
import type { UploadService } from '../upload-service';

const mockResult: ReturnType<UploadService['processFile']> extends Promise<{
  uploadData: unknown;
  ocrData: unknown;
  duplicates: unknown;
  jobId?: string;
}> ? true : false = true;

export { mockResult };
