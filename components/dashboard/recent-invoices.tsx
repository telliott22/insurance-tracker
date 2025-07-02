import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/types/database";
import { formatDistanceToNow } from "date-fns";

interface RecentInvoicesProps {
  invoices: Invoice[];
}

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Recent Invoices</CardTitle>
        <Button asChild variant="outline" size="sm" className="border-slate-600">
          <Link href="/dashboard/invoices">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No invoices uploaded yet</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/upload">Upload Your First Invoice</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-white">
                        {invoice.provider_name || "Unknown Provider"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {invoice.invoice_number && `#${invoice.invoice_number} • `}
                        {invoice.created_at && formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {invoice.amount && (
                    <span className="font-semibold text-white">
                      €{invoice.amount.toFixed(2)}
                    </span>
                  )}
                  <Badge className={statusColors[invoice.status]}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}