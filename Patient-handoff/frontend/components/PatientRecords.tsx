import React, { useState, useMemo } from 'react';
import { PatientRecord, RecordType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, NotesIcon, LabIcon, MedicationIcon, SearchIcon, ListIcon } from './icons';

interface PatientRecordsProps {
    records: PatientRecord[];
    isCollapsed: boolean;
    onToggle: () => void;
}

const recordTypeToIcon: Record<RecordType, React.ReactElement<{ className?: string }>> = {
    [RecordType.ProgressNote]: <NotesIcon />,
    [RecordType.NurseNote]: <NotesIcon />,
    [RecordType.LabResult]: <LabIcon />,
    [RecordType.Medication]: <MedicationIcon />,
};

const MedicationItem: React.FC<{ details: { [key: string]: string } }> = ({ details }) => {
    const { Medication, Status, ...otherDetails } = details;
  
    if (!Medication) return null;

    return (
      <div className="text-sm mt-2 border border-outline-variant/30 rounded-lg p-3 space-y-2 bg-surface-container-lowest">
        <div>
            <p className="font-semibold text-base text-primary">{Medication}</p>
            {Status && <p className="text-xs font-medium text-on-surface-variant">{Status}</p>}
        </div>
        <dl className="space-y-1.5 border-t border-outline-variant/30 pt-2">
          {Object.entries(otherDetails).map(([key, value]) => {
            if (key === '__id') return null;
            return (
                <div key={key}>
                    <dt className="font-medium text-on-surface-variant text-xs uppercase tracking-wider">{key}</dt>
                    <dd className="text-on-surface text-sm">{value}</dd>
                </div>
            );
          })}
        </dl>
      </div>
    );
};

const MedicationRecord: React.FC<{ content: string }> = ({ content }) => {
    const medications = useMemo(() => {
        return content.split('---').map((medBlock, index) => {
            const data: { [key: string]: string } = { __id: `med-${index}` };
            medBlock.trim().split('\n').forEach(line => {
                const firstColonIndex = line.indexOf(':');
                if (firstColonIndex !== -1) {
                    const key = line.substring(0, firstColonIndex).trim();
                    const value = line.substring(firstColonIndex + 1).trim();
                    if (key && value) {
                        data[key] = value;
                    }
                }
            });
            return data;
        });
    }, [content]);

    return (
        <div className="space-y-2">
            {medications.map((med) => (
                <MedicationItem key={med.__id} details={med} />
            ))}
        </div>
    );
};

