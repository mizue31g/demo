import React, { useState, useRef, useEffect } from 'react';
import { PatientRecord, ChatMessage } from '../types';
import { chatWithDocument } from '../services/geminiService';
import { GeminiIcon, SendIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useToast } from '../context/AppContext';

interface ChatPanelProps {
    documentContent: string;
    setDocumentContent: (content: string) => void;
    patientRecords: PatientRecord[];
    isCollapsed: boolean;
    onToggle: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ documentContent, setDocumentContent, patientRecords, isCollapsed, onToggle }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: "私はあなたのGeminiアシスタントです。ドキュメントに関する質問や編集指示をお寄せください。" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chatWithDocument(documentContent, userInput, patientRecords);
            const aiResponseMessage: ChatMessage = { sender: 'ai', text: response.chatResponse };
            setMessages(prev => [...prev, aiResponseMessage]);

            // Only update the document if a non-null value is explicitly returned.
            // This prevents the document from being cleared when just asking a question.
            if (response.updatedDocument !== null) {
                setDocumentContent(response.updatedDocument);
            }
        } catch (error: any) {
            console.error("Chat error:", error);
            addToast(error.message, 'error');
            const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    if (isCollapsed) {
        return (
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant h-full flex flex-col items-center justify-start py-4 gap-4">
                <button 
                    onClick={onToggle} 
                    className="p-1 rounded-full hover:bg-on-surface/10"
                    aria-label="Expand AI Assistant panel"
                >
                    <ChevronLeftIcon />
                </button>
                <GeminiIcon className="h-6 w-6" />
            </div>
        );
    }

    return (
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant h-full flex flex-col transition-all duration-300">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <GeminiIcon className="h-5 w-5" />
                    Gemini Assistant
                </h3>
                <button 
                    onClick={onToggle} 
                    className="p-1 rounded-full hover:bg-on-surface/10"
                    aria-label="Collapse AI Assistant panel"
                >
                    <ChevronRightIcon />
                </button>
            </div>
            <>
                <div className="overflow-y-auto flex-grow p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${
                                msg.sender === 'user' ? 'bg-primary-container text-on-primary-container rounded-br-none' : 'bg-surface-container text-on-surface rounded-bl-none'
                            }`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] p-3 rounded-2xl bg-surface-container text-on-surface rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 bg-on-surface-variant rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-outline-variant bg-surface-container-low rounded-b-2xl">
                    <div className="relative">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a question or give an instruction..."
                            disabled={isLoading}
                            className="w-full pr-12 pl-4 py-2 bg-surface-container-highest border border-outline rounded-full focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !userInput.trim()}
                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-12 text-primary disabled:text-on-surface/38"
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </>
        </div>
    );
};

export default ChatPanel;