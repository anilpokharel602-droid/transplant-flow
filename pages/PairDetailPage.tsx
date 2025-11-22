
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPairById, getPatientById, getWorkflowForPatient } from '../services/backendService';
import { generatePairSummary } from '../services/geminiService';
import { Patient, Workflow, Pair } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PhaseTracker } from '../components/PhaseTracker';
import { Users, Columns, Calendar, Wand2, ArrowRight, RefreshCw } from 'lucide-react';

const PairDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pair, setPair] = useState<Pair | undefined>();
  const [donor, setDonor] = useState<Patient | undefined>();
  const [recipient, setRecipient] = useState<Patient | undefined>();
  const [viewMode, setViewMode] = useState<'columns' | 'timeline'>('columns');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  // For timeline data
  const [donorWorkflow, setDonorWorkflow] = useState<Workflow | null>(null);
  const [recipientWorkflow, setRecipientWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    if(id) {
        const p = getPairById(id);
        setPair(p);
        if(p) {
            setDonor(getPatientById(p.donorId));
            setRecipient(getPatientById(p.recipientId));
            setDonorWorkflow(getWorkflowForPatient(p.donorId));
            setRecipientWorkflow(getWorkflowForPatient(p.recipientId));
        }
    }
  }, [id]);

  const handleAiSummary = async () => {
      if(!donor || !recipient) return;
      setLoadingSummary(true);
      const dw = getWorkflowForPatient(donor.id);
      const rw = getWorkflowForPatient(recipient.id);
      try {
        const text = await generatePairSummary(donor, recipient, dw, rw);
        setAiSummary(text);
      } catch(e) {
          console.error(e);
      } finally {
          setLoadingSummary(false);
      }
  };

  if (!pair || !donor || !recipient) return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin mr-2"/> Loading Pair...</div>;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-slate-900">Pair Evaluation</h1>
                    <Badge variant="success">Active</Badge>
                </div>
                <p className="text-slate-500 text-sm mt-1">Pair ID: <span className="font-mono text-slate-700">{pair.id}</span></p>
            </div>
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg self-start">
                <button 
                    onClick={() => setViewMode('columns')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'columns' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Columns size={16} className="mr-2" /> Detailed View
                </button>
                <button 
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'timeline' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Calendar size={16} className="mr-2" /> Timeline
                </button>
            </div>
        </div>

        {/* AI Summary Section */}
        <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-700 rounded-full opacity-50 blur-xl"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <Wand2 className="mr-2 h-5 w-5 text-indigo-300" /> Clinical Pair Summary
                    </h3>
                    {!aiSummary && (
                        <Button size="sm" className="bg-white text-indigo-900 hover:bg-indigo-50 border-none" onClick={handleAiSummary} isLoading={loadingSummary}>
                            Generate Insight
                        </Button>
                    )}
                </div>
                {aiSummary ? (
                    <div className="bg-indigo-800/50 rounded-lg p-4 backdrop-blur-sm border border-indigo-700/50">
                        <div className="prose prose-sm prose-invert max-w-none">
                            <p className="whitespace-pre-line leading-relaxed">{aiSummary}</p>
                        </div>
                        <button onClick={handleAiSummary} className="text-xs text-indigo-300 hover:text-white mt-3 flex items-center">
                            <RefreshCw className="w-3 h-3 mr-1" /> Regenerate Analysis
                        </button>
                    </div>
                ) : (
                    <p className="text-indigo-200 text-sm">Use AI to analyze cross-match compatibility, surgical risks, and timeline synchronization for this pair.</p>
                )}
            </div>
        </div>

        {/* View Content */}
        {viewMode === 'columns' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Donor Column */}
                <div className="flex flex-col space-y-4">
                    <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-4 shadow-sm flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-slate-900">DONOR</h2>
                            <p className="text-lg text-blue-700">{donor.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">MRN</p>
                            <p className="font-mono text-sm">{donor.mrn}</p>
                        </div>
                    </div>
                    <PhaseTracker patientId={donor.id} patientType="Donor" />
                </div>

                {/* Recipient Column */}
                <div className="flex flex-col space-y-4">
                    <div className="bg-white border-l-4 border-purple-500 rounded-r-lg p-4 shadow-sm flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-slate-900">RECIPIENT</h2>
                            <p className="text-lg text-purple-700">{recipient.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">MRN</p>
                            <p className="font-mono text-sm">{recipient.mrn}</p>
                        </div>
                    </div>
                    <PhaseTracker patientId={recipient.id} patientType="Recipient" />
                </div>
            </div>
        )}

        {viewMode === 'timeline' && donorWorkflow && recipientWorkflow && (
             <Card className="overflow-hidden border-0 shadow-md">
                 <CardContent className="p-8 overflow-x-auto">
                     <div className="min-w-[800px]">
                        {/* Timeline Header */}
                        <div className="grid grid-cols-9 gap-2 mb-6 text-center">
                            <div className="col-span-1 text-left font-bold text-slate-400 text-sm uppercase tracking-wider">Patient</div>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="col-span-1 flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 mb-2">
                                        {i}
                                    </div>
                                    <span className="text-xs text-slate-400 hidden md:block truncate max-w-full px-1">
                                        {i===1 ? 'Labs' : i===5 ? 'HLA' : i===8 ? 'Surgery' : 'Phase'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Donor Track */}
                        <div className="grid grid-cols-9 gap-2 items-center mb-6 relative">
                             {/* Connecting Line */}
                             <div className="absolute left-[11%] right-[5%] top-1/2 h-0.5 bg-slate-100 -z-10"></div>
                             
                             <div className="col-span-1 font-semibold text-blue-700 flex items-center">
                                 <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> Donor
                             </div>
                             {[1, 2, 3, 4, 5, 6, 7, 8].map(id => {
                                 const p = donorWorkflow.phases[id];
                                 const isDone = p.status === 'COMPLETED';
                                 const isProg = p.status === 'IN_PROGRESS';
                                 return (
                                     <div key={id} className="col-span-1 flex justify-center">
                                         <div 
                                            className={`w-full h-3 rounded-full transition-all ${isDone ? 'bg-blue-500' : isProg ? 'bg-blue-300 animate-pulse' : 'bg-slate-200'}`}
                                            title={`${p.name}: ${p.status}`}
                                         ></div>
                                     </div>
                                 );
                             })}
                        </div>

                        {/* Recipient Track */}
                        <div className="grid grid-cols-9 gap-2 items-center relative">
                             {/* Connecting Line */}
                             <div className="absolute left-[11%] right-[5%] top-1/2 h-0.5 bg-slate-100 -z-10"></div>

                             <div className="col-span-1 font-semibold text-purple-700 flex items-center">
                                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div> Recipient
                             </div>
                             {[1, 2, 3, 4, 5, 6, 7, 8].map(id => {
                                 const p = recipientWorkflow.phases[id];
                                 const isDone = p.status === 'COMPLETED';
                                 const isProg = p.status === 'IN_PROGRESS';
                                 return (
                                     <div key={id} className="col-span-1 flex justify-center">
                                         <div 
                                            className={`w-full h-3 rounded-full transition-all ${isDone ? 'bg-purple-500' : isProg ? 'bg-purple-300 animate-pulse' : 'bg-slate-200'}`}
                                            title={`${p.name}: ${p.status}`}
                                         ></div>
                                     </div>
                                 );
                             })}
                        </div>
                        
                        {/* Sync Indicators (Mock) */}
                        <div className="mt-8 border-t pt-4 flex justify-center space-x-8 text-sm text-slate-500">
                            <div className="flex items-center"><div className="w-3 h-3 bg-slate-200 rounded-full mr-2"></div> Not Started</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-blue-300 rounded-full mr-2"></div> In Progress</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> Completed</div>
                        </div>
                     </div>
                 </CardContent>
             </Card>
        )}
    </div>
  );
};

export default PairDetailPage;
