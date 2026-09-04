import { Response } from 'express';
import { OcrService } from '../services/ocrService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class OcrController {
  static async scanReceipt(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file && !req.body.imageBase64 && !req.body.sampleText) {
        return ApiResponse.badRequest(res, 'Please upload a receipt image or provide image data');
      }

      // If user is testing with mock text or client sent direct buffer
      if (req.body.sampleText) {
        const parsed = OcrService.parseReceiptText(req.body.sampleText);
        return ApiResponse.success(res, parsed, 'Receipt parsed successfully');
      }

      let imageInput: Buffer | string;
      if (req.file) {
        imageInput = req.file.buffer;
      } else {
        const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        imageInput = Buffer.from(base64Data, 'base64');
      }

      const result = await OcrService.scanReceipt(imageInput);
      return ApiResponse.success(res, result, 'Receipt processed with OCR');
    } catch (error: any) {
      console.error('OCR Controller error:', error);
      return ApiResponse.badRequest(res, error.message || 'Failed to process receipt image');
    }
  }
}
