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

type UploadStep = "upload" | "processing" | "duplicate-check" | "preview" | "complete";

interface OCRData {
  invoice_number?: string;
  amount?: number;
  date?: string;
  provider_name?: string;
  provider_address?: string;
  services?: Array<{
    description: string;
    amount: number;
  }>;
  confidence_score?: number;
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
  const [currentStep, setCurrentStep] = useState<UploadStep>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);

  const handleFilesSelected = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setCurrentStep("processing");
    // Start processing
    processFiles(files);
  };

  const processFiles = async (files: UploadedFile[]) => {
    // Simulate file upload and OCR processing
    for (const uploadedFile of files) {
      // Upload to Supabase Storage
      // Run OCR with OpenAI
      // Check for duplicates
      console.log('Processing:', uploadedFile.file.name);
    }
    
    // For now, simulate the process
    setTimeout(() => {
      setCurrentStep("duplicate-check");
      // Simulate finding duplicates
      setDuplicates([]);
      
      setTimeout(() => {
        setCurrentStep("preview");
        setOcrData({
          invoice_number: "INV-2024-001",
          amount: 125.50,
          date: "2024-01-15",
          provider_name: "Dr. Schmidt Praxis",
          services: [
            { description: "Consultation", amount: 85.00 },
            { description: "Treatment", amount: 40.50 }
          ]
        });
      }, 2000);
    }, 3000);
  };

  const handleSave = async () => {
    // Save to database
    setCurrentStep("complete");
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

      {/* Step Content */}
      {currentStep === "upload" && (
        <FileUploader onFilesSelected={handleFilesSelected} />
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
              <Button asChild>
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-600">
                <Link href="/dashboard/upload">Upload Another</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}