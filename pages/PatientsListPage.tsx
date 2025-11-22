import React from 'react';
import { Link } from 'react-router-dom';
import { getPatients } from '../services/backendService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

const PatientsListPage: React.FC = () => {
  const patients = getPatients();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
        <Link to="/register">
            <Button icon={<Plus size={16}/>}>Register New Patient</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">MRN</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Blood Group</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <Link to={`/patients/${patient.id}`} className="hover:underline">{patient.mrn}</Link>
                  </td>
                  <td className="px-6 py-4">{patient.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${patient.type === 'DONOR' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {patient.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{patient.gender}</td>
                  <td className="px-6 py-4">{patient.bloodGroup}</td>
                  <td className="px-6 py-4">
                      <span className="text-green-600">Active</span>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">No patients found.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsListPage;
