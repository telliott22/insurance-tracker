import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { EmailService } from '@/lib/services/email-service';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    const supabase = await createClient();
    const emailService = new EmailService();

    const { data: jobs, error: jobsError } = await supabase
      .from('processing_jobs')
      .select(`
        *,
        invoices (*),
        users (*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5);

    if (jobsError || !jobs || jobs.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    let processedCount = 0;

    for (const job of jobs) {
      try {
        await supabase
          .from('processing_jobs')
          .update({ status: 'processing' })
          .eq('id', job.id);

        if (job.job_type === 'ocr_processing') {
          await processOCRJob(job, supabase, emailService);
        }

        processedCount++;
      } catch (error) {
        console.error(`Failed to process job ${job.id}:`, error);
        
        await supabase
          .from('processing_jobs')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', job.id);

        if (job.users?.email) {
          await emailService.sendProcessingErrorEmail(
            job.users.email,
            job.invoices?.file_name || 'Unknown file',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }
    }

    return NextResponse.json({ processed: processedCount });

  } catch (error) {
    console.error('Job processing error:', error);
    return NextResponse.json({ error: 'Failed to process jobs' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processOCRJob(job: any, supabase: any, emailService: EmailService) {
  const invoice = job.invoices;
  if (!invoice) throw new Error('Invoice not found');

  const filePath = invoice.file_url.split('/').pop();
  if (!filePath) throw new Error('Invalid file path');

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('invoices')
    .download(filePath);

  if (downloadError) throw new Error('Failed to download file');

  const arrayBuffer = await fileData.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this German health insurance invoice and extract the following information in JSON format:
            {
              "invoice_number": "string (invoice number/reference)",
              "amount": "number (total amount in EUR)",
              "date": "string (invoice date in YYYY-MM-DD format)",
              "provider_name": "string (healthcare provider name)",
              "provider_address": "string (provider address)",
              "services": [
                {
                  "description": "string (service description)",
                  "amount": "number (service amount in EUR)",
                  "date": "string (service date if different from invoice date)"
                }
              ],
              "patient_name": "string (patient name if visible)",
              "confidence_score": "number (your confidence in extraction accuracy 0-100)"
            }
            
            Important:
            - Extract all monetary amounts as numbers (no currency symbols)
            - Use German date format if needed but convert to YYYY-MM-DD
            - Include all services/treatments listed
            - Be precise with medical terminology
            - If information is unclear, use null for that field
            - Provide confidence score based on image quality and text clarity`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.1,
  });

  const extractedText = response.choices[0]?.message?.content;
  if (!extractedText) throw new Error('Failed to extract text');

  const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : extractedText;
  const ocrData = JSON.parse(jsonString);

  const cleanedData = {
    invoice_number: ocrData.invoice_number || null,
    amount: typeof ocrData.amount === 'number' ? ocrData.amount : null,
    date: ocrData.date || null,
    provider_name: ocrData.provider_name || null,
    provider_address: ocrData.provider_address || null,
    services: Array.isArray(ocrData.services) ? ocrData.services : [],
    patient_name: ocrData.patient_name || null,
    confidence_score: typeof ocrData.confidence_score === 'number' 
      ? ocrData.confidence_score 
      : 75,
    raw_text: extractedText,
    extracted_at: new Date().toISOString(),
    file_name: invoice.file_name
  };

  await supabase
    .from('invoices')
    .update({
      ocr_data: cleanedData,
      amount: cleanedData.amount,
      invoice_date: cleanedData.date,
      invoice_number: cleanedData.invoice_number,
      provider_name: cleanedData.provider_name,
      provider_address: cleanedData.provider_address,
    })
    .eq('id', invoice.id);

  await supabase
    .from('processing_jobs')
    .update({ 
      status: 'completed',
      result_data: cleanedData
    })
    .eq('id', job.id);

  if (job.users?.email) {
    await emailService.sendProcessingCompleteEmail(
      job.users.email,
      {
        fileName: invoice.file_name,
        providerName: cleanedData.provider_name,
        amount: cleanedData.amount,
        invoiceNumber: cleanedData.invoice_number,
      }
    );
  }
}