const LabFlag: React.FC<{ flag: string }> = ({ flag }) => {
    const isAbnormal = ['H', 'L', 'Positive'].includes(flag);
    const isNegative = flag === 'Negative';
    
    const flagStyle = isAbnormal
        ? 'bg-error-container text-on-error-container'
        : isNegative 
            ? 'bg-primary-container text-on-primary-container' 
            : 'bg-surface-container-high text-on-surface-variant';

    return <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${flagStyle}`}>{flag}</span>
};

const LabRecord: React.FC<{ content: string }> = ({ content }) => {
    const labPanels = useMemo(() => {
        const panels: { title: string; results: { name: string | null; value: string; ref: string | null; flag: string | null }[]; impression: string }[] = [];
        let currentPanel: { title: string; results: any[]; impression: string } | null = null;

        content.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                if (currentPanel) panels.push(currentPanel);
                currentPanel = { title: trimmedLine.replace(/\*\*/g, ''), results: [], impression: '' };
            } else if (trimmedLine.startsWith('- ') && currentPanel) {
                const lineContent = trimmedLine.substring(2);
                if (lineContent.startsWith('**Impression:**')) {
                    currentPanel.impression = lineContent.replace('**Impression:**', '').trim();
                } else {
                    const resultMatch = lineContent.match(/\*\*(.*?):\*\* (.*)/);
                    if (resultMatch) {
                        const name = resultMatch[1];
                        let valuePart = resultMatch[2].trim();
                        let flag = null;
                        let ref = null;
                        
                        const flagRegex = /\s\((H|L|Negative|Positive)\)$/;
                        const flagMatch = valuePart.match(flagRegex);
                        if (flagMatch) {
                            flag = flagMatch[1];
                            valuePart = valuePart.replace(flagRegex, '').trim();
                        }
                        
                        const refRegex = /\s\(Ref: (.*?)\)$/;
                        const refMatch = valuePart.match(refRegex);
                        if (refMatch) {
                            ref = refMatch[1];
                            valuePart = valuePart.replace(refRegex, '').trim();
                        }
                        
                        currentPanel.results.push({ name, value: valuePart, ref, flag });
                    }
                }
            }
        });

        if (currentPanel) panels.push(currentPanel);
        return panels;
    }, [content]);

    return (
        <div className="space-y-2 mt-2">
            {labPanels.map((panel, index) => (
                <div key={`${panel.title}-${index}`} className="border border-outline-variant/30 rounded-lg p-3 space-y-2 bg-surface-container-lowest">
                    <p className="font-semibold text-base text-primary">{panel.title}</p>
                    
                    {panel.results.length > 0 && (
                        <dl className="space-y-2 border-t border-outline-variant/30 pt-2">
                            {panel.results.map((res, resIndex) => (
                                <div key={`${res.name}-${resIndex}`}>
                                    <dt className="font-medium text-on-surface-variant text-xs uppercase tracking-wider flex justify-between items-center">
                                        <span>{res.name}</span>
                                        {res.flag && <LabFlag flag={res.flag} />}
                                    </dt>
                                    <dd className="text-on-surface text-sm">{res.value}</dd>
                                    {res.ref && <dd className="text-xs text-on-surface-variant/70">Ref: {res.ref}</dd>}
                                </div>
                            ))}
                        </dl>
                    )}
                    
                    {panel.impression && (
                        <div className="border-t border-outline-variant/30 pt-2">
                            <p className="font-medium text-on-surface-variant text-xs uppercase tracking-wider">Impression</p>
                            <p className="text-on-surface text-sm">{panel.impression}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const NoteRecord: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div className="text-sm mt-2 border border-outline-variant/30 rounded-lg p-3 bg-surface-container-lowest">
            <p className="text-on-surface whitespace-pre-wrap">{content}</p>
        </div>
    );
};

const getRecordBgColor = (type: RecordType): string => {
    switch (type) {
        case RecordType.Medication:
            return 'bg-tertiary-container';
        case RecordType.LabResult:
            return 'bg-secondary-container';
        case RecordType.ProgressNote:
        case RecordType.NurseNote:
            return 'bg-warning-container';
        default:
            return 'bg-surface-container';
    }
};

const getRecordTextColor = (type: RecordType): string => {
    switch (type) {
        case RecordType.Medication:
            return 'text-on-tertiary-container';
        case RecordType.LabResult:
            return 'text-on-secondary-container';
        case RecordType.ProgressNote:
        case RecordType.NurseNote:
            return 'text-on-warning-container';
        default:
            return 'text-on-surface';
    }
};

const PatientRecords: React.FC<PatientRecordsProps> = ({ records, isCollapsed, onToggle }) => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRecords = useMemo(() => {
        let results = records;
        if (activeTab === 'Notes') {
            results = records.filter(r => r.type === RecordType.NurseNote || r.type === RecordType.ProgressNote);
        } else if (activeTab === 'Labs') {
            results = records.filter(r => r.type === RecordType.LabResult);
        } else if (activeTab === 'Meds') {
            results = records.filter(r => r.type === RecordType.Medication);
        }
        
        if (searchTerm.trim() !== '') {
            results = results.filter(r => r.content.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return results;
    }, [activeTab, records, searchTerm]);

    if (isCollapsed) {
        return (
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant h-full flex flex-col items-center justify-start py-4 gap-4">
                <button 
                    onClick={onToggle} 
                    className="p-1 rounded-full hover:bg-on-surface/10"
                    aria-label="Expand Patient Records panel"
                >
                    <ChevronRightIcon />
                </button>
                <NotesIcon className="h-6 w-6 text-on-surface-variant" />
            </div>
        );
    }
    
    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant h-full flex flex-col transition-all duration-300">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <NotesIcon className="h-5 w-5" />
                    Patient Records
                </h3>
                 <button 
                    onClick={onToggle} 
                    className="p-1 rounded-full hover:bg-on-surface/10"
                    aria-label="Collapse Patient Records panel"
                >
                    <ChevronLeftIcon />
                </button>
            </div>
            <div className="p-4 border-b border-outline-variant space-y-3">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-surface-container-highest border border-outline rounded-full w-full focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-on-surface-variant h-4 w-4" />
                    </div>
                </div>
                <div className="flex items-center space-x-2 p-1 overflow-x-auto hide-scrollbar">
                    <button onClick={() => setActiveTab('All')} className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors ${activeTab === 'All' ? 'bg-secondary-container text-on-secondary-container' : 'hover:bg-on-surface/5'}`}>
                        <ListIcon className="h-4 w-4" />
                        <span>All</span>
                    </button>
                    <button onClick={() => setActiveTab('Notes')} className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors ${activeTab === 'Notes' ? 'bg-warning-container text-on-warning-container' : 'hover:bg-on-surface/5'}`}>
                        <NotesIcon className="h-4 w-4" />
                        <span>Notes</span>
                    </button>
                    <button onClick={() => setActiveTab('Labs')} className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors ${activeTab === 'Labs' ? 'bg-secondary-container text-on-secondary-container' : 'hover:bg-on-surface/5'}`}>
                        <LabIcon className="h-4 w-4" />
                        <span>Labs</span>
                    </button>
                    <button onClick={() => setActiveTab('Meds')} className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors ${activeTab === 'Meds' ? 'bg-tertiary-container text-on-tertiary-container' : 'hover:bg-on-surface/5'}`}>
                        <MedicationIcon className="h-4 w-4" />
                        <span>Meds</span>
                    </button>
                </div>
            </div>
            <div className="overflow-y-auto flex-grow p-4 space-y-3">
                {records.length === 0 ? <div className="p-4 text-center text-slate-500">Loading records...</div> : filteredRecords.map((record) => {
                    const textColor = getRecordTextColor(record.type);
                    const icon = React.cloneElement(recordTypeToIcon[record.type], {
                        className: `h-4 w-4 ${textColor} opacity-80`
                    });

                    return (
                        <div 
                            key={record.id} 
                            className={`p-3 rounded-xl border ${getRecordBgColor(record.type)} border-black/10`}
                            id={`citation-${record.citationId}`}
                        >
                            <div className={`text-xs ${textColor} font-medium`}>
                                <div className="flex items-center gap-1.5">
                                    {icon}
                                    <span className="font-bold">[{record.citationId}] {record.type}</span>
                                </div>
                                <p className={`text-xs text-right ${textColor} opacity-80 mt-1`}>{record.timestamp}</p>
                            </div>
                            {record.type === RecordType.Medication && <MedicationRecord content={record.content} />}
                            {record.type === RecordType.LabResult && <LabRecord content={record.content} />}
                            {(record.type === RecordType.ProgressNote || record.type === RecordType.NurseNote) && (
                                <NoteRecord content={record.content} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PatientRecords;