import { useState, useEffect } from 'react';
import { Card, Button, TextInput, Select } from 'react-native-paper';
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
  const [extracted, setExtracted] = useState<any>(null);
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
          <Card className="p-4 mb-4">
            <h2 className="font-semibold mb-3">Input Type</h2>
            <div className="flex gap-2">
              {['MANUAL', 'PDF', 'DXF'].map((type) => (
                <Button
                  key={type}
                  mode={inputType === type ? 'contained' : 'outlined'}
                  onPress={() => setInputType(type)}
                  compact
                >
                  {type}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            {inputType === 'MANUAL' && (
              <>
                <TextInput
                  label="Floor Area (sqm)"
                  value={form.floorArea}
                  onChangeText={(v) => setForm({ ...form, floorArea: v })}
                  keyboardType="numeric"
                  className="mb-3"
                />
                <TextInput
                  label="Wall Perimeter (lm)"
                  value={form.wallPerimeter}
                  onChangeText={(v) => setForm({ ...form, wallPerimeter: v })}
                  keyboardType="numeric"
                  className="mb-3"
                />
                <TextInput
                  label="Number of Openings (doors + windows)"
                  value={form.openings}
                  onChangeText={(v) => setForm({ ...form, openings: v })}
                  keyboardType="numeric"
                  className="mb-3"
                />
                <TextInput
                  label="Number of Storeys"
                  value={form.storeys}
                  onChangeText={(v) => setForm({ ...form, storeys: v })}
                  keyboardType="numeric"
                />
              </>
            )}

            {inputType === 'PDF' && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <TextInput
                    label="Length (m)"
                    value={form.length}
                    onChangeText={(v) => setForm({ ...form, length: v })}
                    keyboardType="numeric"
                  />
                  <TextInput
                    label="Width (m)"
                    value={form.width}
                    onChangeText={(v) => setForm({ ...form, width: v })}
                    keyboardType="numeric"
                  />
                  <TextInput
                    label="Height (m)"
                    value={form.height}
                    onChangeText={(v) => setForm({ ...form, height: v })}
                    keyboardType="numeric"
                  />
                </div>
                <TextInput
                  label="Number of Storeys"
                  value={form.storeys}
                  onChangeText={(v) => setForm({ ...form, storeys: v })}
                  keyboardType="numeric"
                  className="mb-3"
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Number of Doors"
                    value={form.doors}
                    onChangeText={(v) => setForm({ ...form, doors: v })}
                    keyboardType="numeric"
                  />
                  <TextInput
                    label="Number of Windows"
                    value={form.windows}
                    onChangeText={(v) => setForm({ ...form, windows: v })}
                    keyboardType="numeric"
                  />
                </div>
              </>
            )}

            {inputType === 'DXF' && (
              <div className="text-center py-8">
                <p className="mb-4 text-gray-600">Upload your DXF/DWG file for automatic extraction</p>
                <Button mode="contained">Upload File</Button>
              </div>
            )}

            <Button
              mode="contained"
              onPress={extractDimensions}
              loading={loading}
              className="mt-4"
            >
              Extract Dimensions
            </Button>
          </Card>
        </>
      )}

      {step === 2 && extracted && (
        <>
          <Card className="p-4 mb-4">
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
          </Card>

          <div className="flex gap-3">
            <Button mode="outlined" onPress={() => setStep(1)}>
              Back
            </Button>
            <Button mode="contained" onPress={confirmAndGenerate}>
              Confirm & Continue
            </Button>
          </div>
        </>
      )}
    </div>
  );
}