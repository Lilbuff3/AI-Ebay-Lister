import React, { useState, useEffect, useRef } from 'react';
import type { EBayListing } from '../types';

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.663-4.663m-4.663 0l-3.181 3.183a8.25 8.25 0 000 11.664l3.181 3.183" />
    </svg>
);

interface HeaderProps {
    onClear: () => void;
    history: EBayListing[];
    onLoadFromHistory: (id: string) => void;
    onClearHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClear, history, onLoadFromHistory, onClearHistory }) => {
    const [showHistory, setShowHistory] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
                setShowHistory(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleClearAndClose = () => {
        onClearHistory();
        setShowHistory(false);
    }

    return (
        <header className="flex flex-col sm:flex-row justify-between items-center py-4 border-b border-slate-700/50">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
                    AI eBay Lister
                </h1>
            </div>
            <div className="flex items-center space-x-2">
                <div className="relative" ref={historyRef}>
                    <button 
                        onClick={() => setShowHistory(prev => !prev)}
                        className="relative px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                            History
                        </div>
                        {history.length > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5">
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-500 items-center justify-center text-xs">{history.length}</span>
                            </span>
                        )}
                    </button>
                    {showHistory && (
                        <div className="absolute right-0 mt-2 w-80 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl z-50 p-3 animate-fade-in-down">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <h4 className="font-bold text-slate-200">Recent Listings</h4>
                                {history.length > 0 && (
                                    <button onClick={handleClearAndClose} className="text-xs text-indigo-400 hover:underline focus:outline-none">Clear History</button>
                                )}
                            </div>
                            {history.length > 0 ? (
                                <ul className="space-y-1 max-h-80 overflow-y-auto">
                                    {history.map(item => (
                                        <li key={item.id}>
                                            <button 
                                                onClick={() => { onLoadFromHistory(item.id); setShowHistory(false); }} 
                                                className="w-full text-left p-2 rounded-md hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <p className="font-semibold text-slate-300 truncate text-sm">{item.title}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-slate-500 py-6 text-sm">No history yet.</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="relative group">
                    <button 
                        onClick={onClear}
                        className="p-3 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-700/50 transition-colors" 
                        aria-label="Refresh and clear"
                    >
                        <RefreshIcon />
                    </button>
                    <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-max px-2 py-1 bg-slate-700 text-slate-200 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Clear & Reset
                    </div>
                </div>
            </div>
        </header>
    );
}