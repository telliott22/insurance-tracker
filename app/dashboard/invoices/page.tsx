import { createClient } from "@/lib/supabase/server";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { InvoiceStats } from "@/components/invoices/invoice-stats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface SearchParams {
  page?: string;
  limit?: string;
  status?: string;
  provider?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface InvoicesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Parse search params
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '10');
  const status = params.status;
  const provider = params.provider;
  const search = params.search;
  const sortBy = params.sortBy || 'created_at';
  const sortOrder = params.sortOrder || 'desc';

  // Build query
  let query = supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  if (provider) {
    query = query.ilike('provider_name', `%${provider}%`);
  }

  if (search) {
    query = query.or(`invoice_number.ilike.%${search}%,provider_name.ilike.%${search}%,notes.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: invoices, error, count } = await query;

  if (error) {
    console.error('Error fetching invoices:', error);
    return <div>Error loading invoices</div>;
  }

  // Calculate stats
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('status, amount')
    .eq('user_id', user.id);

  const stats = {
    total: allInvoices?.length || 0,
    pending: allInvoices?.filter(inv => inv.status === 'pending').length || 0,
    submitted: allInvoices?.filter(inv => inv.status === 'submitted').length || 0,
    paid: allInvoices?.filter(inv => inv.status === 'paid').length || 0,
    rejected: allInvoices?.filter(inv => inv.status === 'rejected').length || 0,
    totalAmount: allInvoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="text-slate-400">
            Manage and track your insurance invoices
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/upload">
            <Plus className="h-4 w-4 mr-2" />
            Upload Invoice
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <InvoiceStats stats={stats} />

      {/* Filters */}
      <InvoiceFilters 
        currentFilters={{
          status,
          provider,
          search,
          sortBy,
          sortOrder
        }}
      />

      {/* Table */}
      <InvoiceTable
        invoices={invoices || []}
        pagination={{
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }}
        sorting={{
          sortBy,
          sortOrder
        }}
      />
    </div>
  );
}