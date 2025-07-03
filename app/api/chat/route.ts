import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mockUserData = {
  policies: [
    {
      company: "Allianz Private Krankenversicherung",
      policyNumber: "POL-2024-001",
      coverageType: "Comprehensive Health Insurance",
      annualDeductible: 500,
      coveragePercentage: 80,
      maxAnnualBenefit: 50000,
      policyStartDate: "2024-01-01",
      policyEndDate: "2024-12-31"
    }
  ],
  invoices: [
    {
      id: "INV-2024-001",
      amount: 125.50,
      date: "2024-01-15",
      provider: "Dr. Mueller Praxis",
      status: "paid",
      services: ["General examination", "Blood test"],
      reimbursementAmount: 100.40
    },
    {
      id: "INV-2024-002", 
      amount: 89.75,
      date: "2024-02-03",
      provider: "Zahnarzt Dr. Schmidt",
      status: "pending",
      services: ["Dental cleaning", "X-ray"],
      reimbursementAmount: null
    },
    {
      id: "INV-2024-003",
      amount: 245.00,
      date: "2024-02-20",
      provider: "Physiotherapie Berlin",
      status: "submitted",
      services: ["Physical therapy session"],
      reimbursementAmount: null
    }
  ],
  reimbursements: {
    totalPaid: 2450.75,
    totalPending: 890.25,
    totalSubmitted: 3341.00,
    averageProcessingTime: "14 days",
    thisYearTotal: 3341.00,
    remainingDeductible: 245.60
  },
  statistics: {
    totalInvoices: 15,
    paidInvoices: 8,
    pendingInvoices: 4,
    rejectedInvoices: 1,
    averageInvoiceAmount: 156.30
  }
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const systemPrompt = `You are an AI assistant for a German private health insurance tracker application. You help users understand their insurance policies, track reimbursements, and manage their healthcare invoices.

Here is the user's current insurance data:

INSURANCE POLICIES:
${JSON.stringify(mockUserData.policies, null, 2)}

RECENT INVOICES:
${JSON.stringify(mockUserData.invoices, null, 2)}

REIMBURSEMENT SUMMARY:
${JSON.stringify(mockUserData.reimbursements, null, 2)}

STATISTICS:
${JSON.stringify(mockUserData.statistics, null, 2)}

IMPORTANT INSTRUCTIONS:
- Only answer questions based on the provided data above
- If information is not available in the data, clearly state that you don't have that information
- Be helpful and conversational, but stay focused on insurance-related topics
- Provide specific numbers and details when available
- Help users understand their reimbursement status and policy details
- If asked about invoices, refer to the specific invoice IDs and amounts
- Convert amounts to EUR when discussing money
- Be concise but informative in your responses

Answer the user's question based only on the provided insurance data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantResponse = response.choices[0]?.message?.content;
    
    if (!assistantResponse) {
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      response: assistantResponse
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'OpenAI API key not configured' 
        }, { status: 500 });
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }, { status: 429 });
      }
    }

    return NextResponse.json({ 
      error: 'Internal server error during chat processing' 
    }, { status: 500 });
  }
}
