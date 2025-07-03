import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { CHAT_ASSISTANT_SYSTEM_PROMPT } from '@/lib/prompts/chat-assistant';

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

    const { message, messages } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const conversationMessages = [];
    
    const systemPrompt = CHAT_ASSISTANT_SYSTEM_PROMPT
      .replace('{policies}', JSON.stringify(mockUserData.policies, null, 2))
      .replace('{invoices}', JSON.stringify(mockUserData.invoices, null, 2))
      .replace('{reimbursements}', JSON.stringify(mockUserData.reimbursements, null, 2))
      .replace('{statistics}', JSON.stringify(mockUserData.statistics, null, 2));
    
    conversationMessages.push({
      role: "system",
      content: systemPrompt
    });

    if (messages && Array.isArray(messages)) {
      const recentMessages = messages.slice(-10);
      conversationMessages.push(...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    conversationMessages.push({
      role: "user",
      content: message
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversationMessages,
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
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json({ 
          error: 'OpenAI quota exceeded. Please try again later or contact support.' 
        }, { status: 429 });
      }
    }

    return NextResponse.json({ 
      error: 'Internal server error during chat processing' 
    }, { status: 500 });
  }
}
