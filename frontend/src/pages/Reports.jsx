import React, { useState, useRef } from 'react';
import { Send, Eye } from 'lucide-react';
import ReportForm from './ReportForm';
import SOSButton from './SOSButton';
import SuccessMessage from './SuccessMessage';
import '../CSS/Reports.css';
import '../CSS/ReportForm.css';
import '../CSS/SOSButton.css';
import '../CSS/SuccessMessage.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sosEnabled, setSosEnabled] = useState(false);
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);
   const [existingReports, setExistingReports] = useState([]);

  const handleReportSubmitSuccess = (reportData) => {
    setLastSubmittedReport(reportData);
    setSosEnabled(true);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleSOSActivate = async (sosData) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...lastSubmittedReport,
          ...sosData,
          severity: 'critical',
          isSOSAlert: true,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send SOS alert");
      }

      const result = await response.json();
      console.log("SOS Alert sent:", result);
      
      
      alert("SOS Alert sent successfully! Emergency responders have been notified.");
      
    } catch (error) {
      console.error("Error sending SOS:", error);
      alert("Error sending SOS alert. Please try again or contact emergency services directly.");
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-content">
        
        <div className="reports-header">
          <div>
            <h1 className="reports-title">Disaster Reports</h1>
            <p className="reports-subtitle">Submit and track disaster reports in your area</p>
          </div>
        </div>

       
        <div className="nav-tabs">
          
        </div>
        
        {activeTab === 'submit' && (
          <ReportForm onSubmitSuccess={handleReportSubmitSuccess} />
        )}
        
        {submitSuccess && (
          <SuccessMessage 
            title="Report Submitted Successfully!"
            message="Your disaster report has been received and will be reviewed by emergency responders. The SOS button is now active for emergencies."
          />
        )}

        <SOSButton 
          enabled={sosEnabled} 
          onSOSActivate={handleSOSActivate}
          lastReport={lastSubmittedReport}
        />

      </div>
    </div>
  );
};

export default Reports;