
import { Patient, Pair, Workflow, PatientType, PhaseStatus, EvaluationPhase } from "../types";

const STORAGE_KEYS = {
  PATIENTS: 'tf_patients',
  PAIRS: 'tf_pairs',
  WORKFLOWS: 'tf_workflows',
};

// Seed Data
const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    const demoPatients: Patient[] = [
      {
        id: 'p1', mrn: 'MRN-001', name: 'John Doe', dateOfBirth: '1980-05-15', gender: 'Male',
        type: PatientType.RECIPIENT, bloodGroup: 'O+', height: 175, weight: 80, bmi: 26.1,
        phone: '555-0101', email: 'john@example.com', medicalHistory: ['Hypertension', 'CKD Stage 5'],
        registeredDate: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: 'p2', mrn: 'MRN-002', name: 'Jane Smith', dateOfBirth: '1985-08-20', gender: 'Female',
        type: PatientType.DONOR, bloodGroup: 'O+', height: 165, weight: 60, bmi: 22.0,
        phone: '555-0102', email: 'jane@example.com', medicalHistory: ['None'],
        registeredDate: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: 'p3', mrn: 'MRN-003', name: 'Robert Brown', dateOfBirth: '1975-02-10', gender: 'Male',
        type: PatientType.RECIPIENT, bloodGroup: 'A+', height: 180, weight: 90, bmi: 27.8,
        phone: '555-0103', email: 'bob@example.com', medicalHistory: ['Diabetes Type 2'],
        registeredDate: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(demoPatients));
    
    // Create pair
    const demoPairs: Pair[] = [
        { id: 'pair1', donorId: 'p2', recipientId: 'p1', createdDate: new Date().toISOString(), status: 'Active' }
    ];
    localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(demoPairs));
    
    // Initialize workflows manually for seed to show progress
    const p1Workflow = createDefaultWorkflow('p1');
    p1Workflow.phases[1].status = PhaseStatus.COMPLETED;
    p1Workflow.phases[1].progress = 100;
    p1Workflow.phases[2].status = PhaseStatus.IN_PROGRESS;
    p1Workflow.phases[2].progress = 40;
    
    const p2Workflow = createDefaultWorkflow('p2');
    p2Workflow.phases[1].status = PhaseStatus.COMPLETED;
    p2Workflow.phases[1].progress = 100;
    p2Workflow.phases[2].status = PhaseStatus.IN_PROGRESS;
    p2Workflow.phases[2].progress = 60;
    
    const workflows = {
        'p1': p1Workflow,
        'p2': p2Workflow,
        'p3': createDefaultWorkflow('p3')
    };
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  }
};

const DEFAULT_PHASES = [
  { id: 1, name: 'Initial Screening & Labs' },
  { id: 2, name: 'Advanced Assessments' },
  { id: 3, name: 'Consultations' },
  { id: 4, name: 'Legal Clearance' },
  { id: 5, name: 'HLA Typing & Crossmatch' },
  { id: 6, name: 'Final Review' },
  { id: 7, name: 'Admission' },
  { id: 8, name: 'Surgery' },
];

const createDefaultWorkflow = (patientId: string): Workflow => {
    const phases: Record<number, EvaluationPhase> = {};
    DEFAULT_PHASES.forEach(p => {
      phases[p.id] = {
        id: p.id,
        name: p.name,
        status: PhaseStatus.AVAILABLE,
        progress: 0,
        lastUpdated: new Date().toISOString(),
        data: {}
      };
    });
    return { patientId, phases };
};

seedData();

// --- Patients ---
export const getPatients = (): Patient[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
};

export const getPatientById = (id: string): Patient | undefined => {
  return getPatients().find(p => p.id === id);
};

export const registerNewPatient = (patient: Patient) => {
  const patients = getPatients();
  patients.push(patient);
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  // Initialize workflow
  getWorkflowForPatient(patient.id); 
};

// --- Pairs ---
export const getPairs = (): Pair[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAIRS) || '[]');
};

export const getPairById = (id: string): Pair | undefined => {
  return getPairs().find(p => p.id === id);
};

export const createPair = (donorId: string, recipientId: string) => {
  const pairs = getPairs();
  const newPair: Pair = {
    id: `pair_${Date.now()}`,
    donorId,
    recipientId,
    createdDate: new Date().toISOString(),
    status: 'Active'
  };
  pairs.push(newPair);
  localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(pairs));
};

// --- Workflow ---

export const getWorkflowForPatient = (patientId: string): Workflow => {
  const workflows = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKFLOWS) || '{}');
  
  if (!workflows[patientId]) {
    workflows[patientId] = createDefaultWorkflow(patientId);
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  }
  
  return workflows[patientId];
};

export const updateWorkflowForPatient = (patientId: string, phaseId: number, updates: Partial<EvaluationPhase>) => {
  const workflows = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKFLOWS) || '{}');
  if (!workflows[patientId]) return;

  const currentPhase = workflows[patientId].phases[phaseId];
  workflows[patientId].phases[phaseId] = { ...currentPhase, ...updates, lastUpdated: new Date().toISOString() };
  
  localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));

  // Handle Pair Syncing for Phases 4-8
  if (phaseId >= 4) {
    syncPairData(patientId, phaseId, updates);
  }
};

const syncPairData = (patientId: string, phaseId: number, updates: Partial<EvaluationPhase>) => {
    const pairs = getPairs();
    const pair = pairs.find(p => p.donorId === patientId || p.recipientId === patientId);
    
    if (pair) {
        const partnerId = pair.donorId === patientId ? pair.recipientId : pair.donorId;
        const workflows = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKFLOWS) || '{}');
        
        if (workflows[partnerId]) {
            const partnerPhase = workflows[partnerId].phases[phaseId];
            // Merge data updates, keep local status/progress unless we want complete lockstep
            // For this app, we sync data payload mostly
            workflows[partnerId].phases[phaseId] = { 
                ...partnerPhase, 
                data: { ...partnerPhase.data, ...updates.data }, 
                lastUpdated: new Date().toISOString() 
            };
            localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
        }
    }
};
