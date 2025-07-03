"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit2, Save, Calendar, DollarSign, FileText, Building } from "lucide-react";

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

interface InvoicePreviewProps {
  ocrData: OCRData | null;
  onSave: () => void;
  onEdit: () => void;
}

export function InvoicePreview({ ocrData, onSave, onEdit }: InvoicePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: ocrData?.invoice_number || "",
    amount: ocrData?.amount || "",
    date: ocrData?.date || "",
    provider_name: ocrData?.provider_name || "",
    provider_address: ocrData?.provider_address || "",
    notes: ""
  });

  const handleSave = () => {
    // Validate and save
    onSave();
  };

  const confidenceScore = ocrData?.confidence_score || 85;

  return (
    <div className="space-y-6">
      {/* Confidence Score */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">OCR Processing Complete</h3>
                <p className="text-sm text-slate-400">
                  AI extracted data with {confidenceScore}% confidence
                </p>
              </div>
            </div>
            <Badge className={`${
              confidenceScore >= 90 
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : confidenceScore >= 75
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}>
              {confidenceScore}% Confidence
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Invoice Details</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="border-slate-600"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Number */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Invoice Number</span>
              </Label>
              {isEditing ? (
                <Input
                  value={formData.invoice_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <p className="text-white font-medium">{formData.invoice_number || "Not detected"}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Amount</span>
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <p className="text-white font-medium">
                  €{formData.amount ? Number(formData.amount).toFixed(2) : "0.00"}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Invoice Date</span>
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <p className="text-white font-medium">{formData.date || "Not detected"}</p>
              )}
            </div>

            {/* Provider Name */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Provider Name</span>
              </Label>
              {isEditing ? (
                <Input
                  value={formData.provider_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <p className="text-white font-medium">{formData.provider_name || "Not detected"}</p>
              )}
            </div>
          </div>

          {/* Provider Address */}
          <div className="space-y-2">
            <Label className="text-slate-300">Provider Address</Label>
            {isEditing ? (
              <Textarea
                value={formData.provider_address}
                onChange={(e) => setFormData(prev => ({ ...prev, provider_address: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            ) : (
              <p className="text-white">{formData.provider_address || "Not detected"}</p>
            )}
          </div>

          {/* Services */}
          {ocrData?.services && ocrData.services.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-300">Services</Label>
              <div className="space-y-2">
                {ocrData.services.map((service, index: number) => (
                  <div key={index} className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-white">{service.description}</span>
                    <span className="text-white font-medium">€{service.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-slate-300">Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes about this invoice..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onEdit} className="border-slate-600">
          Upload Different File
        </Button>
        <div className="space-x-4">
          {isEditing && (
            <Button 
              onClick={() => setIsEditing(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Save Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}