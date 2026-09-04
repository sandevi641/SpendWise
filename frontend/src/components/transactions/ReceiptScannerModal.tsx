import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ocrService, OcrResponseData } from '../../services/ocrService';
import { UploadCloud, FileText, CheckCircle, Loader2, Sparkles, ShoppingBag } from 'lucide-react';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptParsed: (data: {
    description: string;
    amount: number;
    date: string;
    suggestedCategory: string;
  }) => void;
}

const SAMPLE_RECEIPTS = [
  {
    name: 'Supermarket Grocery Receipt',
    text: `WHOLE FOODS MARKET\n100 University Ave, Seattle WA\nDate: 2026-09-02\nOrganic Milk 2gal    $8.50\nBrown Rice 5lb       $12.40\nFresh Avocado 4pk    $6.80\nAlmond Butter        $9.20\nSubtotal:           $36.90\nTax:                $3.10\nTOTAL AMOUNT:       $40.00\nPayment: VISA ENDING 4821`,
  },
  {
    name: 'Cafe & Dining Bill',
    text: `ARTISAN BISTRO & ESPRESSO\nTable: 14 | Server: Chloe\nDate: 2026-09-03\n2x Double Latte      $11.00\n1x Truffle Pasta     $24.50\n1x Tiramisu Slice    $8.50\nService Charge (10%) $4.40\nFINAL TOTAL:        $48.40\nThank you for dining with us!`,
  },
  {
    name: 'Uber Transport Receipt',
    text: `UBER TRIP RECEIPT\nDate: 2026-09-01\nPickup: Downtown Tech Hub\nDropoff: Science Library\nTrip Fare:          $21.50\nAirport Surcharge:   $3.00\nTOTAL PAID:         $24.50\nCharged to Mastercard`,
  },
];

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptParsed,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<OcrResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setParsedResult(null);
      setError(null);
    }
  };

  const handleProcessImage = async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      setError(null);
      const result = await ocrService.scanReceipt(file);
      setParsedResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to scan receipt image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessSample = async (sampleText: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setPreviewUrl(null);
      const result = await ocrService.parseSampleText(sampleText);
      setParsedResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to parse sample');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToForm = () => {
    if (!parsedResult) return;
    onReceiptParsed({
      description: `${parsedResult.merchant || 'Scanned Purchase'} - Receipt`,
      amount: parsedResult.totalAmount || 0,
      date: parsedResult.date || new Date().toISOString().split('T')[0],
      suggestedCategory: parsedResult.suggestedCategory,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Intelligent Receipt Scanner (OCR)"
      subtitle="Extract merchant, items, amount, and date from receipt images"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Upload Box */}
        <div className="border-2 border-dashed border-brand-200 hover:border-copper rounded-2xl p-6 text-center bg-beige-50/50 transition-colors">
          <input
            type="file"
            id="receipt-upload"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <label htmlFor="receipt-upload" className="cursor-pointer block">
            <UploadCloud className="w-10 h-10 text-copper mx-auto mb-2" />
            <p className="text-sm font-bold text-espresso-900">
              {file ? file.name : 'Click to upload receipt image'}
            </p>
            <p className="text-xs text-espresso-400 mt-1">Supports PNG, JPG, JPEG (Max 5MB)</p>
          </label>
        </div>

        {/* Action button if file chosen */}
        {file && !parsedResult && (
          <div className="flex justify-center">
            <button
              onClick={handleProcessImage}
              disabled={isProcessing}
              className="btn-primary text-xs"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Running Neural OCR Engine...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run OCR Extraction
                </>
              )}
            </button>
          </div>
        )}

        {/* Sample presets for quick demonstration */}
        <div>
          <p className="text-xs font-bold text-espresso-600 mb-2 uppercase tracking-wider">
            Or test with verified receipt benchmarks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SAMPLE_RECEIPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleProcessSample(sample.text)}
                disabled={isProcessing}
                className="p-3 text-left bg-white hover:bg-beige-100 border border-brand-200 rounded-xl transition-all shadow-soft-sm active:scale-95"
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-espresso-800">
                  <FileText className="w-4 h-4 text-copper shrink-0" />
                  <span className="truncate">{sample.name}</span>
                </div>
                <span className="text-[10px] text-espresso-400 mt-1 block">Click to parse instantly</span>
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Result Display */}
        {parsedResult && (
          <div className="p-5 bg-white border border-brand-200 rounded-2xl shadow-soft-md space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-beige-200 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold text-espresso-900">Receipt Extracted Successfully</span>
              </div>
              <span className="badge badge-income font-mono text-xs font-bold">
                Total: ${parsedResult.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-espresso-400 block font-medium">Merchant</span>
                <span className="font-bold text-espresso-900">{parsedResult.merchant || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-espresso-400 block font-medium">Date</span>
                <span className="font-bold text-espresso-900">{parsedResult.date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-espresso-400 block font-medium">Suggested Category</span>
                <span className="font-bold text-copper">{parsedResult.suggestedCategory}</span>
              </div>
            </div>

            {parsedResult.items && parsedResult.items.length > 0 && (
              <div>
                <span className="text-xs font-bold text-espresso-700 block mb-1.5">Detected Line Items:</span>
                <div className="max-h-28 overflow-y-auto space-y-1 bg-beige-50 p-2.5 rounded-xl border border-brand-100">
                  {parsedResult.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-espresso-700 font-mono">
                      <span>{item.name}</span>
                      <span>{item.price ? `$${item.price.toFixed(2)}` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handleApplyToForm}
                className="btn-primary text-xs w-full sm:w-auto"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                Populate Expense Form
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
