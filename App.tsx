import React, { useState, useCallback } from 'react';
import { generateDescriptionFromImages } from './services/geminiService';
import FileUploader from './components/FileUploader';
import { Header } from './components/Header';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';


export interface EBayListing {
  title: string;
  category_suggestion: string;
  condition: string;
  description: string;
  item_specifics: { name: string; value: string }[];
  price_recommendation: {
    price: number;
    justification: string;
  };
  shipping_recommendation: {
      est_weight: string;
      est_dimensions: string;
      rec_service: string;
  };
  sources?: {
      uri: string;
      title: string;
  }[];
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [listingData, setListingData] = useState<EBayListing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setListingData(null);
    setError(null);
  };

  const handleClear = () => {
    setFiles([]);
    setListingData(null);
    setError(null);
    setIsLoading(false);
  };

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) return;
    
    setIsLoading(true);
    setListingData(null);
    setError(null);

    try {
      const { jsonString, sources } = await generateDescriptionFromImages(files);
      const cleanedJsonString = jsonString.trim().replace(/^```json\n/, '').replace(/\n```$/, '');
      const generatedData = JSON.parse(cleanedJsonString) as EBayListing;
      setListingData({ ...generatedData, sources });
    } catch (err: unknown) {
      let message = 'An unknown error occurred.';
      if (err instanceof SyntaxError) {
          message = `Failed to parse AI response. The response might be malformed. Error: ${err.message}`;
      } else if (err instanceof Error) {
          message = `Error during generation: ${err.message}`;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [files]);
  
  const hasFiles = files.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />

        <main className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-slate-700 h-fit sticky top-8">
              <h2 className="text-xl font-bold text-green-400 mb-1">1. Upload Product Images</h2>
              <p className="text-sm text-slate-400 mb-4">Share a set of pictures for one item. More angles and details will produce better results.</p>
              <FileUploader files={files} onFilesChange={handleFilesChange} />
              <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                      onClick={handleAnalyze}
                      disabled={!hasFiles || isLoading}
                      className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                  >
                      {isLoading ? 'Analyzing...' : 'Analyze Images'}
                  </button>
                  <button
                      onClick={handleClear}
                      disabled={!hasFiles && !listingData}
                      className="w-full px-4 py-3 bg-slate-700 text-slate-300 font-bold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-800 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                  >
                      Clear
                  </button>
              </div>
            </section>
          </div>

          <div className="lg:col-span-3">
             <section className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-700 min-h-[400px]">
                <h2 className="text-xl font-bold text-green-400 mb-4">2. Generated Listing Details</h2>
                 {isLoading && <Loader />}
                 {error && <ErrorMessage message={error} />}
                 {listingData && !isLoading && !error && <ResultDisplay listingData={listingData} />}
                 {!isLoading && !error && !listingData && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-slate-500">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 01-7.5 0c-1.28-.28-2.427-.86-3.344-1.612a4.5 4.5 0 01-1.423-3.344A6.01 6.01 0 014.25 12c0-1.42.38-2.754 1.057-3.962a4.5 4.5 0 013.344-1.423 7.5 7.5 0 017.5 0 4.5 4.5 0 013.344 1.423 6.01 6.01 0 011.057 3.962 4.5 4.5 0 01-1.423 3.344 6.01 6.01 0 01-3.344 1.612 7.5 7.5 0 01-7.5 0z" />
                        </svg>
                        <p className="text-lg font-semibold">Your listing details will appear here.</p>
                        <p className="max-w-sm">Upload your product images and click "Analyze Images" to let the AI generate a complete eBay listing for you.</p>
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
