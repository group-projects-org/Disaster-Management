import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessMessage = ({ title, message }) => {
  return (
    <div className="success-overlay">
      <div className="success-message">
        <CheckCircle className="success-icon" />
        <h3 className="success-title">{title}</h3>
        <p className="success-text">{message}</p>
      </div>
    </div>
  );
};

export default SuccessMessage;