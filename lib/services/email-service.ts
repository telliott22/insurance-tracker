import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@insurance-tracker.com';

  async sendProcessingCompleteEmail(
    userEmail: string,
    invoiceData: {
      fileName: string;
      providerName?: string;
      amount?: number;
      invoiceNumber?: string;
    }
  ): Promise<void> {
    const subject = 'Invoice Processing Complete';
    const html = `
      <h2>Your invoice has been processed successfully!</h2>
      <p>We've finished processing your invoice and it's now available in your dashboard.</p>
      
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3>Invoice Details:</h3>
        <p><strong>File:</strong> ${invoiceData.fileName}</p>
        ${invoiceData.providerName ? `<p><strong>Provider:</strong> ${invoiceData.providerName}</p>` : ''}
        ${invoiceData.amount ? `<p><strong>Amount:</strong> €${invoiceData.amount}</p>` : ''}
        ${invoiceData.invoiceNumber ? `<p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>` : ''}
      </div>
      
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a></p>
    `;

    await this.sendEmail(userEmail, subject, html);
  }

  async sendProcessingErrorEmail(
    userEmail: string,
    fileName: string,
    errorMessage: string
  ): Promise<void> {
    const subject = 'Invoice Processing Failed';
    const html = `
      <h2>There was an issue processing your invoice</h2>
      <p>We encountered an error while processing your invoice: <strong>${fileName}</strong></p>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Error:</strong> ${errorMessage}</p>
      </div>
      
      <p>Please try uploading the invoice again, or contact support if the issue persists.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/upload" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Try Again</a></p>
    `;

    await this.sendEmail(userEmail, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}
