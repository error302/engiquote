import { useState, useEffect } from 'react';
import { Card, Button, Modal, TextInput, Table, Badge } from 'react-native-paper';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/api';

export default function VariationOrders() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [variations, setVariations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ description: '', items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVariations();
  }, [projectId]);

  const loadVariations = async () => {
    try {
      const res = await projectsApi.getById(projectId);
      setVariations(res.data.variationOrders || []);
    } catch (error) {
      console.error('Failed to load variations');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-700',
      ISSUED: 'bg-blue-100 text-blue-700',
      CLIENT_APPROVED: 'bg-green-100 text-green-700',
      CLIENT_REJECTED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Variation Orders</h1>
        <Button mode="contained" onClick={() => setShowModal(true)}>
          New Variation
        </Button>
      </div>

      {variations.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No variation orders yet</p>
          <Button mode="outlined" onClick={() => setShowModal(true)}>
            Create First Variation
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <Table.Header>
              <Table.Title>VO #</Table.Title>
              <Table.Title>Description</Table.Title>
              <Table.Title>Net Change</Table.Title>
              <Table.Title>Status</Table.Title>
              <Table.Title>Date</Table.Title>
            </Table.Header>
            <Table.Body>
              {variations.map((vo, idx) => (
                <Table.Row key={vo.id || idx}>
                  <Table.Cell>VO-{String(vo.voNumber).padStart(3, '0')}</Table.Cell>
                  <Table.Cell className="max-w-xs truncate">{vo.description}</Table.Cell>
                  <Table.Cell className={Number(vo.netChangeKsh) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    KSh {Number(vo.netChangeKsh).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(vo.status)}`}>
                      {vo.status.replace('_', ' ')}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{new Date(vo.createdAt).toLocaleDateString()}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
        <Card className="p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">New Variation Order</h2>
          
          <TextInput
            label="Description of change"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
            rows={3}
            className="mb-4"
          />
          
          <p className="text-sm text-gray-500 mb-4">
            Add items that are being added, removed, or changed from the original BOQ.
          </p>

          <div className="flex gap-2">
            <Button mode="contained" onPress={() => setShowModal(false)}>
              Save Draft
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