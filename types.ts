
export enum PatientType {
  DONOR = 'DONOR',
  RECIPIENT = 'RECIPIENT',
}

export enum PhaseStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  LOCKED = 'LOCKED',
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  type: PatientType;
  bloodGroup: string;
  height: number;
  weight: number;
  bmi: number;
  phone: string;
  email: string;
  medicalHistory: string[];
  registeredDate: string;
}

export interface Pair {
  id: string;
  donorId: string;
  recipientId: string;
  createdDate: string;
  status: 'Active' | 'OnHold' | 'Completed';
}

export interface MedicalTestItem {
  id: string;
  name: string;
  category: string;
  isAbnormal: boolean;
  value?: string;
  isExempt?: boolean;
  exemptReason?: string;
  requiredGender?: 'Male' | 'Female';
  minAge?: number;
}

// Phase 2: Anatomy & Function
export interface KidneyAnatomy {
    length: string; // cm
    arteries: number;
    veins: number;
    cysts: boolean;
    stones: boolean;
    notes: string;
}

export interface Phase2Data {
    // Donor Specific
    leftKidney?: KidneyAnatomy;
    rightKidney?: KidneyAnatomy;
    gfrLeft?: number;
    gfrRight?: number;
    gfrTotal?: number;
    surgicalPlan?: string;
    selectedKidney?: 'Left' | 'Right';
    
    // Recipient Specific
    cardiacClearance?: 'Pending' | 'Cleared' | 'Conditional';
    chestXray?: 'Normal' | 'Abnormal';
    dentalClearance?: boolean;
    notes?: string;
}

// Phase 3: Consultations
export interface Consultation {
    id: string;
    specialty: string; // e.g., Nephrology, Urology, SW, Psych
    practitioner: string;
    date: string;
    status: 'Pending' | 'Cleared' | 'Conditional' | 'Rejected';
    notes: string;
}

// Phase 5: HLA
export interface HlaData {
  a1: string;
  a2: string;
  b1: string;
  b2: string;
  dr1: string;
  dr2: string;
  crossmatchPositive: boolean;
  dsaDetected: boolean;
  riskLevel: 'Identical' | 'Low' | 'Moderate' | 'High';
}

export interface EvaluationPhase {
  id: number;
  name: string;
  status: PhaseStatus;
  progress: number;
  lastUpdated: string;
  data: any; // Typed as any for flexibility, but maps to Phase2Data, Consultation[], etc.
}

export interface Workflow {
  patientId: string;
  phases: Record<number, EvaluationPhase>;
}
