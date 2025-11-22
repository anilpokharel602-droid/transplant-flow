
import React, { useState, useEffect } from 'react';
import { Patient, Phase2Data, KidneyAnatomy } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Activity, Ruler, Scissors, Heart, Stethoscope } from 'lucide-react';

interface Phase2Props {
  patient: Patient;
  data: any;
  onUpdate: (updates: any) => void;
  onComplete: () => void;
}

const INITIAL_KIDNEY: KidneyAnatomy = { length: '', arteries: 1, veins: 1, cysts: false, stones: false, notes: '' };

export const Phase2: React.FC<Phase2Props> = ({ patient, data, onUpdate, onComplete }) => {
  const [formData, setFormData] = useState<Phase2Data>(data || {});
  const [activeTab, setActiveTab] = useState<'anatomy' | 'function' | 'surgical'>('anatomy');

  useEffect(() => {
    if (!formData.leftKidney) {
        setFormData(prev => ({
            ...prev,
            leftKidney: { ...INITIAL_KIDNEY },
            rightKidney: { ...INITIAL_KIDNEY },
            selectedKidney: undefined
        }));
    }
  }, []);

  const updateKidney = (side: 'leftKidney' | 'rightKidney', field: keyof KidneyAnatomy, value: any) => {
      const updatedKidney = { ...formData[side]!, [field]: value };
      const newData = { ...formData, [side]: updatedKidney };
      setFormData(newData);
      updateProgress(newData);
  };

  const updateField = (field: keyof Phase2Data, value: any) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      updateProgress(newData);
  };

  const updateProgress = (d: Phase2Data) => {
      let progress = 0;
      if (patient.type === 'DONOR') {
          // Complex donor scoring
          let points = 0;
          if (d.leftKidney?.length) points += 20;
          if (d.rightKidney?.length) points += 20;
          if (d.gfrTotal) points += 20;
          if (d.selectedKidney) points += 20;
          if (d.surgicalPlan) points += 20;
          progress = Math.min(100, points);
      } else {
          // Recipient scoring
          let points = 0;
          if (d.cardiacClearance) points += 40;
          if (d.chestXray) points += 30;
          if (d.dentalClearance) points += 30;
          progress = Math.min(100, points);
      }
      onUpdate({ ...d, progress });
  };

  if (patient.type === 'RECIPIENT') {
      return (
          <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-rose-500"/> Cardiac & Physical Clearance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cardiac Clearance Status</label>
                          <select 
                            className="w-full border border-slate-300 rounded-md p-2 text-sm"
                            value={formData.cardiacClearance || ''}
                            onChange={(e) => updateField('cardiacClearance', e.target.value)}
                          >
                              <option value="">Select Status</option>
                              <option value="Pending">Pending Review</option>
                              <option value="Cleared">Cleared for Surgery</option>
                              <option value="Conditional">Conditional (See Notes)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Chest X-Ray</label>
                          <select 
                            className="w-full border border-slate-300 rounded-md p-2 text-sm"
                            value={formData.chestXray || ''}
                            onChange={(e) => updateField('chestXray', e.target.value)}
                          >
                              <option value="">Select Result</option>
                              <option value="Normal">Normal</option>
                              <option value="Abnormal">Abnormal</option>
                          </select>
                      </div>
                      <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="dental"
                            className="rounded text-primary-600 focus:ring-primary-500"
                            checked={formData.dentalClearance || false}
                            onChange={(e) => updateField('dentalClearance', e.target.checked)}
                          />
                          <label htmlFor="dental" className="text-sm font-medium text-slate-700">Dental Clearance Received</label>
                      </div>
                  </div>
                  <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Notes</label>
                      <textarea 
                        className="w-full border border-slate-300 rounded-md p-2 text-sm" 
                        rows={3}
                        value={formData.notes || ''}
                        onChange={(e) => updateField('notes', e.target.value)}
                        placeholder="Enter detailed fitness notes..."
                      />
                  </div>
              </div>
               <div className="flex justify-end">
                    <Button onClick={onComplete} disabled={!formData.cardiacClearance}>Complete Phase</Button>
               </div>
          </div>
      );
  }

  // DONOR INTERFACE
  return (
    <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('anatomy')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'anatomy' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                CT Angiogram (Anatomy)
            </button>
            <button 
                onClick={() => setActiveTab('function')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'function' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                DTPA (Function)
            </button>
            <button 
                onClick={() => setActiveTab('surgical')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'surgical' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Surgical Plan
            </button>
        </div>

        {activeTab === 'anatomy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['leftKidney', 'rightKidney'].map((side) => {
                    const s = side as 'leftKidney' | 'rightKidney';
                    const k = formData[s] || INITIAL_KIDNEY;
                    return (
                        <div key={side} className="border rounded-lg p-4 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="font-bold text-slate-800 capitalize flex items-center">
                                    <Ruler className="w-4 h-4 mr-2 text-slate-400"/> {side.replace('Kidney', ' Kidney')}
                                </h5>
                                <Badge variant={k.arteries > 1 ? 'warning' : 'success'}>
                                    {k.arteries > 1 ? 'Complex' : 'Standard'}
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-500">Length (cm)</label>
                                    <input type="number" className="w-full border rounded p-1 text-sm" value={k.length} onChange={e => updateKidney(s, 'length', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-slate-500">Arteries</label>
                                        <input type="number" className="w-full border rounded p-1 text-sm" value={k.arteries} onChange={e => updateKidney(s, 'arteries', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Veins</label>
                                        <input type="number" className="w-full border rounded p-1 text-sm" value={k.veins} onChange={e => updateKidney(s, 'veins', parseInt(e.target.value))} />
                                    </div>
                                </div>
                                <div className="flex space-x-3 pt-2">
                                    <label className="flex items-center space-x-1 text-sm">
                                        <input type="checkbox" checked={k.cysts} onChange={e => updateKidney(s, 'cysts', e.target.checked)} /> <span>Cysts</span>
                                    </label>
                                    <label className="flex items-center space-x-1 text-sm">
                                        <input type="checkbox" checked={k.stones} onChange={e => updateKidney(s, 'stones', e.target.checked)} /> <span>Stones</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {activeTab === 'function' && (
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h4 className="font-semibold mb-4 text-slate-800 flex items-center"><Activity className="w-4 h-4 mr-2"/> Split Renal Function</h4>
                <div className="flex items-center justify-center space-x-8 mb-6">
                     <div className="text-center">
                         <div className="text-3xl font-bold text-blue-600">{formData.gfrLeft || 0}%</div>
                         <div className="text-xs uppercase font-bold text-slate-500">Left</div>
                     </div>
                     <div className="text-xl text-slate-300 font-light">VS</div>
                     <div className="text-center">
                         <div className="text-3xl font-bold text-blue-600">{formData.gfrRight || 0}%</div>
                         <div className="text-xs uppercase font-bold text-slate-500">Right</div>
                     </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Left Split %</label>
                        <input type="number" className="w-full border rounded p-2" value={formData.gfrLeft || ''} onChange={e => updateField('gfrLeft', parseFloat(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Right Split %</label>
                        <input type="number" className="w-full border rounded p-2" value={formData.gfrRight || ''} onChange={e => updateField('gfrRight', parseFloat(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Total GFR (ml/min)</label>
                        <input type="number" className="w-full border rounded p-2" value={formData.gfrTotal || ''} onChange={e => updateField('gfrTotal', parseFloat(e.target.value))} />
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'surgical' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold mb-4 text-slate-800 flex items-center"><Scissors className="w-4 h-4 mr-2"/> Surgical Selection</h4>
                <div className="mb-4">
                    <span className="block text-sm font-medium text-slate-700 mb-2">Selected Kidney for Procurement</span>
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => updateField('selectedKidney', 'Left')}
                            className={`flex-1 py-3 border rounded-md font-bold transition-all ${formData.selectedKidney === 'Left' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                        >
                            Left Kidney
                        </button>
                        <button 
                             onClick={() => updateField('selectedKidney', 'Right')}
                             className={`flex-1 py-3 border rounded-md font-bold transition-all ${formData.selectedKidney === 'Right' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                        >
                            Right Kidney
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Surgical Approach & Notes</label>
                    <textarea 
                        className="w-full border border-slate-300 rounded-md p-2 text-sm" 
                        rows={4}
                        value={formData.surgicalPlan || ''}
                        onChange={(e) => updateField('surgicalPlan', e.target.value)}
                        placeholder="e.g. Hand-assisted laparoscopic donor nephrectomy..."
                    />
                </div>
            </div>
        )}

        <div className="flex justify-end pt-4">
             <Button onClick={onComplete} disabled={!formData.selectedKidney && patient.type === 'DONOR'}>
                 Complete Phase 2
             </Button>
        </div>
    </div>
  );
};
