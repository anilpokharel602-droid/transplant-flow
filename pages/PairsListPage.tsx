import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPairs, getPatients, createPair } from '../services/backendService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Link as LinkIcon } from 'lucide-react';

const PairsListPage: React.FC = () => {
  const pairs = getPairs();
  const patients = getPatients();
  const [showModal, setShowModal] = useState(false);
  const [donorId, setDonorId] = useState('');
  const [recipientId, setRecipientId] = useState('');

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';

  const handleCreate = () => {
      if(donorId && recipientId) {
          createPair(donorId, recipientId);
          setShowModal(false);
          window.location.reload(); // Simple reload to fetch new data
      }
  };

  const availableDonors = patients.filter(p => p.type === 'DONOR');
  const availableRecipients = patients.filter(p => p.type === 'RECIPIENT');

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Donor-Recipient Pairs</h1>
            <Button onClick={() => setShowModal(true)} icon={<Plus size={16} />}>Create Pair</Button>
        </div>

        <Card>
            <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-xs uppercase text-slate-700">
                        <tr>
                            <th className="px-6 py-3">Pair ID</th>
                            <th className="px-6 py-3">Donor</th>
                            <th className="px-6 py-3">Recipient</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pairs.map(pair => (
                            <tr key={pair.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-xs">{pair.id}</td>
                                <td className="px-6 py-4">{getPatientName(pair.donorId)}</td>
                                <td className="px-6 py-4">{getPatientName(pair.recipientId)}</td>
                                <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{pair.status}</span></td>
                                <td className="px-6 py-4">
                                    <Link to={`/pairs/${pair.id}`} className="text-primary-600 hover:underline font-medium">View Workflow</Link>
                                </td>
                            </tr>
                        ))}
                         {pairs.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-8 text-slate-500">No pairs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>

        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h3 className="text-lg font-bold mb-4">Create New Pair</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Select Donor</label>
                            <select className="w-full border p-2 rounded" onChange={(e) => setDonorId(e.target.value)}>
                                <option value="">-- Select --</option>
                                {availableDonors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Select Recipient</label>
                            <select className="w-full border p-2 rounded" onChange={(e) => setRecipientId(e.target.value)}>
                                <option value="">-- Select --</option>
                                {availableRecipients.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default PairsListPage;
