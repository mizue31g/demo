import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Patient, PatientRecord, RecordType, DocumentType, HandoffDocument as HandoffDocumentType, HandoffFormat, Slide } from '../types';
import { generateDocument, saveDocument, generateAudioSummary, modifySelectedText, generateSlideDeck } from '../services/geminiService';
import { BackIcon, GeminiIcon, BoldIcon, ItalicIcon, AudioIcon, TrashIcon, ChevronDownIcon, CheckIcon, PrintIcon, PresentationIcon, WarningIcon } from './icons';
import ChatPanel from './ChatPanel';
import PatientRecords from './PatientRecords';
import FloatingToolbar from './FloatingToolbar';
import PresentationViewer from './PresentationViewer';
import { useAppContext, useToast } from '../context/AppContext';
import { usePatientRecords, useDocument } from '../hooks/dataHooks';

/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 The base64 encoded string.
 * @returns A Uint8Array of the decoded data.
 */
const decode = (base64: string): Uint8Array => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

/**
 * Creates a WAV file in memory from raw PCM data and returns a playable object URL.
 * @param pcmData The raw PCM audio data (24kHz, 16-bit, mono).
 * @returns A string containing the object URL for the WAV file.
 */
const createWavUrl = (pcmData: Uint8Array): string => {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');

    // fmt chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // Linear PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // Byte rate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // Block align
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data from the original buffer
    const pcmBytes = new Uint8Array(pcmData.buffer);
    for (let i = 0; i < dataSize; i++) {
        view.setUint8(44 + i, pcmBytes[i]);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
};

const preprocessTextForSpeech = (markdown: string): string => {
  let text = markdown;
  text = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/^\s*[\*\-]\s/gm, '').replace(/^\s*\d+\.\s/gm, '');
  text = text.replace(/\s*\[\d+\]\s*/g, ' ');
  text = text.replace(/^.*MRN:.*$/gm, '');
  text = text.replace(/\((\w),\s*(\d+)\)/g, (match, gender, age) => {
    const fullGender = gender.toUpperCase() === 'F' ? 'female' : 'male';
    return `is a ${age} year-old ${fullGender}`;
  });
  text = text.replace(/\b(Patient|Admission Date|Reason for Admission|Hospital Course|Discharge Diagnoses|Discharge Condition|Discharge Plan|Medications|Follow-up|Diet|Activity|Return Precautions):/gi, '');
  text = text.replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, year, month, day) => {
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  });
  text = text.replace(/y\/o/g, 'year old');
  text = text.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ');
  return text.trim();
};

const PatientInfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium uppercase text-on-surface-variant tracking-wider">{label}</p>
        <p className="text-sm text-on-surface font-medium">{value}</p>
    </div>
);

const PatientHeader: React.FC<{ patient: Patient; onBack: () => void; documentType: DocumentType | ''; isNew: boolean; isDirty: boolean; }> = ({ patient, onBack, documentType, isNew, isDirty }) => (
    <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-on-surface/10 transition-colors" aria-label="Back to dashboard">
                <BackIcon />
            </button>
            <div>
                <h1 className="text-2xl font-normal text-on-surface">
                    {documentType || (isNew ? 'New Handoff Document' : '')}
                    {isDirty && <span className="text-primary" title="Unsaved changes">*</span>}
                </h1>
            </div>
        </div>
        <div className="bg-surface-container rounded-2xl border border-outline-variant p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                    <p className="text-xs font-medium uppercase text-on-surface-variant tracking-wider">Patient</p>
                    <p className="text-xl font-medium text-primary">{patient.name}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3 flex-shrink-0">
                    <PatientInfoItem label="MRN" value={patient.mrn} />
                    <PatientInfoItem label="DOB" value={patient.dob} />
                    <PatientInfoItem label="Age & Gender" value={`${patient.age} / ${patient.gender}`} />
                    <PatientInfoItem label="Location" value={patient.location} />
                    <PatientInfoItem label="Encounter ID" value={patient.encounterId} />
                </div>
            </div>
        </div>
    </div>
);

