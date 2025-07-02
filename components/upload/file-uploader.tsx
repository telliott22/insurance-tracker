"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { UploadedFile } from "@/types";

interface FileUploaderProps {
  onFilesSelected: (files: UploadedFile[]) => void;
}

export function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      uploaded: false
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-600 hover:border-slate-500"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            {isDragActive ? (
              <div>
                <p className="text-lg text-blue-400 mb-2">Drop your files here</p>
                <p className="text-sm text-slate-400">
                  We'll process them automatically
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg text-white mb-2">
                  Drag & drop your invoices here, or click to browse
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Supports PDF, JPG, PNG files up to 10MB each
                </p>
                <Button variant="outline" className="border-slate-600">
                  Choose Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-3">
              {files.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-white">{uploadedFile.file.name}</p>
                      <p className="text-sm text-slate-400">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Process {files.length} File{files.length > 1 ? 's' : ''}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}