import React, { useState } from 'react';
import type { EBayListing } from '../types';

interface ResultDisplayProps {
  listingData: EBayListing;
  onUpdate: (data: EBayListing) => void;
  onRefine: (prompt: string) => Promise<void>;
  isRefining: boolean;
}

const inputStyles = "mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-300 focus:ring-indigo-500 focus:border-indigo-500 transition";
const labelStyles = "font-semibold text-green-400";
const sectionSpacing = "space-y-4";

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

const EditableSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className={labelStyles}>{title}</h3>
        <div className="mt-2 space-y-3">{children}</div>
    </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ listingData, onUpdate, onRefine, isRefining }) => {
    const [copied, setCopied] = useState(false);
    const [refinePrompt, setRefinePrompt] = useState('');

    const handleFieldChange = (field: keyof EBayListing, value: any) => {
        onUpdate({ ...listingData, [field]: value });
    };

    const handleNestedChange = (section: keyof EBayListing, field: string, value: any) => {
        let parsedValue = value;
        if (field === 'price' && typeof value === 'string') {
            parsedValue = parseFloat(value) || 0;
        }
        onUpdate({
            ...listingData,
            [section]: {
                ...(listingData[section] as object),
                [field]: parsedValue,
            },
        });
    };
    
    const handleSpecificsChange = (index: number, field: 'name' | 'value', value: string) => {
        const newSpecifics = [...listingData.item_specifics];
        newSpecifics[index] = { ...newSpecifics[index], [field]: value };
        handleFieldChange('item_specifics', newSpecifics);
    };

    const handleExportAll = () => {
        const specificsText = listingData.item_specifics.map(s => `${s.name}: ${s.value}`).join('\n');
        
        const exportText = `
Title:
${listingData.title}

Category:
${listingData.category_suggestion}

Condition:
${listingData.condition}

Recommended Price:
$${listingData.price_recommendation.price.toFixed(2)}
Justification: ${listingData.price_recommendation.justification}

Item Specifics:
${specificsText}

Shipping Recommendation:
Est. Weight: ${listingData.shipping_recommendation.est_weight}
Est. Dimensions: ${listingData.shipping_recommendation.est_dimensions}
Rec. Service: ${listingData.shipping_recommendation.rec_service}

Description:
${listingData.description}
        `.trim();

        navigator.clipboard.writeText(exportText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

     const handleRefineClick = () => {
        if (!refinePrompt.trim()) return;
        onRefine(refinePrompt);
        setRefinePrompt('');
    };
    
    const categoryPath = listingData.category_suggestion.split('>').map(part => part.trim());

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-400">Generated Listing Details</h2>
                 <button
                    type="button"
                    onClick={handleExportAll}
                    className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors font-semibold ${copied ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                    aria-label="Export all details"
                >
                    {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                    {copied ? 'Copied' : 'Export All'}
                </button>
            </div>

            <div className={`${sectionSpacing} pb-40`}>
                <EditableSection title="Recommended Price">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="price" className="text-sm font-medium text-slate-400">Price ($)</label>
                            <input
                                id="price"
                                type="number"
                                value={listingData.price_recommendation.price}
                                onChange={(e) => handleNestedChange('price_recommendation', 'price', e.target.value)}
                                className={inputStyles}
                                step="0.01"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="justification" className="text-sm font-medium text-slate-400">Price Justification</label>
                            <textarea
                                id="justification"
                                value={listingData.price_recommendation.justification}
                                onChange={(e) => handleNestedChange('price_recommendation', 'justification', e.target.value)}
                                className={`${inputStyles} h-24`}
                            />
                        </div>
                    </div>
                </EditableSection>
                
                <EditableSection title="Listing Details">
                    <div>
                        <label htmlFor="title" className="text-sm font-medium text-slate-400">eBay Title</label>
                        <input
                            id="title"
                            type="text"
                            value={listingData.title}
                            onChange={(e) => handleFieldChange('title', e.target.value)}
                            className={inputStyles}
                        />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-400 block mb-1">eBay Category</label>
                        <div className="flex flex-wrap items-center gap-x-2 p-2 rounded-md bg-slate-900 border border-slate-700">
                          {categoryPath.map((part, index) => (
                            <React.Fragment key={index}>
                              <span className="text-slate-300">{part}</span>
                              {index < categoryPath.length - 1 && <span className="text-slate-500">&gt;</span>}
                            </React.Fragment>
                          ))}
                        </div>
                         <input
                            id="category"
                            type="text"
                            value={listingData.category_suggestion}
                            onChange={(e) => handleFieldChange('category_suggestion', e.target.value)}
                            className={`${inputStyles} mt-2`}
                            aria-label="Full category path"
                        />
                    </div>
                    <div>
                        <label htmlFor="condition" className="text-sm font-medium text-slate-400">Condition</label>
                        <select
                            id="condition"
                            value={listingData.condition}
                            onChange={(e) => handleFieldChange('condition', e.target.value)}
                            className={inputStyles}
                        >
                            <option>Used</option>
                            <option>New</option>
                            <option>For parts or not working</option>
                        </select>
                    </div>
                </EditableSection>

                <EditableSection title="Item Specifics">
                    <div className="space-y-3">
                        {listingData.item_specifics.map((spec, index) => (
                            <div key={index} className="grid grid-cols-2 gap-2 items-center text-sm">
                                <input
                                    type="text"
                                    value={spec.name}
                                    onChange={(e) => handleSpecificsChange(index, 'name', e.target.value)}
                                    className={`${inputStyles} mt-0`}
                                    aria-label={`Specific name ${index + 1}`}
                                />
                                <input
                                    type="text"
                                    value={spec.value}
                                    onChange={(e) => handleSpecificsChange(index, 'value', e.target.value)}
                                    className={`${inputStyles} mt-0`}
                                    aria-label={`Specific value ${index + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </EditableSection>

                <EditableSection title="Shipping Recommendation">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="est_weight" className="text-sm font-medium text-slate-400">Est. Weight</label>
                            <input
                                id="est_weight"
                                type="text"
                                value={listingData.shipping_recommendation.est_weight}
                                onChange={(e) => handleNestedChange('shipping_recommendation', 'est_weight', e.target.value)}
                                className={inputStyles}
                            />
                        </div>
                        <div>
                             <label htmlFor="est_dimensions" className="text-sm font-medium text-slate-400">Est. Dimensions</label>
                            <input
                                id="est_dimensions"
                                type="text"
                                value={listingData.shipping_recommendation.est_dimensions}
                                onChange={(e) => handleNestedChange('shipping_recommendation', 'est_dimensions', e.target.value)}
                                className={inputStyles}
                            />
                        </div>
                        <div className="sm:col-span-2">
                             <label htmlFor="rec_service" className="text-sm font-medium text-slate-400">Rec. Service</label>
                            <input
                                id="rec_service"
                                type="text"
                                value={listingData.shipping_recommendation.rec_service}
                                onChange={(e) => handleNestedChange('shipping_recommendation', 'rec_service', e.target.value)}
                                className={inputStyles}
                            />
                        </div>
                    </div>
                </EditableSection>
                
                <EditableSection title="Description">
                    <textarea
                        value={listingData.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        className={`${inputStyles} h-48`}
                    />
                </EditableSection>

                {listingData.sources && listingData.sources.length > 0 && (
                     <EditableSection title="Sources">
                        <ul className="list-disc list-inside space-y-2 text-sm">
                        {listingData.sources.map((source, index) => (
                            <li key={index}>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-2 break-all">
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                        </ul>
                    </EditableSection>
                )}
            </div>

            <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-md -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 pt-6 pb-6 sm:px-8 sm:pb-8 rounded-t-xl border-t border-slate-700 shadow-2xl shadow-slate-900/50">
                <EditableSection title="Refine with AI">
                    <p className="text-sm text-slate-400 -mt-1 mb-3">
                        Use plain language to ask the AI to make changes. E.g: "Change condition to 'New'" or "Make title shorter".
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <textarea
                            value={refinePrompt}
                            onChange={(e) => setRefinePrompt(e.target.value)}
                            className={`${inputStyles} h-20 sm:h-12 flex-grow resize-y`}
                            placeholder="Enter your refinement request..."
                            disabled={isRefining}
                        />
                        <button
                            onClick={handleRefineClick}
                            disabled={isRefining || !refinePrompt.trim()}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out self-stretch"
                        >
                            {isRefining ? 'Refining...' : 'Refine'}
                        </button>
                    </div>
                </EditableSection>
            </div>
        </div>
    );
};

export default ResultDisplay;
