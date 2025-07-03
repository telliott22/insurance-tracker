"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/upload/file-uploader";
import { UploadProgress } from "@/components/upload/upload-progress";
import { DuplicateCheck } from "@/components/upload/duplicate-check";
import { InvoicePreview } from "@/components/upload/invoice-preview";
import { UploadedFile } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UploadService } from "@/lib/services/upload-service";
import { useRouter } from "next/navigation";

type UploadStep = "upload" | "processing" | "duplicate-check" | "preview" | "complete";

interface OCRData {
  invoice_number?: string | null;
  amount?: number | null;
  date?: string | null;
  provider_name?: string | null;
  provider_address?: string | null;
  services?: Array<{
    description: string;
    amount: number;
  }>;
  confidence_score?: number;
  raw_text?: string;
  extracted_at?: string;
  file_name?: string;
  error?: string;
}

interface Duplicate {
  provider_name?: string;
  invoice_number?: string;
  amount?: number;
  date?: string;
  status?: string;
  uploaded_date?: string;
  similarity?: number;
}

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<UploadStep>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [uploadData, setUploadData] = useState<{
    file_url: string;
    file_name: string;
    file_size: number;
    document_hash: string;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setCurrentStep("processing");
    setError(null);
    // Start processing the first file (for now, handle single file)
    processFile(files[0]);
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    setProcessing(true);
    
    try {
      const uploadService = new UploadService((progress) => {
        // Update file progress
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file.name === uploadedFile.file.name 
              ? { ...f, progress: progress.progress }
              : f
          )
        );
      });

      const result = await uploadService.processFile(uploadedFile.file);
      
      // Store results
      setUploadData(result.uploadData);
      setOcrData(result.ocrData);
      setDuplicates(result.duplicates);

      // Move to next step
      if (result.duplicates.length > 0) {
        setCurrentStep("duplicate-check");
      } else {
        setCurrentStep("preview");
      }

    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
      setCurrentStep("upload");
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!ocrData || !uploadData) {
      setError('Missing data to save invoice');
      return;
    }

    try {
      const uploadService = new UploadService();
      
      const invoiceData = {
        file_url: uploadData.file_url,
        file_name: uploadData.file_name,
        file_size: uploadData.file_size,
        document_hash: uploadData.document_hash,
        ocr_data: ocrData,
        amount: ocrData.amount,
        invoice_date: ocrData.date,
        invoice_number: ocrData.invoice_number,
        provider_name: ocrData.provider_name,
        provider_address: ocrData.provider_address,
        status: 'pending'
      };

      await uploadService.saveInvoice(invoiceData);
      setCurrentStep("complete");

    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Invoice</h1>
          <p className="text-slate-400">
            Upload your invoice and let AI extract the details automatically
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Upload Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {[
              { key: "upload", label: "Upload File" },
              { key: "processing", label: "AI Processing" },
              { key: "duplicate-check", label: "Duplicate Check" },
              { key: "preview", label: "Review & Save" }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.key
                      ? "bg-blue-600 text-white"
                      : index < ["upload", "processing", "duplicate-check", "preview"].indexOf(currentStep)
                      ? "bg-green-600 text-white"
                      : "bg-slate-600 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm text-slate-300">{step.label}</span>
                {index < 3 && <div className="w-8 h-px bg-slate-600 mx-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <p className="text-red-400 font-medium">Error</p>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
            <Button 
              onClick={() => setError(null)}
              variant="outline"
              size="sm"
              className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {currentStep === "upload" && (
        <FileUploader onFilesSelected={handleFilesSelected} disabled={processing} />
      )}

      {currentStep === "processing" && (
        <UploadProgress files={uploadedFiles} />
      )}

      {currentStep === "duplicate-check" && (
        <DuplicateCheck 
          duplicates={duplicates} 
          onContinue={() => setCurrentStep("preview")}
        />
      )}

      {currentStep === "preview" && (
        <InvoicePreview 
          ocrData={ocrData}
          onSave={handleSave}
          onEdit={() => setCurrentStep("upload")}
        />
      )}

      {currentStep === "complete" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="text-center py-12">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-2">Invoice Uploaded Successfully!</h2>
            <p className="text-slate-400 mb-6">
              Your invoice has been processed and saved to your account.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/dashboard')}>
                View Dashboard
              </Button>
              <Button 
                onClick={() => {
                  setCurrentStep("upload");
                  setUploadedFiles([]);
                  setOcrData(null);
                  setDuplicates([]);
                  setUploadData(null);
                  setError(null);
                }} 
                variant="outline" 
                className="border-slate-600"
              >
                Upload Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}