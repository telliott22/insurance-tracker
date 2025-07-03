import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${user.id}/${Date.now()}_${crypto.randomUUID()}.${fileExtension}`;

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
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

    // Get signed URL for private access (expires in 1 hour)
    const { data: signedUrlData, error: signUrlError } = await supabase.storage
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