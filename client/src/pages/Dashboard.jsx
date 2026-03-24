import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FolderKanban, FileText, DollarSign } from 'lucide-react';
import { dashboardApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Unable to load dashboard data. Make sure the backend is running.</p>
      </div>
    );
  }

  const cards = [
    { title: 'Total Clients', value: stats.totalClients, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Projects', value: stats.activeProjects, icon: FolderKanban, color: 'bg-green-500' },
    { title: 'Quotes This Month', value: stats.quotesThisMonth, icon: FileText, color: 'bg-amber-500' },
    { title: 'Revenue', value: `KSh ${Number(stats.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-xl font-bold dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthlyData || []}>
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                formatter={(value) => `KSh ${Number(value || 0).toLocaleString()}`}
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="revenue" fill="#1E40AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Quotes</h2>
          {stats.recentQuotes?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentQuotes.map(quote => (
                <div key={quote.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium dark:text-white">{quote.quoteNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{quote.project?.client?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold dark:text-white">KSh {Number(quote.total || 0).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      quote.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No quotes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
