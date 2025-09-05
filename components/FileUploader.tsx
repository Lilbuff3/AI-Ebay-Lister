import React, { useRef, useState, useEffect } from 'react';

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ files, onFilesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  useEffect(() => {
    // Create blob URLs for previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);

    // Cleanup function
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesChange(Array.from(event.target.files));
      // Clear the input value to allow re-selecting the same file(s)
      event.target.value = '';
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
      onFilesChange(Array.from(event.dataTransfer.files));
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

  const hasFiles = imagePreviews.length > 0;

  return (
    <div 
      onClick={hasFiles ? undefined : handleContainerClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`relative flex items-center justify-center p-4 border-2 border-dashed rounded-lg bg-slate-900/50 transition-colors duration-300 min-h-[200px] ${isDragging ? 'border-indigo-500' : 'border-slate-600'} ${!hasFiles && 'cursor-pointer hover:bg-slate-900'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        multiple
      />
      {hasFiles ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full">
            {imagePreviews.map((src, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-md border border-slate-700">
                    <img
                        src={src}
                        alt={`preview ${index}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center pointer-events-none text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-500 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <p className="text-base text-slate-400">
            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-slate-500">PNG, JPG, or WEBP</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;