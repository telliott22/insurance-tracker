/**
 * Upload service that orchestrates file upload, OCR, and duplicate checking
 */

import { fileToBase64, validateFile } from '@/lib/utils/file-processing';
import { UploadedFile } from '@/types';

interface UploadProgress {
  step: 'uploading' | 'processing' | 'checking' | 'complete';
  progress: number;
  message: string;
}

interface UploadData {
  file_url: string;
  file_name: string;
  file_size: number;
  document_hash: string;
  uploaded_at: string;
}

interface OCRData {
  invoice_number?: string | null;
  amount?: number | null;
  date?: string | null;
  provider_name?: string | null;
  provider_address?: string | null;
  services?: Array<{
    description: string;
    amount: number;
  }>;
  confidence_score?: number;
  raw_text?: string;
  extracted_at?: string;
  file_name?: string;
  error?: string;
}

interface Duplicate {
  id: string;
  provider_name?: string;
  invoice_number?: string;
  amount?: number;
  date?: string;
  status?: string;
  uploaded_date?: string;
  similarity?: number;
  match_type?: string;
}

interface ProcessedInvoice {
  uploadData: UploadData | null;
  ocrData: OCRData;
  duplicates: Duplicate[];
}

export class UploadService {
  private onProgress?: (progress: UploadProgress) => void;

  constructor(onProgress?: (progress: UploadProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(step: UploadProgress['step'], progress: number, message: string) {
    if (this.onProgress) {
      this.onProgress({ step, progress, message });
    }
  }

  async processFile(file: File): Promise<ProcessedInvoice> {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    this.updateProgress('uploading', 10, 'Validating file...');

    try {
      // Step 1: Upload file to Supabase Storage
      this.updateProgress('uploading', 30, 'Uploading to secure storage...');
      const uploadData = await this.uploadFile(file);

      // Step 2: Process with OCR
      this.updateProgress('processing', 50, 'Extracting text with AI...');
      const ocrData = await this.processWithOCR(file);

      // Step 3: Check for duplicates
      this.updateProgress('checking', 80, 'Checking for duplicates...');
      const duplicates = await this.checkDuplicates(ocrData, uploadData.document_hash);

      this.updateProgress('complete', 100, 'Processing complete!');

      return {
        uploadData,
        ocrData,
        duplicates
      };

    } catch (error) {
      console.error('Upload processing error:', error);
      throw error;
    }
  }

  private async uploadFile(file: File): Promise<UploadData> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  }

  private async processWithOCR(file: File): Promise<OCRData> {
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          fileName: file.name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'OCR processing failed');
      }

      const result = await response.json();
      return result.data;

    } catch (error) {
      console.error('OCR processing error:', error);
      // Return basic data if OCR fails
      return {
        invoice_number: null,
        amount: null,
        date: null,
        provider_name: null,
        provider_address: null,
        services: [],
        confidence_score: 0,
        error: 'OCR processing failed'
      };
    }
  }

  private async checkDuplicates(ocrData: OCRData, documentHash: string): Promise<Duplicate[]> {
    try {
      const response = await fetch('/api/duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentHash,
          invoiceNumber: ocrData.invoice_number,
          amount: ocrData.amount,
          providerName: ocrData.provider_name,
          invoiceDate: ocrData.date
        })
      });

      if (!response.ok) {
        console.error('Duplicate check failed');
        return [];
      }

      const result = await response.json();
      return result.data.duplicates || [];

    } catch (error) {
      console.error('Duplicate check error:', error);
      return [];
    }
  }

  async saveInvoice(invoiceData: {
    file_url: string;
    file_name: string;
    file_size: number;
    document_hash: string;
    ocr_data: OCRData;
    amount?: number | null;
    invoice_date?: string | null;
    invoice_number?: string | null;
    provider_name?: string | null;
    provider_address?: string | null;
    status?: string;
  }): Promise<{ id: string }> {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save invoice');
    }

    const result = await response.json();
    return result.data;
  }
}

// Helper function to process multiple files
export async function processMultipleFiles(
  files: UploadedFile[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<ProcessedInvoice[]> {
  const results: ProcessedInvoice[] = [];

  for (let i = 0; i < files.length; i++) {
    const uploadedFile = files[i];
    const service = new UploadService((progress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    });

    try {
      const result = await service.processFile(uploadedFile.file);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process file ${uploadedFile.file.name}:`, error);
      // Add error result
      results.push({
        uploadData: null,
        ocrData: { error: error instanceof Error ? error.message : 'Unknown error' },
        duplicates: []
      });
    }
  }

  return results;
}