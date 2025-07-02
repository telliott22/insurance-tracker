"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, FileText } from "lucide-react";

interface DuplicateCheckProps {
  duplicates: any[];
  onContinue: () => void;
}

export function DuplicateCheck({ duplicates, onContinue }: DuplicateCheckProps) {
  const hasDuplicates = duplicates.length > 0;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          {hasDuplicates ? (
            <>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Potential Duplicates Found</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>No Duplicates Detected</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasDuplicates ? (
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 font-medium mb-2">
                We found {duplicates.length} potential duplicate{duplicates.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-slate-300">
                Please review these matches to avoid double payments.
              </p>
            </div>

            <div className="space-y-4">
              {duplicates.map((duplicate, index) => (
                <div key={index} className="border border-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-yellow-500" />
                      <div>
                        <h4 className="font-medium text-white">
                          {duplicate.provider_name || "Unknown Provider"}
                        </h4>
                        <p className="text-sm text-slate-400">
                          Invoice #{duplicate.invoice_number}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {duplicate.similarity}% Match
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Amount</p>
                      <p className="text-white">€{duplicate.amount}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Date</p>
                      <p className="text-white">{duplicate.date}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status</p>
                      <p className="text-white">{duplicate.status}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Uploaded</p>
                      <p className="text-white">{duplicate.uploaded_date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" className="border-slate-600">
                Cancel Upload
              </Button>
              <Button onClick={onContinue} className="bg-yellow-600 hover:bg-yellow-700">
                Continue Anyway
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              All Clear!
            </h3>
            <p className="text-slate-400 mb-6">
              No duplicate invoices were found. Your invoice appears to be unique.
            </p>
            <Button onClick={onContinue} className="bg-green-600 hover:bg-green-700">
              Continue to Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}