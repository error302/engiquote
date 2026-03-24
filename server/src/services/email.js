import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendQuoteEmail = async ({ to, quote, client, project, companySettings }) => {
  const subject = `Quote ${quote.quoteNumber} from ${companySettings.companyName || 'EngiQuote KE'}`;
  
  const itemsHtml = quote.items?.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.description}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.unit}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${Number(item.unitPrice).toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${Number(item.total).toLocaleString()}</td>
    </tr>
  `).join('') || '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1E40AF; color: white; padding: 20px; text-align: center;">
        <h1>${companySettings.companyName || 'EngiQuote KE'}</h1>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <h2>Quote #${quote.quoteNumber}</h2>
        <p><strong>Date:</strong> ${new Date(quote.createdAt).toLocaleDateString()}</p>
        <p><strong>Valid Until:</strong> ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</p>
        
        <h3>Bill To:</h3>
        <p>
          <strong>${client.name}</strong><br>
          ${client.company || ''}<br>
          ${client.email || ''}<br>
          ${client.phone || ''}
        </p>
        
        <h3>Project: ${project.name}</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #1E40AF; color: white;">
              <th style="padding: 12px; text-align: left;">Description</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: center;">Unit</th>
              <th style="padding: 12px; text-align: right;">Unit Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px;">
          <p>Subtotal: <strong>KSh ${Number(quote.subtotal).toLocaleString()}</strong></p>
          <p>Profit (${quote.profitMarginPercent}%): <strong>KSh ${Number(quote.profitAmount).toLocaleString()}</strong></p>
          <p>Tax (${quote.taxPercent}%): <strong>KSh ${Number(quote.taxAmount).toLocaleString()}</strong></p>
          <h3>Total: KSh ${Number(quote.total).toLocaleString()}</h3>
        </div>
        
        ${quote.notes ? `<p><strong>Notes:</strong> ${quote.notes}</p>` : ''}
        
        <div style="margin-top: 30px; padding: 15px; background: #e8f4fd; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            This quote is valid for 30 days from the date of issue.<br>
            Payment terms: 50% deposit upon acceptance, 50% upon completion.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${companySettings.companyName || 'EngiQuote KE'}" <${companySettings.companyEmail || process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async ({ to, name, password }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1E40AF;">Welcome to EngiQuote KE!</h2>
      <p>Hello ${name},</p>
      <p>Your account has been created. Here are your login credentials:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>Please login and change your password immediately.</p>
      <a href="${process.env.APP_URL || 'http://localhost:5173'}" style="display: inline-block; background: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login Now</a>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Welcome to EngiQuote KE',
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};
