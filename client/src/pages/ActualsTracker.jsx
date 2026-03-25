import { useState, useEffect } from 'react';
import { Card, Button, Modal, TextInput, Table, ProgressBar } from 'react-native-paper';
import { useParams } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';

export default function ActualsTracker() {
  const { projectId } = useParams();
  const [actuals, setActuals] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
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

  const totalEstimated = project?.quotes?.reduce((sum: number, q: any) => sum + Number(q.total), 0) || 0;
  const totalSpent = actuals.reduce((sum: number, a: any) => sum + Number(a.amountKsh), 0) || 0;
  const percentage = totalEstimated > 0 ? (totalSpent / totalEstimated) * 100 : 0;
  const remaining = totalEstimated - totalSpent;

  const byCategory = actuals.reduce((acc: any, a: any) => {
    acc[a.category] = (acc[a.category] || 0) + Number(a.amountKsh);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actuals vs Estimate</h1>
        <Button mode="contained" onClick={() => setShowModal(true)}>
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Estimated</p>
          <p className="text-xl font-bold">{formatCurrency(totalEstimated)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remaining)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">% Complete</p>
          <p className="text-xl font-bold">{percentage.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-4 mb-6">
        <p className="text-sm font-medium mb-2">Project Progress</p>
        <ProgressBar 
          progress={Math.min(percentage / 100, 1)} 
          color={percentage > 100 ? '#EF4444' : '#10B981'}
          className="h-3 rounded"
        />
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Spent by Category</h3>
          {Object.entries(byCategory).length === 0 ? (
            <p className="text-gray-500">No expenses recorded</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(byCategory).map(([cat, amount]: [string, any]) => (
                <div key={cat} className="flex justify-between">
                  <span className="text-gray-600">{cat}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Budget vs Actual</h3>
          <div className="space-y-2">
            {Object.entries(byCategory).map(([cat, spent]: [string, any]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cat}</span>
                  <span>{formatCurrency(spent)} spent</span>
                </div>
                <ProgressBar 
                  progress={Math.min(spent / (totalEstimated * 0.2), 1)} 
                  color={spent > totalEstimated * 0.25 ? '#EF4444' : '#3B82F6'}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Expense History</h3>
        </div>
        {actuals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No expenses recorded yet
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Title>Date</Table.Title>
              <Table.Title>Description</Table.Title>
              <Table.Title>Category</Table.Title>
              <Table.Title>Amount</Table.Title>
            </Table.Header>
            <Table.Body>
              {actuals.map((expense, idx) => (
                <Table.Row key={expense.id || idx}>
                  <Table.Cell>{new Date(expense.spentAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>{expense.description}</Table.Cell>
                  <Table.Cell>{expense.category}</Table.Cell>
                  <Table.Cell className="font-medium">{formatCurrency(expense.amountKsh)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Add Expense Modal */}
      <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
        <Card className="p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Add Expense</h2>
          
          <TextInput
            label="Description"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            className="mb-3"
          />
          
          <TextInput
            label="Amount (KSh)"
            value={form.amountKsh}
            onChangeText={(text) => setForm({ ...form, amountKsh: text })}
            keyboardType="numeric"
            className="mb-3"
          />

          <select 
            className="w-full border rounded p-2 mb-4"
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
            <Button mode="contained" onPress={() => setShowModal(false)}>
              Save
            </Button>
            <Button mode="outlined" onPress={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      </Modal>
    </div>
  );
}