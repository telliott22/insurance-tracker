// Database types for Private Health Insurance Tracker
// Auto-generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          excess_rules: Json
          insurance_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          excess_rules?: Json
          insurance_info?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          excess_rules?: Json
          insurance_info?: Json
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          file_url: string
          file_name: string | null
          file_size: number | null
          ocr_data: Json
          amount: number | null
          invoice_date: string | null
          invoice_number: string | null
          provider_name: string | null
          provider_address: string | null
          status: 'pending' | 'submitted' | 'paid' | 'rejected'
          document_hash: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          file_name?: string | null
          file_size?: number | null
          ocr_data?: Json
          amount?: number | null
          invoice_date?: string | null
          invoice_number?: string | null
          provider_name?: string | null
          provider_address?: string | null
          status?: 'pending' | 'submitted' | 'paid' | 'rejected'
          document_hash?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          file_name?: string | null
          file_size?: number | null
          ocr_data?: Json
          amount?: number | null
          invoice_date?: string | null
          invoice_number?: string | null
          provider_name?: string | null
          provider_address?: string | null
          status?: 'pending' | 'submitted' | 'paid' | 'rejected'
          document_hash?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_type: 'bank_transfer' | 'adjustment' | 'partial'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_type?: 'bank_transfer' | 'adjustment' | 'partial'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          invoice_id?: string
          amount?: number
          payment_date?: string
          payment_type?: 'bank_transfer' | 'adjustment' | 'partial'
          notes?: string | null
          created_at?: string
        }
      }
      insurance_documents: {
        Row: {
          id: string
          user_id: string
          file_url: string
          file_name: string | null
          file_size: number | null
          document_type: 'policy' | 'excess_rules' | 'terms' | 'contract'
          extracted_rules: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          file_name?: string | null
          file_size?: number | null
          document_type?: 'policy' | 'excess_rules' | 'terms' | 'contract'
          extracted_rules?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          file_name?: string | null
          file_size?: number | null
          document_type?: 'policy' | 'excess_rules' | 'terms' | 'contract'
          extracted_rules?: Json
          created_at?: string
        }
      }
      processing_jobs: {
        Row: {
          id: string
          user_id: string
          invoice_id: string | null
          job_type: 'ocr_processing' | 'duplicate_check'
          status: 'pending' | 'processing' | 'completed' | 'failed'
          job_data: Json
          result_data: Json
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_id?: string | null
          job_type: 'ocr_processing' | 'duplicate_check'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          job_data?: Json
          result_data?: Json
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          invoice_id?: string | null
          job_type?: 'ocr_processing' | 'duplicate_check'
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          job_data?: Json
          result_data?: Json
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Utility types
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export type InsuranceDocument = Database['public']['Tables']['insurance_documents']['Row']
export type InsuranceDocumentInsert = Database['public']['Tables']['insurance_documents']['Insert']
export type InsuranceDocumentUpdate = Database['public']['Tables']['insurance_documents']['Update']

export type ProcessingJob = Database['public']['Tables']['processing_jobs']['Row']
export type ProcessingJobInsert = Database['public']['Tables']['processing_jobs']['Insert']
export type ProcessingJobUpdate = Database['public']['Tables']['processing_jobs']['Update']

// Invoice status types
export type InvoiceStatus = 'pending' | 'submitted' | 'paid' | 'rejected'
export type PaymentType = 'bank_transfer' | 'adjustment' | 'partial'
export type DocumentType = 'policy' | 'excess_rules' | 'terms' | 'contract'
export type JobType = 'ocr_processing' | 'duplicate_check'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

// OCR data structure
export interface OCRData {
  raw_text?: string
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
  confidence_score?: number
  extracted_at?: string
}

// Excess rules structure
export interface ExcessRules {
  annual_deductible?: number
  percentage_coverage?: number
  max_annual_benefit?: number
  copay_amounts?: {
    [service_type: string]: number
  }
  exclusions?: string[]
}

// Insurance info structure
export interface InsuranceInfo {
  company_name?: string
  policy_number?: string
  contact_email?: string
  contact_phone?: string
  coverage_type?: string
  policy_start_date?: string
  policy_end_date?: string
}

// Dashboard stats
export interface DashboardStats {
  total_invoices: number
  pending_invoices: number
  paid_invoices: number
  total_amount_paid: number
  total_amount_pending: number
  total_amount_submitted: number
  recent_payments: Payment[]
}

// Filter options for invoice dashboard
export interface InvoiceFilters {
  status?: InvoiceStatus[]
  date_from?: string
  date_to?: string
  provider?: string
  amount_min?: number
  amount_max?: number
  search?: string
}
