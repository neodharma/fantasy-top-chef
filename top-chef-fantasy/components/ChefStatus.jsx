// components/ChefStatus.jsx
import React from 'react';

const ChefStatus = ({ status }) => {
  // Define styles and text based on status
  let bgColor, textColor, statusText;
  
  switch (status) {
    case 'lck':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      statusText = 'LCK';
      break;
    case 'eliminated':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      statusText = 'Eliminated';
      break;
    default: // active
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      statusText = 'Active';
  }
  
  return (
    <span className={`inline-block px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs`}>
      {statusText}
    </span>
  );
};

export default ChefStatus;