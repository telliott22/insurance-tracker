/**
 * Upload service that orchestrates file upload, OCR, and duplicate checking
 */

import { validateFile } from '@/lib/utils/file-processing';
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


interface ProcessedInvoice {
  uploadData: UploadData | null;
  jobId: string;
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
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    this.updateProgress('uploading', 10, 'Validating file...');

    try {
      this.updateProgress('uploading', 50, 'Uploading to secure storage...');
      const uploadData = await this.uploadFile(file);

      this.updateProgress('uploading', 80, 'Creating invoice record...');
      const invoiceData = {
        file_url: uploadData.file_url,
        file_name: uploadData.file_name,
        file_size: uploadData.file_size,
        document_hash: uploadData.document_hash,
        status: 'pending',
        ocr_data: {}
      };

      const invoice = await this.saveInvoice(invoiceData);

      this.updateProgress('uploading', 90, 'Queuing for processing...');
      const jobId = await this.createProcessingJob(invoice.id, file);

      this.updateProgress('complete', 100, 'Upload complete! Processing in background...');

      return {
        uploadData,
        jobId
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

  private async createProcessingJob(invoiceId: string, file: File): Promise<string> {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId,
        jobType: 'ocr_processing',
        jobData: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create processing job');
    }

    const result = await response.json();
    return result.data.id;
  }

  async saveInvoice(invoiceData: {
    file_url: string;
    file_name: string;
    file_size: number;
    document_hash: string;
    ocr_data?: Record<string, unknown>;
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
        jobId: ''
      });
    }
  }

  return results;
}
