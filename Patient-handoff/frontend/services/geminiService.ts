import { Patient, PatientRecord, DocumentType, HandoffDocument, HandoffFormat, Slide } from '../types';
import { MOCK_PATIENTS, MOCK_DOCUMENTS, MOCK_RECORDS } from '../constants';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api';

async function postApi(path: string, payload: any): Promise<any> {
    const response = await fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    return response.json();
}

// Make a mutable copy for in-session changes
let documentsData: { [key: number]: HandoffDocument[] } = JSON.parse(JSON.stringify(MOCK_DOCUMENTS));
let nextDocId = 100; // Start new doc IDs from 100 to avoid collision

const simulateDelay = <T>(data: T, delay = 1500): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Return a deep copy to prevent components from mutating the "database"
            resolve(JSON.parse(JSON.stringify(data))); 
        }, delay);
    });
};

export const getPatients = (): Promise<Patient[]> => {
    return simulateDelay(MOCK_PATIENTS, 0);
};

export const getPatientDocuments = (patientId: number): Promise<HandoffDocument[]> => {
    const docs = documentsData[patientId] || [];
    return simulateDelay(docs, 0);
};

export const getPatientRecords = (patientId: number): Promise<PatientRecord[]> => {
    const records = MOCK_RECORDS[patientId] || [];
    return simulateDelay(records, 0);
};

export const getDocument = async (documentId: number): Promise<HandoffDocument> => {
    for (const patientId in documentsData) {
        const doc = documentsData[patientId].find(d => d.id === documentId);
        if (doc) {
            // If the document content is missing, generate it dynamically.
            if (!doc.content) {
                const patient = MOCK_PATIENTS.find(p => p.id === parseInt(patientId));
                const records = MOCK_RECORDS[parseInt(patientId)];
                if(patient && records) {
                    // Defaulting to IPASS for loading existing docs, as format wasn't stored
                    const handoffFormat = doc.format || 'ipass';
                    if (!doc.format) {
                        doc.format = 'ipass';
                    }
                    const recordsContext = records.map(r => `[${r.citationId}] ${r.type} (${r.timestamp}): ${r.content}`).join('\n');

                    const prompt = `
                        You are an AI assistant for healthcare professionals. Your task is to generate a patient handoff or discharge summary document.
                        **Patient Information:**
                        - Name: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}, Status: ${patient.status}
                        **Available Patient Records:**
                        ---
                        ${recordsContext}
                        ---
                        **Instructions:**
                        1. Generate a "${doc.documentType}" document.
                        2. The document format MUST be "${handoffFormat.toUpperCase()}".
                        3. Use the provided patient records to create a concise and accurate summary.
                        4. When you use information from a specific record, you MUST include its citation number in brackets, like [1], [5], etc.
                        5. ONLY use citation numbers that are present in the "Available Patient Records" section. Do not invent citation numbers.
                        6. Respond ONLY with the generated Markdown content for the document. Do not include any other text or explanations.
                    `;
                    try {
                        const response = await postApi('/generate_text', { prompt: prompt });
                        doc.content = response.generated_text.trim();
                    } catch(e: any) {
                        console.error("Error generating content for document:", e);
                        doc.content = `Error: Could not generate summary for ${doc.documentType}. Details: ${e.message}`;
                    }
                } else {
                    doc.content = `This is the full text for ${doc.documentType} for patient ID ${patientId}. It includes details about the patient's visit, treatment, and response. The document was originally created on ${doc.createdAt} by ${doc.createdBy}.`;
                }
            }
            return doc;
        }
    }
    throw new Error("Document not found");
};

