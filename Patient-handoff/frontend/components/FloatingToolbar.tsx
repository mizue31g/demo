import React, { useState, useEffect, useRef } from 'react';
import { GeminiIcon, SendIcon, XIcon } from './icons';

interface FloatingToolbarProps {
    editorRef: React.RefObject<HTMLDivElement>;
    selectionRect: DOMRect;
    onSubmit: (instruction: string) => void;
    onClose: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ editorRef, selectionRect, onSubmit, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [instruction, setInstruction] = useState('');
    const toolbarRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset to collapsed state when selection changes
    useEffect(() => {
        setIsExpanded(false);
        setInstruction('');
    }, [selectionRect]);

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded) {
            inputRef.current?.focus();
        }
    }, [isExpanded]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (instruction.trim()) {
            onSubmit(instruction);
        }
    };

    const calculatePosition = () => {
        if (!editorRef.current || !toolbarRef.current) {
            return { top: -9999, left: -9999 };
        }

        const editorBounds = editorRef.current.getBoundingClientRect();
        const toolbarBounds = toolbarRef.current.getBoundingClientRect();

        let top = selectionRect.top - editorBounds.top - toolbarBounds.height - 8;
        let left = selectionRect.left - editorBounds.left + (selectionRect.width / 2) - (toolbarBounds.width / 2);

        // Prevent toolbar from going off-screen
        if (top < 8) { // give some padding from the top
            top = selectionRect.bottom - editorBounds.top + 8;
        }
        if (left < 8) left = 8;
        if (left + toolbarBounds.width > editorBounds.width - 8) {
            left = editorBounds.width - toolbarBounds.width - 8;
        }

        return { top, left };
    };

    const [position, setPosition] = useState({ top: -9999, left: -9999 });

    useEffect(() => {
        if (toolbarRef.current) {
            setPosition(calculatePosition());
        }
    }, [selectionRect, isExpanded]);

    const handleExpandMouseDown = (e: React.MouseEvent) => {
        // Prevent editor from losing focus/selection
        e.preventDefault();
        // Stop this event from bubbling up to the editor's onMouseUp/Down handlers which would close the toolbar
        e.stopPropagation();
        setIsExpanded(true);
    };

    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    if (!isExpanded) {
        return (
            <div
                ref={toolbarRef}
                className="floating-toolbar absolute z-20"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
            >
                <button
                    onMouseDown={handleExpandMouseDown}
                    className="flex items-center justify-center p-2 bg-inverse-surface rounded-full shadow-lg hover:bg-primary transition-colors"
                    aria-label="Ask AI to edit"
                >
                    <GeminiIcon className="h-5 w-5 text-on-primary" />
                </button>
            </div>
        );
    }

    return (
        <div
            ref={toolbarRef}
            className="floating-toolbar absolute z-20 flex items-center p-1 bg-inverse-surface rounded-full shadow-lg border border-outline-variant"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
        >
            <form onSubmit={handleSubmit} className="flex items-center w-full">
                <GeminiIcon className="h-5 w-5 mx-2 text-on-primary" />
                <input
                    ref={inputRef}
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="e.g., Make this more concise"
                    className="bg-transparent text-inverse-on-surface placeholder:text-inverse-on-surface/60 outline-none w-64 text-sm"
                />
                <button
                    type="submit"
                    disabled={!instruction.trim()}
                    className="p-1.5 bg-primary rounded-full ml-1 text-on-primary disabled:bg-on-surface/38"
                    aria-label="Modify text"
                >
                    <SendIcon className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-full ml-1 text-inverse-on-surface/60 hover:text-inverse-on-surface"
                    aria-label="Close"
                >
                    <XIcon className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};

export default FloatingToolbar;