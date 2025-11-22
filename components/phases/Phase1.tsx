
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Patient, MedicalTestItem } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  CheckCircle, AlertCircle, MinusCircle, Beaker, ShieldAlert, 
  FileHeart, Scan, Activity, Droplet, Scale, Thermometer, 
  AlertTriangle, ChevronRight, ChevronDown, Upload
} from 'lucide-react';

interface Phase1Props {
  patient: Patient;
  data: any;
  onUpdate: (updates: any) => void;
  onComplete: () => void;
}

// --- Types for the Smart Catalog ---
type TestValidationType = 'numeric' | 'qualitative' | 'text';

interface TestDefinition {
  name: string;
  unit?: string;
  type: TestValidationType;
  // Reference Range Display String
  rangeDisplay: string; 
  // Logic to validate - Now includes AGE
  min?: (gender: 'Male'|'Female', age: number) => number;
  max?: (gender: 'Male'|'Female', age: number) => number;
  expected?: string[]; // For qualitative (e.g., ['Negative', 'Non-Reactive'])
  abnormalKeywords?: string[]; // Triggers for text (e.g., ['Abnormal', 'Positive'])
}

interface TestCategory {
  name: string;
  icon: React.ReactNode;
  tests: TestDefinition[];
}

// --- Clinical Catalog with Normal Values ---
const LAB_CATALOG: TestCategory[] = [
  { 
    name: 'Hematology (CBC)', 
    icon: <Droplet className="w-4 h-4 text-red-500"/>,
    tests: [
      { name: 'Hemoglobin (Hb)', unit: 'g/dL', type: 'numeric', rangeDisplay: 'M: 13.5-17.5, F: 12.0-15.5', min: (g) => g === 'Male' ? 13.5 : 12.0, max: (g) => g === 'Male' ? 17.5 : 15.5 },
      { name: 'White Blood Cell Count (WBC)', unit: 'x10^9/L', type: 'numeric', rangeDisplay: '4.5 - 11.0', min: () => 4.5, max: () => 11.0 },
      { name: 'Platelet Count (Plt)', unit: 'x10^9/L', type: 'numeric', rangeDisplay: '150 - 450', min: () => 150, max: () => 450 },
      { name: 'Hematocrit (Hct)', unit: '%', type: 'numeric', rangeDisplay: 'M: 41-50, F: 36-48', min: (g) => g === 'Male' ? 41 : 36, max: (g) => g === 'Male' ? 50 : 48 },
      { name: 'Neutrophils (Neu)', unit: '%', type: 'numeric', rangeDisplay: '40 - 70%', min: () => 40, max: () => 70 },
      { name: 'Lymphocytes (Lym)', unit: '%', type: 'numeric', rangeDisplay: '20 - 40%', min: () => 20, max: () => 40 },
      { name: 'Eosinophils (Eos)', unit: '%', type: 'numeric', rangeDisplay: '1 - 6%', min: () => 1, max: () => 6 },
      { name: 'Basophils (Baso)', unit: '%', type: 'numeric', rangeDisplay: '0 - 2%', min: () => 0, max: () => 2 },
      { name: 'Blood Group (ABO/Rh)', type: 'text', rangeDisplay: 'N/A' }
    ] 
  },
  { 
    name: 'Renal Profile (RFT)', 
    icon: <Activity className="w-4 h-4 text-blue-500"/>,
    tests: [
      { name: 'Sodium (Na+)', unit: 'mmol/L', type: 'numeric', rangeDisplay: '135 - 145', min: () => 135, max: () => 145 },
      { name: 'Potassium (K+)', unit: 'mmol/L', type: 'numeric', rangeDisplay: '3.5 - 5.0', min: () => 3.5, max: () => 5.0 },
      { name: 'Chloride (Cl-)', unit: 'mmol/L', type: 'numeric', rangeDisplay: '98 - 107', min: () => 98, max: () => 107 },
      { name: 'Bicarbonate (HCO3)', unit: 'mmol/L', type: 'numeric', rangeDisplay: '22 - 29', min: () => 22, max: () => 29 },
      { name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '7 - 20', min: () => 7, max: () => 20 },
      { 
        name: 'Serum Creatinine (SCr)', 
        unit: 'mg/dL', 
        type: 'numeric', 
        rangeDisplay: 'M: 0.7-1.3, F: 0.6-1.1', 
        min: (g) => g === 'Male' ? 0.7 : 0.6, 
        max: (g) => g === 'Male' ? 1.3 : 1.1 
      },
      { name: 'BUN/Creatinine Ratio', unit: '', type: 'numeric', rangeDisplay: '10 - 20', min: () => 10, max: () => 20 },
      { 
        name: 'eGFR (CKD-EPI)', 
        unit: 'mL/min/1.73m²', 
        type: 'numeric', 
        rangeDisplay: 'Age Adapted (>60-90)', 
        min: (g, age) => {
             // Natural decline of GFR with age: Young > 90, Elderly > 60 accepted
             if (age < 30) return 90;
             if (age < 40) return 80;
             if (age < 60) return 70;
             return 60;
        }, 
        max: () => 200 
      } 
    ] 
  },
  { 
    name: 'Liver Function Tests (LFT)', 
    icon: <Beaker className="w-4 h-4 text-amber-500"/>,
    tests: [
      { name: 'Total Bilirubin (T.Bil)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '0.1 - 1.2', min: () => 0.1, max: () => 1.2 },
      { name: 'Direct Bilirubin (D.Bil)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '< 0.3', min: () => 0, max: () => 0.3 },
      { name: 'ALT (SGPT)', unit: 'U/L', type: 'numeric', rangeDisplay: '< 45', min: () => 0, max: () => 45 },
      { name: 'AST (SGOT)', unit: 'U/L', type: 'numeric', rangeDisplay: '< 40', min: () => 0, max: () => 40 },
      { name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', type: 'numeric', rangeDisplay: '44 - 147', min: () => 44, max: () => 147 },
      { name: 'Alk Phos Isoenzymes', type: 'text', rangeDisplay: 'Normal Pattern' },
      { name: 'Gamma-GT (GGT)', unit: 'U/L', type: 'numeric', rangeDisplay: '9 - 48', min: () => 9, max: () => 48 },
      { name: 'Total Protein (TP)', unit: 'g/dL', type: 'numeric', rangeDisplay: '6.0 - 8.3', min: () => 6.0, max: () => 8.3 },
      { name: 'Albumin (Alb)', unit: 'g/dL', type: 'numeric', rangeDisplay: '3.5 - 5.5', min: () => 3.5, max: () => 5.5 },
      { name: 'Globulin (Glob)', unit: 'g/dL', type: 'numeric', rangeDisplay: '2.0 - 3.5', min: () => 2.0, max: () => 3.5 }
    ] 
  },
  { 
    name: 'Metabolic & Endocrine', 
    icon: <Scale className="w-4 h-4 text-purple-500"/>,
    tests: [
      { name: 'Fasting Blood Sugar (FBS)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '70 - 99', min: () => 70, max: () => 99 },
      { name: 'HbA1c', unit: '%', type: 'numeric', rangeDisplay: '< 5.7', min: () => 0, max: () => 5.7 },
      { name: 'Calcium (Ca)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '8.5 - 10.5', min: () => 8.5, max: () => 10.5 },
      { name: 'Phosphate (PO4)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '2.5 - 4.5', min: () => 2.5, max: () => 4.5 },
      { name: 'Magnesium (Mg)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '1.7 - 2.2', min: () => 1.7, max: () => 2.2 },
      { 
        name: 'Uric Acid (UA)', 
        unit: 'mg/dL', 
        type: 'numeric', 
        rangeDisplay: 'M: 3.4-7.0, F: 2.4-6.0', 
        min: (g) => g === 'Male' ? 3.4 : 2.4, 
        max: (g) => g === 'Male' ? 7.0 : 6.0 
      },
      { name: 'Parathyroid Hormone (PTH)', unit: 'pg/mL', type: 'numeric', rangeDisplay: '15 - 65', min: () => 15, max: () => 65 },
      { name: 'Thyroid Stimulating Hormone (TSH)', unit: 'mIU/L', type: 'numeric', rangeDisplay: '0.4 - 4.0', min: () => 0.4, max: () => 4.0 },
      { name: 'Free Thyroxine (fT4)', unit: 'ng/dL', type: 'numeric', rangeDisplay: '0.8 - 1.8', min: () => 0.8, max: () => 1.8 },
      { name: 'Vitamin D (25-OH)', unit: 'ng/mL', type: 'numeric', rangeDisplay: '20 - 80', min: () => 20, max: () => 80 }
    ] 
  },
  { 
    name: 'Lipids & Coagulation', 
    icon: <Thermometer className="w-4 h-4 text-orange-500"/>,
    tests: [
      { name: 'Total Cholesterol (TC)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '< 200', min: () => 0, max: () => 200 },
      { name: 'Triglycerides (TG)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '< 150', min: () => 0, max: () => 150 },
      { name: 'HDL Cholesterol (HDL)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '> 40', min: () => 40, max: () => 200 }, // High HDL is good, capping at 200 to catch outliers
      { name: 'LDL Cholesterol (LDL)', unit: 'mg/dL', type: 'numeric', rangeDisplay: '< 100', min: () => 0, max: () => 100 },
      { name: 'Prothrombin Time (PT)', unit: 'sec', type: 'numeric', rangeDisplay: '11 - 13.5', min: () => 11, max: () => 13.5 },
      { name: 'INR', unit: '', type: 'numeric', rangeDisplay: '0.8 - 1.1', min: () => 0.8, max: () => 1.1 },
      { name: 'APTT', unit: 'sec', type: 'numeric', rangeDisplay: '30 - 40', min: () => 30, max: () => 40 }
    ] 
  },
  { 
    name: 'Infectious Disease (Virology)', 
    icon: <ShieldAlert className="w-4 h-4 text-rose-500"/>,
    tests: [
      { name: 'HIV 1/2 Screen (HIV)', type: 'qualitative', rangeDisplay: 'Non-Reactive', expected: ['Non-Reactive', 'Negative', 'Neg', 'Not Detected'] },
      { name: 'Hep B Surface Ag (HBsAg)', type: 'qualitative', rangeDisplay: 'Non-Reactive', expected: ['Non-Reactive', 'Negative', 'Neg'] },
      { name: 'Hep B Surface Ab (Anti-HBs)', unit: 'mIU/mL', type: 'qualitative', rangeDisplay: 'Reactive (>10)', expected: ['Reactive', 'Positive', 'Pos', '>10'] },
      { name: 'Hep B Core Ab (Anti-HBc)', type: 'qualitative', rangeDisplay: 'Non-Reactive', expected: ['Non-Reactive', 'Negative', 'Neg'] },
      { name: 'Hep C Antibody (Anti-HCV)', type: 'qualitative', rangeDisplay: 'Non-Reactive', expected: ['Non-Reactive', 'Negative', 'Neg'] },
      { name: 'Hep D Antibody (Anti-HDV)', type: 'qualitative', rangeDisplay: 'Non-Reactive', expected: ['Non-Reactive', 'Negative', 'Neg'] },
      { name: 'Hep E Antibody (Anti-HEV)', type: 'qualitative', rangeDisplay: 'Non-Reactive', expected: ['Non-Reactive', 'Negative', 'Neg'] },
      { name: 'Syphilis (VDRL/RPR)', type: 'qualitative', rangeDisplay: 'Non-Reactive', expected: ['Non-Reactive', 'Negative', 'Neg'] },
      { name: 'CMV IgG', type: 'qualitative', rangeDisplay: 'Positive (Immune)', expected: ['Positive', 'Reactive', 'Detected', 'Pos'] },
      { name: 'EBV IgG', type: 'qualitative', rangeDisplay: 'Positive (Immune)', expected: ['Positive', 'Reactive', 'Detected', 'Pos'] },
      { name: 'Varicella Zoster IgG (VZV)', type: 'qualitative', rangeDisplay: 'Positive (Immune)', expected: ['Positive', 'Pos', 'Reactive'] },
      { name: 'Measles IgG', type: 'qualitative', rangeDisplay: 'Positive (Immune)', expected: ['Positive', 'Reactive', 'Detected', 'Pos'] },
      { name: 'Quantiferon-TB (IGRA)', type: 'qualitative', rangeDisplay: 'Negative', expected: ['Negative', 'Neg', 'Not Detected'] }
    ] 
  },
  { 
    name: 'Urine Studies', 
    icon: <Activity className="w-4 h-4 text-yellow-600"/>,
    tests: [
      { name: 'Urine Protein (Dipstick)', type: 'qualitative', rangeDisplay: 'Negative', expected: ['Negative', 'Neg', 'Trace'] },
      { name: 'Urine Blood (Dipstick)', type: 'qualitative', rangeDisplay: 'Negative', expected: ['Negative', 'Neg'] },
      { name: 'Urine Leukocytes (Dipstick)', type: 'qualitative', rangeDisplay: 'Negative', expected: ['Negative', 'Neg'] },
      { name: 'Urine Culture (C/S)', type: 'qualitative', rangeDisplay: 'No Growth', expected: ['No Growth', 'Sterile', 'Negative'] },
      { name: 'Urine Osmolality', unit: 'mOsm/kg', type: 'numeric', rangeDisplay: '500 - 800', min: () => 50, max: () => 1200 },
      { name: 'Urine Specific Gravity', unit: '', type: 'numeric', rangeDisplay: '1.005 - 1.030', min: () => 1.005, max: () => 1.030 },
      { name: 'Spot Urine Protein/Cr (UPCR)', unit: 'mg/mg', type: 'numeric', rangeDisplay: '< 0.2', min: () => 0, max: () => 0.2 },
      { name: 'Spot Urine Albumin/Cr (ACR)', unit: 'mg/g', type: 'numeric', rangeDisplay: '< 30', min: () => 0, max: () => 30 },
      { name: '24h Urine Volume (Vol)', unit: 'mL', type: 'numeric', rangeDisplay: '800 - 2500', min: () => 800, max: () => 3000 },
      { name: '24h Urine Protein (Prot)', unit: 'mg/day', type: 'numeric', rangeDisplay: '< 150', min: () => 0, max: () => 150 },
      { name: '24h Urine Urea', unit: 'mg/day', type: 'numeric', rangeDisplay: '12000 - 24000', min: () => 12000, max: () => 24000 },
      { name: '24h Urine Creatinine', unit: 'mg/day', type: 'numeric', rangeDisplay: 'M: 1000-2000, F: 800-1800', min: (g) => g === 'Male' ? 1000 : 800, max: (g) => g === 'Male' ? 2000 : 1800 },
      { 
        name: '24h Creatinine Clearance (CrCl)', 
        unit: 'mL/min', 
        type: 'numeric', 
        rangeDisplay: 'M: 97-137, F: 88-128', 
        min: (g) => g === 'Male' ? 97 : 88, 
        max: (g) => g === 'Male' ? 137 : 128 
      }
    ] 
  },
  { 
    name: 'Cardiopulmonary & Imaging', 
    icon: <FileHeart className="w-4 h-4 text-pink-600"/>,
    tests: [
      { name: 'ECG Rhythm', type: 'qualitative', rangeDisplay: 'Sinus Rhythm', expected: ['Sinus Rhythm', 'NSR', 'Normal'] },
      { name: 'ECG Conclusion', type: 'qualitative', rangeDisplay: 'Normal', expected: ['Normal'] },
      { name: 'ECHO LVEF (%)', unit: '%', type: 'numeric', rangeDisplay: '55 - 70', min: () => 55, max: () => 75 },
      { name: 'ECHO PA Pressure (PASP)', unit: 'mmHg', type: 'numeric', rangeDisplay: '< 35', min: () => 0, max: () => 35 },
      { name: 'Chest X-Ray (CXR)', type: 'qualitative', rangeDisplay: 'Normal', expected: ['Normal', 'Clear'] },
      { name: 'USG Abdomen (Kidneys)', type: 'qualitative', rangeDisplay: 'Normal', expected: ['Normal'] },
      { name: 'USG Abdomen (Liver)', type: 'qualitative', rangeDisplay: 'Normal', expected: ['Normal'] }
    ] 
  },
  { 
    name: 'Cancer & Screening', 
    icon: <Scan className="w-4 h-4 text-emerald-500"/>,
    tests: [
      { 
        name: 'PSA (Total)', 
        unit: 'ng/mL', 
        type: 'numeric', 
        rangeDisplay: 'Age Specific (<2.5 to <6.5)', 
        min: () => 0, 
        max: (g, age) => {
            // Age-specific PSA reference ranges
            if (age < 50) return 2.5;
            if (age < 60) return 3.5;
            if (age < 70) return 4.5;
            return 6.5;
        } 
      },
      { name: 'Pap Smear', type: 'qualitative', rangeDisplay: 'Negative / NILM', expected: ['Negative', 'Normal', 'NILM'] },
      { name: 'Mammogram', type: 'qualitative', rangeDisplay: 'BIRADS 1/2', expected: ['Normal', 'Negative', 'BIRADS 1', 'BIRADS 2'] },
      { name: 'Colonoscopy', type: 'qualitative', rangeDisplay: 'Normal', expected: ['Normal', 'Negative', 'No Polyps'] },
      { name: 'Fecal Occult Blood (FOBT)', type: 'qualitative', rangeDisplay: 'Negative', expected: ['Negative', 'Neg'] },
      { name: 'Pregnancy Test (Beta-HCG)', type: 'qualitative', rangeDisplay: 'Negative', expected: ['Negative', 'Neg'] }
    ] 
  },
];

// --- Component ---

export const Phase1: React.FC<Phase1Props> = ({ patient, data, onUpdate, onComplete }) => {
  const [tests, setTests] = useState<MedicalTestItem[]>(data.tests || []);
  const [openCategories, setOpenCategories] = useState<string[]>(LAB_CATALOG.map(c => c.name));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patientAge = useMemo(() => {
      if (!patient.dateOfBirth) return 30; // Default
      return new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  }, [patient.dateOfBirth]);

  // Initialize tests using the Smart Catalog (Handles migration/new tests)
  useEffect(() => {
    const currentTests = [...tests];
    let hasChanges = false;
    // Find max ID to append new ones cleanly
    let idCounter = currentTests.length > 0 
        ? Math.max(...currentTests.map(t => parseInt(t.id.replace(/^t/, '')) || 0)) + 1 
        : 1;

    LAB_CATALOG.forEach(cat => {
      cat.tests.forEach(def => {
          // Gender & Age Logic for Inclusion
          if (def.name.includes('PSA') && patient.gender !== 'Male') return;
          if ((def.name.includes('Pap') || def.name.includes('Mammogram') || def.name.includes('Pregnancy')) && patient.gender !== 'Female') return;
          
          if (def.name.includes('Colonoscopy') && patientAge < 45) return;
          if (def.name.includes('Mammogram') && patientAge < 40) return;
          if (def.name.includes('PSA') && patientAge < 50) return;
          if (def.name.includes('Pregnancy') && patientAge > 55) return;

          // Check if exists, if not add it
          if (!currentTests.some(t => t.name === def.name)) {
              currentTests.push({
                  id: `t${idCounter++}`,
                  name: def.name,
                  category: cat.name,
                  isAbnormal: false,
                  value: ''
              });
              hasChanges = true;
          }
      });
    });
    
    if (hasChanges || (tests.length === 0 && currentTests.length > 0)) {
      setTests(currentTests);
      onUpdate({ tests: currentTests });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.gender, patientAge]); // Re-run if demographics change

  const checkAbnormality = (value: string, def: TestDefinition): boolean => {
      if (!value || value.trim() === '') return false;

      // 1. Numeric Validation
      if (def.type === 'numeric' && def.min && def.max) {
          const num = parseFloat(value);
          if (isNaN(num)) return false; // If text entered in numeric field, don't auto-flag
          const min = def.min(patient.gender, patientAge);
          const max = def.max(patient.gender, patientAge);
          return num < min || num > max;
      }

      // 2. Qualitative Validation (Exact string match, case insensitive)
      if (def.type === 'qualitative' && def.expected) {
          const lowerVal = value.toLowerCase().trim();
          const isExpected = def.expected.some(ex => lowerVal.includes(ex.toLowerCase()));
          return !isExpected;
      }

      // 3. Text search for "Bad" words if no specific expected values
      if (def.abnormalKeywords) {
          const lowerVal = value.toLowerCase();
          return def.abnormalKeywords.some(k => lowerVal.includes(k.toLowerCase()));
      }

      return false;
  };

  const handleValueChange = (id: string, value: string) => {
    let updatedTests = tests.map(t => {
        if (t.id !== id) return t;
        
        // Find definition to check for abnormality
        let isAbnormal = t.isAbnormal;
        const category = LAB_CATALOG.find(c => c.name === t.category);
        const def = category?.tests.find(d => d.name === t.name);
        
        if (def) {
            isAbnormal = checkAbnormality(value, def);
        }

        return { ...t, value, isAbnormal };
    });

    // Auto-Calculate BUN/Creatinine Ratio
    const changedTest = tests.find(t => t.id === id);
    if (changedTest && (changedTest.name === 'Blood Urea Nitrogen (BUN)' || changedTest.name === 'Serum Creatinine (SCr)')) {
        const bun = updatedTests.find(t => t.name === 'Blood Urea Nitrogen (BUN)')?.value;
        const scr = updatedTests.find(t => t.name === 'Serum Creatinine (SCr)')?.value;
        const ratioTest = updatedTests.find(t => t.name === 'BUN/Creatinine Ratio');

        if (bun && scr && ratioTest) {
            const bunVal = parseFloat(bun);
            const scrVal = parseFloat(scr);
            
            if (!isNaN(bunVal) && !isNaN(scrVal) && scrVal !== 0) {
                const ratioVal = (bunVal / scrVal).toFixed(1);
                
                // Determine abnormality for the calculated ratio
                const category = LAB_CATALOG.find(c => c.name === ratioTest.category);
                const def = category?.tests.find(d => d.name === ratioTest.name);
                const isRatioAbnormal = def ? checkAbnormality(ratioVal, def) : false;

                updatedTests = updatedTests.map(t => 
                    t.name === 'BUN/Creatinine Ratio' 
                        ? { ...t, value: ratioVal, isAbnormal: isRatioAbnormal } 
                        : t
                );
            }
        }
    }

    setTests(updatedTests);
    updateProgress(updatedTests);
  };

  const toggleAbnormal = (id: string) => {
    const newTests = tests.map(t => t.id === id ? { ...t, isAbnormal: !t.isAbnormal } : t);
    setTests(newTests);
    updateProgress(newTests);
  };

  const toggleExempt = (id: string) => {
      const currentTest = tests.find(t => t.id === id);
      if (currentTest?.isExempt) {
          if (confirm("Remove exemption?")) {
             const newTests = tests.map(t => t.id === id ? { ...t, isExempt: false, exemptReason: undefined, value: '' } : t);
             setTests(newTests);
             updateProgress(newTests);
          }
          return;
      }
      const reason = prompt("Reason for exemption (Required):");
      if (reason === null || !reason.trim()) return;
      const newTests = tests.map(t => t.id === id ? { ...t, isExempt: true, exemptReason: reason.trim(), value: 'N/A' } : t);
      setTests(newTests);
      updateProgress(newTests);
  };

  const updateProgress = (currentTests: MedicalTestItem[]) => {
    const completed = currentTests.filter(t => (t.value && t.value.length > 0) || (t.isExempt && t.exemptReason)).length;
    const progress = Math.round((completed / currentTests.length) * 100);
    onUpdate({ tests: currentTests, progress });
  };

  const toggleCategory = (catName: string) => {
      setOpenCategories(prev => 
          prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
      );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        alert(`Report "${file.name}" attached.`);
    }
  };

  // Filter abnormal tests for summary
  const abnormalTests = useMemo(() => tests.filter(t => t.isAbnormal), [tests]);

  return (
    <div className="space-y-6">
      
      {/* --- Clinical Alert Dashboard (Summary) --- */}
      {abnormalTests.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm animate-in fade-in slide-in-from-top-2">
              <h3 className="text-red-800 font-bold flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 mr-2" /> Clinical Alerts: {abnormalTests.length} Abnormal Findings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {abnormalTests.map(t => {
                      const cat = LAB_CATALOG.find(c => c.name === t.category);
                      const def = cat?.tests.find(d => d.name === t.name);
                      return (
                        <div key={t.id} className="bg-white p-3 rounded border-l-4 border-red-500 shadow-sm flex justify-between items-start">
                            <div>
                                <div className="text-xs text-slate-500 font-medium uppercase">{t.category.split(' ')[0]}</div>
                                <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                    Ref: <span className="text-slate-700">{def?.rangeDisplay || 'N/A'} {def?.unit}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-red-600">{t.value}</div>
                                <div className="text-xs text-red-400 font-medium">{def?.unit}</div>
                            </div>
                        </div>
                      );
                  })}
              </div>
          </div>
      )}

      {/* --- Lab Entry Forms --- */}
      <div className="grid grid-cols-1 gap-6">
        {LAB_CATALOG.filter(cat => tests.some(t => t.category === cat.name)).map(cat => {
            const isOpen = openCategories.includes(cat.name);
            return (
            <div key={cat.name} className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                <button 
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <h4 className="font-semibold text-slate-800 flex items-center">
                        <span className="mr-3 bg-white p-2 rounded-md border border-slate-200 shadow-sm">{cat.icon}</span>
                        {cat.name}
                    </h4>
                    {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400"/> : <ChevronRight className="w-5 h-5 text-slate-400"/>}
                </button>
                
                {isOpen && (
                <div className="p-5 grid grid-cols-1 gap-y-4">
                    {tests.filter(t => t.category === cat.name).map(test => {
                        const def = cat.tests.find(d => d.name === test.name);
                        const hasValue = test.value && test.value.length > 0;
                        return (
                        <div key={test.id} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-all duration-200 
                            ${test.isExempt 
                                ? 'bg-slate-50 border-slate-200 border-l-4 border-l-blue-500' 
                                : test.isAbnormal 
                                    ? 'bg-red-50 border-red-200 border-l-4 border-l-red-500 shadow-sm' 
                                    : hasValue 
                                        ? 'bg-slate-50 border-slate-200 border-l-4 border-l-emerald-500' 
                                        : 'bg-white border-slate-200 hover:border-blue-300 border-l-4 border-l-transparent shadow-sm'
                            }`}>
                            
                            {/* Label & Reference Range */}
                            <div className="flex-1 pr-4 mb-2 sm:mb-0">
                                <div className="flex items-center justify-between sm:justify-start">
                                    <div className="flex items-center">
                                        {test.isExempt ? (
                                            <MinusCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                                        ) : test.isAbnormal ? (
                                            <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                                        ) : hasValue ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 mr-2 flex-shrink-0 opacity-0" />
                                        )}
                                        <div className="text-sm font-semibold text-slate-800">{test.name}</div>
                                    </div>
                                    {test.isAbnormal && <Badge variant="danger" className="ml-2 sm:hidden">Abnormal</Badge>}
                                </div>
                                {def && (
                                    <div className="flex items-center mt-1 text-xs text-slate-500 ml-6">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-mono mr-1">
                                            Ref: {def.rangeDisplay}
                                        </span>
                                        {!def.unit && def.unit && <span className="text-slate-400">{def.unit}</span>}
                                    </div>
                                )}
                                {test.isExempt && <div className="text-xs text-blue-600 mt-1 italic ml-6">Exempt: {test.exemptReason}</div>}
                            </div>

                            {/* Input & Actions */}
                            <div className="flex items-center space-x-3">
                                <div className="relative flex items-center shadow-sm rounded-md">
                                    <input 
                                        type="text" 
                                        inputMode={def?.type === 'numeric' ? "decimal" : "text"}
                                        placeholder={def?.type === 'numeric' ? "0.0" : "Enter Result"}
                                        className={`text-sm border px-3 py-2 w-full sm:w-32 focus:ring-2 focus:ring-offset-1 outline-none transition-all font-medium
                                            ${def?.unit ? 'rounded-l-md border-r-0' : 'rounded-md'} 
                                            ${test.isAbnormal 
                                                ? 'border-red-300 text-red-700 focus:ring-red-200 bg-white' 
                                                : hasValue 
                                                    ? 'border-emerald-300 text-emerald-700 focus:ring-emerald-200 bg-emerald-50' 
                                                    : 'border-slate-300 text-slate-900 focus:ring-blue-200'
                                            }
                                            ${test.isExempt ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
                                        `}
                                        value={test.value || ''}
                                        onChange={(e) => handleValueChange(test.id, e.target.value)}
                                        disabled={test.isExempt || false}
                                    />
                                    
                                    {/* Unit Addon */}
                                    {def?.unit && (
                                        <div className={`flex items-center justify-center px-3 py-2 border border-l-0 rounded-r-md text-xs font-medium select-none whitespace-nowrap min-w-[3rem]
                                            ${test.isAbnormal 
                                                ? 'bg-red-50 border-red-300 text-red-600' 
                                                : hasValue 
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                                                    : 'bg-slate-50 border-slate-300 text-slate-500'
                                            }
                                            ${test.isExempt ? 'bg-slate-100' : ''}
                                        `}>
                                            {def.unit}
                                            {/* Icon inside addon if exists */}
                                            {hasValue && !test.isExempt && (
                                                <span className="ml-2">
                                                    {test.isAbnormal ? (
                                                        <AlertCircle className="w-3 h-3" />
                                                    ) : (
                                                        <CheckCircle className="w-3 h-3" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Icon inside input if NO unit */}
                                    {!def?.unit && hasValue && !test.isExempt && (
                                        <div className="absolute right-3 top-2.5 pointer-events-none">
                                            {test.isAbnormal ? (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-1">
                                    <button 
                                        onClick={() => toggleAbnormal(test.id)} 
                                        title={test.isAbnormal ? "Mark Normal" : "Mark Abnormal (Override)"}
                                        className={`p-2 rounded-md transition-colors ${test.isAbnormal ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-slate-300 hover:bg-red-50 hover:text-red-500'}`}
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => toggleExempt(test.id)} 
                                        title={test.isExempt ? "Remove Exemption" : "Mark Exempt"} 
                                        className={`p-2 rounded-md transition-colors ${test.isExempt ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:bg-blue-50 hover:text-blue-500'}`}
                                    >
                                        <MinusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
                )}
            </div>
        )})}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-500 font-medium">
              {tests.filter(t => (t.value && t.value.length > 0) || t.isExempt).length} of {tests.length} tests recorded
          </div>
          <div className="flex space-x-3 ml-auto">
             <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
             />
             <Button variant="outline" icon={<Upload className="w-4 h-4"/>} onClick={handleUploadClick}>
                Upload Report
             </Button>
             <Button onClick={onComplete} disabled={data.progress < 100}>
                Complete Phase 1
             </Button>
          </div>
      </div>
    </div>
  );
};