export const generateDocument = async (patientId: number, documentType: DocumentType, handoffFormat: HandoffFormat): Promise<HandoffDocument> => {
    const patient = MOCK_PATIENTS.find(p => p.id === patientId);
    const records = MOCK_RECORDS[patientId] || [];

    if (!patient) {
        throw new Error("Patient not found");
    }
    
    const recordsContext = records.map(r => `[${r.citationId}] ${r.type} (${r.timestamp}): ${r.content}`).join('\n');

    let prompt = '';

    if (documentType === DocumentType.DischargeSummaryDiagnosesPlan) {
        prompt = `
            You are an AI assistant for healthcare professionals. Your task is to generate a "Discharge Summary: Diagnoses and Plan" document.
            The document should be structured like the example below, including sections for HOSPITAL COURSE, CONDITION AT DISCHARGE, DISCHARGE MEDICATIONS, and DISCHARGE INSTRUCTIONS. Make sure the main sections are in bold.

            When generating the "HOSPITAL COURSE" section, you MUST follow these specific instructions:
            OVERALL: You are a helpful tool for generating the Hospital Course section of the Discharge Summary Note. The Hospital Course section should concisely summarize the patient's significant medical events and treatments during their hospital stay for a given encounter.
            STEPS:
            1. Review the patient's medical record provided.
            2. Describe the primary reason for admission to include the patient's age and gender.
            3. Include historical information (with dates if found in the record) that are related to the primary reason for admission.
            4. List the primary diagnoses that were related to the reason for admission.
            5. List diagnoses and conditions that were identified during the encounter that required treatment.
            6. Summarize the treatment and the patient's response for each diagnosis treated.
            7. Describe proposed interventions (such as a diagnostic study or consult or procedure) that were not carried out and why not.
            8. If any complications occurred, describe them, the treatments, and patient response to those treatments.

            **Patient Information:**
            - Name: ${patient.name}
            - Age: ${patient.age}
            - Gender: ${patient.gender}
            - MRN: ${patient.mrn}
            - Admitted At: ${patient.admittedAt}
            - Status: ${patient.status}

            **Available Patient Records:**
            ---
            ${recordsContext}
            ---

            **Example Discharge Summary Structure (use this as a template):**
            ---
            Discharge Summary
            **Admission Date:** ${patient.admittedAt.split(' ')[0]} **Discharge Date:** ${new Date().toISOString().split('T')[0]} **Primary Diagnosis:** [Determine from records]

            **HOSPITAL COURSE:**
            [Generate this section based on the detailed instructions and patient records. When you use information from a specific record, you MUST include its citation number in brackets, like [1], [5], etc.]

            **CONDITION AT DISCHARGE:**
            Stable.

            **DISCHARGE MEDICATIONS:**
            [List relevant medications from records.]

            **DISCHARGE INSTRUCTIONS:**
            [Provide generic but appropriate instructions for Activity, Incision Care (if applicable), Diet, Follow-up, and Urgent Concerns.]
            ---

            **Your Task:**
            Generate the complete discharge summary based on all the information and instructions provided. Respond ONLY with the generated Markdown content for the document. Do not include any other text, greetings, or explanations.
        `;
    } else {
        prompt = `
            You are an AI assistant for healthcare professionals. Your task is to generate a patient handoff or discharge summary document.

            **Patient Information:**
            - Name: ${patient.name}
            - Age: ${patient.age}
            - Gender: ${patient.gender}
            - MRN: ${patient.mrn}
            - Admitted At: ${patient.admittedAt}
            - Status: ${patient.status}

            **Available Patient Records:**
            ---
            ${recordsContext}
            ---

            **Instructions:**
            1. Generate a "${documentType}" document.
            2. The document format MUST be "${handoffFormat.toUpperCase()}".
            3. Use the provided patient records to create a concise and accurate summary.
            4. When you use information from a specific record, you MUST include its citation number in brackets, like [1], [5], etc.
            5. ONLY use citation numbers that are present in the "Available Patient Records" section. Do not invent citation numbers.
            6. Ensure the generated content is clinically appropriate and follows the structure of the requested format (IPASS or SBAR).
            7. Respond ONLY with the generated Markdown content for the document. Do not include any other text, greetings, or explanations.
        `;
    }
    
    let summaryContent = '';
    try {
        const response = await postApi('/generate_text', { prompt: prompt });
        summaryContent = response.generated_text.trim();
    } catch(e: any) {
        console.error("Error generating new document:", e);
        throw new Error(`Failed to generate the document content from the AI service. Details: ${e.message}`);
    }

    const newDoc: HandoffDocument = {
        id: nextDocId++,
        documentType: documentType,
        visitId: `V${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toLocaleDateString(),
        modifiedAt: new Date().toLocaleDateString(),
        createdBy: '佐藤医師',
        content: summaryContent,
        format: documentType === DocumentType.DischargeSummaryDiagnosesPlan ? undefined : handoffFormat,
    };

    if (!documentsData[patientId]) {
        documentsData[patientId] = [];
    }
    documentsData[patientId].push(newDoc);
    return newDoc;
};

export const saveDocument = (documentId: number, updatedText: string, documentType: DocumentType, audioBase64: string | null, slides: Slide[] | null): Promise<HandoffDocument> => {
    for (const patientId in documentsData) {
        const docIndex = documentsData[patientId].findIndex(d => d.id === documentId);
        if (docIndex > -1) {
            // Create a new object to ensure immutability and prevent subtle bugs.
            const updatedDoc: HandoffDocument = {
                ...documentsData[patientId][docIndex],
                content: updatedText,
                documentType: documentType,
                modifiedAt: new Date().toLocaleDateString(),
                audioSummaryBase64: audioBase64 || undefined,
                slides: slides || undefined,
            };

            // Replace the old document in the array with the updated one.
            documentsData[patientId][docIndex] = updatedDoc;
            
            // No more artificial delay, but still simulate async operation and return a deep copy
            return simulateDelay(updatedDoc, 0);
        }
    }
    return Promise.reject(new Error("Document not found to save"));
};

export interface ChatResponse {
    chatResponse: string;
    updatedDocument: string | null;
}

export const chatWithDocument = async (
    documentContent: string, 
    userPrompt: string, 
    records: PatientRecord[]
): Promise<ChatResponse> => {
    try {
        const response = await postApi('/chat_with_document', {
            documentContent,
            userPrompt,
            records,
        });
        return {
            chatResponse: response.chatResponse || "I'm sorry, I couldn't generate a valid response.",
            updatedDocument: response.updatedDocument || null
        };
    } catch (error: any) {
        console.error("Error in chatWithDocument API call:", error);
        throw new Error(`I'm sorry, I encountered an error communicating with the AI. Please try again. Details: ${error.message}`);
    }
};

