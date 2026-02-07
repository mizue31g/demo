import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { Patient, HandoffDocument } from '../types';

interface AppContextType {
  view: 'dashboard' | 'editor';
  activePatient: Patient | null;
  activeDocument: HandoffDocument | null;
  showDashboard: () => void;
  createNewDocument: (patient: Patient) => void;
  editDocument: (patient: Patient, document: HandoffDocument) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [activeDocument, setActiveDocument] = useState<HandoffDocument | null>(null);

  const showDashboard = useCallback(() => {
    setView('dashboard');
    setActivePatient(null);
    setActiveDocument(null);
  }, []);

  const createNewDocument = useCallback((patient: Patient) => {
    setActivePatient(patient);
    setActiveDocument(null);
    setView('editor');
  }, []);

  const editDocument = useCallback((patient: Patient, document: HandoffDocument) => {
    setActivePatient(patient);
    setActiveDocument(document);
    setView('editor');
  }, []);

  const value = {
    view,
    activePatient,
    activeDocument,
    showDashboard,
    createNewDocument,
    editDocument,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// --- Toast Notification Context ---

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = toastId++;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};