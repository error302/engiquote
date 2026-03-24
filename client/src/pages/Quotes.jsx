import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Copy, Download, Mail } from 'lucide-react';
import { quotesApi, emailApi } from '../services/api';
import QuoteBuilder from '../components/QuoteBuilder';
import { exportQuotesToExcel } from '../utils/excelExport';
import { generateQuotePDF } from '../utils/pdfGenerator';

const CURRENCY_SYMBOLS = { KES: 'KSh', USD: '$', EUR: '€', GBP: '£' };

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const res = await quotesApi.getAll();
      setQuotes(res.data);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this quote?')) {
      try {
        await quotesApi.delete(id);
        loadQuotes();
      } catch (error) {
        console.error('Failed to delete quote:', error);
        alert('Failed to delete quote');
      }
    }
  };

  const handleView = (quote) => {
    setEditingQuote(quote);
    setShowBuilder(true);
  };

  const handleNewQuote = () => {
    setEditingQuote(null);
    setShowBuilder(true);
  };

  const handleDuplicate = async (id) => {
    try {
      await quotesApi.duplicate(id);
      loadQuotes();
    } catch (error) {
      console.error('Failed to duplicate quote:', error);
      alert('Failed to duplicate quote');
    }
  };

  const handleExportExcel = () => {
    exportQuotesToExcel(quotes);
  };

  const handleSendEmail = async (quote) => {
    const email = prompt('Enter email address:', quote.project?.client?.email || '');
    if (email) {
      try {
        await emailApi.sendQuote({ quoteId: quote.id, to: email });
        alert('Quote sent successfully!');
      } catch (error) {
        console.error('Failed to send quote:', error);
        alert('Failed to send quote. Make sure SMTP is configured.');
      }
    }
  };

  const getCurrencySymbol = (currency) => CURRENCY_SYMBOLS[currency] || currency;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'SENT': return 'bg-blue-100 text-blue-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

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
        <h1 className="text-2xl font-bold dark:text-white">Quotes</h1>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
            <Download size={20} /> Export Excel
          </button>
          <button onClick={handleNewQuote} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light transition-colors">
            <Plus size={20} /> New Quote
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Quote #</th>
              <th className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Client</th>
              <th className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Project</th>
              <th className="px-4 py-3 text-right text-sm font-semibold dark:text-gray-200">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-semibold dark:text-gray-200">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold dark:text-gray-200">Actions</th>
            </tr>
          </thead>
            <tbody>
              {quotes.length > 0 ? (
                quotes.map(quote => (
                  <tr key={quote.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium dark:text-white">{quote.quoteNumber}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{quote.project?.client?.name || '-'}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{quote.project?.name || '-'}</td>
                    <td className="px-4 py-3 text-right font-semibold dark:text-white">{getCurrencySymbol(quote.currency)} {Number(quote.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleView(quote)} className="text-primary hover:text-primary-light mr-3" title="View/Edit">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleDuplicate(quote.id)} className="text-amber-600 hover:text-amber-800 mr-3" title="Duplicate">
                        <Copy size={18} />
                      </button>
                      <button onClick={() => handleDelete(quote.id)} className="text-red-500 hover:text-red-700" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No quotes yet. Create your first quote!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showBuilder && (
        <QuoteBuilder
          quote={editingQuote}
          onClose={() => { setShowBuilder(false); setEditingQuote(null); }}
          onSave={loadQuotes}
        />
      )}
    </div>
  );
}
