CREATE TABLE public.processing_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('ocr_processing', 'duplicate_check')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  job_data JSONB DEFAULT '{}',
  result_data JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own processing jobs" ON public.processing_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processing jobs" ON public.processing_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processing jobs" ON public.processing_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_processing_jobs_user_id ON public.processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_processing_jobs_created_at ON public.processing_jobs(created_at);

CREATE TRIGGER update_processing_jobs_updated_at
  BEFORE UPDATE ON public.processing_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
