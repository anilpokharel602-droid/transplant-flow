import React, { useState } from 'react';
import { Patient, HlaData } from '../../types';
import { Button } from '../ui/Button';
import { extractHlaDataFromReports } from '../../services/geminiService';
import { Upload, FileText, Zap } from 'lucide-react';

interface Phase5Props {
  patient: Patient;
  data: any;
  onUpdate: (updates: any) => void;
}

export const Phase5: React.FC<Phase5Props> = ({ patient, data, onUpdate }) => {
  const [hla, setHla] = useState<Partial<HlaData>>(data.hla || {});
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        try {
            const extractedData = await extractHlaDataFromReports(base64Content, file.type);
            const newData = { ...hla, ...extractedData };
            setHla(newData);
            onUpdate({ hla: newData, progress: 50 }); // Partial progress
        } catch (error) {
            alert("AI Extraction Failed. Please try manual entry.");
        } finally {
            setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (key: keyof HlaData, value: any) => {
    const newData = { ...hla, [key]: value };
    setHla(newData);
    onUpdate({ hla: newData, progress: calculateProgress(newData) });
  };

  const calculateProgress = (d: Partial<HlaData>) => {
      let filled = 0;
      const fields = ['a1', 'a2', 'b1', 'b2', 'dr1', 'dr2'];
      fields.forEach(f => { if (d[f as keyof HlaData]) filled++; });
      return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-center justify-between">
        <div>
            <h4 className="text-sm font-semibold text-indigo-900 flex items-center">
                <Zap className="w-4 h-4 mr-2" /> AI Auto-Fill
            </h4>
            <p className="text-xs text-indigo-700">Upload HLA/CDC report to autofill fields.</p>
        </div>
        <div className="relative">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*,application/pdf" />
            <Button variant="secondary" size="sm" isLoading={isUploading} icon={<Upload className="w-4 h-4"/>}>
                Upload Report
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
         {/* HLA A */}
         <div className="border p-4 rounded bg-white">
            <h5 className="text-sm font-bold mb-2 text-slate-500">Locus A</h5>
            <div className="grid grid-cols-2 gap-2">
                <input placeholder="A1" className="border p-2 rounded" value={hla.a1 || ''} onChange={e => handleChange('a1', e.target.value)} />
                <input placeholder="A2" className="border p-2 rounded" value={hla.a2 || ''} onChange={e => handleChange('a2', e.target.value)} />
            </div>
         </div>
         {/* HLA B */}
         <div className="border p-4 rounded bg-white">
            <h5 className="text-sm font-bold mb-2 text-slate-500">Locus B</h5>
            <div className="grid grid-cols-2 gap-2">
                <input placeholder="B1" className="border p-2 rounded" value={hla.b1 || ''} onChange={e => handleChange('b1', e.target.value)} />
                <input placeholder="B2" className="border p-2 rounded" value={hla.b2 || ''} onChange={e => handleChange('b2', e.target.value)} />
            </div>
         </div>
         {/* HLA DR */}
         <div className="border p-4 rounded bg-white">
            <h5 className="text-sm font-bold mb-2 text-slate-500">Locus DR</h5>
            <div className="grid grid-cols-2 gap-2">
                <input placeholder="DR1" className="border p-2 rounded" value={hla.dr1 || ''} onChange={e => handleChange('dr1', e.target.value)} />
                <input placeholder="DR2" className="border p-2 rounded" value={hla.dr2 || ''} onChange={e => handleChange('dr2', e.target.value)} />
            </div>
         </div>
         
         {/* Crossmatch */}
         <div className="border p-4 rounded bg-white">
            <h5 className="text-sm font-bold mb-2 text-slate-500">Crossmatch</h5>
            <div className="space-y-2">
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={hla.crossmatchPositive || false} onChange={e => handleChange('crossmatchPositive', e.target.checked)} />
                    <span className="text-sm">Positive Crossmatch</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={hla.dsaDetected || false} onChange={e => handleChange('dsaDetected', e.target.checked)} />
                    <span className="text-sm">DSA Detected</span>
                </label>
            </div>
         </div>
      </div>
    </div>
  );
};
