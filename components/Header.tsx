import React from 'react';

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.663-4.663m-4.663 0l-3.181 3.183a8.25 8.25 0 000 11.664l3.181 3.183" />
    </svg>
);

const FullscreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);


export const Header: React.FC = () => (
    <header className="flex flex-col sm:flex-row justify-between items-center py-4 border-b border-slate-700/50">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-slate-100">
                eBay Listing Optimizer AI
            </h1>
        </div>
        <div className="flex items-center space-x-2">
            <button className="relative px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    History
                </div>
                <span className="absolute -top-2 -right-2 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-500 items-center justify-center text-xs">1</span>
                </span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-700/50 transition-colors" aria-label="Refresh">
                <RefreshIcon />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-700/50 transition-colors" aria-label="Toggle Fullscreen">
                 <FullscreenIcon />
            </button>
        </div>
    </header>
);