export const modifySelectedText = async (
    selectedMarkdown: string,
    instruction: string
): Promise<string> => {
    try {
        const response = await postApi('/modify_text', {
            selectedMarkdown,
            instruction,
        });
        return response.modified_text.trim();
    } catch (error: any) {
        console.error("Error modifying selected text:", error);
        throw new Error(`The AI failed to modify the text. This could be due to a network issue or a content safety filter. Details: ${error.message}`);
    }
};


/**
 * Generates audio from text content using the Gemini API.
 * @param documentContent The text to convert to speech.
 * @returns A promise that resolves with a base64 encoded audio string.
 */
export const generateAudioSummary = async (documentContent: string): Promise<string> => {
    console.log("Generating audio for:", documentContent.substring(0, 100) + "...");
    
    if (!documentContent) {
        throw new Error("Cannot generate audio from empty content.");
    }

    try {
        const response = await postApi('/generate_audio', { text: documentContent });
        const base64Audio = response.audio_content;
        if (!base64Audio) {
            throw new Error("No audio data received from the API.");
        }
        return base64Audio;
    } catch (error: any) {
        console.error("Error generating audio summary:", error);
        throw new Error(`Failed to generate audio summary. The service may be busy or the content may be blocked. Details: ${error.message}`);
    }
};

/**
 * Generates a slide deck from document content using the Gemini API.
 * @param documentContent The text to convert into slides.
 * @returns A promise that resolves with an array of Slide objects.
 */
export const generateSlideDeck = async (documentContent: string): Promise<Slide[]> => {
    if (!documentContent) {
        throw new Error("Cannot generate slides from empty content.");
    }

    try {
        const slideData = await postApi('/generate_slides', { documentContent });
        
        // Basic validation
        if (Array.isArray(slideData) && slideData.every(s => 'title' in s && Array.isArray(s.points))) {
            return slideData;
        } else {
            throw new Error("API returned data in an unexpected format.");
        }

    } catch (error: any) {
        console.error("Error generating slide deck:", error);
        throw new Error(`Failed to generate slide deck. The AI service might be unavailable or returned an invalid format. Details: ${error.message}`);
    }
};