
import React, { useState, useEffect } from 'react';
import { Workflow, Patient, PhaseStatus, EvaluationPhase } from '../types';
import { getWorkflowForPatient, updateWorkflowForPatient } from '../services/backendService';
import { ChevronDown, ChevronUp, Check, PlayCircle, Lock } from 'lucide-react';
import { Phase1 } from './phases/Phase1';
import { Phase2 } from './phases/Phase2';
import { Phase3 } from './phases/Phase3';
import { Phase5 } from './phases/Phase5';
import { Badge } from './ui/Badge';

// Generic placeholder for future phases
const GenericPhase = ({ data, onUpdate, onComplete }: any) => (
    <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <p className="text-slate-500 italic mb-4">Detailed clinical form for this phase is under development.</p>
        <textarea 
            className="w-full mt-2 border rounded-md p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
            placeholder="Enter clinical notes or summary for this phase..."
            rows={4}
            value={data.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value, progress: 50 })}
        />
        <div className="mt-4 flex justify-end">
            <button onClick={onComplete} className="text-sm text-primary-600 font-medium hover:underline">Mark as Complete</button>
        </div>
    </div>
);

interface PhaseTrackerProps {
  patientId: string;
  patientType: 'Donor' | 'Recipient';
}

export const PhaseTracker: React.FC<PhaseTrackerProps> = ({ patientId, patientType }) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [openPhase, setOpenPhase] = useState<number | null>(1);

  useEffect(() => {
    const load = () => {
        setWorkflow(getWorkflowForPatient(patientId));
        const patients = JSON.parse(localStorage.getItem('tf_patients') || '[]');
        setPatient(patients.find((p: Patient) => p.id === patientId));
    };
    load();
    // Polling for simple reactivity
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [patientId]);

  if (!workflow || !patient) return <div className="p-4 text-slate-500">Loading Workflow...</div>;

  const handleUpdate = (phaseId: number, updates: any) => {
      updateWorkflowForPatient(patientId, phaseId, { data: updates, progress: updates.progress });
      setWorkflow(prev => {
          if (!prev) return null;
          return {
              ...prev,
              phases: {
                  ...prev.phases,
                  [phaseId]: { 
                      ...prev.phases[phaseId], 
                      progress: updates.progress ?? prev.phases[phaseId].progress,
                      data: { ...prev.phases[phaseId].data, ...updates } 
                    }
              }
          };
      });
  };

  const completePhase = (phaseId: number) => {
      updateWorkflowForPatient(patientId, phaseId, { status: PhaseStatus.COMPLETED, progress: 100 });
      // Auto open next
      if (phaseId < 8) setOpenPhase(phaseId + 1);
  };

  const renderPhaseContent = (phaseId: number) => {
      const phase = workflow.phases[phaseId];
      const commonProps = {
          patient,
          data: phase.data,
          onUpdate: (u: any) => handleUpdate(phaseId, u),
          onComplete: () => completePhase(phaseId)
      };

      switch (phaseId) {
          case 1: return <Phase1 {...commonProps} />;
          case 2: return <Phase2 {...commonProps} />;
          case 3: return <Phase3 {...commonProps} />;
          case 5: return <Phase5 {...commonProps} />;
          default: return <GenericPhase {...commonProps} />;
      }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case PhaseStatus.COMPLETED: return <Badge variant="success">Completed</Badge>;
          case PhaseStatus.IN_PROGRESS: return <Badge variant="info">In Progress</Badge>;
          case PhaseStatus.LOCKED: return <Badge variant="default">Locked</Badge>;
          default: return <Badge variant="outline">Available</Badge>;
      }
  };

  return (
    <div className="space-y-3">
      {(Object.values(workflow.phases) as EvaluationPhase[]).sort((a, b) => a.id - b.id).map(phase => {
        const isOpen = openPhase === phase.id;
        const isCompleted = phase.status === PhaseStatus.COMPLETED;
        
        return (
        <div key={phase.id} className={`border rounded-lg bg-white transition-all duration-200 ${isOpen ? 'ring-1 ring-primary-500 shadow-md' : 'shadow-sm hover:shadow'}`}>
            <button 
                onClick={() => setOpenPhase(isOpen ? null : phase.id)}
                className={`w-full flex items-center justify-between p-4 ${isOpen ? 'bg-slate-50 border-b border-slate-100' : ''}`}
            >
                <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                        ${isCompleted ? 'bg-emerald-500 text-white' : 
                          phase.status === PhaseStatus.IN_PROGRESS ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {isCompleted ? <Check className="w-5 h-5" /> : phase.id}
                    </div>
                    <div className="text-left">
                        <div className={`font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-700'}`}>{phase.name}</div>
                        <div className="flex items-center mt-1 space-x-2">
                             {getStatusBadge(phase.status)}
                             {phase.progress > 0 && phase.status !== PhaseStatus.COMPLETED && (
                                 <span className="text-xs text-slate-500">{phase.progress}% Done</span>
                             )}
                        </div>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {isOpen && (
                <div className="p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {renderPhaseContent(phase.id)}
                </div>
            )}
        </div>
      )})}
    </div>
  );
};
