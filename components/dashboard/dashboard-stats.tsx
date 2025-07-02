import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, DollarSign } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const supabase = await createClient();

  // Fetch invoice statistics
  const { data: invoices } = await supabase
    .from('invoices')
    .select('status, amount')
    .eq('user_id', userId);

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('user_id', userId);

  // Calculate stats
  const totalInvoices = invoices?.length || 0;
  const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0;
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
  // const totalAmount = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const totalPaid = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  const stats = [
    {
      title: "Total Invoices",
      value: totalInvoices.toString(),
      icon: FileText,
      color: "text-blue-500"
    },
    {
      title: "Pending",
      value: pendingInvoices.toString(),
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Paid",
      value: paidInvoices.toString(),
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      title: "Total Reimbursed",
      value: `€${totalPaid.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}