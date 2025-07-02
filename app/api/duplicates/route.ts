import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      documentHash, 
      invoiceNumber, 
      amount, 
      providerName, 
      invoiceDate 
    } = await request.json();

    const duplicates = [];

    // Check for exact document hash match (exact duplicate)
    if (documentHash) {
      const { data: hashMatches } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .eq('document_hash', documentHash);

      if (hashMatches && hashMatches.length > 0) {
        duplicates.push(...hashMatches.map(invoice => ({
          ...invoice,
          similarity: 100,
          match_type: 'exact_document'
        })));
      }
    }

    // Check for invoice number match
    if (invoiceNumber && duplicates.length === 0) {
      const { data: invoiceMatches } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .eq('invoice_number', invoiceNumber);

      if (invoiceMatches && invoiceMatches.length > 0) {
        duplicates.push(...invoiceMatches.map(invoice => ({
          ...invoice,
          similarity: 95,
          match_type: 'invoice_number'
        })));
      }
    }

    // Check for similar invoices (same provider, similar amount, similar date)
    if (duplicates.length === 0 && providerName && amount && invoiceDate) {
      // Search for invoices with same provider and similar amount (within 5%)
      const amountTolerance = amount * 0.05;
      const minAmount = amount - amountTolerance;
      const maxAmount = amount + amountTolerance;

      // Date tolerance (within 30 days)
      const date = new Date(invoiceDate);
      const startDate = new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000));
      const endDate = new Date(date.getTime() + (30 * 24 * 60 * 60 * 1000));

      const { data: similarMatches } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .ilike('provider_name', `%${providerName}%`)
        .gte('amount', minAmount)
        .lte('amount', maxAmount)
        .gte('invoice_date', startDate.toISOString().split('T')[0])
        .lte('invoice_date', endDate.toISOString().split('T')[0]);

      if (similarMatches && similarMatches.length > 0) {
        duplicates.push(...similarMatches.map(invoice => {
          // Calculate similarity score based on multiple factors
          let similarity = 60; // Base score for matching criteria
          
          // Boost similarity for exact provider name match
          if (invoice.provider_name?.toLowerCase() === providerName.toLowerCase()) {
            similarity += 15;
          }
          
          // Boost similarity for exact amount match
          if (Math.abs((invoice.amount || 0) - amount) < 0.01) {
            similarity += 15;
          }
          
          // Boost similarity for exact date match
          if (invoice.invoice_date === invoiceDate) {
            similarity += 10;
          }

          return {
            ...invoice,
            similarity: Math.min(similarity, 90), // Cap at 90% for similar matches
            match_type: 'similar_invoice'
          };
        }));
      }
    }

    // Remove duplicates and sort by similarity
    const uniqueDuplicates = duplicates
      .filter((item, index, arr) => 
        arr.findIndex(other => other.id === item.id) === index
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Limit to top 5 matches

    return NextResponse.json({
      success: true,
      data: {
        duplicates: uniqueDuplicates,
        count: uniqueDuplicates.length,
        has_exact_duplicate: uniqueDuplicates.some(d => d.similarity === 100)
      }
    });

  } catch (error) {
    console.error('Duplicate check error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during duplicate check' 
    }, { status: 500 });
  }
}