const markdownToHtml = (markdown: string, patientRecords: PatientRecord[]): string => {
    if (!markdown) return '';

    const citationIdToTypeMap = new Map<string, RecordType>();
    patientRecords.forEach(record => {
        citationIdToTypeMap.set(record.citationId.toString(), record.type);
    });

    let processedMarkdown = markdown.replace(/\[([\d,\s]+)\]/g, (match, citationIdsString) => {
        const citationIds = citationIdsString.split(',').map((id: string) => id.trim()).filter(Boolean);
        return citationIds.map((citationId: string) => {
            const recordType = citationIdToTypeMap.get(citationId);
            let className = 'citation-chip';
            let title = '';

            if (recordType) {
                switch (recordType) {
                    case RecordType.Medication:
                        className += ' citation-meds';
                        break;
                    case RecordType.LabResult:
                        className += ' citation-labs';
                        break;
                    case RecordType.ProgressNote:
                    case RecordType.NurseNote:
                        className += ' citation-notes';
                        break;
                }
            } else {
                className += ' invalid';
                title = 'Citation source not found';
            }
            return `<span class="${className}" data-citation-id="${citationId}" title="${title}">[${citationId}]</span>`;
        }).join(' ');
    });
    
    const lines = processedMarkdown.split('\n');
    let htmlLines: string[] = [];
    let inUl = false;
    let inOl = false;

    for (const line of lines) {
        let processedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        const trimmedLine = processedLine.trim();
        
        const closeLists = () => {
            if (inUl) { htmlLines.push('</ul>'); inUl = false; }
            if (inOl) { htmlLines.push('</ol>'); inOl = false; }
        };

        if (trimmedLine.startsWith('#### ')) {
            closeLists();
            htmlLines.push(`<h4>${trimmedLine.substring(5)}</h4>`);
        } else if (trimmedLine.startsWith('### ')) {
            closeLists();
            htmlLines.push(`<h3>${trimmedLine.substring(4)}</h3>`);
        } else if (trimmedLine.startsWith('# ')) {
            closeLists();
            htmlLines.push(`<h1>${trimmedLine.substring(2)}</h1>`);
        } else if (trimmedLine.startsWith('* ')) {
            if (!inUl) { htmlLines.push('<ul>'); inUl = true; }
            if (inOl) { htmlLines.push('</ol>'); inOl = false; }
            htmlLines.push(`<li>${trimmedLine.substring(2)}</li>`);
        } else if (/^\d+\.\s/.test(trimmedLine)) {
            if (!inOl) { htmlLines.push('<ol>'); inOl = true; }
            if (inUl) { htmlLines.push('</ul>'); inUl = false; }
            htmlLines.push(`<li>${trimmedLine.replace(/^\d+\.\s/, '')}</li>`);
        } else {
            closeLists();
            if (processedLine) {
                htmlLines.push(`<p>${processedLine}</p>`);
            } else {
                htmlLines.push('<p><br></p>');
            }
        }
    }
    if (inUl) htmlLines.push('</ul>');
    if (inOl) htmlLines.push('</ol>');
    return htmlLines.join('');
};

const htmlToMarkdown = (html: string): string => {
    if (!html) return '';
    
    let md = html;

    // Handle block elements that need markdown prefixes.
    md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
    md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
    md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');

    // Convert paragraphs and divs to have double newlines.
    md = md.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '\n\n');
    md = md.replace(/<div[^>]*>/gi, '').replace(/<\/div>/gi, '\n\n');

    // Handle lists using placeholders to avoid nested replacements.
    md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '---LI---$1');
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '---UL---$1---ENDUL---');
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '---OL---$1---ENDOL---');

    md = md.replace(/---UL---([\s\S]*?)---ENDUL---/gi, (_match, content) => {
        return content.replace(/---LI---/g, '\n* ');
    });
    md = md.replace(/---OL---([\s\S]*?)---ENDOL---/gi, (_match, content) => {
        let i = 1;
        return content.replace(/---LI---/g, () => `\n${i++}. `);
    });
    
    // Line breaks
    md = md.replace(/<br\s*\/?>/gi, '\n');

    // Inline elements
    md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
    md = md.replace(/<span class="citation-chip[^"]*"[^>]*>\[(\d+)\]<\/span>/gi, '[$1]');
    
    // Strip any remaining HTML tags that we don't handle.
    md = md.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities and clean up whitespace.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = md;
    md = tempDiv.textContent || "";
    
    // Final newline cleanup to ensure proper spacing.
    md = md.replace(/(\n\s*){3,}/g, '\n\n').trim();
    
    return md;
};


