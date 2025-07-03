export const sampleFile = new File(['sample content'], 'test-invoice.pdf', {
  type: 'application/pdf',
})

export const sampleImageFile = new File(['image content'], 'test-invoice.jpg', {
  type: 'image/jpeg',
})

export const sampleOCRData = {
  invoice_number: 'INV-2024-001',
  amount: 125.50,
  date: '2024-01-15',
  provider_name: 'Dr. Mueller Praxis',
  provider_address: 'Hauptstraße 123, 10115 Berlin',
  services: [
    {
      description: 'Allgemeine Untersuchung',
      amount: 75.50,
      date: '2024-01-15'
    }
  ],
  patient_name: 'Max Mustermann',
  confidence_score: 95,
  raw_text: 'Sample extracted text',
  extracted_at: '2024-01-15T10:00:00Z',
  file_name: 'test-invoice.pdf'
}

export const sampleInvoice = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user-123',
  file_url: 'https://example.com/invoice.pdf',
  file_name: 'test-invoice.pdf',
  file_size: 1024,
  amount: 125.50,
  invoice_date: '2024-01-15',
  invoice_number: 'INV-2024-001',
  provider_name: 'Dr. Mueller Praxis',
  provider_address: 'Hauptstraße 123, 10115 Berlin',
  status: 'pending',
  document_hash: 'abc123def456',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
}

export const sampleDuplicate = {
  ...sampleInvoice,
  id: '456e7890-e89b-12d3-a456-426614174001',
  similarity: 95,
  match_type: 'invoice_number'
}

export const mockOpenAIResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          invoice_number: 'INV-2024-001',
          amount: 125.50,
          date: '2024-01-15',
          provider_name: 'Dr. Mueller Praxis',
          provider_address: 'Hauptstraße 123, 10115 Berlin',
          services: [
            {
              description: 'Allgemeine Untersuchung',
              amount: 75.50,
              date: '2024-01-15'
            },
            {
              description: 'Blutuntersuchung',
              amount: 50.00,
              date: '2024-01-15'
            }
          ],
          patient_name: 'Max Mustermann',
          confidence_score: 95
        })
      }
    }
  ]
}
