import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/api';
import api from '../services/api';

export default function PlanExtractor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [inputType, setInputType] = useState('MANUAL');
  const [form, setForm] = useState({
    floorArea: '',
    wallPerimeter: '',
    openings: '',
    storeys: '1',
    length: '',
    width: '',
    height: '',
    doors: '',
    windows: '',
  });
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractDimensions = async () => {
    setLoading(true);
    try {
      let dimensions = {};
      
      if (inputType === 'MANUAL') {
        dimensions = {
          floorArea: parseFloat(form.floorArea) || 0,
          wallPerimeter: parseFloat(form.wallPerimeter) || 0,
          openingsCount: parseInt(form.openings) || 0,
          storeys: parseInt(form.storeys) || 1,
        };
      } else if (inputType === 'PDF') {
        dimensions = {
          length: parseFloat(form.length) || 0,
          width: parseFloat(form.width) || 0,
          height: parseFloat(form.height) || 2.4,
          floors: parseInt(form.storeys) || 1,
          doors: parseInt(form.doors) || 0,
          windows: parseInt(form.windows) || 0,
        };
      }

      const res = await api.post('/api/plan-upload/extract', {
        projectId,
        inputType,
        dimensions: JSON.stringify(dimensions),
      });

      setExtracted(res.data);
      setStep(2);
    } catch (error) {
      console.error('Extraction failed:', error);
      alert('Failed to extract dimensions');
    } finally {
      setLoading(false);
    }
  };

  const confirmAndGenerate = async () => {
    try {
      await api.put(`/api/plan-upload/${projectId}/confirm`, { confirmed: true });
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to confirm');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Plan Extraction</h1>

      {step === 1 && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="font-semibold mb-3">Input Type</h2>
            <div className="flex gap-2">
              {['MANUAL', 'PDF', 'DXF'].map((type) => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded ${inputType === type ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}
                  onClick={() => setInputType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            {inputType === 'MANUAL' && (
              <>
                <input
                  type="number"
                  placeholder="Floor Area (sqm)"
                  value={form.floorArea}
                  onChange={(e) => setForm({ ...form, floorArea: e.target.value })}
                  className="w-full border rounded p-3 mb-3"
                />
                <input
                  type="number"
                  placeholder="Wall Perimeter (lm)"
                  value={form.wallPerimeter}
                  onChange={(e) => setForm({ ...form, wallPerimeter: e.target.value })}
                  className="w-full border rounded p-3 mb-3"
                />
                <input
                  type="number"
                  placeholder="Number of Openings (doors + windows)"
                  value={form.openings}
                  onChange={(e) => setForm({ ...form, openings: e.target.value })}
                  className="w-full border rounded p-3 mb-3"
                />
                <input
                  type="number"
                  placeholder="Number of Storeys"
                  value={form.storeys}
                  onChange={(e) => setForm({ ...form, storeys: e.target.value })}
                  className="w-full border rounded p-3"
                />
              </>
            )}

            {inputType === 'PDF' && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <input
                    type="number"
                    placeholder="Length (m)"
                    value={form.length}
                    onChange={(e) => setForm({ ...form, length: e.target.value })}
                    className="border rounded p-3"
                  />
                  <input
                    type="number"
                    placeholder="Width (m)"
                    value={form.width}
                    onChange={(e) => setForm({ ...form, width: e.target.value })}
                    className="border rounded p-3"
                  />
                  <input
                    type="number"
                    placeholder="Height (m)"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className="border rounded p-3"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Number of Storeys"
                  value={form.storeys}
                  onChange={(e) => setForm({ ...form, storeys: e.target.value })}
                  className="w-full border rounded p-3 mb-3"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Number of Doors"
                    value={form.doors}
                    onChange={(e) => setForm({ ...form, doors: e.target.value })}
                    className="border rounded p-3"
                  />
                  <input
                    type="number"
                    placeholder="Number of Windows"
                    value={form.windows}
                    onChange={(e) => setForm({ ...form, windows: e.target.value })}
                    className="border rounded p-3"
                  />
                </div>
              </>
            )}

            {inputType === 'DXF' && (
              <div className="text-center py-8">
                <p className="mb-4 text-gray-600">Upload your DXF/DWG file for automatic extraction</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Upload File
                </button>
              </div>
            )}

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-4"
              onClick={extractDimensions}
              disabled={loading}
            >
              {loading ? 'Extracting...' : 'Extract Dimensions'}
            </button>
          </div>
        </>
      )}

      {step === 2 && extracted && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="font-semibold mb-3">Extracted Dimensions</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Floor Area:</span>
                <span className="font-medium">{extracted.extracted?.totalFloorArea?.toFixed(2)} sqm</span>
              </div>
              <div className="flex justify-between">
                <span>Wall Perimeter:</span>
                <span className="font-medium">{extracted.extracted?.wallPerimeter?.toFixed(2)} lm</span>
              </div>
              <div className="flex justify-between">
                <span>Openings:</span>
                <span className="font-medium">{extracted.extracted?.openings}</span>
              </div>
              <div className="flex justify-between">
                <span>Storeys:</span>
                <span className="font-medium">{extracted.extracted?.storeys}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className={`font-medium ${extracted.extracted?.confidence === 'high' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {extracted.extracted?.confidence}
                </span>
              </div>
            </div>

            {extracted.extracted?.warnings?.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded">
                <p className="text-sm text-yellow-700">⚠️ {extracted.extracted.warnings[0]}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={confirmAndGenerate}
            >
              Confirm & Continue
            </button>
          </div>
        </>
      )}
    </div>
  );
}