import React from 'react';

const EmptyState = ({ 
  icon = 'fa-info-circle', 
  title = 'No data available', 
  description = 'There is no data to display at the moment.',
  action = null 
}) => {
  return (
    <div className="text-center py-8 px-4">
      <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
        <i className={`fa ${icon} text-4xl`}></i>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;