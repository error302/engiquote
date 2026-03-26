export function formatCurrency(amount, currency = 'KES') {
  if (amount === null || amount === undefined) return 'KSh 0';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-KE');
}

export function formatDateTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-KE');
}

export function getStatusColor(status) {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SENT: 'bg-blue-100 text-blue-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-orange-100 text-orange-700',
    OVERDUE: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function generateWhatsAppLink(phone, message) {
  const cleanPhone = phone.replace(/^0/, '254').replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
