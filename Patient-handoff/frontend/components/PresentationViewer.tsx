import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '../types';
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, FullscreenEnterIcon, FullscreenExitIcon, PresentationIcon, ChevronDownIcon, WarningIcon } from './icons';

// This makes the PptxGenJS library available in the component
declare var PptxGenJS: any;

interface PresentationViewerProps {
    slides: Slide[];
    onDelete: () => void;
    initialCollapsed?: boolean;
    isStale: boolean;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({ slides, onDelete, initialCollapsed, isStale }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed ?? false);
    const viewerRef = useRef<HTMLDivElement>(null);

    const handleNext = () => {
        setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    };

    const handlePrev = () => {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
    };

    const handleExport = () => {
        if (typeof PptxGenJS === 'undefined') {
            alert('Presentation library not loaded. Please try again later.');
            return;
        }
        
        const pptx = new PptxGenJS();
        
        slides.forEach(slide => {
            const pptxSlide = pptx.addSlide();
            
            // Add Title
            pptxSlide.addText(slide.title, { 
                x: 0.5, y: 0.25, w: '90%', h: 1, 
                fontSize: 32, 
                bold: true, 
                color: '0061A4' // --md-sys-color-primary
            });

            // Add Bullet Points
            pptxSlide.addText(slide.points.join('\n'), { 
                x: 0.5, y: 1.5, w: '90%', h: 3.5, 
                bullet: true, 
                fontSize: 18,
                color: '1A1C1E' // --md-sys-color-on-surface
            });
        });

        pptx.writeFile({ fileName: 'PatientHandoff_Presentation.pptx' });
    };

    const handleToggleFullscreen = () => {
        if (!viewerRef.current) return;
        if (!document.fullscreenElement) {
            viewerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };
    
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const slide = slides[currentSlide];

    return (
        <div ref={viewerRef} className={`flex flex-col border-b border-outline-variant bg-surface-container ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between gap-4 bg-surface-container-high">
                <div className="flex items-center gap-3">
                    <PresentationIcon className="h-5 w-5 text-on-surface"/>
                    <span className="font-medium text-sm text-on-surface">Presentation</span>
                    {isStale && (
                        <div title="Presentation is out of sync with document text. Regenerate for the latest version.">
                            <WarningIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleExport} className="p-2 rounded-full hover:bg-on-surface/10" title="Export as .pptx">
                        <DownloadIcon className="h-5 w-5 text-on-surface-variant"/>
                    </button>
                    <button onClick={handleToggleFullscreen} className="p-2 rounded-full hover:bg-on-surface/10" title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                        {isFullscreen ? <FullscreenExitIcon className="h-5 w-5 text-on-surface-variant"/> : <FullscreenEnterIcon className="h-5 w-5 text-on-surface-variant"/>}
                    </button>
                    {!isFullscreen && (
                        <>
                            <button onClick={onDelete} className="p-2 rounded-full hover:bg-on-surface/10" aria-label="Delete presentation">
                                <TrashIcon className="h-5 w-5 text-on-surface-variant"/>
                            </button>
                            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full hover:bg-on-surface/10" aria-label={isCollapsed ? "Expand presentation viewer" : "Collapse presentation viewer"}>
                                <ChevronDownIcon className={`h-5 w-5 text-on-surface-variant transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}/>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Collapsible Content */}
            {!isCollapsed && (
                <>
                    {/* Slide Content */}
                    <div className="flex-grow flex flex-col justify-center items-center p-8 min-h-[300px]">
                        <h2 className="text-3xl font-bold text-primary mb-6 text-center">{slide.title}</h2>
                        <ul className="space-y-4 list-disc pl-8 max-w-2xl">
                            {slide.points.map((point, index) => (
                                <li key={index} className="text-lg text-on-surface">{point}</li>
                            ))}
                        </ul>
                    </div>
        
                    {/* Footer / Navigation */}
                    <div className="p-4 flex items-center justify-center gap-4 bg-surface-container-high">
                        <button onClick={handlePrev} disabled={currentSlide === 0} className="p-2 rounded-full hover:bg-on-surface/10 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeftIcon />
                        </button>
                        <span className="text-sm font-medium text-on-surface-variant">
                            {currentSlide + 1} / {slides.length}
                        </span>
                        <button onClick={handleNext} disabled={currentSlide === slides.length - 1} className="p-2 rounded-full hover:bg-on-surface/10 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronRightIcon />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PresentationViewer;