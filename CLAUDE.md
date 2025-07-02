# Private Health Insurance Tracker - CLAUDE.md

## Project Overview
A web application for managing private health insurance invoices in Germany, with OCR capabilities and automated processing.

## Tech Stack
- **Next.js 15.3.4** with App Router, TypeScript, ESLint
- **Supabase** for database, authentication, and file storage
- **Tailwind CSS** with modern PostCSS plugin
- **OpenAI GPT-4o** for invoice OCR and text extraction
- **Resend** for email sending functionality
- **shadcn/ui** for professional UI components
- **Lucide React** for icons

## Environment Setup

### Required Environment Variables
Copy `.env.example` to `.env.local` and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI Configuration  
OPENAI_API_KEY=your-openai-api-key

# Resend Configuration (for email sending)
RESEND_API_KEY=your-resend-api-key
```

### Getting API Keys

1. **Supabase**: 
   - Go to https://app.supabase.com/project/_/settings/api
   - Copy Project URL and anon public key

2. **OpenAI**:
   - Visit https://platform.openai.com/api-keys
   - Create new secret key for GPT-4o Vision API

3. **Resend**:
   - Go to https://resend.com/api-keys
   - Create API key for email sending

## Development Commands

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Run production build locally
yarn start

# Run linting
yarn lint

# Run type checking
yarn type-check
```

## Database Schema

### Core Tables

```sql
-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  excess_rules JSONB DEFAULT '{}',
  insurance_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices with OCR data
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  ocr_data JSONB DEFAULT '{}',
  amount DECIMAL(10,2),
  invoice_date DATE,
  invoice_number TEXT,
  provider_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'paid', 'rejected')),
  document_hash TEXT UNIQUE, -- For duplicate detection
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment tracking
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_type TEXT DEFAULT 'bank_transfer' CHECK (payment_type IN ('bank_transfer', 'adjustment', 'partial')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance documents and rules
CREATE TABLE public.insurance_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  document_type TEXT DEFAULT 'policy' CHECK (document_type IN ('policy', 'excess_rules', 'terms')),
  extracted_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring users can only access their own data.

## Key Features

### Phase 1: Foundation ✅
- [x] Next.js setup with Supabase template
- [x] Environment configuration
- [x] Database schema creation
- [x] Authentication system

### Phase 2: Core OCR & Upload
- [ ] File upload with drag-and-drop interface
- [ ] GPT-4o Vision API integration
- [ ] Document hash generation for duplicate detection
- [ ] Invoice data extraction and storage

### Phase 3: Dashboard & Management  
- [ ] Professional dark theme implementation
- [ ] Spreadsheet-style invoice dashboard
- [ ] Advanced filtering and search
- [ ] Payment status tracking
- [ ] Balance calculations with excess rules

### Phase 4: Advanced Features
- [ ] Email drafting functionality
- [ ] Insurance document upload and parsing
- [ ] Custom excess rules configuration
- [ ] Multi-user support

### Phase 5: Polish & Deploy
- [ ] Error handling and validation
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Vercel deployment

## File Structure

```
insurance-tracker/
├── app/                     # Next.js App Router
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Main dashboard
│   ├── invoices/          # Invoice management
│   ├── payments/          # Payment tracking
│   └── settings/          # User settings
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase clients
│   ├── openai/           # OpenAI integration
│   └── utils/            # Helper functions
└── types/                # TypeScript type definitions
```

## OCR Implementation Details

### GPT-4o Vision API Usage
- **Model**: gpt-4o (latest vision model)
- **Accuracy**: ~90% for invoice text extraction
- **Input Format**: Base64 encoded images (convert PDF pages to images)
- **Output**: Structured JSON with invoice details

### Duplicate Detection Strategy
1. Generate SHA-256 hash of normalized invoice content
2. Compare invoice numbers, amounts, and dates
3. Visual similarity detection for scanned documents
4. Flag potential duplicates for user review

## Deployment

### Vercel Deployment
```bash
# Connect to Vercel
vercel

# Deploy to production
vercel --prod
```

### Environment Variables in Production
Set all required environment variables in Vercel dashboard.

## Security Considerations
- Row Level Security (RLS) enabled on all tables
- Input sanitization and validation
- Secure file upload with type restrictions
- API key security (never exposed to client)

## GitHub Issues Tracking

### Current Open Issues
- [#1 Create invoice dashboard with spreadsheet view](https://github.com/telliott22/insurance-tracker/issues/1) - **High Priority**
- [#2 Implement email drafting functionality](https://github.com/telliott22/insurance-tracker/issues/2) - Medium Priority  
- [#3 Add payment tracking and excess calculations](https://github.com/telliott22/insurance-tracker/issues/3) - **High Priority**
- [#4 Setup user settings and insurance configuration](https://github.com/telliott22/insurance-tracker/issues/4) - Medium Priority
- [#5 Add data encryption for sensitive information](https://github.com/telliott22/insurance-tracker/issues/5) - Low Priority

### Project Management
- **Repository**: https://github.com/telliott22/insurance-tracker
- **Issues**: Track all features and bugs via GitHub Issues
- **Pull Requests**: Feature development with proper review process
- **Milestones**: Group related features for release planning

## Future Enhancements
- End-to-end encryption for sensitive data
- Advanced OCR with multiple AI providers
- Mobile app companion
- Integration with German banking APIs
- Automated insurance company email templates

## Troubleshooting

### Common Issues
1. **Supabase Connection**: Verify URL and anon key
2. **OpenAI API**: Check API key and model availability
3. **File Upload**: Ensure Supabase storage bucket is configured
4. **Authentication**: Check Supabase auth settings

### Development Tips
- Use Supabase local development for testing
- Test OCR with sample German invoices
- Implement proper error boundaries
- Use TypeScript strict mode
- Follow accessibility guidelines

## Contact & Support
GitHub Repository: https://github.com/telliott22/insurance-tracker