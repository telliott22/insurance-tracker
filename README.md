# Private Health Insurance Tracker

<p align="center">
 Streamline your private health insurance management with AI-powered invoice processing
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#usage"><strong>Usage</strong></a> ·
  <a href="#support"><strong>Support</strong></a>
</p>
<br/>

## Features

- **AI-Powered OCR**: Automatically extract invoice data using GPT-4o Vision API
- **Smart Duplicate Detection**: Prevent duplicate invoice submissions with intelligent matching
- **Secure File Storage**: Your documents are safely stored with enterprise-grade security
- **Payment Tracking**: Monitor reimbursement status and calculate outstanding balances
- **German Insurance Optimized**: Specifically designed for German private health insurance workflows
- **Dark Theme Interface**: Professional, easy-on-the-eyes design for extended use

## Getting Started

### Prerequisites
- A Supabase account for database and authentication
- An OpenAI API key for invoice processing
- Node.js 18+ and yarn/npm

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/telliott22/insurance-tracker.git
   cd insurance-tracker
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env.local` and add your credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_DB_PASSWORD=your-database-password
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Start the development server**
   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to access the application.

## Usage

### Upload Invoices
1. Navigate to the Upload section
2. Drag and drop your invoice PDFs or images
3. The AI will automatically extract key information
4. Review and confirm the extracted data

### Track Payments
1. View all invoices in the dashboard
2. Monitor payment status and amounts
3. Calculate outstanding reimbursements
4. Export data for your records

### Manage Settings
1. Configure your insurance excess rules
2. Set up automated email templates
3. Customize processing preferences

## Technical Details

This application is built with modern web technologies:
- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Supabase for database, auth, and file storage
- **AI Processing**: OpenAI GPT-4o for invoice OCR
- **Deployment**: Optimized for cloud deployment

For detailed technical documentation, see [CLAUDE.md](./CLAUDE.md).

## Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/telliott22/insurance-tracker/issues)
- **Documentation**: See [CLAUDE.md](./CLAUDE.md) for technical details
- **Security**: This application handles sensitive financial data with enterprise-grade security practices

## License

This project is private and proprietary.
