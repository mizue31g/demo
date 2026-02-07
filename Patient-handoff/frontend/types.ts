// FIX: Removed a circular self-import statement from this file.
// The file was attempting to import types from itself, causing declaration conflicts.

export interface Patient {
  id: number;
  name: string;
  mrn: string;
  dob: string;
  location: string;
  status: 'Observation' | 'Inpatient' | 'Pending Discharge' | 'Discharged';
  age: number;
  gender: 'M' | 'F';
  encounterId: string;
  admittedAt: string;
}

export interface HandoffDocument {
  id: number;
  documentType: string;
  visitId: string;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  format?: HandoffFormat;
  content?: string;
  audioSummaryBase64?: string;
  slides?: Slide[];
}

export enum RecordType {
  ProgressNote = 'Progress Note',
  NurseNote = 'Nurse Note',
  LabResult = 'Lab Result',
  Medication = 'Medication',
}

export interface PatientRecord {
  id: number;
  citationId: number;
  type: RecordType;
  timestamp: string;
  content: string;
}

export enum DocumentType {
    DischargeSummaryDiagnosesPlan = 'Discharge Summary: Diagnoses and Plan',
    NurseHandoff = 'Nurse Patient Handoff',
    MDHandoff = 'MD Patient Handoff',
}

export type HandoffFormat = 'ipass' | 'sbar';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Slide {
  title: string;
  points: string[];
}