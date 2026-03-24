import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileText, Check, X, Clock } from 'lucide-react';
import { quotesApi, clientsApi } from '../services/api';

export default function ClientPortal() {
  const [searchParams] = useSearchParams();
  const [quotes, setQuotes] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [error, setError] = useState('');

  const clientId = searchParams.get('client');

  useEffect(() => {
    if (clientId) {
      loadClientQuotes();
    } else {
      setLoading(false);
    }
  }, [clientId]);

  const loadClientQuotes = async () => {
    try {
      const clientsRes = await clientsApi.getById(clientId);
      setClient(clientsRes.data);
      
      const quotesRes = await quotesApi.getAll();
      const clientQuotes = quotesRes.data.filter(q => q.project?.clientId === clientId);
      setQuotes(clientQuotes);
    } catch (error) {
      setError('Unable to load client quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const clientsRes = await clientsApi.getAll();
      const foundClient = clientsRes.data.find(c => c.email?.toLowerCase() === searchEmail.toLowerCase());
      if (foundClient) {
        window.location.href = `/portal?client=${foundClient.id}`;
      } else {
        setError('No client found with that email');
      }
    } catch (error) {
      setError('Unable to search client');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return <Check className="text-green-500" size={16} />;
      case 'REJECTED': return <X className="text-red-500" size={16} />;
      default: return <Clock className="text-amber-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Client Portal</h1>
            <p className="text-gray-500 mt-2">View your quotes by entering your email</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="you@company.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-light transition-colors"
            >
              View My Quotes
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Welcome{client?.name ? `, ${client.name}` : ''}</h1>
          <p className="text-primary-light mt-1">Here are your quotes from EngiQuote KE</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {quotes.length > 0 ? (
          <div className="space-y-4">
            {quotes.map(quote => (
              <div key={quote.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{quote.quoteNumber}</h3>
                    <p className="text-gray-500 text-sm">{quote.project?.name}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(quote.status)}
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pb-2">Description</th>
                        <th className="pb-2 text-center">Qty</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items?.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2">{item.description}</td>
                          <td className="py-2 text-center">{item.quantity} {item.unit}</td>
                          <td className="py-2 text-right">KSh {Number(item.unitPrice).toLocaleString()}</td>
                          <td className="py-2 text-right">KSh {Number(item.total).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="border-t mt-4 pt-4 flex justify-end">
                  <div className="text-right space-y-1">
                    <p className="text-sm text-gray-500">
                      Subtotal: KSh {Number(quote.subtotal).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Tax ({quote.taxPercent}%): KSh {Number(quote.taxAmount).toLocaleString()}
                    </p>
                    <p className="text-lg font-bold">Total: KSh {Number(quote.total).toLocaleString()}</p>
                  </div>
                </div>
                
                {quote.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                    <strong>Notes:</strong> {quote.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-500">No quotes found for this client</p>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link to="/portal" className="text-primary hover:underline">
            Search for different client
          </Link>
        </div>
      </div>
    </div>
  );
}
