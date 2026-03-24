import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Copy } from 'lucide-react';
import { templatesApi } from '../services/api';

const PROJECT_TYPES = ['', 'CIVIL', 'ELECTRICAL', 'MECHANICAL', 'ARCHITECTURE'];
const ITEM_CATEGORIES = ['material', 'labor', 'equipment', 'other'];

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectType: '',
    items: []
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await templatesApi.getAll();
      setTemplates(res.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await templatesApi.update(editingTemplate.id, formData);
      } else {
        await templatesApi.create(formData);
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', description: '', projectType: '', items: [] });
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      projectType: template.projectType || '',
      items: template.items?.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      })) || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this template?')) {
      try {
        await templatesApi.delete(id);
        loadTemplates();
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Failed to delete template');
      }
    }
  };

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setFormData({ name: '', description: '', projectType: '', items: [] });
    setShowModal(true);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { category: 'material', description: '', quantity: 1, unit: 'unit', unitPrice: 0 }]
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
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
        <h1 className="text-2xl font-bold dark:text-white">Quote Templates</h1>
        <button onClick={openNewTemplate} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light">
          <Plus size={20} /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold dark:text-white">{template.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(template)} className="text-primary hover:text-primary-light">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(template.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {template.projectType && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{template.projectType}</span>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{template.description || 'No description'}</p>
            <p className="text-xs text-gray-400 mt-2">{template.items?.length || 0} items</p>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No templates yet. Create your first template!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Project Type</label>
                  <select
                    value={formData.projectType}
                    onChange={e => setFormData({...formData, projectType: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {PROJECT_TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={2}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium dark:text-gray-200">Template Items</label>
                  <button type="button" onClick={addItem} className="text-primary text-sm flex items-center gap-1">
                    <Plus size={16} /> Add Item
                  </button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-semibold dark:text-gray-200">Category</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold dark:text-gray-200">Description</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold dark:text-gray-200 w-16">Qty</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold dark:text-gray-200 w-16">Unit</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold dark:text-gray-200 w-20">Price</th>
                        <th className="px-2 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-t dark:border-gray-700">
                          <td className="px-2 py-2">
                            <select
                              value={item.category}
                              onChange={e => updateItem(index, 'category', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={e => updateItem(index, 'description', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => updateItem(index, 'quantity', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={e => updateItem(index, 'unit', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <button type="button" onClick={() => removeItem(index)} className="text-red-500">
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg dark:text-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
