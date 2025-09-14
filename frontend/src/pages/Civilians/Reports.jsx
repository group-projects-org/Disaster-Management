import { useState } from 'react';
import ReportForm from './ReportForm';
import SOSButton from './SOSButton';
import Header from '../../components/Header';
import { CheckCircle } from 'lucide-react';
import './CSS/Reports.css';
import './CSS/ReportForm.css';
import './CSS/SOSButton.css';
import './CSS/SuccessMessage.css';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Reports = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);

  const handleReportSubmitSuccess = (reportData) => {
    setLastSubmittedReport(reportData);
    setSubmitSuccess(true);
  };

  return (
      <>
        <Header section="SOS" />
        <div className="reports-content">
          <div className="reports-header">
              <h1 className="reports-title">Disaster Reports</h1>
              <p className="reports-subtitle">Submit and track disaster reports in your area</p>
              <center><div className='Emg-Buttons' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px',  margin: '0', width: '100%', maxWidth: '350px'}}>
                <SOSButton lastReport={lastSubmittedReport} />
                <div className="emergency-button" onClick={() => window.open("tel:112")}> EMERGENCY CALL 112 </div>
              </div> </center>
          </div>
          <ReportForm onSubmitSuccess={handleReportSubmitSuccess} />
          {submitSuccess && (
            <div className="success-overlay">
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <h3 className="success-title">Report Submitted Successfully!</h3>
                <p className="success-text">Your disaster report has been received and will be reviewed by emergency responders. The SOS button is now active for emergencies.</p>
              </div>
            </div>
          )} 
        </div>
    </>
  );
};

export default Reports;