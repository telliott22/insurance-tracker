"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/upload/file-uploader";
import { UploadProgress } from "@/components/upload/upload-progress";
import { UploadedFile } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UploadService } from "@/lib/services/upload-service";
import { useRouter } from "next/navigation";

type UploadStep = "upload" | "processing" | "complete";


export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<UploadStep>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadData, setUploadData] = useState<{
    file_url: string;
    file_name: string;
    file_size: number;
    document_hash: string;
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [jobId, setJobId] = useState<string | null>(null);
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
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file.name === uploadedFile.file.name 
              ? { ...f, progress: progress.progress }
              : f
          )
        );
      });

      const result = await uploadService.processFile(uploadedFile.file);
      
      setUploadData(result.uploadData);
      setJobId(result.jobId || null);
      
      console.log('Upload completed:', { uploadData: result.uploadData, jobId: result.jobId });

      setCurrentStep("complete");

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setCurrentStep("upload");
    } finally {
      setProcessing(false);
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
              { key: "processing", label: "Uploading..." },
              { key: "complete", label: "Complete" }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.key
                      ? "bg-blue-600 text-white"
                      : index < ["upload", "processing", "complete"].indexOf(currentStep)
                      ? "bg-green-600 text-white"
                      : "bg-slate-600 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm text-slate-300">{step.label}</span>
                {index < 2 && <div className="w-8 h-px bg-slate-600 mx-4" />}
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

      {currentStep === "complete" && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="text-center py-12">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-2">Invoice Uploaded Successfully!</h2>
            <p className="text-slate-400 mb-6">
              Your invoice has been uploaded and is being processed in the background. 
              You&apos;ll receive an email notification when processing is complete.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/dashboard')}>
                View Dashboard
              </Button>
              <Button 
                onClick={() => {
                  setCurrentStep("upload");
                  setUploadedFiles([]);
                  setUploadData(null);
                  setJobId(null);
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
