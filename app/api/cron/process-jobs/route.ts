import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/process-jobs`, {
      method: 'POST',
    });

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      processed: result.processed 
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Failed to process jobs' }, { status: 500 });
  }
}