type SaveState = 'idle' | 'saving' | 'saved';

interface SelectionInfo {
    range: Range;
    text: string;
    rect: DOMRect;
}

interface AudioData {
    base64: string;
    sourceContent: string;
}

interface SlideData {
    slides: Slide[];
    sourceContent: string;
    isNew?: boolean;
}

const HandoffDocument: React.FC<{ 
    patient: Patient;
    content: string; setContent: (content: string) => void;
    isGenerating: boolean;
    isLoadingDoc: boolean;
    isNewDocument: boolean;
    documentType: DocumentType | ''; setDocumentType: (type: DocumentType | '') => void;
    onGenerate: (format: HandoffFormat) => void;
    onSave: () => void; saveState: SaveState; canSave: boolean;
    onCitationClick: (citationId: string) => void;
    audioData: AudioData | null; setAudioData: (data: AudioData | null) => void;
    slideData: SlideData | null; setSlideData: (data: SlideData | null) => void;
    patientRecords: PatientRecord[];
}> = ({ 
    patient,
    content, setContent, isGenerating, isLoadingDoc, isNewDocument, 
    documentType, setDocumentType, onGenerate, onSave, saveState, canSave, onCitationClick,
    audioData, setAudioData, slideData, setSlideData, patientRecords
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const audioUrlRef = useRef<string | null>(null);
    const formatMenuRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isGeneratingSlides, setIsGeneratingSlides] = useState<boolean>(false);
    
    const [handoffFormat, setHandoffFormat] = useState<HandoffFormat>('ipass');
    const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
    const [selection, setSelection] = useState<SelectionInfo | null>(null);
    const [isModifyingText, setIsModifyingText] = useState(false);

    const isDisabled = isGenerating || isLoadingDoc || isModifyingText;
    
    const isAudioValid = useMemo(() => audioData?.sourceContent === content, [audioData, content]);
    const isSlideDeckValid = useMemo(() => slideData?.sourceContent === content, [slideData, content]);
    
    const isHandoffDocument = useMemo(() => {
        return documentType === DocumentType.MDHandoff || documentType === DocumentType.NurseHandoff;
    }, [documentType]);

    useEffect(() => { return () => { if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); }; }, []);
    useEffect(() => { const handleClickOutside = (e: MouseEvent) => { if (formatMenuRef.current && !formatMenuRef.current.contains(e.target as Node)) setIsFormatMenuOpen(false); }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
    
    useEffect(() => { 
        if (editorRef.current && htmlToMarkdown(editorRef.current.innerHTML) !== content) {
            editorRef.current.innerHTML = markdownToHtml(content, patientRecords);
        }
    }, [content, patientRecords]);

    const handleDismissAudio = useCallback(() => { if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; setAudioUrl(null); }, []);
    
    const handleDeleteAudio = useCallback(() => {
        handleDismissAudio();
        setAudioData(null);
    }, [handleDismissAudio, setAudioData]);
    
    useEffect(() => {
        if (isAudioValid && audioData) {
            const url = createWavUrl(decode(audioData.base64));
            audioUrlRef.current = url;
            setAudioUrl(url);
        } else {
            handleDismissAudio();
        }
    }, [isAudioValid, audioData, handleDismissAudio]);

    const handleInput = useCallback(() => { if (editorRef.current) setContent(htmlToMarkdown(editorRef.current.innerHTML)); }, [setContent]);
    
    const applyFormat = useCallback((cmd: string) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(cmd, false, undefined);
        const newHtml = editorRef.current.innerHTML;
        const newMarkdown = htmlToMarkdown(newHtml);
        setContent(newMarkdown);
        setSelection(null);
    }, [setContent]);

    const handleGenerateAudioSummary = async () => {
        if (!content) return;
        setIsGeneratingAudio(true);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
        setAudioUrl(null);
        try {
            const base64 = await generateAudioSummary(preprocessTextForSpeech(content));
            setAudioData({ base64, sourceContent: content });
        } catch (error: any) { 
            console.error("Failed to generate audio", error); 
            addToast(error.message, 'error');
        } finally { setIsGeneratingAudio(false); }
    };

    const handleGenerateSlideDeck = async () => {
        if (!content) return;
        setIsGeneratingSlides(true);
        setSlideData(null);
        try {
            const slides = await generateSlideDeck(content);
            setSlideData({ slides, sourceContent: content, isNew: true });
        } catch (error: any) {
            console.error("Failed to generate slides", error);
            addToast(error.message, 'error');
        } finally {
            setIsGeneratingSlides(false);
        }
    };

    const handleMouseUp = () => {
        if (isDisabled) return;
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const text = sel.toString().trim();
            if (text.length > 0) {
                setSelection({ range, text, rect: range.getBoundingClientRect() });
            } else {
                setSelection(null);
            }
        } else {
            setSelection(null);
        }
    };
    
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (selection && !(event.target as HTMLElement).closest('.floating-toolbar')) {
            setSelection(null);
        }
    };

    const handleModifyText = async (instruction: string) => {
        if (!selection || !editorRef.current) return;
    
        setIsModifyingText(true);
        const { range } = selection;
        setSelection(null); 
    
        try {
            const contents = range.cloneContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(contents);
            const selectedHtml = tempDiv.innerHTML;
            const selectedMarkdown = htmlToMarkdown(selectedHtml);
            const modifiedMarkdown = await modifySelectedText(selectedMarkdown, instruction);
            editorRef.current.focus();
            range.deleteContents();
            const fragment = document.createDocumentFragment();
            const parts = modifiedMarkdown.split(/(\*\*.*?\*\*|\*.*?\*|\[\d+\])/g).filter(Boolean);
    
            parts.forEach(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    const strong = document.createElement('strong');
                    strong.textContent = part.slice(2, -2);
                    fragment.appendChild(strong);
                } else if (part.startsWith('*') && part.endsWith('*')) {
                    const em = document.createElement('em');
                    em.textContent = part.slice(1, -1);
                    fragment.appendChild(em);
                } else if (/^\[\d+\]$/.test(part)) {
                    const span = document.createElement('span');
                    span.className = 'citation-chip';
                    span.dataset.citationId = part.slice(1, -1);
                    span.textContent = part;
                    fragment.appendChild(span);
                } else {
                    fragment.appendChild(document.createTextNode(part));
                }
            });
    
            const lastNode = fragment.lastChild;
            range.insertNode(fragment);
            
            if (lastNode) {
                const sel = window.getSelection();
                if (sel) {
                    sel.removeAllRanges();
                    const newRange = document.createRange();
                    newRange.setStartAfter(lastNode);
                    newRange.collapse(true);
                    sel.addRange(newRange);
                }
            }
            
            if (editorRef.current) {
                setContent(htmlToMarkdown(editorRef.current.innerHTML));
            }
        } catch (error: any) {
            console.error("Failed to modify text:", error);
            addToast(error.message || "Sorry, an error occurred while modifying the text.", 'error');
        } finally {
            setIsModifyingText(false);
        }
    };

    const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('citation-chip')) {
            const citationId = target.dataset.citationId;
            if (citationId) onCitationClick(citationId);
        }
    };
    
    const getSaveButtonContent = () => {
        switch (saveState) {
            case 'saving': return <><div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div><span>Saving...</span></>;
            case 'saved': return <><CheckIcon className="h-5 w-5" /><span>Saved</span></>;
            default: return 'Save';
        }
    };

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant h-full flex flex-col">
            <div className="non-printable p-4 border-b border-outline-variant flex items-center justify-between gap-4 min-h-[88px]">
                <div className="flex items-center gap-2">
                    <select value={documentType} onChange={(e) => setDocumentType(e.target.value as DocumentType)} className="p-2.5 bg-surface-container-highest border border-outline rounded-lg focus:ring-2 focus:ring-primary text-sm">
                        <option value="" disabled>Select document type...</option>
                        {Object.values(DocumentType).map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                    {isHandoffDocument ? (
                        <div className="relative inline-flex group" ref={formatMenuRef} title={!documentType ? "Please select a document type first" : ""}>
                            <button onClick={() => onGenerate(handoffFormat)} disabled={isDisabled || !documentType} className="pl-6 pr-4 py-2.5 bg-secondary-container text-on-secondary-container rounded-l-full hover:shadow-md disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 transition-colors"><GeminiIcon className="h-5 w-5"/>Generate ({handoffFormat.toUpperCase()})</button>
                            <button onClick={() => setIsFormatMenuOpen(p => !p)} disabled={isDisabled || !documentType} className="px-3 py-2.5 bg-secondary-container text-on-secondary-container rounded-r-full hover:shadow-md disabled:bg-on-surface/12 disabled:cursor-not-allowed border-l border-on-secondary-container/20 transition-colors"><ChevronDownIcon className="h-5 w-5" /></button>
                            {isFormatMenuOpen && (<div className="absolute top-full mt-2 w-40 bg-surface-container rounded-lg shadow-lg border z-10"><button onClick={() => {setHandoffFormat('ipass'); setIsFormatMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm hover:bg-on-surface/5">IPASS</button><button onClick={() => {setHandoffFormat('sbar'); setIsFormatMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm hover:bg-on-surface/5">SBAR</button></div>)}
                        </div>
                    ) : (
                         <button 
                            onClick={() => onGenerate('ipass')} // Format is ignored for non-handoff docs
                            disabled={isDisabled || !documentType} 
                            className="px-6 py-2.5 bg-secondary-container text-on-secondary-container rounded-full hover:shadow-md disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 transition-colors"
                        >
                            <GeminiIcon className="h-5 w-5"/>
                            <span>Generate</span>
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onSave} disabled={!canSave || isDisabled || saveState !== 'idle'} className="px-6 py-2.5 bg-primary text-on-primary rounded-full hover:shadow-md disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2 w-[120px] transition-colors">{getSaveButtonContent()}</button>
                </div>
            </div>
            <div className="non-printable p-4 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-lg font-medium">Document Content</h3>
                <div className="flex items-center gap-1">
                    <button onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }} className="p-2 rounded-full hover:bg-on-surface/10" title="Bold"><BoldIcon className="h-5 w-5 text-on-surface-variant"/></button>
                    <button onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }} className="p-2 rounded-full hover:bg-on-surface/10" title="Italic"><ItalicIcon className="h-5 w-5 text-on-surface-variant"/></button>
                    <div className="h-5 w-px bg-outline-variant mx-1"></div>
                    <button onClick={handleGenerateAudioSummary} disabled={isGeneratingAudio || !content} className="p-2 rounded-full hover:bg-on-surface/10 disabled:text-on-surface/38" title={isGeneratingAudio ? 'Generating...' : 'Generate Audio'}>
                        <AudioIcon className={`h-5 w-5 text-on-surface-variant ${isGeneratingAudio ? 'animate-pulse' : ''}`}/>
                    </button>
                    <button onClick={handleGenerateSlideDeck} disabled={isGeneratingSlides || !content} className="p-2 rounded-full hover:bg-on-surface/10 disabled:text-on-surface/38" title={isGeneratingSlides ? 'Generating...' : 'Generate Slide Deck'}>
                        <PresentationIcon className={`h-5 w-5 text-on-surface-variant ${isGeneratingSlides ? 'animate-pulse' : ''}`}/>
                    </button>
                    <button onClick={() => window.print()} disabled={!content} className="p-2 rounded-full hover:bg-on-surface/10 disabled:text-on-surface/38" title="Print Document">
                        <PrintIcon className="h-5 w-5 text-on-surface-variant"/>
                    </button>
                </div>
            </div>

            {(isGeneratingAudio || (audioData)) && (
                <div className="non-printable p-4 border-b border-outline-variant flex items-center justify-between gap-4 bg-surface-container">
                    <div className="flex items-center gap-3">
                        <AudioIcon className="h-5 w-5 text-on-surface"/>
                        <span className="font-medium text-sm text-on-surface">Audio Summary</span>
                        {!isAudioValid && !isGeneratingAudio && audioData && (
                            <div title="Audio is out of sync with document text. Regenerate for the latest version.">
                                <WarningIcon className="h-5 w-5 text-yellow-600" />
                            </div>
                        )}
                    </div>
                    <div className="flex-grow max-w-md flex items-center justify-center">
                        {isGeneratingAudio ? (
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">Generating audio...</span>
                            </div>
                        ) : (
                            <audio controls src={audioUrl || ''} className="w-full h-10"></audio>
                        )}
                    </div>
                    <button onClick={handleDeleteAudio} disabled={isGeneratingAudio} className="p-2 rounded-full hover:bg-on-surface/10 disabled:opacity-50" aria-label="Delete audio summary">
                        <TrashIcon className="h-5 w-5 text-on-surface-variant"/>
                    </button>
                </div>
            )}
            
            {(isGeneratingSlides || (slideData)) && (
                isGeneratingSlides ? (
                    <div className="non-printable p-4 border-b border-outline-variant flex items-center justify-between gap-4 bg-surface-container">
                        <div className="flex items-center gap-3">
                            <PresentationIcon className="h-5 w-5 text-on-surface"/>
                            <span className="font-medium text-sm text-on-surface">Presentation</span>
                        </div>
                        <div className="flex-grow flex items-center justify-center">
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">Generating slide deck...</span>
                            </div>
                        </div>
                        <button disabled className="p-2 rounded-full disabled:opacity-50" aria-label="Delete presentation">
                            <TrashIcon className="h-5 w-5 text-on-surface-variant"/>
                        </button>
                    </div>
                ) : (
                    slideData && <PresentationViewer slides={slideData.slides} onDelete={() => setSlideData(null)} initialCollapsed={!slideData.isNew} isStale={!isSlideDeckValid} />
                )
            )}

            <div id="printable-area" className="overflow-y-auto flex-grow p-6 relative bg-surface-container-lowest" onClick={handleEditorClick} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
                {selection && editorRef.current && (
                    <FloatingToolbar
                        editorRef={editorRef}
                        selectionRect={selection.rect}
                        onSubmit={handleModifyText}
                        onClose={() => setSelection(null)}
                    />
                )}
                <div className="hidden print:block mb-8 pb-4 border-b-2 border-gray-600 text-black">
                    <h2 className="text-2xl font-bold">{patient.name}</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
                        <p><strong className="font-semibold">MRN:</strong> {patient.mrn}</p>
                        <p><strong className="font-semibold">DOB:</strong> {patient.dob}</p>
                        <p><strong className="font-semibold">Encounter ID:</strong> {patient.encounterId}</p>
                        <p><strong className="font-semibold">Admitted:</strong> {patient.admittedAt}</p>
                    </div>
                </div>

                {isGenerating && (
                    <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-b-2xl">
                        <div className="text-center flex flex-col items-center">
                            <GeminiIcon className="h-16 w-16 animate-pulse"/>
                            <p className="mt-4 text-on-surface-variant text-lg">Generating with</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-[#8E68FF] to-[#4386F5] text-transparent bg-clip-text">Google Gemini</p>
                        </div>
                    </div>
                )}
                <div className="relative h-full">
                    {isModifyingText && (
                         <div className="absolute inset-0 bg-scrim/30 z-10 flex items-center justify-center rounded-b-2xl">
                             <div className="bg-surface-container-high p-4 rounded-lg shadow-lg flex items-center gap-3">
                                 <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                 <p className="text-on-surface-variant font-medium">AI is editing...</p>
                             </div>
                         </div>
                    )}
                    {isNewDocument && !content && !isGenerating && !isLoadingDoc && (<div className="absolute inset-0 text-on-surface-variant/70 pointer-events-none p-1">Select a document type and click "Generate" to create a summary.</div>)}
                    <div ref={editorRef} onInput={handleInput} contentEditable={!isDisabled} className="w-full h-full focus:outline-none text-on-surface leading-relaxed whitespace-pre-wrap print:text-black"/>
                </div>
            </div>
        </div>
    );
};

