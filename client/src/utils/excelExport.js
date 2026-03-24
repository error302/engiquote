import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  const colWidths = [];
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...data.map(row => String(row[header] || '').length)
      );
      colWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
  }
  worksheet['!cols'] = colWidths;
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportQuotesToExcel = (quotes) => {
  const data = quotes.map(quote => ({
    'Quote #': quote.quoteNumber,
    'Client': quote.project?.client?.name || '',
    'Project': quote.project?.name || '',
    'Status': quote.status,
    'Subtotal': Number(quote.subtotal),
    'Profit': Number(quote.profitAmount),
    'Tax': Number(quote.taxAmount),
    'Total': Number(quote.total),
    'Currency': quote.currency,
    'Valid Until': quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '',
    'Created': new Date(quote.createdAt).toLocaleDateString()
  }));
  
  exportToExcel(data, 'quotes', 'Quotes');
};

export const exportClientsToExcel = (clients) => {
  const data = clients.map(client => ({
    'Name': client.name,
    'Company': client.company || '',
    'Email': client.email || '',
    'Phone': client.phone || '',
    'Address': client.address || '',
    'Created': new Date(client.createdAt).toLocaleDateString()
  }));
  
  exportToExcel(data, 'clients', 'Clients');
};

export const exportProjectsToExcel = (projects) => {
  const data = projects.map(project => ({
    'Name': project.name,
    'Client': project.client?.name || '',
    'Type': project.type,
    'Status': project.status,
    'Description': project.description || '',
    'Created': new Date(project.createdAt).toLocaleDateString()
  }));
  
  exportToExcel(data, 'projects', 'Projects');
};

export const exportMaterialsToExcel = (materials) => {
  const data = materials.map(material => ({
    'Name': material.name,
    'Category': material.category,
    'Unit': material.unit,
    'Unit Price': Number(material.unitPrice),
    'Description': material.description || ''
  }));
  
  exportToExcel(data, 'materials', 'Materials');
};
