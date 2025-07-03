
import type { validateFile } from '../file-processing';

const mockValidation: ReturnType<typeof validateFile> extends {
  valid: boolean;
  error?: string;
} ? true : false = true;

export { mockValidation };
