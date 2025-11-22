import { GoogleGenAI, Type } from "@google/genai";
import { Patient, Workflow, HlaData } from "../types";

const getAi = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateRiskAssessment = async (patient: Patient): Promise<string> => {
  const ai = getAi();
  const prompt = `
    Analyze the following kidney transplant patient profile and provide a brief, qualitative risk assessment (Low, Moderate, High) with 3-4 bullet points explaining the reasoning.
    Focus on BMI, age, and medical history.
    
    Patient: ${patient.name} (${patient.type})
    Age: ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
    BMI: ${patient.bmi.toFixed(1)}
    History: ${patient.medicalHistory.join(', ')}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "Could not generate assessment.";
};

export const generateEvaluationSummary = async (patient: Patient, workflow: Workflow): Promise<string> => {
  const ai = getAi();
  // Extract key info from workflow phases (simplified for prompt)
  const phaseSummary = Object.values(workflow.phases)
    .map(p => `Phase ${p.id} (${p.name}): ${p.status} - ${p.progress}%`)
    .join('\n');

  const prompt = `
    Generate a professional clinical summary for a kidney transplant evaluation.
    Patient: ${patient.name} (${patient.type})
    Current Status:
    ${phaseSummary}

    Highlight any completed phases and suggest next steps. Keep it under 150 words.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "Could not generate summary.";
};

export const generatePairSummary = async (
  donor: Patient,
  recipient: Patient,
  donorWorkflow: Workflow,
  recipientWorkflow: Workflow
): Promise<string> => {
  const ai = getAi();
  const prompt = `
    Create a structured clinical summary for a Donor-Recipient pair for a multidisciplinary team meeting.
    
    Donor: ${donor.name} (Age: ${new Date().getFullYear() - new Date(donor.dateOfBirth).getFullYear()}, BMI: ${donor.bmi.toFixed(1)})
    Recipient: ${recipient.name} (Age: ${new Date().getFullYear() - new Date(recipient.dateOfBirth).getFullYear()})
    
    Donor Progress: Phase 1 ${donorWorkflow.phases[1].status}, Phase 2 ${donorWorkflow.phases[2].status}
    Recipient Progress: Phase 1 ${recipientWorkflow.phases[1].status}, Phase 2 ${recipientWorkflow.phases[2].status}
    Pair Phase 5 (HLA): ${donorWorkflow.phases[5].status}

    Format with Markdown headers: ## Overall Status, ## Key Concerns, ## Next Steps.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "Could not generate pair summary.";
};

export const extractHlaDataFromReports = async (base64File: string, mimeType: string): Promise<Partial<HlaData>> => {
  const ai = getAi();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64File,
            mimeType: mimeType,
          }
        },
        {
          text: "Extract HLA typing information from this report. Return JSON only."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          a1: { type: Type.STRING },
          a2: { type: Type.STRING },
          b1: { type: Type.STRING },
          b2: { type: Type.STRING },
          dr1: { type: Type.STRING },
          dr2: { type: Type.STRING },
          dsaDetected: { type: Type.BOOLEAN },
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse HLA JSON", e);
    return {};
  }
};
