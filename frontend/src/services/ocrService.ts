import api from './api';
import { ApiResponse } from '../types';

export interface OcrResponseData {
  merchant: string;
  date: string | null;
  totalAmount: number | null;
  suggestedCategory: string;
  items: Array<{ name: string; price?: number }>;
  rawText: string;
}

export const ocrService = {
  async scanReceipt(file: File): Promise<OcrResponseData> {
    const formData = new FormData();
    formData.append('receiptImage', file);

    const res = await api.post<ApiResponse<OcrResponseData>>('/ocr/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async scanBase64(imageBase64: string): Promise<OcrResponseData> {
    const res = await api.post<ApiResponse<OcrResponseData>>('/ocr/scan', { imageBase64 });
    return res.data.data;
  },

  async parseSampleText(sampleText: string): Promise<OcrResponseData> {
    const res = await api.post<ApiResponse<OcrResponseData>>('/ocr/scan', { sampleText });
    return res.data.data;
  },
};

export const statementService = {
  async downloadPdf(startDate?: string, endDate?: string): Promise<void> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/statements/export-pdf?${params.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SpendWise_Statement_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
