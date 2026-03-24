import { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, DollarSign, X } from 'lucide-react';
import { invoicesApi, quotesApi, clientsApi } from '../services/api';

const CURRENCY_SYMBOLS = { KES: 'KSh', USD: '$', EUR: '€', GBP: '£' };

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ quoteId: '', clientId: '', amount: '', dueDate: '', notes: '' });
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'bank_transfer', reference: '', notes: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesRes, quotesRes, clientsRes] = await Promise.all([
        invoicesApi.getAll(),
        quotesApi.getAll(),
        clientsApi.getAll()
      ]);
      setInvoices(invoicesRes.data);
      setQuotes(quotesRes.data.filter(q => q.status === 'ACCEPTED'));
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.quoteId) {
        await invoicesApi.createFromQuote({ quoteId: formData.quoteId, dueDate: formData.dueDate });
      } else {
        await invoicesApi.create(formData);
      }
      setShowModal(false);
      setFormData({ quoteId: '', clientId: '', amount: '', dueDate: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice');
    }
  };

  const handleQuoteSelect = (quoteId) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      setFormData({ ...formData, quoteId, clientId: quote.project?.clientId, amount: quote.total });
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await invoicesApi.addPayment(selectedInvoice.id, paymentData);
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentData({ amount: '', method: 'bank_transfer', reference: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Failed to add payment:', error);
      alert('Failed to add payment');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this invoice?')) {
      try {
        await invoicesApi.delete(id);
        loadData();
      } catch (error) {
        alert('Failed to delete invoice');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'PARTIAL': return 'bg-amber-100 text-amber-700';
      case 'OVERDUE': return 'bg-red-100 text-red-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const acceptedQuotes = quotes.filter(q => !invoices.some(inv => inv.quoteId === q.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Invoices</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light">
          <Plus size={20} /> New Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Invoice #</th>
              <th className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Client</th>
              <th className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Quote</th>
              <th className="px-4 py-3 text-right text-sm font-semibold dark:text-gray-200">Amount</th>
              <th className="px-4 py-3 text-right text-sm font-semibold dark:text-gray-200">Paid</th>
              <th className="px-4 py-3 text-center text-sm font-semibold dark:text-gray-200">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map(invoice => (
                <tr key={invoice.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium dark:text-white">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{invoice.client?.name}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{invoice.quote?.quoteNumber || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold dark:text-white">KSh {Number(invoice.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right dark:text-gray-300">KSh {Number(invoice.paidAmount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setSelectedInvoice(invoice); setPaymentData({ ...paymentData, amount: invoice.amount - invoice.paidAmount }); setShowPaymentModal(true); }} className="text-green-600 hover:text-green-800 mr-3" title="Add Payment">
                      <DollarSign size={18} />
                    </button>
                    <button onClick={() => handleDelete(invoice.id)} className="text-red-500 hover:text-red-700" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No invoices yet. Create your first invoice!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">New Invoice</h2>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">From Quote (optional)</label>
                <select
                  value={formData.quoteId}
                  onChange={e => handleQuoteSelect(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Quote</option>
                  {acceptedQuotes.map(q => (
                    <option key={q.id} value={q.id}>{q.quoteNumber} - {q.project?.client?.name}</option>
                  ))}
                </select>
              </div>
              {!formData.quoteId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Client *</label>
                    <select
                      required
                      value={formData.clientId}
                      onChange={e => setFormData({...formData, clientId: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Amount</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg dark:text-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Add Payment</h2>
              <button onClick={() => setShowPaymentModal(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm dark:text-gray-300">Invoice: {selectedInvoice.invoiceNumber}</p>
              <p className="text-sm dark:text-gray-300">Amount: KSh {Number(selectedInvoice.amount).toLocaleString()}</p>
              <p className="text-sm dark:text-gray-300">Paid: KSh {Number(selectedInvoice.paidAmount).toLocaleString()}</p>
              <p className="text-sm font-medium dark:text-white">Balance: KSh {Number(selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString()}</p>
            </div>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Amount *</label>
                <input
                  type="number"
                  required
                  value={paymentData.amount}
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Payment Method</label>
                <select
                  value={paymentData.method}
                  onChange={e => setPaymentData({...paymentData, method: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Reference</label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={e => setPaymentData({...paymentData, reference: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border rounded-lg dark:text-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Add Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
