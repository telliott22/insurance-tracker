import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch dashboard data
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Future: Use for payment tracking
  // const { data: payments } = await supabase
  //   .from('payments')
  //   .select('*')
  //   .eq('user_id', user.id)
  //   .order('payment_date', { ascending: false })
  //   .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Welcome back! Here&apos;s an overview of your insurance invoices.
        </p>
      </div>

      <DashboardStats userId={user.id} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentInvoices invoices={invoices || []} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}