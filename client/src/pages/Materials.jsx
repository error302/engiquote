import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { materialsApi, laborRatesApi } from '../services/api';

const MATERIAL_CATEGORIES = ['concrete', 'steel', 'wood', 'electrical', 'plumbing', 'finishing', 'other'];

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [laborRates, setLaborRates] = useState([]);
  const [activeTab, setActiveTab] = useState('materials');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', category: 'other', unit: 'piece', unitPrice: 0, description: '' });
  const [laborFormData, setLaborFormData] = useState({ role: '', hourlyRate: 0, description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsRes, laborRes] = await Promise.all([
        materialsApi.getAll(),
        laborRatesApi.getAll()
      ]);
      setMaterials(materialsRes.data);
      setLaborRates(laborRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMaterial = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await materialsApi.update(editingItem.id, formData);
      } else {
        await materialsApi.create(formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', category: 'other', unit: 'piece', unitPrice: 0, description: '' });
      loadData();
    } catch (error) {
      console.error('Failed to save material:', error);
      alert('Failed to save');
    }
  };

  const handleSubmitLabor = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await laborRatesApi.update(editingItem.id, laborFormData);
      } else {
        await laborRatesApi.create(laborFormData);
      }
      setShowModal(false);
      setEditingItem(null);
      setLaborFormData({ role: '', hourlyRate: 0, description: '' });
      loadData();
    } catch (error) {
      console.error('Failed to save labor rate:', error);
      alert('Failed to save');
    }
  };

  const handleEditMaterial = (material) => {
    setEditingItem(material);
    setFormData({
      name: material.name,
      category: material.category,
      unit: material.unit,
      unitPrice: Number(material.unitPrice),
      description: material.description || ''
    });
    setShowModal(true);
  };

  const handleEditLabor = (labor) => {
    setEditingItem(labor);
    setLaborFormData({
      role: labor.role,
      hourlyRate: Number(labor.hourlyRate),
      description: labor.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteMaterial = async (id) => {
    if (confirm('Delete this material?')) {
      try {
        await materialsApi.delete(id);
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleDeleteLabor = async (id) => {
    if (confirm('Delete this labor rate?')) {
      try {
        await laborRatesApi.delete(id);
        loadData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const openNewMaterial = () => {
    setEditingItem(null);
    setFormData({ name: '', category: 'other', unit: 'piece', unitPrice: 0, description: '' });
    setShowModal(true);
  };

  const openNewLabor = () => {
    setEditingItem(null);
    setLaborFormData({ role: '', hourlyRate: 0, description: '' });
    setShowModal(true);
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
      <h1 className="text-2xl font-bold mb-6">Materials & Labor</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'materials' ? 'bg-primary text-white' : 'bg-gray-200'}`}
        >
          Materials ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('labor')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'labor' ? 'bg-primary text-white' : 'bg-gray-200'}`}
        >
          Labor Rates ({laborRates.length})
        </button>
      </div>

      {activeTab === 'materials' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between">
            <h2 className="font-semibold">Material Library</h2>
            <button onClick={openNewMaterial} className="bg-primary text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm">
              <Plus size={16} /> Add Material
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Unit</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Unit Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(material => (
                <tr key={material.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{material.name}</td>
                  <td className="px-4 py-3 text-gray-600">{material.category}</td>
                  <td className="px-4 py-3 text-gray-600">{material.unit}</td>
                  <td className="px-4 py-3 text-right font-medium">KSh {Number(material.unitPrice).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEditMaterial(material)} className="text-primary mr-3"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteMaterial(material.id)} className="text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No materials yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'labor' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between">
            <h2 className="font-semibold">Labor Rates</h2>
            <button onClick={openNewLabor} className="bg-primary text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm">
              <Plus size={16} /> Add Labor Rate
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Hourly Rate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {laborRates.map(labor => (
                <tr key={labor.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{labor.role}</td>
                  <td className="px-4 py-3">KSh {Number(labor.hourlyRate).toLocaleString()}/hr</td>
                  <td className="px-4 py-3 text-gray-600">{labor.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEditLabor(labor)} className="text-primary mr-3"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteLabor(labor.id)} className="text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {laborRates.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No labor rates yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'materials' ? 'Material' : 'Labor Rate'}
              </h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            {activeTab === 'materials' ? (
              <form onSubmit={handleSubmitMaterial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                      {MATERIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit</label>
                    <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price (KSh)</label>
                  <input type="number" min="0" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={2} />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitLabor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role *</label>
                  <input type="text" required value={laborFormData.role} onChange={e => setLaborFormData({...laborFormData, role: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hourly Rate (KSh)</label>
                  <input type="number" min="0" value={laborFormData.hourlyRate} onChange={e => setLaborFormData({...laborFormData, hourlyRate: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={laborFormData.description} onChange={e => setLaborFormData({...laborFormData, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={2} />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}