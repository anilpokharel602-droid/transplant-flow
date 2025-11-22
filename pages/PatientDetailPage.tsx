import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientById, getWorkflowForPatient } from '../services/backendService';
import { generateEvaluationSummary, generateRiskAssessment } from '../services/geminiService';
import { Patient, Workflow } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PhaseTracker } from '../components/PhaseTracker';
import { Brain, Activity, User } from 'lucide-react';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [workflow, setWorkflow] = useState<Workflow | undefined>(undefined);
  const [summary, setSummary] = useState<string>('');
  const [risk, setRisk] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<'summary' | 'risk' | null>(null);

  useEffect(() => {
    if (id) {
      const p = getPatientById(id);
      setPatient(p);
      if (p) {
          setWorkflow(getWorkflowForPatient(p.id));
      }
    }
  }, [id]);

  const handleGenerateSummary = async () => {
    if (!patient || !workflow) return;
    setLoadingAi('summary');
    try {
      const result = await generateEvaluationSummary(patient, workflow);
      setSummary(result);
    } catch (e) {
        console.error(e);
        setSummary("Error generating summary.");
    } finally {
      setLoadingAi(null);
    }
  };

  const handleGenerateRisk = async () => {
    if (!patient) return;
    setLoadingAi('risk');
    try {
      const result = await generateRiskAssessment(patient);
      setRisk(result);
    } catch (e) {
        console.error(e);
        setRisk("Error generating risk.");
    } finally {
      setLoadingAi(null);
    }
  };

  if (!patient) return <div className="p-8">Patient not found</div>;

  return (
    <div className="space-y-6">
      {/* Top Card */}
      <Card>
          <CardContent className="p-6 flex justify-between items-start">
              <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${patient.type === 'DONOR' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
                      <div className="flex space-x-4 text-sm text-slate-500 mt-1">
                          <span>{patient.mrn}</span>
                          <span>•</span>
                          <span>{patient.type}</span>
                          <span>•</span>
                          <span>{patient.gender}, {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs</span>
                          <span>•</span>
                          <span>BMI: {patient.bmi.toFixed(1)}</span>
                      </div>
                  </div>
              </div>
              <div className="text-right text-sm text-slate-500">
                 Registered: {new Date(patient.registeredDate).toLocaleDateString()}
              </div>
          </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Workflow */}
          <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Evaluation Workflow</h3>
              <PhaseTracker patientId={patient.id} patientType={patient.type as any} />
          </div>

          {/* Right: AI Assistants */}
          <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">AI Assistants</h3>
              
              {/* Summary Card */}
              <Card className="border-indigo-100 shadow-md">
                  <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                      <CardTitle className="text-indigo-900 flex items-center">
                          <Brain className="w-5 h-5 mr-2" /> Clinical Summary
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                      {!summary ? (
                          <div className="text-center py-4">
                              <p className="text-sm text-slate-500 mb-4">Generate a status summary based on current phase data.</p>
                              <Button onClick={handleGenerateSummary} isLoading={loadingAi === 'summary'} variant="secondary" size="sm">
                                  Generate Summary
                              </Button>
                          </div>
                      ) : (
                          <div className="prose prose-sm prose-indigo">
                             <p className="whitespace-pre-line">{summary}</p>
                             <Button onClick={handleGenerateSummary} isLoading={loadingAi === 'summary'} variant="outline" size="sm" className="mt-4 w-full">
                                  Refresh
                             </Button>
                          </div>
                      )}
                  </CardContent>
              </Card>

              {/* Risk Card */}
              <Card className="border-orange-100 shadow-md">
                  <CardHeader className="bg-orange-50 border-b border-orange-100">
                      <CardTitle className="text-orange-900 flex items-center">
                          <Activity className="w-5 h-5 mr-2" /> Risk Assessment
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                      {!risk ? (
                          <div className="text-center py-4">
                              <p className="text-sm text-slate-500 mb-4">Analyze patient profile for risk factors.</p>
                              <Button onClick={handleGenerateRisk} isLoading={loadingAi === 'risk'} variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                                  Assess Risk
                              </Button>
                          </div>
                      ) : (
                           <div className="prose prose-sm prose-orange">
                             <p className="whitespace-pre-line">{risk}</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
