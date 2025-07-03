import {
  validateFile,
  isImageFile,
  isPDFFile,
  formatFileSize,
  generateUniqueFilename,
  fileToBase64,
} from '@/lib/utils/file-processing'

describe('File Processing Utils', () => {
  describe('validateFile', () => {
    it('should accept valid image files', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid PDF files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const result = validateFile(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid file types', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should reject files that are too large', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('')
      const file = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File too large')
    })
  })

  describe('isImageFile', () => {
    it('should return true for image files', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      expect(isImageFile(file)).toBe(true)
    })

    it('should return false for non-image files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      expect(isImageFile(file)).toBe(false)
    })
  })

  describe('isPDFFile', () => {
    it('should return true for PDF files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      expect(isPDFFile(file)).toBe(true)
    })

    it('should return false for non-PDF files', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      expect(isPDFFile(file)).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })
  })

  describe('generateUniqueFilename', () => {
    it('should generate unique filename with user ID and timestamp', () => {
      const originalName = 'test-invoice.pdf'
      const userId = 'user-123'
      const filename = generateUniqueFilename(originalName, userId)
      
      expect(filename).toContain(userId)
      expect(filename).toContain('.pdf')
      expect(filename).toMatch(/user-123\/\d+_[a-z0-9]+\.pdf/)
    })
  })

  describe('fileToBase64', () => {
    it('should convert file to base64', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const base64 = await fileToBase64(file)
      expect(base64).toBe('mockBase64Data')
    })
  })
})
