import '@testing-library/jest-dom'

global.fetch = jest.fn()

beforeEach(() => {
  fetch.mockClear()
})

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn(),
  },
})

Object.defineProperty(window, 'FileReader', {
  value: class MockFileReader {
    constructor() {
      this.result = null
      this.onload = null
      this.onerror = null
    }
    
    readAsDataURL(file) {
      setTimeout(() => {
        this.result = 'data:image/jpeg;base64,mockBase64Data'
        if (this.onload) this.onload()
      }, 0)
    }
  },
})
