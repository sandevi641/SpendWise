import Tesseract from 'tesseract.js';
import { CategorizationService } from './categorizationService';
import { OcrReceiptResult } from '../types';

export class OcrService {
  /**
   * Processes an image buffer or file path to extract receipt metadata.
   */
  static async scanReceipt(imageInput: string | Buffer): Promise<OcrReceiptResult> {
    try {
      const { data: { text } } = await Tesseract.recognize(imageInput, 'eng', {
        logger: () => {}, // suppress verbose logs
      });

      return this.parseReceiptText(text);
    } catch (error) {
      console.error('OCR processing error:', error);
      // Return safe structured fallback if OCR fails
      return {
        merchant: 'Scanned Merchant',
        date: new Date().toISOString().split('T')[0],
        totalAmount: null,
        suggestedCategory: 'General Expense',
        items: [],
        rawText: '',
      };
    }
  }

  /**
   * Parses raw OCR text into structured receipt attributes.
   */
  static parseReceiptText(rawText: string): OcrReceiptResult {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // 1. Merchant Detection: Top non-empty line with letters
    let merchant = 'Unknown Merchant';
    for (const line of lines.slice(0, 5)) {
      if (/[a-zA-Z]{3,}/.test(line) && !/receipt|invoice|tax|welcome|order|table|cashier|date|time/i.test(line)) {
        merchant = line.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
        break;
      }
    }

    // 2. Date Extraction: Regex patterns for DD/MM/YYYY, YYYY-MM-DD, Month DD YYYY
    let dateStr: string | null = null;
    const datePatterns = [
      /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/,
      /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/i,
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          const parsed = new Date(match[0]);
          if (!isNaN(parsed.getTime())) {
            dateStr = parsed.toISOString().split('T')[0];
            break;
          }
        }
      }
      if (dateStr) break;
    }

    if (!dateStr) {
      dateStr = new Date().toISOString().split('T')[0];
    }

    // 3. Total Amount Extraction:
    let totalAmount: number | null = null;
    const totalKeywords = /(?:total|amount due|balance due|grand total|net total|final amount|charge|paid|rs\.?|\$)/i;
    const pricePattern = /(?:[\$€£₹]|rs\.?)?\s*(\d+[.,]\d{2})\b/i;

    // Scan backwards from bottom since totals usually appear at bottom
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (totalKeywords.test(line)) {
        const match = line.match(pricePattern);
        if (match && match[1]) {
          const val = parseFloat(match[1].replace(',', '.'));
          if (!isNaN(val) && val > 0) {
            totalAmount = val;
            break;
          }
        }
      }
    }

    // If still no total found, take largest floating point number found in text
    if (!totalAmount) {
      let maxPrice = 0;
      for (const line of lines) {
        const matches = line.matchAll(/\b(\d+[.,]\d{2})\b/g);
        for (const m of matches) {
          const val = parseFloat(m[1].replace(',', '.'));
          if (val > maxPrice && val < 500000) {
            maxPrice = val;
          }
        }
      }
      if (maxPrice > 0) totalAmount = maxPrice;
    }

    // 4. Line Items
    const items: Array<{ name: string; price?: number }> = [];
    for (const line of lines.slice(1, -2)) {
      const itemPriceMatch = line.match(/([A-Za-z0-9\s-]{3,})\s+[\$€£₹]?\s*(\d+[.,]\d{2})$/);
      if (itemPriceMatch) {
        items.push({
          name: itemPriceMatch[1].trim(),
          price: parseFloat(itemPriceMatch[2].replace(',', '.')),
        });
      }
    }

    // 5. Category suggestion based on merchant & item names
    const textToCategorize = `${merchant} ${items.map((it) => it.name).join(' ')} ${rawText}`;
    const suggestion = CategorizationService.suggestCategory(textToCategorize, 'EXPENSE');

    return {
      merchant,
      date: dateStr,
      totalAmount,
      suggestedCategory: suggestion.categoryName,
      items,
      rawText,
    };
  }
}
