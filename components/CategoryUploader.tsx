import React, { useRef, useState } from 'react';
import { parseEBayCategoriesCSV } from '../utils/csvParser';

interface CategoryUploaderProps {
  onFilesParsed: (files: File[], categories: string[]) => void;
}

const CategoryUploader: React.FC<CategoryUploaderProps> = ({ onFilesParsed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filenames, setFilenames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await processFiles(Array.from(event.target.files));
      event.target.value = ''; 
    }
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0 || files.length > 2) {
        setError("Please upload 1 or 2 eBay category CSV files.");
        return;
    }
    
    setError(null);
    setIsParsing(true);
    setFilenames(files.map(f => f.name));

    try {
        const fileContents = await Promise.all(files.map(file => file.text()));
        const categoryList = parseEBayCategoriesCSV(fileContents);
        onFilesParsed(files, categoryList);
    } catch (e) {
        console.error("Error parsing CSV files:", e);
        setError("Could not parse files. Please ensure they are valid eBay category CSVs.");
        onFilesParsed([], []);
        setFilenames([]);
    } finally {
        setIsParsing(false);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      processFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
     event.preventDefault();
     event.stopPropagation();
     setIsDragging(true);
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
     event.preventDefault();
     event.stopPropagation();
     setIsDragging(false);
  }

  return (
    <div>
        <div 
        onClick={handleContainerClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-slate-900/50 transition-colors duration-300 min-h-[100px] cursor-pointer ${isDragging ? 'border-indigo-500' : 'border-slate-600'} hover:bg-slate-900`}
        >
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".csv"
            multiple
        />
        {isParsing ? (
            <p className="text-slate-400">Parsing files...</p>
        ) : filenames.length > 0 ? (
            <div className="text-center text-sm text-slate-400">
                <p className="font-semibold text-green-400">Files Uploaded:</p>
                {filenames.map(name => <p key={name} className="truncate">{name}</p>)}
            </div>
        ) : (
            <div className="flex flex-col items-center pointer-events-none text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-500 mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <p className="text-sm text-slate-400">
                <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">Upload up to 2 CSV files</p>
            </div>
        )}
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default CategoryUploader;
