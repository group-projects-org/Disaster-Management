import React, { useState, useRef } from 'react';
import { Camera, MapPin, AlertTriangle, User, MessageSquare, Send, X, Mic, MicOff } from 'lucide-react';
import LocationPicker from './LocationPicker';
import VoiceRecorder from './VoiceRecorder';

const ReportForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    reporterName: '',
    message: '',
    latitude: '',
    longitude: '',
    severity: 'medium',
    disasterType: 'other'
  });
  
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceNote, setVoiceNote] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  };

  const handleVoiceNote = (audioBlob) => {
    setVoiceNote(audioBlob);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const submitData = new FormData();
      submitData.append('reporter', formData.reporterName);
      submitData.append('latitude', parseFloat(formData.latitude));
      submitData.append('longitude', parseFloat(formData.longitude));
      submitData.append('severity', formData.severity);
      submitData.append('disaster_type', formData.disasterType);
      
      if (selectedPhoto) {
        submitData.append('photo', selectedPhoto);
      }
      
      if (voiceNote) {
        submitData.append('voice_note', voiceNote, 'voice_note.webm');
      }

      const response = await fetch("http://127.0.0.1:8000/report", {
        method: "POST",
        body: submitData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit report");
      }
  
      const result = await response.json();
      console.log("Report submitted:", result);
  
      onSubmitSuccess({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        photo: selectedPhoto,
        voiceNote: voiceNote,
        timestamp: new Date().toISOString()
      });

    
      setFormData({
        reporterName: "",
        message: "",
        latitude: "",
        longitude: "",
        severity: "medium",
        disasterType: "other",
      });
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setVoiceNote(null);
  
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-section">
      <div className="form-card">
        <div className="form-header">
          <h2 className="form-title">Submit New Disaster Report</h2>
          <p className="form-description">
            Help emergency responders by reporting disasters in your area with photos and detailed information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          

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


          <div className="form-section">
            <h3 className="section-title">Voice Message (Optional)</h3>
            <p className="section-description">
              Record a voice message if typing is difficult or for additional details
            </p>
            <VoiceRecorder onVoiceRecorded={handleVoiceNote} />
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

            {/* Map Preview */}
            {formData.latitude && formData.longitude && (
              <LocationPicker 
                latitude={parseFloat(formData.latitude)}
                longitude={parseFloat(formData.longitude)}
                onLocationSelect={handleLocationSelect}
              />
            )}
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
  );
};

export default ReportForm;