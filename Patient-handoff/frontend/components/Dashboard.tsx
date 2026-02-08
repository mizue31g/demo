import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Patient, HandoffDocument, DocumentType } from '../types';
import { DOCUMENT_TYPE_TRANSLATIONS } from '../constants';
import { usePatients, usePatientDocuments } from '../hooks/dataHooks';
import { useAppContext } from '../context/AppContext';
import { SearchIcon, AudioIcon, PresentationIcon } from './icons';

const PatientStatusBadge: React.FC<{ status: Patient['status'] }> = ({ status }) => {
    const statusStyles: { [key in Patient['status']]: string } = {
        'Inpatient': 'bg-tertiary-container text-on-tertiary-container',
        'Observation': 'bg-primary-container text-on-primary-container',
        'Pending Discharge': 'bg-warning-container text-on-warning-container',
        'Discharged': 'bg-surface-variant text-on-surface-variant',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

const Dashboard: React.FC = () => {
    const { createNewDocument, editDocument } = useAppContext();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: patients, isLoading: isLoadingPatients } = usePatients();
    const { data: documents, isLoading: isLoadingDocuments } = usePatientDocuments(selectedPatient?.id || null);
    
    const filteredPatients = useMemo(() => {
        if (!patients) return [];
        return [...patients].filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [patients, searchTerm]);

    // Effect to select the first patient when the list loads
    React.useEffect(() => {
        if (!selectedPatient && filteredPatients.length > 0) {
            setSelectedPatient(filteredPatients[0]);
        }
    }, [filteredPatients, selectedPatient]);

    return (
        <div className="h-full flex flex-col space-y-6">
            <h1 className="text-2xl font-normal text-on-surface shrink-0">患者ダッシュボード</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
                {/* Master Pane (Patient List) */}
                <div className="lg:col-span-1 bg-surface-container-low rounded-2xl border border-outline-variant flex flex-col">
                    <div className="p-4 border-b border-outline-variant shrink-0">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search Patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-surface-container-highest border border-outline rounded-full w-full focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="text-on-surface-variant" />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-y-auto">
                        {isLoadingPatients ? (
                            <div className="p-4 text-center text-on-surface-variant">Loading patients...</div>
                        ) : (
                            <ul>
                                {filteredPatients.map(patient => (
                                    <li key={patient.id}>
                                        <button 
                                            onClick={() => setSelectedPatient(patient)}
                                            className={`w-full text-left p-4 border-b border-outline-variant hover:bg-surface-container-high transition-colors ${selectedPatient?.id === patient.id ? 'bg-secondary-container' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <p className={`font-medium text-base ${selectedPatient?.id === patient.id ? 'text-on-secondary-container' : 'text-on-surface'}`}>{patient.name}</p>
                                                <PatientStatusBadge status={patient.status} />
                                            </div>
                                            <div className={`text-xs grid grid-cols-2 gap-x-4 gap-y-1 ${selectedPatient?.id === patient.id ? 'text-on-secondary-container/80' : 'text-on-surface-variant'}`}>
                                                <p><span className="font-medium">MRN:</span> {patient.mrn}</p>
                                                <p><span className="font-medium">DOB:</span> {patient.dob}</p>
                                                <p className="col-span-2"><span className="font-medium">Admitted:</span> {patient.admittedAt}</p>
                                                <p><span className="font-medium">Location:</span> {patient.location}</p>
                                                <p><span className="font-medium">Encounter:</span> {patient.encounterId}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Detail Pane (Document List) */}
                <div className="lg:col-span-2 bg-surface-container-low rounded-2xl border border-outline-variant flex flex-col">
                    <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-outline-variant shrink-0">
                        <div>
                            <h2 className="text-lg font-medium text-on-surface">Patient Documents</h2>
                            {selectedPatient ? <p className="text-sm text-on-surface-variant">{selectedPatient.name} (MRN: {selectedPatient.mrn})</p> : <p className="text-sm text-on-surface-variant">Select a patient to view documents.</p>}
                        </div>
                        <button 
                            onClick={() => selectedPatient && createNewDocument(selectedPatient)}
                            disabled={!selectedPatient}
                            className="mt-2 md:mt-0 px-6 py-2.5 bg-primary text-on-primary rounded-full hover:shadow-md disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:cursor-not-allowed transition-all font-medium text-sm shrink-0">
                            新規ドキュメント作成
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-on-surface-variant">
                            <thead className="text-xs text-on-surface-variant uppercase bg-surface-container sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Document Details</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Created At</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Modified At</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingDocuments ? (
                                    <tr><td colSpan={4} className="text-center p-4">Loading documents...</td></tr>
                                ) : (documents && documents.length > 0) ? (
                                    documents.map((doc) => (
                                        <tr key={doc.id} className="border-b border-surface-variant hover:bg-surface-container cursor-pointer" onClick={() => selectedPatient && editDocument(selectedPatient, doc)}>
                                            <th scope="row" className="px-6 py-4 font-medium text-on-surface whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{DOCUMENT_TYPE_TRANSLATIONS[doc.documentType as DocumentType] || doc.documentType}</span>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {doc.format && doc.documentType !== DocumentType.DischargeSummaryDiagnosesPlan && (
                                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-container-high text-on-surface-variant">
                                                                {doc.format.toUpperCase()}
                                                            </span>
                                                        )}
                                                        {doc.audioSummaryBase64 && (
                                                            <div title="Audio summary available">
                                                                <AudioIcon className="h-4 w-4 text-on-surface-variant" />
                                                            </div>
                                                        )}
                                                        {doc.slides && doc.slides.length > 0 && (
                                                            <div title="Presentation available">
                                                                <PresentationIcon className="h-4 w-4 text-on-surface-variant" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4">{doc.createdAt}</td>
                                            <td className="px-6 py-4">{doc.modifiedAt}</td>
                                            <td className="px-6 py-4">{doc.createdBy}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="text-center p-4">{selectedPatient ? 'No documents found for this patient.' : '...'}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;