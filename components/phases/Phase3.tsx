
import React, { useState, useEffect } from 'react';
import { Consultation } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UserCheck, AlertCircle, FileText } from 'lucide-react';

interface Phase3Props {
  data: any;
  onUpdate: (updates: any) => void;
  onComplete: () => void;
}

const DEFAULT_SPECIALTIES = [
    'Nephrology', 'Urology', 'Social Work', 'Psychology', 'Dietitian', 'Financial Coordinator'
];

export const Phase3: React.FC<Phase3Props> = ({ data, onUpdate, onComplete }) => {
  const [consults, setConsults] = useState<Consultation[]>(data.consults || []);

  useEffect(() => {
      if (consults.length === 0) {
          const initial: Consultation[] = DEFAULT_SPECIALTIES.map((s, i) => ({
              id: `c_${i}`,
              specialty: s,
              practitioner: '',
              date: new Date().toISOString().split('T')[0],
              status: 'Pending',
              notes: ''
          }));
          setConsults(initial);
          onUpdate({ consults: initial });
      }
  }, []);

  const updateConsult = (id: string, field: keyof Consultation, value: string) => {
      const updated = consults.map(c => c.id === id ? { ...c, [field]: value } : c);
      setConsults(updated);
      
      // Calculate progress: % of consults that are NOT Pending
      const done = updated.filter(c => c.status !== 'Pending').length;
      const progress = Math.round((done / updated.length) * 100);
      
      onUpdate({ consults: updated, progress });
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Cleared': return 'success';
          case 'Rejected': return 'danger';
          case 'Conditional': return 'warning';
          default: return 'default';
      }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
          {consults.map(consult => (
              <div key={consult.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                              <UserCheck size={16} />
                          </div>
                          <h4 className="font-semibold text-slate-900">{consult.specialty}</h4>
                      </div>
                      <Badge variant={getStatusColor(consult.status) as any}>
                          {consult.status}
                      </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Practitioner</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                            placeholder="Dr. Name"
                            value={consult.practitioner}
                            onChange={(e) => updateConsult(consult.id, 'practitioner', e.target.value)}
                          />
                      </div>
                      <div className="md:col-span-3">
                           <label className="block text-xs font-medium text-slate-500 mb-1">Decision</label>
                           <select 
                                className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                                value={consult.status}
                                onChange={(e) => updateConsult(consult.id, 'status', e.target.value as any)}
                           >
                               <option value="Pending">Pending</option>
                               <option value="Cleared">Cleared</option>
                               <option value="Conditional">Conditional</option>
                               <option value="Rejected">Rejected</option>
                           </select>
                      </div>
                      <div className="md:col-span-6">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                            placeholder="Key findings..."
                            value={consult.notes}
                            onChange={(e) => updateConsult(consult.id, 'notes', e.target.value)}
                          />
                      </div>
                  </div>
              </div>
          ))}
      </div>
      <div className="flex justify-end pt-2">
          <Button onClick={onComplete} disabled={consults.some(c => c.status === 'Pending')}>
              Complete Phase 3
          </Button>
      </div>
    </div>
  );
};
