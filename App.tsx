
import React, { useState, useCallback, useEffect } from 'react';
import { generateDescriptionFromImages, refineListing } from './services/geminiService';
import FileUploader from './components/FileUploader';
import { Header } from './components/Header';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import { EBayListing, ebayListingSchema } from './types';
import CategoryUploader from './components/CategoryUploader';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [categoryFiles, setCategoryFiles] = useState<File[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [listingData, setListingData] = useState<EBayListing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EBayListing[]>([]);

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem('ebayListingHistory');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    } catch (err) {
        console.error("Failed to load history from localStorage:", err);
        localStorage.removeItem('ebayListingHistory'); // Clear corrupted data
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('ebayListingHistory', JSON.stringify(history));
    } catch (err) {
        console.error("Failed to save history to localStorage:", err);
    }
  }, [history]);
  
  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setListingData(null);
    setError(null);
  };

  const handleCategoryFilesChange = (files: File[], categories: string[]) => {
    setCategoryFiles(files);
    setCategoryList(categories);
    setError(null);
  };

  const handleClear = () => {
    setFiles([]);
    setCategoryFiles([]);
    setCategoryList([]);
    setListingData(null);
    setError(null);
    setIsLoading(false);
  };

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0 || categoryFiles.length === 0) return;
    
    setIsLoading(true);
    setListingData(null);
    setError(null);

    try {
      const { jsonString, sources } = await generateDescriptionFromImages(files, categoryList);
      
      const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
      const contentToParse = match ? match[1] : jsonString;
      
      const parsedJson = JSON.parse(contentToParse);
      
      // Defensive truncation for title before validation
      if (parsedJson.title && typeof parsedJson.title === 'string' && parsedJson.title.length > 80) {
        parsedJson.title = parsedJson.title.substring(0, 80);
      }

      const validationResult = ebayListingSchema.safeParse(parsedJson);

      if (!validationResult.success) {
        const formattedErrors = validationResult.error.issues.map(e => `Field '${e.path.join('.')}': ${e.message}`).join('; ');
        throw new Error(`AI response failed validation. Details: ${formattedErrors}`);
      }

      const newListing = { ...validationResult.data, sources, id: `listing-${Date.now()}` };

      setListingData(newListing);
      
      setHistory(prevHistory => {
        const updatedHistory = [newListing, ...prevHistory];
        return updatedHistory.slice(0, 10); // Keep only the last 10 items
      });

    } catch (err: unknown) {
      let message = 'An unknown error occurred.';
       if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [files, categoryFiles, categoryList]);

  const handleListingUpdate = (updatedData: EBayListing) => {
    setListingData(updatedData);
  };
  
  const handleLoadFromHistory = (id: string) => {
    const listingToLoad = history.find(item => item.id === id);
    if (listingToLoad) {
      setListingData(listingToLoad);
      setError(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleRefine = async (refinementPrompt: string) => {
    if (!listingData || !refinementPrompt.trim()) return;

    setIsRefining(true);
    setError(null);

    try {
        const jsonString = await refineListing(listingData, refinementPrompt);
        
        const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
        const contentToParse = match ? match[1] : jsonString;

        const parsedJson = JSON.parse(contentToParse);
        
        // Defensive truncation for title before validation
        if (parsedJson.title && typeof parsedJson.title === 'string' && parsedJson.title.length > 80) {
            parsedJson.title = parsedJson.title.substring(0, 80);
        }

        const validationResult = ebayListingSchema.safeParse(parsedJson);

        if (!validationResult.success) {
            const formattedErrors = validationResult.error.issues.map(e => `Field '${e.path.join('.')}': ${e.message}`).join('; ');
            throw new Error(`Refined AI response failed validation. Details: ${formattedErrors}`);
        }
        
        const newListing = { ...validationResult.data, sources: listingData.sources, id: `listing-${Date.now()}` };

        setListingData(newListing);

        setHistory(prevHistory => {
            const updatedHistory = [newListing, ...prevHistory];
            return updatedHistory.slice(0, 10);
        });

    } catch (err: unknown) {
        let message = 'An unknown error occurred during refinement.';
        if (err instanceof Error) {
            message = err.message;
        }
        setError(message);
    } finally {
        setIsRefining(false);
    }
  };

  const hasFiles = files.length > 0;
  const hasCategoryFile = categoryFiles.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header 
          onClear={handleClear} 
          history={history}
          onLoadFromHistory={handleLoadFromHistory}
          onClearHistory={handleClearHistory}
        />

        <main className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-8 self-start">
            <section className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-slate-700">
              <h2 className="text-xl font-bold text-green-400 mb-1">1. Upload Product Images</h2>
              <p className="text-sm text-slate-400 mb-4">Share pictures for one item. More angles produce better results.</p>
              <FileUploader files={files} onFilesChange={handleFilesChange} />
            </section>

            <section className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-slate-700">
              <h2 className="text-xl font-bold text-green-400 mb-1">2. Upload eBay Category File</h2>
              <p className="text-sm text-slate-400 mb-4">Provide the latest category CSV files from eBay for accurate suggestions.</p>
              <CategoryUploader onFilesParsed={handleCategoryFilesChange} />
            </section>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={handleAnalyze}
                    disabled={!hasFiles || !hasCategoryFile || isLoading}
                    className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Images'}
                </button>
                <button
                    onClick={handleClear}
                    disabled={!hasFiles && !listingData && !hasCategoryFile}
                    className="w-full px-4 py-3 bg-slate-700 text-slate-300 font-bold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-800 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    Clear
                </button>
            </div>
          </div>

          <div className="lg:col-span-3">
             <section className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 min-h-[400px]">
                 {isLoading && <Loader />}
                 {error && <ErrorMessage message={error} />}
                 {listingData && !isLoading && !error && (
                    <ResultDisplay 
                      listingData={listingData} 
                      onUpdate={handleListingUpdate}
                      onRefine={handleRefine}
                      isRefining={isRefining}
                    />
                 )}
                 {!isLoading && !error && !listingData && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-slate-500">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 01-7.5 0c-1.28-.28-2.427-.86-3.344-1.612a4.5 4.5 0 01-1.423-3.344A6.01 6.01 0 014.25 12c0-1.42.38-2.754 1.057-3.962a4.5 4.5 0 013.344-1.423 7.5 7.5 0 017.5 0 4.5 4.5 0 013.344 1.423 6.01 6.01 0 011.057 3.962 4.5 4.5 0 01-1.423 3.344 6.01 6.01 0 01-3.344 1.612 7.5 7.5 0 01-7.5 0z" />
                        </svg>
                        <p className="text-lg font-semibold">Your listing details will appear here.</p>
                        <p className="max-w-sm">Upload your product images and category file, then click "Analyze Images" to let the AI generate a complete eBay listing.</p>
                    </div>
                 )}
            </section>
          </div>
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
