import React, { useState } from 'react';
import type { EBayListing } from '../App';

interface ResultDisplayProps {
  listingData: EBayListing;
}

const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.125 8.25h3.375c.621 0 1.125.504 1.125 1.125V18c0 .621-.504 1.125-1.125 1.125H4.5A1.125 1.125 0 013.375 18V9.375c0-.621.504-1.125 1.125-1.125h3.375m6.75 0V6.375c0-.621-.504-1.125-1.125-1.125H9.375c-.621 0-1.125.504-1.125 1.125v1.875m6.75 0h-6.75" />
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const useCopyToClipboard = (): [string | null, (text: string, id: string) => void] => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copy = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return [copiedId, copy];
};

interface DetailSectionProps {
    title: string;
    copyId?: string;
    copyText?: string;
    children: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({ title, copyId, copyText, children }) => {
    const [copiedId, copy] = useCopyToClipboard();
    const isCopied = copyId && copiedId === copyId;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-green-400">{title}</h3>
                {copyText && copyId && (
                     <button 
                        type="button" 
                        onClick={() => copy(copyText, copyId)}
                        className={`px-3 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${isCopied ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                        aria-label={`Copy ${title}`}
                    >
                         {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        {isCopied ? 'Copied' : 'Copy'}
                    </button>
                )}
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-300 space-y-2">
                {children}
            </div>
        </div>
    );
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ listingData }) => {
    const formattedDescription = listingData.description
        .split('\n')
        .map((paragraph, i) => (
            <p key={i}>{paragraph.replace(/^\*/, '•')}</p> 
        ));

    const itemSpecificsText = listingData.item_specifics.map(s => `${s.name}: ${s.value}`).join('\n');
    
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Price */}
             <div>
                <h3 className="font-semibold text-green-400 mb-2">Recommended Price</h3>
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                     <div className="flex items-center gap-2">
                         <span className="text-4xl font-bold text-slate-100">${listingData.price_recommendation.price.toFixed(2)}</span>
                        <div className="relative group">
                            <InfoIcon className="text-slate-500 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-slate-950 text-slate-300 text-xs rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
                                {listingData.price_recommendation.justification}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title */}
            <DetailSection title="eBay Title" copyId="title" copyText={listingData.title}>
                 <p>{listingData.title}</p>
            </DetailSection>

             {/* Category */}
            <DetailSection title="eBay Category" copyId="category" copyText={listingData.category_suggestion}>
                <div className="flex items-center flex-wrap text-sm" aria-label="Category Path">
                    {listingData.category_suggestion.split('>').map((part, index, arr) => (
                        <React.Fragment key={index}>
                            <span className="font-medium">{part.trim()}</span>
                            {index < arr.length - 1 && <span className="mx-2 text-slate-500" aria-hidden="true">&gt;</span>}
                        </React.Fragment>
                    ))}
                </div>
            </DetailSection>

            {/* Item Specifics */}
            <DetailSection title="Item Specifics" copyId="specs" copyText={itemSpecificsText}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {listingData.item_specifics.map((spec) => (
                        <div key={spec.name} className="grid grid-cols-2 text-sm">
                            <span className="font-medium text-slate-400">{spec.name}</span>
                            <span>{spec.value}</span>
                        </div>
                    ))}
                     <div className="grid grid-cols-2 text-sm">
                        <span className="font-medium text-slate-400">Condition</span>
                        <span>{listingData.condition}</span>
                    </div>
                </div>
            </DetailSection>

             {/* Shipping */}
            <DetailSection title="Shipping Recommendation">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <div className="grid grid-cols-2 text-sm">
                        <span className="font-medium text-slate-400">Est. Weight</span>
                        <span>{listingData.shipping_recommendation.est_weight}</span>
                    </div>
                    <div className="grid grid-cols-2 text-sm">
                        <span className="font-medium text-slate-400">Est. Dimensions</span>
                        <span>{listingData.shipping_recommendation.est_dimensions}</span>
                    </div>
                     <div className="grid grid-cols-2 text-sm sm:col-span-2">
                        <span className="font-medium text-slate-400">Rec. Service</span>
                        <span>{listingData.shipping_recommendation.rec_service}</span>
                    </div>
                </div>
            </DetailSection>

            {/* Description */}
            <DetailSection title="Description" copyId="description" copyText={listingData.description}>
                <div className="prose prose-sm prose-invert max-w-none text-slate-300 space-y-3">
                    {formattedDescription}
                </div>
            </DetailSection>

             {/* Sources */}
            {listingData.sources && listingData.sources.length > 0 && (
                <DetailSection title="Sources">
                    <ul className="list-disc list-inside space-y-2 text-sm">
                       {listingData.sources.map((source, index) => (
                           <li key={index}>
                               <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-2 break-all">
                                   {source.title || source.uri}
                               </a>
                           </li>
                       ))}
                    </ul>
                </DetailSection>
            )}
        </div>
    );
};

export default ResultDisplay;