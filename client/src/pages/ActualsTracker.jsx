import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';

export default function ActualsTracker() {
  const { projectId } = useParams();
  const [actuals, setActuals] = useState([]);
  const [project, setProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ description: '', amountKsh: '', category: 'Materials' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const res = await projectsApi.getById(projectId);
      setProject(res.data);
      setActuals(res.data.actualExpenses || []);
    } catch (error) {
      console.error('Failed to load data');
    }
  };

  const totalEstimated = project?.quotes?.reduce((sum, q) => sum + Number(q.total), 0) || 0;
  const totalSpent = actuals.reduce((sum, a) => sum + Number(a.amountKsh), 0) || 0;
  const percentage = totalEstimated > 0 ? (totalSpent / totalEstimated) * 100 : 0;
  const remaining = totalEstimated - totalSpent;

  const byCategory = actuals.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + Number(a.amountKsh);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actuals vs Estimate</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Estimated</p>
          <p className="text-xl font-bold">{formatCurrency(totalEstimated)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">% Complete</p>
          <p className="text-xl font-bold">{percentage.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-sm font-medium mb-2">Project Progress</p>
        <div className="h-3 bg-gray-200 rounded overflow-hidden">
          <div 
            className={`h-full ${percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Spent by Category</h3>
          {Object.keys(byCategory).length === 0 ? (
            <p className="text-gray-500">No expenses recorded</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(byCategory).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between">
                  <span className="text-gray-600">{cat}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Budget vs Actual</h3>
          <div className="space-y-2">
            {Object.entries(byCategory).map(([cat, spent]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cat}</span>
                  <span>{formatCurrency(spent)} spent</span>
                </div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className={`h-full ${spent > totalEstimated * 0.25 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((spent / (totalEstimated * 0.2)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Expense History</h3>
        </div>
        {actuals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No expenses recorded yet
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {actuals.map((expense, idx) => (
                <tr key={expense.id || idx} className="border-t">
                  <td className="px-4 py-3">{new Date(expense.spentAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{expense.description}</td>
                  <td className="px-4 py-3">{expense.category}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(expense.amountKsh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded p-3 mb-3"
            />
            
            <input
              type="number"
              placeholder="Amount (KSh)"
              value={form.amountKsh}
              onChange={(e) => setForm({ ...form, amountKsh: e.target.value })}
              className="w-full border rounded p-3 mb-3"
            />

            <select 
              className="w-full border rounded p-3 mb-4"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>Materials</option>
              <option>Labour</option>
              <option>Equipment</option>
              <option>Subcontractor</option>
              <option>Other</option>
            </select>

            <div className="flex gap-2">
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowModal(false)}
              >
                Save
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