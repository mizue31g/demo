import { useState, useEffect } from 'react';
import { getPatients, getPatientDocuments, getPatientRecords, getDocument } from '../services/geminiService';
import { Patient, HandoffDocument, PatientRecord } from '../types';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export const usePatients = () => {
  const [state, setState] = useState<ApiState<Patient[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    setState({ data: null, isLoading: true, error: null });
    getPatients()
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error }));
  }, []);

  return state;
};

export const usePatientDocuments = (patientId: number | null) => {
  const [state, setState] = useState<ApiState<HandoffDocument[]>>({
    data: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (patientId === null) {
      setState({ data: [], isLoading: false, error: null });
      return;
    }
    setState({ data: null, isLoading: true, error: null });
    getPatientDocuments(patientId)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(error => setState({ data: null, isLoading: false, error }));
  }, [patientId]);

  return state;
};


export const usePatientRecords = (patientId: number | null) => {
    const [state, setState] = useState<ApiState<PatientRecord[]>>({
      data: [],
      isLoading: false,
      error: null,
    });
  
    useEffect(() => {
      if (patientId === null) {
        setState({ data: [], isLoading: false, error: null });
        return;
      }
      setState({ data: [], isLoading: true, error: null });
      getPatientRecords(patientId)
        .then(data => setState({ data, isLoading: false, error: null }))
        .catch(error => setState({ data: null, isLoading: false, error }));
    }, [patientId]);
  
    return state;
};

export const useDocument = (documentId: number | null) => {
    const [state, setState] = useState<ApiState<HandoffDocument>>({
      data: null,
      isLoading: false,
      error: null,
    });
  
    useEffect(() => {
      if (documentId === null) {
        setState({ data: null, isLoading: false, error: null });
        return;
      }
      setState({ data: null, isLoading: true, error: null });
      getDocument(documentId)
        .then(data => setState({ data, isLoading: false, error: null }))
        .catch(error => setState({ data: null, isLoading: false, error }));
    }, [documentId]);
  
    return state;
};
