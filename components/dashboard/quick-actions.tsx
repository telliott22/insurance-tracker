import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Settings, CreditCard } from "lucide-react";

const actions = [
  {
    title: "Upload Invoice",
    description: "Add a new invoice with AI processing",
    href: "/dashboard/upload",
    icon: Upload,
    color: "bg-blue-600 hover:bg-blue-700"
  },
  {
    title: "View All Invoices",
    description: "Manage and track your invoices",
    href: "/dashboard/invoices",
    icon: FileText,
    color: "bg-green-600 hover:bg-green-700"
  },
  {
    title: "Record Payment",
    description: "Log insurance reimbursements",
    href: "/dashboard/payments",
    icon: CreditCard,
    color: "bg-purple-600 hover:bg-purple-700"
  },
  {
    title: "Settings",
    description: "Configure excess rules and insurance info",
    href: "/dashboard/settings",
    icon: Settings,
    color: "bg-slate-600 hover:bg-slate-700"
  }
];

export function QuickActions() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              asChild
              className={`w-full h-auto p-4 flex flex-col items-start space-y-2 ${action.color}`}
            >
              <Link href={action.href}>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <p className="text-sm opacity-90 text-left">
                  {action.description}
                </p>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}