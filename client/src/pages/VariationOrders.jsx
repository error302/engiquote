import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';

export default function VariationOrders() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [variations, setVariations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ description: '', items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVariations();
  }, [projectId]);

  const loadVariations = async () => {
    try {
      const res = await projectsApi.getById(projectId);
      setVariations(res.data.variationOrders || []);
    } catch (error) {
      console.error('Failed to load variations');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-700',
      ISSUED: 'bg-blue-100 text-blue-700',
      CLIENT_APPROVED: 'bg-green-100 text-green-700',
      CLIENT_REJECTED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Variation Orders</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          New Variation
        </button>
      </div>

      {variations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No variation orders yet</p>
          <button 
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
            onClick={() => setShowModal(true)}
          >
            Create First Variation
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">VO #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Net Change</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {variations.map((vo, idx) => (
                <tr key={vo.id || idx} className="border-t">
                  <td className="px-4 py-3">VO-{String(vo.voNumber || idx + 1).padStart(3, '0')}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{vo.description}</td>
                  <td className={`px-4 py-3 text-right ${Number(vo.netChangeKsh || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(vo.netChangeKsh || 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(vo.status)}`}>
                      {(vo.status || 'DRAFT').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(vo.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">New Variation Order</h2>
            
            <textarea
              placeholder="Description of change"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded p-3 mb-4 h-24"
            />
            
            <p className="text-sm text-gray-500 mb-4">
              Add items that are being added, removed, or changed from the original BOQ.
            </p>

            <div className="flex gap-2">
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowModal(false)}
              >
                Save Draft
              </button>
              <button 
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}