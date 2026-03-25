import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, TextInput, Text } from 'react-native-paper';
import { portalApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';

export default function SharedQuotePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState<any>(null);
  const [error, setError] = useState('');
  const [revisionComment, setRevisionComment] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [token]);

  const loadQuote = async () => {
    try {
      const res = await portalApi.getByToken(token!);
      setShare(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Quote not found');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await portalApi.approve(token!);
      setShare((prev: any) => ({ ...prev, status: 'APPROVED', approvedAt: new Date() }));
    } catch (error) {
      alert('Failed to approve quote');
    }
  };

  const handleRevision = async () => {
    if (!revisionComment.trim()) {
      alert('Please add a comment explaining what you need changed');
      return;
    }
    try {
      await portalApi.requestRevision(token!, revisionComment);
      setShare((prev: any) => ({ ...prev, status: 'REVISION_REQUESTED', comments: revisionComment }));
      setShowRevisionForm(false);
    } catch (error) {
      alert('Failed to submit revision request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Quote Not Available</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!share) return null;

  const project = share.project;
  const quote = project?.quotes?.[0];
  const isApproved = share.status === 'APPROVED';
  const isRevisionRequested = share.status === 'REVISION_REQUESTED';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">EngiQuote KE</h1>
          <p className="text-gray-500 mt-2">Professional Engineering Estimates</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">{project?.name}</h2>
              <p className="text-gray-500">{project?.client?.name}</p>
              <p className="text-sm text-gray-400">{project?.location || 'Location not specified'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              isApproved ? 'bg-green-100 text-green-700' :
              isRevisionRequested ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {isApproved ? 'Approved' : isRevisionRequested ? 'Revision Requested' : 'Pending'}
            </span>
          </div>

          {quote && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Bill of Quantities</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right">{item.quantity} {item.unit}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit ({quote.profitMarginPercent}%)</span>
                  <span>{formatCurrency(quote.profitAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({quote.taxPercent}%)</span>
                  <span>{formatCurrency(quote.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            <p>Quote #: {quote?.quoteNumber}</p>
            <p>Valid until: {quote?.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '30 days'}</p>
          </div>
        </Card>

        {isApproved ? (
          <Card className="p-6 text-center bg-green-50">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-700">Estimate Approved</h3>
            <p className="text-green-600">
              Approved on {new Date(share.approvedAt).toLocaleDateString()}
            </p>
          </Card>
        ) : isRevisionRequested ? (
          <Card className="p-6 bg-orange-50">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">📝</div>
              <h3 className="text-xl font-bold text-orange-700">Revision Requested</h3>
              <p className="text-orange-600">Your contractor has been notified</p>
            </div>
            {share.comments && (
              <div className="bg-white p-3 rounded">
                <p className="text-sm font-medium">Your comment:</p>
                <p className="text-gray-600">{share.comments}</p>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="flex gap-4">
              <Button 
                mode="contained" 
                onPress={handleApprove}
                className="flex-1"
                buttonColor="#10B981"
              >
                Approve Estimate
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => setShowRevisionForm(true)}
                className="flex-1"
              >
                Request Revision
              </Button>
            </div>

            {showRevisionForm && (
              <div className="mt-4 pt-4 border-t">
                <TextInput
                  label="What would you like to change?"
                  multiline
                  rows={3}
                  value={revisionComment}
                  onChangeText={setRevisionComment}
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button 
                    mode="contained" 
                    onPress={handleRevision}
                    className="flex-1"
                  >
                    Submit Request
                  </Button>
                  <Button 
                    mode="text" 
                    onPress={() => setShowRevisionForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        <p className="text-center text-gray-400 text-sm mt-8">
          Generated by EngiQuote KE • Professional Engineering Estimates
        </p>
      </div>
    </div>
  );
}