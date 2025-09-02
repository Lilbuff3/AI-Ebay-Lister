import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="mt-8 bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
      <strong className="font-bold block mb-1">An Error Occurred</strong>
      <span className="block">{message}</span>
    </div>
  );
};

export default ErrorMessage;