interface AudioData {
    base64: string;
    sourceContent: string;
}

interface SlideData {
    slides: Slide[];
    sourceContent: string;
    isNew?: boolean;
}

const UnsavedChangesModal: React.FC<{
    onSave: () => Promise<void>;
    onDiscard: () => void;
    onCancel: () => void;
}> = ({ onSave, onDiscard, onCancel }) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveClick = async () => {
        setIsSaving(true);
        await onSave();
        // If save fails, the parent `onSave` won't navigate away. 
        // We reset the saving state to allow the user to try again.
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-scrim/50 z-50 flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-surface-container-low rounded-3xl shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-start">
                    <div className="mt-0.5 mr-4 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary-container">
                        <WarningIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-on-surface" id="modal-title">
                            Unsaved Changes
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-on-surface-variant">
                                You have unsaved changes. Would you like to save them before leaving this page?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 text-sm font-medium text-primary rounded-full hover:bg-primary-container"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onDiscard}
                        className="px-6 py-2.5 text-sm font-medium text-primary rounded-full hover:bg-primary-container"
                    >
                        Discard
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className="px-6 py-2.5 text-sm font-medium bg-primary text-on-primary rounded-full hover:shadow-md disabled:bg-on-surface/12 disabled:text-on-surface/38 flex items-center gap-2"
                    >
                        {isSaving && <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                        {isSaving ? 'Saving...' : 'Save & Exit'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const DocumentEditor: React.FC = () => {
    const { activePatient: patient, activeDocument: initialDocument, showDashboard: onBack } = useAppContext();
    const { addToast } = useToast();
    
    const [documentType, setDocumentType] = useState<DocumentType | ''>('');
    const [documentContent, setDocumentContent] = useState<string>('');
    const [originalContent, setOriginalContent] = useState<string>('');
    const [currentDocId, setCurrentDocId] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isRecordsCollapsed, setIsRecordsCollapsed] = useState<boolean>(false);
    const [isChatCollapsed, setIsChatCollapsed] = useState<boolean>(false);
    const [citationToHighlight, setCitationToHighlight] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [audioData, setAudioData] = useState<AudioData | null>(null);
    const [slideData, setSlideData] = useState<SlideData | null>(null);
    const [originalAudioData, setOriginalAudioData] = useState<AudioData | null>(null);
    const [originalSlideData, setOriginalSlideData] = useState<SlideData | null>(null);
    const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
    
    const { data: patientRecordsData } = usePatientRecords(patient?.id || null);
    const { data: initialDocumentData, isLoading: isLoadingInitialDoc } = useDocument(initialDocument?.id || null);
    const patientRecords = patientRecordsData || [];

    const isNewDocument = initialDocument === null;
    
    const isDirty = useMemo(() => {
        if (isLoadingInitialDoc) return false;

        const contentChanged = originalContent !== documentContent;
        const audioChanged = (originalAudioData?.base64 ?? null) !== (audioData?.base64 ?? null);
        const slidesChanged = JSON.stringify(originalSlideData?.slides ?? null) !== JSON.stringify(slideData?.slides ?? null);

        return contentChanged || audioChanged || slidesChanged;
    }, [originalContent, documentContent, originalAudioData, audioData, originalSlideData, slideData, isLoadingInitialDoc]);

    useEffect(() => {
        const doc = initialDocumentData;
        if (doc) {
            setDocumentContent(doc.content || '');
            setOriginalContent(doc.content || '');
            setCurrentDocId(doc.id);
            setDocumentType(doc.documentType as DocumentType);
            
            const initialAudio = doc.audioSummaryBase64 ? { base64: doc.audioSummaryBase64, sourceContent: doc.content || '' } : null;
            setAudioData(initialAudio);
            setOriginalAudioData(initialAudio);
            
            const initialSlides = doc.slides ? { slides: doc.slides, sourceContent: doc.content || '', isNew: false } : null;
            setSlideData(initialSlides);
            setOriginalSlideData(initialSlides);

        } else if (isNewDocument) {
            setDocumentContent('');
            setOriginalContent('');
            setCurrentDocId(null);
            setDocumentType('');
            setAudioData(null);
            setOriginalAudioData(null);
            setSlideData(null);
            setOriginalSlideData(null);
        }
    }, [initialDocumentData, isNewDocument]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    useEffect(() => {
        if (citationToHighlight) {
            const recordElement = document.getElementById(`citation-${citationToHighlight}`);
            if (recordElement) {
                setTimeout(() => {
                    recordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    recordElement.classList.add('highlight-record');
                    setTimeout(() => recordElement.classList.remove('highlight-record'), 2000);
                }, 200);
            }
            setCitationToHighlight(null);
        }
    }, [citationToHighlight]);

    const handleGenerate = async (format: HandoffFormat) => {
        if (!documentType || !patient) return;
        setIsGenerating(true);
        setDocumentContent('');
        setAudioData(null);
        setSlideData(null);
        try {
            const newDoc = await generateDocument(patient.id, documentType as DocumentType, format);
            setDocumentContent(newDoc.content || '');
            // Do not set original content, so the new document starts in a "dirty" state
            setCurrentDocId(newDoc.id);
        } catch (error: any) { 
            addToast(error.message || "Error: Could not generate summary.", 'error');
            setDocumentContent("Error: Could not generate summary.");
        } finally { setIsGenerating(false); }
    };
    
    const handleSave = async (): Promise<boolean> => {
        if(!currentDocId || !documentType || saveState !== 'idle' || !patient || !isDirty) return false;
        setSaveState('saving');
        try {
            const audioToSave = audioData ? audioData.base64 : null;
            const slidesToSave = slideData ? slideData.slides : null;
            const savedDoc = await saveDocument(currentDocId, documentContent, documentType as DocumentType, audioToSave, slidesToSave);
            
            setOriginalContent(savedDoc.content || '');

            const newOriginalAudio = savedDoc.audioSummaryBase64 ? { base64: savedDoc.audioSummaryBase64, sourceContent: savedDoc.content || '' } : null;
            setAudioData(newOriginalAudio);
            setOriginalAudioData(newOriginalAudio);

            const newOriginalSlides = savedDoc.slides ? { slides: savedDoc.slides, sourceContent: savedDoc.content || '', isNew: false } : null;
            setSlideData(newOriginalSlides);
            setOriginalSlideData(newOriginalSlides);
            
            setSaveState('saved');
            addToast('Document saved successfully!', 'success');
            setTimeout(() => setSaveState('idle'), 2000);
            return true;
        } catch (error) { 
            console.error("Failed to save", error); 
            addToast('Failed to save document.', 'error'); 
            setSaveState('idle'); 
            return false;
        }
    };

    const handleCitationClick = (citationId: string) => {
        if (isRecordsCollapsed) setIsRecordsCollapsed(false);
        setCitationToHighlight(citationId);
    };

    const handleBack = () => {
        if (isDirty) {
            setIsUnsavedModalOpen(true);
        } else {
            onBack();
        }
    };

    const handleSaveAndExit = async () => {
        const success = await handleSave();
        if (success) {
            onBack();
        }
    };
    
    if (!patient) return <div className="text-center">Loading patient information...</div>;
    
    const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: `${isRecordsCollapsed ? 'auto' : 'minmax(0, 1.2fr)'} minmax(0, 3fr) ${isChatCollapsed ? 'auto' : 'minmax(0, 1.2fr)'}`, gridTemplateRows: 'minmax(0, 1fr)', gap: '1.5rem' };
    
    return (
        <div className="flex flex-col flex-grow min-h-0">
            {isUnsavedModalOpen && (
                <UnsavedChangesModal
                    onSave={handleSaveAndExit}
                    onDiscard={onBack}
                    onCancel={() => setIsUnsavedModalOpen(false)}
                />
            )}
            <div className="non-printable">
                <PatientHeader patient={patient} onBack={handleBack} documentType={documentType} isNew={isNewDocument} isDirty={isDirty}/>
            </div>
            <div className="flex-grow min-h-0" style={gridStyle}>
                <div className="non-printable min-h-0">
                    <PatientRecords records={patientRecords} isCollapsed={isRecordsCollapsed} onToggle={() => setIsRecordsCollapsed(!isRecordsCollapsed)}/>
                </div>
                <div className="h-full min-h-0">
                    <HandoffDocument 
                        patient={patient}
                        content={documentContent} setContent={setDocumentContent}
                        isGenerating={isGenerating} isLoadingDoc={isLoadingInitialDoc} isNewDocument={isNewDocument}
                        documentType={documentType} setDocumentType={setDocumentType}
                        onGenerate={handleGenerate} onSave={() => handleSave()} saveState={saveState}
                        canSave={currentDocId !== null && isDirty} onCitationClick={handleCitationClick}
                        audioData={audioData} setAudioData={setAudioData}
                        slideData={slideData} setSlideData={setSlideData}
                        patientRecords={patientRecords}
                    />
                </div>
                <div className="non-printable min-h-0">
                    <ChatPanel documentContent={documentContent} setDocumentContent={setDocumentContent} patientRecords={patientRecords} isCollapsed={isChatCollapsed} onToggle={() => setIsChatCollapsed(!isChatCollapsed)}/>
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;