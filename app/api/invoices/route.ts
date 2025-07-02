import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch user's invoices
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    const search = searchParams.get('search');

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

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: invoices, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('GET invoices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoiceData = await request.json();

    // Validate required fields
    if (!invoiceData.file_url) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Prepare invoice data for database
    const newInvoice = {
      user_id: user.id,
      file_url: invoiceData.file_url,
      file_name: invoiceData.file_name,
      file_size: invoiceData.file_size,
      ocr_data: invoiceData.ocr_data || {},
      amount: invoiceData.amount,
      invoice_date: invoiceData.invoice_date,
      invoice_number: invoiceData.invoice_number,
      provider_name: invoiceData.provider_name,
      provider_address: invoiceData.provider_address,
      status: invoiceData.status || 'pending',
      document_hash: invoiceData.document_hash,
      notes: invoiceData.notes || null
    };

    // Insert invoice into database
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert([newInvoice])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      
      // Handle duplicate document hash
      if (error.code === '23505' && error.message.includes('document_hash')) {
        return NextResponse.json({ 
          error: 'This invoice has already been uploaded' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ error: 'Failed to save invoice' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('POST invoice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}