import React from 'react';

const ErrorMessage = ({ message, onRetry, showConfigHelp = false }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className="fa fa-exclamation-triangle text-red-400"></i>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Something went wrong
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          
          {showConfigHelp && (
            <div className="mt-3 text-sm text-red-700">
              <p className="font-medium">Setup Instructions:</p>
              <ol className="mt-1 list-decimal list-inside space-y-1">
                <li>Copy <code>.env.example</code> to <code>.env</code></li>
                <li>Get your API keys from the respective services</li>
                <li>Add your API keys to the <code>.env</code> file</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}
          
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;