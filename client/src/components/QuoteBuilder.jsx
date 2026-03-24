import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Send } from 'lucide-react';
import { quotesApi, projectsApi, materialsApi, laborRatesApi } from '../services/api';

const ITEM_CATEGORIES = ['material', 'labor', 'equipment', 'other'];
const QUOTE_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'];

export default function QuoteBuilder({ quote, onClose, onSave }) {
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [laborRates, setLaborRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    projectId: '',
    profitMarginPercent: 10,
    taxPercent: 16,
    validUntil: '',
    notes: '',
    status: 'DRAFT',
    items: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, materialsRes, laborRes] = await Promise.all([
        projectsApi.getAll(),
        materialsApi.getAll(),
        laborRatesApi.getAll()
      ]);
      setProjects(projectsRes.data);
      setMaterials(materialsRes.data);
      setLaborRates(laborRes.data);
      
      if (quote) {
        setFormData({
          projectId: quote.projectId,
          profitMarginPercent: Number(quote.profitMarginPercent) || 10,
          taxPercent: Number(quote.taxPercent) || 16,
          validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
          notes: quote.notes || '',
          status: quote.status,
          items: quote.items?.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice)
          })) || []
        });
      } else if (projectsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, projectId: projectsRes.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (category = 'material') => {
    const newItem = {
      category,
      description: '',
      quantity: 1,
      unit: category === 'labor' ? 'hour' : 'unit',
      unitPrice: 0,
      total: 0
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const addFromLibrary = (type, item) => {
    if (type === 'material') {
      addItem('material');
      const idx = formData.items.length;
      setTimeout(() => {
        updateItem(idx, 'description', item.name);
        updateItem(idx, 'unit', item.unit);
        updateItem(idx, 'unitPrice', Number(item.unitPrice));
      }, 0);
    } else if (type === 'labor') {
      addItem('labor');
      const idx = formData.items.length;
      setTimeout(() => {
        updateItem(idx, 'description', item.role);
        updateItem(idx, 'unit', 'hour');
        updateItem(idx, 'unitPrice', Number(item.hourlyRate));
      }, 0);
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const profitAmount = subtotal * (Number(formData.profitMarginPercent) / 100);
    const beforeTax = subtotal + profitAmount;
    const taxAmount = beforeTax * (Number(formData.taxPercent) / 100);
    const total = beforeTax + taxAmount;
    return { subtotal, profitAmount, taxAmount, total };
  };

  const handleSubmit = async (status) => {
    setSaving(true);
    try {
      const data = {
        ...formData,
        status,
        validUntil: formData.validUntil || null
      };
      
      if (quote) {
        await quotesApi.update(quote.id, data);
      } else {
        await quotesApi.create(data);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save quote:', error);
      alert('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();
  const selectedProject = projects.find(p => p.id === formData.projectId);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{quote ? 'Edit Quote' : 'New Quote'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project *</label>
              <select
                required
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name} - {p.client?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              >
                {QUOTE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Add Material</label>
              <select
                onChange={e => {
                  if (e.target.value) {
                    const material = materials.find(m => m.id === e.target.value);
                    if (material) addFromLibrary('material', material);
                    e.target.value = '';
                  }
                }}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Material</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} - KSh {m.unitPrice}/{m.unit}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Add Labor</label>
              <select
                onChange={e => {
                  if (e.target.value) {
                    const labor = laborRates.find(l => l.id === e.target.value);
                    if (labor) addFromLibrary('labor', labor);
                    e.target.value = '';
                  }
                }}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Labor</option>
                {laborRates.map(l => <option key={l.id} value={l.id}>{l.role} - KSh {l.hourlyRate}/hr</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Line Items</label>
              <button onClick={() => addItem()} className="text-primary text-sm flex items-center gap-1">
                <Plus size={16} /> Add Item
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold w-20">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold w-20">Unit</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold w-24">Unit Price</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold w-24">Total</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2">
                        <select
                          value={item.category}
                          onChange={e => updateItem(index, 'category', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(index, 'description', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Description"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={e => updateItem(index, 'quantity', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={e => updateItem(index, 'unit', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium">
                        KSh {Number(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.items.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-3 py-8 text-center text-gray-500">
                        No items. Click "Add Item" or select from library above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Profit Margin (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.profitMarginPercent}
                onChange={e => setFormData({...formData, profitMarginPercent: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.taxPercent}
                onChange={e => setFormData({...formData, taxPercent: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={e => setFormData({...formData, validUntil: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                rows={2}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span className="font-medium">KSh {totals.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Profit ({formData.profitMarginPercent}%):</span>
              <span className="font-medium">KSh {totals.profitAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax ({formData.taxPercent}%):</span>
              <span className="font-medium">KSh {totals.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t mt-2 text-lg font-bold">
              <span>Total:</span>
              <span>KSh {totals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <div className="flex gap-2">
            <button 
              onClick={() => handleSubmit('DRAFT')} 
              disabled={saving}
              className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
            >
              <Save size={18} /> Save Draft
            </button>
            <button 
              onClick={() => handleSubmit('SENT')} 
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary-light disabled:opacity-50"
            >
              <Send size={18} /> {saving ? 'Saving...' : 'Save & Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
