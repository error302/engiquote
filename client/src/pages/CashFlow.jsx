import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { cashflowApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const CURVE_OPTIONS = [
  { value: 'S_CURVE', label: 'S-Curve (Standard)' },
  { value: 'LINEAR', label: 'Linear (Even distribution)' },
  { value: 'FRONT_LOADED', label: 'Front-loaded (Early spend)' },
  { value: 'BACK_LOADED', label: 'Back-loaded (Late spend)' },
];

export default function CashFlowPage() {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [cashflow, setCashflow] = useState(null);
  const [curve, setCurve] = useState('S_CURVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const generateCashFlow = async () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }
    setLoading(true);
    try {
      const res = await cashflowApi.generate(projectId, curve);
      setCashflow(res.data);
    } catch (error) {
      console.error('Failed to generate cash flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCurve = async (newCurve) => {
    setLoading(true);
    try {
      const res = await cashflowApi.updateCurve(projectId, newCurve);
      setCashflow(res.data);
      setCurve(newCurve);
    } catch (error) {
      console.error('Failed to update curve:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExistingCashFlow();
  }, []);

  const loadExistingCashFlow = async () => {
    try {
      const res = await cashflowApi.get(projectId);
      if (res.data) {
        setCashflow(res.data);
        setCurve(res.data.curve || 'S_CURVE');
      }
    } catch (error) {
      console.error('No existing cash flow');
    }
  };

  if (!cashflow) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Cash Flow Projection</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Generate Cash Flow</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input 
                type="date" 
                className="w-full border rounded p-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input 
                type="date" 
                className="w-full border rounded p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Cash Flow Curve</label>
            <select 
              className="w-full border rounded p-2"
              value={curve}
              onChange={(e) => setCurve(e.target.value)}
            >
              {CURVE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={generateCashFlow}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Cash Flow'}
          </button>
        </div>
      </div>
    );
  }

  const { weeks, summary } = cashflow;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cash Flow Projection</h1>
        <div className="flex gap-2">
          <select 
            className="border rounded px-3 py-2"
            value={curve}
            onChange={(e) => updateCurve(e.target.value)}
          >
            {CURVE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button 
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={() => window.print()}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Avg Daily Burn</p>
          <p className="text-xl font-bold">{formatCurrency(summary?.averageDailyBurnKsh || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Peak Daily Burn</p>
          <p className="text-xl font-bold text-orange-500">{formatCurrency(summary?.peakDailyBurnKsh || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Peak Phase</p>
          <p className="text-lg font-semibold">{summary?.peakPhase || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Peak Week</p>
          <p className="text-lg font-semibold">Week {summary?.peakWeekNumber || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">S-Curve Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeks || []}>
            <XAxis dataKey="weekNumber" />
            <YAxis tickFormatter={(v) => `KSh ${(v/1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line type="monotone" dataKey="cumulativeKsh" stroke="#1E40AF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Weekly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Week</th>
                <th className="px-3 py-2 text-left">Phase</th>
                <th className="px-3 py-2 text-right">Spend</th>
                <th className="px-3 py-2 text-right">Cumulative</th>
                <th className="px-3 py-2 text-right">% Complete</th>
              </tr>
            </thead>
            <tbody>
              {(weeks || []).map((week) => (
                <tr key={week.weekNumber} className="border-t">
                  <td className="px-3 py-2">Week {week.weekNumber}</td>
                  <td className="px-3 py-2">{week.phase}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(week.plannedSpendKsh)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatCurrency(week.cumulativeKsh)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      week.percentComplete > 80 ? 'bg-green-100 text-green-700' :
                      week.percentComplete > 40 ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {week.percentComplete}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}