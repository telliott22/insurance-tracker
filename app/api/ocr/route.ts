import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageBase64, fileName } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this German health insurance invoice and extract the following information in JSON format:
              {
                "invoice_number": "string (invoice number/reference)",
                "amount": "number (total amount in EUR)",
                "date": "string (invoice date in YYYY-MM-DD format)",
                "provider_name": "string (healthcare provider name)",
                "provider_address": "string (provider address)",
                "services": [
                  {
                    "description": "string (service description)",
                    "amount": "number (service amount in EUR)",
                    "date": "string (service date if different from invoice date)"
                  }
                ],
                "patient_name": "string (patient name if visible)",
                "confidence_score": "number (your confidence in extraction accuracy 0-100)"
              }
              
              Important:
              - Extract all monetary amounts as numbers (no currency symbols)
              - Use German date format if needed but convert to YYYY-MM-DD
              - Include all services/treatments listed
              - Be precise with medical terminology
              - If information is unclear, use null for that field
              - Provide confidence score based on image quality and text clarity`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for consistent extraction
    });

    const extractedText = response.choices[0]?.message?.content;
    
    if (!extractedText) {
      return NextResponse.json({ error: 'Failed to extract text from image' }, { status: 500 });
    }

    // Parse the JSON response from OpenAI
    let extractedData;
    try {
      // Find JSON in the response (sometimes AI includes explanation text)
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : extractedText;
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return NextResponse.json({ 
        error: 'Failed to parse extracted data',
        rawResponse: extractedText 
      }, { status: 500 });
    }

    // Validate and clean the extracted data
    const cleanedData = {
      invoice_number: extractedData.invoice_number || null,
      amount: typeof extractedData.amount === 'number' ? extractedData.amount : null,
      date: extractedData.date || null,
      provider_name: extractedData.provider_name || null,
      provider_address: extractedData.provider_address || null,
      services: Array.isArray(extractedData.services) ? extractedData.services : [],
      patient_name: extractedData.patient_name || null,
      confidence_score: typeof extractedData.confidence_score === 'number' 
        ? extractedData.confidence_score 
        : 75,
      raw_text: extractedText,
      extracted_at: new Date().toISOString(),
      file_name: fileName
    };

    return NextResponse.json({
      success: true,
      data: cleanedData
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    
    // Handle specific OpenAI errors
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
      error: 'Internal server error during OCR processing' 
    }, { status: 500 });
  }
}