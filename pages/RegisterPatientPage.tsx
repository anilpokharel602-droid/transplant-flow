import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient, PatientType } from '../types';
import { registerNewPatient } from '../services/backendService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const RegisterPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<PatientType>(PatientType.RECIPIENT);
  const [formData, setFormData] = useState({
    name: '', mrn: '', dob: '', gender: 'Male',
    height: '', weight: '', bloodGroup: 'O+', phone: '', email: '', history: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const bmi = (weight / ((height / 100) * (height / 100))) || 0;

    const newPatient: Patient = {
      id: `p_${Date.now()}`,
      mrn: formData.mrn,
      name: formData.name,
      dateOfBirth: formData.dob,
      gender: formData.gender as 'Male' | 'Female',
      type,
      bloodGroup: formData.bloodGroup,
      height,
      weight,
      bmi,
      phone: formData.phone,
      email: formData.email,
      medicalHistory: formData.history.split(',').map(s => s.trim()),
      registeredDate: new Date().toISOString()
    };

    registerNewPatient(newPatient);
    navigate('/patients');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Register New Patient</h1>
      
      <Card>
        <CardHeader>
            <div className="flex space-x-4 mb-4">
                <button 
                    onClick={() => setType(PatientType.RECIPIENT)}
                    className={`flex-1 py-2 rounded-md font-medium transition-colors ${type === PatientType.RECIPIENT ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                    Recipient
                </button>
                <button 
                    onClick={() => setType(PatientType.DONOR)}
                    className={`flex-1 py-2 rounded-md font-medium transition-colors ${type === PatientType.DONOR ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                    Donor
                </button>
            </div>
            <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input required name="name" onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">MRN</label>
                    <input required name="mrn" onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                    <input type="date" required name="dob" onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Gender</label>
                    <select name="gender" onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2">
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Blood Group</label>
                    <select name="bloodGroup" onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2">
                        <option>O+</option>
                        <option>O-</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                    </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Height (cm)</label>
                    <input type="number" required name="height" onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Weight (kg)</label>
                    <input type="number" required name="weight" onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" />
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700">Medical History (Comma separated)</label>
                <textarea name="history" rows={3} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2" placeholder="e.g. Hypertension, Diabetes..." />
             </div>

             <div className="pt-4">
                <Button type="submit" className="w-full">Register Patient</Button>
             </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPatientPage;
