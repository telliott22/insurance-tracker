import { UploadService } from '@/lib/services/upload-service'
import { sampleFile, sampleOCRData } from '../fixtures/sample-data'

jest.mock('@/lib/utils/file-processing', () => ({
  validateFile: jest.fn(() => ({ valid: true })),
  fileToBase64: jest.fn(() => Promise.resolve('mockBase64Data')),
}))

describe('UploadService', () => {
  let uploadService: UploadService
  let mockProgressCallback: jest.Mock

  beforeEach(() => {
    mockProgressCallback = jest.fn()
    uploadService = new UploadService(mockProgressCallback)
    
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('processFile', () => {
    it('should process file successfully', async () => {
      const mockUploadResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: {
            file_url: 'https://example.com/file.pdf',
            file_name: 'test.pdf',
            file_size: 1024,
            document_hash: 'abc123',
            uploaded_at: '2024-01-15T10:00:00Z'
          }
        })
      }

      const mockOCRResponse = {
        ok: true,
        json: () => Promise.resolve({ data: sampleOCRData })
      }

      const mockDuplicatesResponse = {
        ok: true,
        json: () => Promise.resolve({ data: { duplicates: [] } })
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockUploadResponse)
        .mockResolvedValueOnce(mockOCRResponse)
        .mockResolvedValueOnce(mockDuplicatesResponse)

      const result = await uploadService.processFile(sampleFile)

      expect(result.uploadData).toBeDefined()
      expect(result.ocrData).toEqual(sampleOCRData)
      expect(result.duplicates).toEqual([])
      expect(mockProgressCallback).toHaveBeenCalledWith({
        step: 'complete',
        progress: 100,
        message: 'Processing complete!'
      })
    })

    it('should handle upload errors gracefully', async () => {
      const mockErrorResponse = {
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' })
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse)

      await expect(uploadService.processFile(sampleFile)).rejects.toThrow('Upload failed')
    })

    it('should handle OCR errors gracefully', async () => {
      const mockUploadResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: {
            file_url: 'https://example.com/file.pdf',
            document_hash: 'abc123'
          }
        })
      }

      const mockOCRError = {
        ok: false,
        json: () => Promise.resolve({ error: 'OCR failed' })
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockUploadResponse)
        .mockResolvedValueOnce(mockOCRError)

      const result = await uploadService.processFile(sampleFile)

      expect(result.ocrData.error).toBe('OCR processing failed')
      expect(result.ocrData.confidence_score).toBe(0)
    })
  })

  describe('saveInvoice', () => {
    it('should save invoice successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: { id: 'invoice-123' } })
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const invoiceData = {
        file_url: 'https://example.com/file.pdf',
        file_name: 'test.pdf',
        file_size: 1024,
        document_hash: 'abc123',
        ocr_data: sampleOCRData
      }

      const result = await uploadService.saveInvoice(invoiceData)
      expect(result.id).toBe('invoice-123')
    })
  })
})
