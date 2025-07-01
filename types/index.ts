// Main types for Private Health Insurance Tracker application

export * from './database'

// API Response types
export interface APIResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

// File upload types
export interface FileUploadResponse {
  url: string
  path: string
  size: number
  type: string
}

export interface UploadedFile {
  file: File
  preview?: string
  progress?: number
  error?: string
  uploaded?: boolean
  url?: string
}

// OCR API types
export interface OCRRequest {
  image_base64: string
  file_name: string
  user_id: string
}

export interface OCRResponse {
  success: boolean
  data?: {
    invoice_number?: string
    amount?: number
    date?: string
    provider_name?: string
    provider_address?: string
    services?: Array<{
      description: string
      amount: number
      date?: string
    }>
    raw_text: string
    confidence_score: number
  }
  error?: string
}

// Email types
export interface EmailDraft {
  to: string
  subject: string
  body: string
  attachments?: string[]
}

export interface EmailTemplate {
  id: string
  name: string
  subject_template: string
  body_template: string
  insurance_company?: string
}

// Form types
export interface InvoiceFormData {
  file?: File
  amount?: number
  invoice_date?: string
  invoice_number?: string
  provider_name?: string
  provider_address?: string
  notes?: string
}

export interface PaymentFormData {
  invoice_id: string
  amount: number
  payment_date: string
  payment_type: 'bank_transfer' | 'adjustment' | 'partial'
  notes?: string
}

export interface UserSettingsFormData {
  name?: string
  excess_rules?: {
    annual_deductible?: number
    percentage_coverage?: number
    max_annual_benefit?: number
    copay_amounts?: { [key: string]: number }
    exclusions?: string[]
  }
  insurance_info?: {
    company_name?: string
    policy_number?: string
    contact_email?: string
    contact_phone?: string
    coverage_type?: string
    policy_start_date?: string
    policy_end_date?: string
  }
}

// Dashboard types
export interface DashboardMetrics {
  totalInvoices: number
  pendingInvoices: number
  paidInvoices: number
  rejectedInvoices: number
  totalAmountPaid: number
  totalAmountPending: number
  totalAmountSubmitted: number
  averageProcessingTime: number
  thisMonthInvoices: number
  thisMonthPayments: number
}

export interface RecentActivity {
  id: string
  type: 'invoice_uploaded' | 'payment_received' | 'invoice_submitted' | 'document_uploaded'
  description: string
  amount?: number
  date: string
  invoice_id?: string
}

// Search and filter types
export interface SearchFilters {
  query?: string
  status?: string[]
  dateFrom?: string
  dateTo?: string
  provider?: string
  amountMin?: number
  amountMax?: number
  sortBy?: 'date' | 'amount' | 'provider' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

// Component prop types
export interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  sortable?: boolean
  width?: string
  render?: (value: any, record: T) => React.ReactNode
}

export interface DropzoneProps {
  onDrop: (files: File[]) => void
  accept?: string[]
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  multiple?: boolean
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Error types
export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: any
}

// Auth types (extending Supabase auth)
export interface AuthUser {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  created_at?: string
  last_sign_in_at?: string
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Configuration types
export interface AppConfig {
  supabase: {
    url: string
    anonKey: string
  }
  openai: {
    apiKey: string
    model: string
  }
  resend: {
    apiKey: string
    fromEmail: string
  }
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }
}

// Utility types
export type ValueOf<T> = T[keyof T]
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>