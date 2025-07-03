"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Invoice {
  id: string;
  invoice_number?: string;
  provider_name?: string;
  amount?: number;
  invoice_date?: string;
  status: string;
  created_at: string;
  file_url: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Sorting {
  sortBy: string;
  sortOrder: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  pagination: Pagination;
  sorting: Sorting;
}

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30"
};

export function InvoiceTable({ invoices, pagination, sorting }: InvoiceTableProps) {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return "—";
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getSortLink = (column: string) => {
    const newOrder = sorting.sortBy === column && sorting.sortOrder === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams();
    params.set('sortBy', column);
    params.set('sortOrder', newOrder);
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());
    return `?${params.toString()}`;
  };

  const getPaginationLink = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', pagination.limit.toString());
    params.set('sortBy', sorting.sortBy);
    params.set('sortOrder', sorting.sortOrder);
    return `?${params.toString()}`;
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const toggleAllSelection = () => {
    setSelectedInvoices(prev =>
      prev.length === invoices.length ? [] : invoices.map(inv => inv.id)
    );
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-slate-600 bg-slate-700"
                  />
                </th>
                <th className="p-4 text-left text-slate-300 font-medium">
                  <Link href={getSortLink('invoice_number')} className="flex items-center hover:text-white">
                    Invoice #
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Link>
                </th>
                <th className="p-4 text-left text-slate-300 font-medium">
                  <Link href={getSortLink('provider_name')} className="flex items-center hover:text-white">
                    Provider
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Link>
                </th>
                <th className="p-4 text-left text-slate-300 font-medium">
                  <Link href={getSortLink('amount')} className="flex items-center hover:text-white">
                    Amount
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Link>
                </th>
                <th className="p-4 text-left text-slate-300 font-medium">
                  <Link href={getSortLink('invoice_date')} className="flex items-center hover:text-white">
                    Date
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Link>
                </th>
                <th className="p-4 text-left text-slate-300 font-medium">
                  <Link href={getSortLink('status')} className="flex items-center hover:text-white">
                    Status
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Link>
                </th>
                <th className="p-4 text-left text-slate-300 font-medium">
                  <Link href={getSortLink('created_at')} className="flex items-center hover:text-white">
                    Uploaded
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Link>
                </th>
                <th className="p-4 text-right text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No invoices found. <Link href="/dashboard/upload" className="text-blue-400 hover:underline">Upload your first invoice</Link>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => toggleInvoiceSelection(invoice.id)}
                        className="rounded border-slate-600 bg-slate-700"
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-white font-mono text-sm">
                        {invoice.invoice_number || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white">
                        {invoice.provider_name || "Unknown Provider"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        {formatAmount(invoice.amount)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300">
                        {invoice.invoice_date ? formatDate(invoice.invoice_date) : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[invoice.status as keyof typeof statusColors] || statusColors.pending}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 text-sm">
                        {formatDate(invoice.created_at)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-slate-400 hover:text-white"
                        >
                          <a href={invoice.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={pagination.page === 1}
                className="border-slate-600"
              >
                <Link href={getPaginationLink(pagination.page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    asChild
                    className="border-slate-600"
                  >
                    <Link href={getPaginationLink(pageNum)}>
                      {pageNum}
                    </Link>
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={pagination.page === pagination.pages}
                className="border-slate-600"
              >
                <Link href={getPaginationLink(pagination.page + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedInvoices.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-t border-slate-600">
            <span className="text-sm text-slate-300">
              {selectedInvoices.length} invoice{selectedInvoices.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-slate-600">
                Mark as Submitted
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600">
                Mark as Paid
              </Button>
              <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-500/10">
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}