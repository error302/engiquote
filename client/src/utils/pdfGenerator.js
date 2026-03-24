import jsPDF from 'jspdf';

export const generateQuotePDF = (quote, settings = {}) => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;
  
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175);
  doc.text(settings.companyName || 'EngiQuote KE', margin, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  
  if (settings.companyAddress) {
    doc.text(settings.companyAddress, margin, y);
    y += 5;
  }
  if (settings.companyPhone) {
    doc.text(`Phone: ${settings.companyPhone}`, margin, y);
    y += 5;
  }
  if (settings.companyEmail) {
    doc.text(`Email: ${settings.companyEmail}`, margin, y);
    y += 5;
  }
  
  y += 10;
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175);
  doc.text('QUOTE', pageWidth - margin, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Quote #: ${quote.quoteNumber}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, pageWidth - margin, 35, { align: 'right' });
  if (quote.validUntil) {
    doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, pageWidth - margin, 40, { align: 'right' });
  }
  
  y = 55;
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Bill To:', margin, y);
  
  y += 6;
  doc.setFontSize(10);
  doc.text(quote.project?.client?.name || '', margin, y);
  y += 5;
  if (quote.project?.client?.company) {
    doc.text(quote.project?.client?.company, margin, y);
    y += 5;
  }
  if (quote.project?.client?.address) {
    doc.text(quote.project?.client?.address, margin, y);
    y += 5;
  }
  if (quote.project?.client?.email) {
    doc.text(quote.project?.client?.email, margin, y);
    y += 5;
  }
  if (quote.project?.client?.phone) {
    doc.text(quote.project?.client?.phone, margin, y);
    y += 5;
  }
  
  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont(undefined, 'bold');
  doc.text('Description', margin + 2, y);
  doc.text('Qty', 110, y);
  doc.text('Unit', 130, y);
  doc.text('Price', 150, y);
  doc.text('Total', 175, y);
  
  y += 8;
  doc.setFont(undefined, 'normal');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y - 3, pageWidth - margin, y - 3);
  
  quote.items?.forEach((item, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, 'F');
    }
    
    const desc = item.description?.substring(0, 40) || '';
    doc.text(desc, margin + 2, y);
    doc.text(String(item.quantity), 110, y);
    doc.text(item.unit, 130, y);
    doc.text(Number(item.unitPrice).toLocaleString(), 150, y);
    doc.text(Number(item.total).toLocaleString(), 175, y);
    y += 8;
  });
  
  y += 5;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  
  const totalsX = 140;
  doc.setFontSize(10);
  doc.text('Subtotal:', totalsX, y);
  doc.text(`KSh ${Number(quote.subtotal || 0).toLocaleString()}`, 175, y, { align: 'right' });
  y += 7;
  
  doc.text(`Profit (${quote.profitMarginPercent || 0}%):`, totalsX, y);
  doc.text(`KSh ${Number(quote.profitAmount || 0).toLocaleString()}`, 175, y, { align: 'right' });
  y += 7;
  
  doc.text(`Tax (${quote.taxPercent || 0}%):`, totalsX, y);
  doc.text(`KSh ${Number(quote.taxAmount || 0).toLocaleString()}`, 175, y, { align: 'right' });
  y += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total:', totalsX, y);
  doc.text(`KSh ${Number(quote.total || 0).toLocaleString()}`, 175, y, { align: 'right' });
  
  if (quote.notes) {
    y += 20;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', margin, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    const splitNotes = doc.splitTextToSize(quote.notes, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, y);
  }
  
  y += 20;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This quote is valid for 30 days from the date of issue.', margin, y);
  y += 5;
  doc.text('Payment terms: 50% deposit upon acceptance, 50% upon completion.', margin, y);
  
  doc.save(`${quote.quoteNumber}.pdf`);
};
