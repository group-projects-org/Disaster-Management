import { useState, useRef } from 'react';
import { Camera, MapPin, AlertTriangle, User, MessageSquare, Send, X, CheckCircle, Eye, Clock } from 'lucide-react';
import './../CSS/Reports.css';

const Reports = () => {
  const [formData, setFormData] = useState({reporterName: '', reporterId: '', message: '', latitude: '', longitude: '', severity: 'medium', disasterType: 'other' });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const fileInputRef = useRef(null);
  const existingReports = [
    {
      id: 1,
      reporterName: 'John Smith',
      reporterId: 'RPT001',
      message: 'Severe flooding in downtown area. Water levels rising rapidly. Multiple cars stranded.',
      location: { lat: 40.7128, lng: -74.0060, address: 'Manhattan, NY' },
      severity: 'high',
      disasterType: 'flood',
      timestamp: '2025-08-16T10:30:00Z',
      status: 'verified',
      photo: '🌊'
    },
    {
      id: 2,
      reporterName: 'Sarah Johnson',
      reporterId: 'RPT002',
      message: 'Wildfire spotted near residential area. Smoke visible from highway. Immediate attention needed.',
      location: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
      severity: 'critical',
      disasterType: 'wildfire',
      timestamp: '2025-08-15T15:45:00Z',
      status: 'investigating',
      photo: '🔥'
    },
    {
      id: 3,
      reporterName: 'Mike Davis',
      reporterId: 'RPT003',
      message: 'Minor earthquake felt in office building. No visible damage but people evacuated as precaution.',
      location: { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
      severity: 'low',
      disasterType: 'earthquake',
      timestamp: '2025-08-15T09:20:00Z',
      status: 'resolved',
      photo: '🏚️'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        (error) => {
          alert('Unable to get your location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
  
    try {
      // Call FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reporter: formData.reporterName,  // required
    text: formData.message,           // required
    latitude: parseFloat(formData.latitude),   
    longitude: parseFloat(formData.longitude), // required, ensure it's a number

        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit report");
      }
  
      const result = await response.json();
      console.log("Prediction result:", result);
  
      // Reset form
      setFormData({
        reporterName: "",
        reporterId: "",
        message: "",
        latitude: "",
        longitude: "",
        severity: "medium",
        disasterType: "other",
      });
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setSubmitSuccess(true);
  
      setTimeout(() => setSubmitSuccess(false), 3000);
  
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const getSeverityClass = (severity) => {
    return `severity-${severity}`;
  };

  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  const getDisasterIcon = (type) => {
    const icons = {
      earthquake: '🏚️',
      flood: '🌊',
      wildfire: '🔥',
      hurricane: '🌀',
      tornado: '🌪️',
      landslide: '⛰️',
      other: '⚠️'
    };
    return icons[type] || '⚠️';
  };

  return (
    <div className="reports-container">
      <div className="reports-content">
        
        {/* Header */}
        <div className="reports-header">
          <div>
            <h1 className="reports-title">Disaster Reports</h1>
            <p className="reports-subtitle">Submit and track disaster reports in your area</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            <Send className="tab-icon" />
            Submit New Report
          </button>
          <button 
            className={`nav-tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            <Eye className="tab-icon" />
            View Reports
          </button>
        </div>

        {/* Submit Report Form */}
        {activeTab === 'submit' && (
          <div className="submit-section">
            <div className="form-card">
              <div className="form-header">
                <h2 className="form-title">Submit New Disaster Report</h2>
                <p className="form-description">
                  Help emergency responders by reporting disasters in your area with photos and detailed information.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="report-form">
                
                {/* Reporter Information */}
                <div className="form-section">
                  <h3 className="section-title">Reporter Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <User className="label-icon" />
                        Reporter Name *
                      </label>
                      <input
                        type="text"
                        name="reporterName"
                        value={formData.reporterName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Reporter ID (Optional)
                      </label>
                      <input
                        type="text"
                        name="reporterId"
                        value={formData.reporterId}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., Employee ID, Badge Number"
                      />
                    </div>
                  </div>
                </div>

                {/* Disaster Details */}
                <div className="form-section">
                  <h3 className="section-title">Disaster Details</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <AlertTriangle className="label-icon" />
                        Disaster Type *
                      </label>
                      <select
                        name="disasterType"
                        value={formData.disasterType}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                      >
                        <option value="earthquake">Earthquake</option>
                        <option value="flood">Flood</option>
                        <option value="wildfire">Wildfire</option>
                        <option value="hurricane">Hurricane</option>
                        <option value="tornado">Tornado</option>
                        <option value="landslide">Landslide</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Severity Level *
                      </label>
                      <select
                        name="severity"
                        value={formData.severity}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                      >
                        <option value="low">Low - Minor impact</option>
                        <option value="medium">Medium - Moderate impact</option>
                        <option value="high">High - Significant impact</option>
                        <option value="critical">Critical - Life threatening</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <MessageSquare className="label-icon" />
                      Detailed Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Describe the disaster situation, damages, people affected, immediate needs, etc."
                      rows={4}
                      required
                    />
                    <div className="character-count">
                      {formData.message.length}/500 characters
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="form-section">
                  <h3 className="section-title">Location Information</h3>
                  
                  <div className="location-header">
                    <p className="location-description">
                      Provide the exact location where the disaster is occurring
                    </p>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="location-btn"
                    >
                      <MapPin className="btn-icon" />
                      Use My Location
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <MapPin className="label-icon" />
                        Latitude *
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 40.7128"
                        step="any"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Longitude *
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., -74.0060"
                        step="any"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="form-section">
                  <h3 className="section-title">Photo Evidence</h3>
                  <p className="section-description">
                    Upload a photo to help emergency responders assess the situation
                  </p>

                  <div className="photo-upload-area">
                    {!photoPreview ? (
                      <div className="upload-placeholder">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="file-input"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="upload-label">
                          <Camera className="upload-icon" />
                          <div className="upload-text">
                            <span className="upload-title">Click to upload photo</span>
                            <span className="upload-subtitle">PNG, JPG up to 10MB</span>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="photo-preview">
                        <img src={photoPreview} alt="Report" className="preview-image" />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="remove-photo-btn"
                        >
                          <X className="remove-icon" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner"></div>
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <Send className="btn-icon" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Reports */}
        {activeTab === 'view' && (
          <div className="view-section">
            <div className="reports-list-card">
              <div className="list-header">
                <h2 className="list-title">Recent Reports</h2>
                <p className="list-description">
                  Track the status of submitted disaster reports
                </p>
              </div>

              <div className="reports-list">
                {existingReports.map((report) => (
                  <div key={report.id} className="report-item">
                    <div className="report-header">
                      <div className="report-info">
                        <div className="report-icon">{getDisasterIcon(report.disasterType)}</div>
                        <div className="report-details">
                          <h4 className="report-type">{report.disasterType}</h4>
                          <p className="report-location">{report.location.address}</p>
                        </div>
                      </div>
                      <div className="report-badges">
                        <span className={`severity-badge ${getSeverityClass(report.severity)}`}>
                          {report.severity.toUpperCase()}
                        </span>
                        <span className={`status-badge ${getStatusClass(report.status)}`}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="report-content">
                      <p className="report-message">{report.message}</p>
                      <div className="report-meta">
                        <div className="meta-item">
                          <User className="meta-icon" />
                          {report.reporterName} ({report.reporterId})
                        </div>
                        <div className="meta-item">
                          <Clock className="meta-icon" />
                          {new Date(report.timestamp).toLocaleString()}
                        </div>
                        <div className="meta-item">
                          <MapPin className="meta-icon" />
                          {report.location.lat}, {report.location.lng}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="success-overlay">
            <div className="success-message">
              <CheckCircle className="success-icon" />
              <h3>Report Submitted Successfully!</h3>
              <p>Your disaster report has been received and will be reviewed by emergency responders.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;