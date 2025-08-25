import { useState } from 'react';
import ReportForm from './ReportForm';
import SOSButton from './SOSButton';
import Header from '../../components/Header';
import { CheckCircle } from 'lucide-react';
import './CSS/Reports.css';
import './CSS/ReportForm.css';
import './CSS/SOSButton.css';
import './CSS/SuccessMessage.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const Reports = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sosEnabled, setSosEnabled] = useState(false);
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);

  const handleReportSubmitSuccess = (reportData) => {
    setLastSubmittedReport(reportData);
    setSosEnabled(true);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
      <>
        <Header section="SOS" />
        <div className="reports-content">
          <div className="reports-header">
              <h1 className="reports-title">Disaster Reports</h1>
              <p className="reports-subtitle">Submit and track disaster reports in your area</p>
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
          <SOSButton enabled={sosEnabled} lastReport={lastSubmittedReport} />
        </div>
    </>
  );
};

export default Reports;