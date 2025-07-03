export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    updateUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      createSignedUrl: jest.fn(),
    })),
  },
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(() => Promise.resolve({
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
                    }
                  ],
                  patient_name: 'Max Mustermann',
                  confidence_score: 95
                })
              }
            }
          ]
        })),
      },
    },
  }))
})
