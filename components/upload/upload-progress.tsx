"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadedFile } from "@/types";
import { CheckCircle, FileText, Loader2 } from "lucide-react";

interface UploadProgressProps {
  files: UploadedFile[];
}

export function UploadProgress({ files }: UploadProgressProps) {
  const totalProgress = Math.round(
    files.reduce((sum, file) => sum + (file.progress || 0), 0) / files.length
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span>Processing Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Overall Progress</span>
            <span>{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {/* Individual File Progress */}
        <div className="space-y-4">
          {files.map((file, index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-6 w-6 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-white">{file.file.name}</p>
                  <p className="text-sm text-slate-400">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {file.uploaded && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>

              <div className="space-y-2">
                {/* Upload Progress */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Upload</span>
                    <span>{file.progress || 0}%</span>
                  </div>
                  <Progress value={file.progress || 0} className="h-1" />
                </div>

                {/* Processing Steps */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`text-center p-2 rounded ${
                    (file.progress || 0) >= 33 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-slate-600/50 text-slate-400"
                  }`}>
                    Upload
                  </div>
                  <div className={`text-center p-2 rounded ${
                    (file.progress || 0) >= 66 
                      ? "bg-blue-500/20 text-blue-400" 
                      : "bg-slate-600/50 text-slate-400"
                  }`}>
                    OCR Processing
                  </div>
                  <div className={`text-center p-2 rounded ${
                    (file.progress || 0) >= 100 
                      ? "bg-purple-500/20 text-purple-400" 
                      : "bg-slate-600/50 text-slate-400"
                  }`}>
                    Duplicate Check
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Processing Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-2">What&apos;s happening?</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Uploading files to secure storage</li>
            <li>• Extracting text and data using AI</li>
            <li>• Checking for duplicate invoices</li>
            <li>• Preparing data for review</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}