import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Upload, Mail, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="w-full border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-white">Insurance Tracker</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Manage Your
              <span className="text-blue-500 block">Health Insurance</span>
              Invoices
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Stop double-paying invoices. Upload, scan, and track your private health insurance invoices 
              with AI-powered OCR. Automated duplicate detection and insurance company communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/sign-up">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Everything you need to manage invoices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Upload className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle className="text-white">Smart Upload</CardTitle>
                <CardDescription className="text-slate-400">
                  Drag & drop invoices with automatic OCR processing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <FileText className="h-10 w-10 text-green-500 mb-2" />
                <CardTitle className="text-white">Duplicate Detection</CardTitle>
                <CardDescription className="text-slate-400">
                  AI-powered detection prevents double payments
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Mail className="h-10 w-10 text-purple-500 mb-2" />
                <CardTitle className="text-white">Auto Email Drafts</CardTitle>
                <CardDescription className="text-slate-400">
                  Generate emails to insurance companies automatically
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle className="text-white">Payment Tracking</CardTitle>
                <CardDescription className="text-slate-400">
                  Track reimbursements and outstanding amounts
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upload Invoice</h3>
              <p className="text-slate-400">
                Scan or upload your invoice. Our AI extracts all details automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Processing</h3>
              <p className="text-slate-400">
                Check for duplicates and verify all invoice details are correct.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Submit & Track</h3>
              <p className="text-slate-400">
                Send to insurance company and track payment status in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
