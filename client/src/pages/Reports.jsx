import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { quotesApi, invoicesApi, projectsApi, clientsApi } from '../services/api';

const COLORS = ['#1E40AF', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [quotesRes, invoicesRes, projectsRes, clientsRes] = await Promise.all([
        quotesApi.getAll(),
        invoicesApi.getAll(),
        projectsApi.getAll(),
        clientsApi.getAll()
      ]);
      setQuotes(quotesRes.data);
      setInvoices(invoicesRes.data);
      setProjects(projectsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthQuotes = quotes.filter(q => {
        const date = new Date(q.createdAt);
        return date >= monthStart && date <= monthEnd;
      });
      
      const monthInvoices = invoices.filter(inv => {
        const date = new Date(inv.issueDate);
        return date >= monthStart && date <= monthEnd;
      });
      
      months.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        quotes: monthQuotes.length,
        quoteValue: monthQuotes.reduce((sum, q) => sum + Number(q.total || 0), 0),
        invoices: monthInvoices.length,
        revenue: monthInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0)
      });
    }
    return months;
  };

  const getQuoteStatusData = () => {
    const status = {};
    quotes.forEach(q => {
      status[q.status] = (status[q.status] || 0) + 1;
    });
    return Object.entries(status).map(([name, value]) => ({ name, value }));
  };

  const getProjectTypeData = () => {
    const types = {};
    projects.forEach(p => {
      types[p.type] = (types[p.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  const getInvoiceStatusData = () => {
    const status = {};
    invoices.forEach(inv => {
      status[inv.status] = (status[inv.status] || 0) + 1;
    });
    return Object.entries(status).map(([name, value]) => ({ name, value }));
  };

  const totalQuotes = quotes.reduce((sum, q) => sum + Number(q.total || 0), 0);
  const acceptedQuotes = quotes.filter(q => q.status === 'ACCEPTED').reduce((sum, q) => sum + Number(q.total || 0), 0);
  const totalInvoices = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
  const totalOutstanding = totalInvoices - totalPaid;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Quote Value</p>
          <p className="text-2xl font-bold dark:text-white">KSh {totalQuotes.toLocaleString()}</p>
          <p className="text-sm text-green-600">{quotes.length} quotes</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Accepted Value</p>
          <p className="text-2xl font-bold dark:text-white">KSh {acceptedQuotes.toLocaleString()}</p>
          <p className="text-sm text-green-600">{quotes.filter(q => q.status === 'ACCEPTED').length} accepted</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoiced</p>
          <p className="text-2xl font-bold dark:text-white">KSh {totalInvoices.toLocaleString()}</p>
          <p className="text-sm text-blue-600">{invoices.length} invoices</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="text-2xl font-bold dark:text-white">KSh {totalOutstanding.toLocaleString()}</p>
          <p className="text-sm text-amber-600">{invoices.filter(i => i.status !== 'PAID').length} pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Monthly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getMonthlyData()}>
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value) => `KSh ${value.toLocaleString()}`}
              />
              <Legend />
              <Line type="monotone" dataKey="quoteValue" stroke="#3B82F6" name="Quote Value" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Quote Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getQuoteStatusData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getQuoteStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Project Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getProjectTypeData()}>
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Invoice Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getInvoiceStatusData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getInvoiceStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Top Clients by Revenue</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold dark:text-gray-200">Client</th>
                <th className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-200">Quotes</th>
                <th className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-200">Quote Value</th>
                <th className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-200">Accepted</th>
                <th className="px-4 py-2 text-right text-sm font-semibold dark:text-gray-200">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const clientQuotes = quotes.filter(q => q.project?.clientId === client.id);
                const acceptedValue = clientQuotes.filter(q => q.status === 'ACCEPTED').reduce((sum, q) => sum + Number(q.total || 0), 0);
                const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
                const revenue = clientInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
                return (
                  <tr key={client.id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-2 dark:text-white">{client.name}</td>
                    <td className="px-4 py-2 text-right dark:text-gray-300">{clientQuotes.length}</td>
                    <td className="px-4 py-2 text-right dark:text-gray-300">KSh {clientQuotes.reduce((s, q) => s + Number(q.total || 0), 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right dark:text-gray-300">KSh {acceptedValue.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-medium dark:text-white">KSh {revenue.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
