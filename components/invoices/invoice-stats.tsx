"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  Send, 
  CheckCircle, 
  XCircle, 
  Euro,
  TrendingUp,
  Calendar
} from "lucide-react";

interface InvoiceStatsProps {
  stats: {
    total: number;
    pending: number;
    submitted: number;
    paid: number;
    rejected: number;
    totalAmount: number;
  };
}

export function InvoiceStats({ stats }: InvoiceStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusPercentage = (count: number) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  const statCards = [
    {
      title: "Total Invoices",
      value: stats.total.toString(),
      icon: FileText,
      description: "All uploaded invoices",
      color: "text-slate-400",
      bgColor: "bg-slate-700/50"
    },
    {
      title: "Pending Review",
      value: stats.pending.toString(),
      icon: Clock,
      description: `${getStatusPercentage(stats.pending)}% of total`,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Submitted",
      value: stats.submitted.toString(),
      icon: Send,
      description: `${getStatusPercentage(stats.submitted)}% of total`,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Paid",
      value: stats.paid.toString(),
      icon: CheckCircle,
      description: `${getStatusPercentage(stats.paid)}% of total`,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Rejected",
      value: stats.rejected.toString(),
      icon: XCircle,
      description: `${getStatusPercentage(stats.rejected)}% of total`,
      color: "text-red-400",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Total Amount",
      value: formatCurrency(stats.totalAmount),
      icon: Euro,
      description: "Sum of all invoices",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`${stat.bgColor} border-slate-700/50`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color} mt-1`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Invoice Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.total > 0 ? (
              <>
                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div className="h-full flex">
                    {stats.pending > 0 && (
                      <div
                        className="bg-yellow-500 h-full"
                        style={{ width: `${getStatusPercentage(stats.pending)}%` }}
                      />
                    )}
                    {stats.submitted > 0 && (
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${getStatusPercentage(stats.submitted)}%` }}
                      />
                    )}
                    {stats.paid > 0 && (
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${getStatusPercentage(stats.paid)}%` }}
                      />
                    )}
                    {stats.rejected > 0 && (
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${getStatusPercentage(stats.rejected)}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                      <span className="text-sm text-slate-300">Pending</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {stats.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                      <span className="text-sm text-slate-300">Submitted</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {stats.submitted}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                      <span className="text-sm text-slate-300">Paid</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {stats.paid}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                      <span className="text-sm text-slate-300">Rejected</span>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      {stats.rejected}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No invoices uploaded yet</p>
                <p className="text-sm text-slate-500 mt-1">Upload your first invoice to see statistics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.total > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Completion Rate</span>
                  <div className="flex items-center">
                    <span className="text-green-400 font-semibold mr-2">
                      {getStatusPercentage(stats.paid)}%
                    </span>
                    <div className="w-16 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${getStatusPercentage(stats.paid)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Average Amount</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(stats.totalAmount / stats.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Pending Actions</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    {stats.pending + stats.submitted}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Success Rate</span>
                  <span className="text-green-400 font-semibold">
                    {stats.total > 0 ? Math.round(((stats.paid) / (stats.paid + stats.rejected)) * 100) || 0 : 0}%
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No insights available</p>
                <p className="text-sm text-slate-500 mt-1">Start uploading invoices to see insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}