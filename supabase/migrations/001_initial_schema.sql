-- Initial schema for Private Health Insurance Tracker
-- Created: 2025-07-01

-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  excess_rules JSONB DEFAULT '{}',
  insurance_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to automatically create user profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Invoices table
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  ocr_data JSONB DEFAULT '{}',
  amount DECIMAL(10,2),
  invoice_date DATE,
  invoice_number TEXT,
  provider_name TEXT,
  provider_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'paid', 'rejected')),
  document_hash TEXT UNIQUE, -- For duplicate detection
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoices table
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_hash ON public.invoices(document_hash);

-- Payment tracking table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_type TEXT DEFAULT 'bank_transfer' CHECK (payment_type IN ('bank_transfer', 'adjustment', 'partial')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments table
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments" ON public.payments
  FOR DELETE USING (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);

-- Insurance documents table
CREATE TABLE public.insurance_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  document_type TEXT DEFAULT 'policy' CHECK (document_type IN ('policy', 'excess_rules', 'terms', 'contract')),
  extracted_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on insurance_documents table
ALTER TABLE public.insurance_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for insurance_documents table
CREATE POLICY "Users can view own insurance documents" ON public.insurance_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insurance documents" ON public.insurance_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insurance documents" ON public.insurance_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insurance documents" ON public.insurance_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX idx_insurance_documents_user_id ON public.insurance_documents(user_id);
CREATE INDEX idx_insurance_documents_type ON public.insurance_documents(document_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Supabase Storage
-- This will be handled through the Supabase dashboard
-- Buckets needed: 'invoices', 'insurance-documents'