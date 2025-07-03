import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Upload API - Auth check:', { user: user?.id, authError });

    if (authError || !user) {
      console.log('Upload API - Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    console.log('Upload API - User profile check:', { userProfile, profileError });

    if (profileError || !userProfile) {
      console.log('Upload API - User profile missing, creating...');
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || null
        });

      if (createError) {
        console.error('Upload API - Failed to create user profile:', createError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.'
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 10MB.'
      }, { status: 400 });
    }

    // Generate unique file name - try without user folder structure first
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${crypto.randomUUID()}.${fileExtension}`;

    console.log('Upload API - Attempting upload with filename:', uniqueFileName);

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Upload API - Service role key available:', !!serviceRoleKey);

    if (!serviceRoleKey) {
      console.error('Upload API - Service role key not available');
      return NextResponse.json({
        error: 'Server configuration error - missing service role key'
      }, { status: 500 });
    }

    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    console.log('Upload API - Using service role for storage upload...');

    const { error: uploadError } = await serviceSupabase.storage
      .from('invoices')
      .upload(uniqueFileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({
        error: 'Failed to upload file to storage'
      }, { status: 500 });
    }

    // Get signed URL for private access (expires in 1 hour) using service role
    const { data: signedUrlData, error: signUrlError } = await serviceSupabase.storage
      .from('invoices')
      .createSignedUrl(uniqueFileName, 3600);

    if (signUrlError || !signedUrlData) {
      console.error('Signed URL error:', signUrlError);
      return NextResponse.json({
        error: 'Failed to create file access URL'
      }, { status: 500 });
    }

    // Generate document hash for duplicate detection
    const documentHash = crypto
      .createHash('sha256')
      .update(Buffer.from(fileBuffer))
      .digest('hex');

    return NextResponse.json({
      success: true,
      data: {
        file_url: signedUrlData.signedUrl,
        file_path: uniqueFileName,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        document_hash: documentHash,
        uploaded_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Internal server error during file upload'
    }, { status: 500 });
  }
}
