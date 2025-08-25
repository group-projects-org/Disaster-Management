import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, Phone } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_API_URL;

const SOSButton = ({ enabled, lastReport }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const countdownRef = useRef(null);

  const onSOSActivate = async () => {
    try {
      const submitData = new FormData();
      submitData.append('reporter', lastReport.reporter);
      submitData.append('text', lastReport.message);
      submitData.append('latitude', lastReport.latitude);
      submitData.append('longitude', lastReport.longitude);
      submitData.append('severity', 'critical');
      submitData.append('isSOSAlert', true);
      submitData.append('timestamp', new Date().toISOString());

      const response = await fetch(`${BASE_URL}/sos`, { method: "POST", body: submitData });
      if (!response.ok) { throw new Error("Failed to send SOS alert"); }
      const result = await response.json();
      console.log("SOS Alert sent:", result);
      alert("SOS Alert sent successfully! Emergency responders have been notified.");
    } catch (error) {
      console.error("Error sending SOS:", error);
      alert("Error sending SOS alert. Please try again or contact emergency services directly.");
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: new Date().toISOString() });
          }, (error) => { reject(error); },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
        );
      } else { reject(new Error('Geolocation not supported')); }
    });
  };

  const handleSOSClick = async () => {
    if (!enabled) {
      alert('Please submit a disaster report first to enable the SOS function.'); return; }

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.warn('Could not get current location:', error);
      if (lastReport && lastReport.latitude && lastReport.longitude) {
        setCurrentLocation({
          latitude: lastReport.latitude,
          longitude: lastReport.longitude,
          timestamp: new Date().toISOString(),
          fromLastReport: true
        });
      }
    }

    setShowConfirmation(true);
    setCountdown(10);
    setIsAutoSending(true);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          confirmSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmSOS = async () => {
    clearInterval(countdownRef.current);
    setIsAutoSending(false);
    setShowConfirmation(false);

    const sosData = {
      currentLocation,
      autoSent: countdown === 0,
      emergencyType: 'SOS_ALERT',
      message: ` EMERGENCY SOS ALERT - Immediate assistance needed! ${lastReport?.message || 'Emergency situation reported.'}`,
      severity: 'critical'
    };

    await onSOSActivate(sosData);
  };

  const cancelSOS = () => {
    clearInterval(countdownRef.current);
    setCountdown(0);
    setIsAutoSending(false);
    setShowConfirmation(false);
    setCurrentLocation(null);
  };

  const handlePhoneCall = (phoneNumber, serviceName) => {
    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i)) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      if (confirm(`Call ${serviceName} at ${phoneNumber}?`)) {
        window.location.href = `tel:${phoneNumber}`;
      }
    }
  };
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  if (!enabled) {
    return (
      <div className="sos-button-container">
        <button className="sos-button disabled" disabled>
          <AlertTriangle className="sos-icon" />
          <span className="sos-text">SOS</span>
          <span className="sos-subtext">Submit report first</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="sos-button-container">
        <button 
          className="sos-button active" 
          onClick={handleSOSClick}
          disabled={showConfirmation}
        >
          <AlertTriangle className="sos-icon" />
          <span className="sos-text">SOS</span>
          <span className="sos-subtext">Emergency</span>
        </button>
      </div>

      {showConfirmation && (
        <div className="sos-confirmation-overlay">
          <div className="sos-confirmation-modal">
            <div className="sos-confirmation-header">
              <AlertTriangle className="sos-confirmation-icon" />
              <h2 className="sos-confirmation-title">Emergency SOS Alert</h2>
            </div>

            <div className="sos-confirmation-content">
              <p className="sos-confirmation-message">
                Are you sure you want to send an emergency SOS alert? This will immediately notify emergency responders.
              </p>

              {isAutoSending && (
                <div className="sos-auto-send-warning">
                  <div className="countdown-circle">
                    <div className="countdown-number">{countdown}</div>
                  </div>
                  <p>Auto-sending in {countdown} seconds...</p>
                </div>
              )}

              {currentLocation && (
                <div className="sos-location-info">
                  <MapPin className="location-icon" />
                  <div className="location-details">
                    <p><strong>Current Location:</strong></p>
                    <p>Lat: {currentLocation.latitude.toFixed(6)}</p>
                    <p>Lng: {currentLocation.longitude.toFixed(6)}</p>
                    {currentLocation.accuracy && (
                      <p className="location-accuracy">Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                    )}
                    {currentLocation.fromLastReport && (
                      <p className="location-note">Using last reported location</p>
                    )}
                  </div>
                </div>
              )}

              <div className="emergency-contacts">
                <h4>In immediate danger? Call directly:</h4>
                <div className="emergency-numbers">
                  <button 
                    className="emergency-call"
                    onClick={() => handlePhoneCall('911', 'Emergency Services')}
                  >
                    <Phone className="phone-icon" />
                    911 - Emergency
                  </button>
                  <button 
                    className="emergency-call"
                    onClick={() => handlePhoneCall('108', 'Ambulance Services')}
                  >
                    <Phone className="phone-icon" />
                    108 - Ambulance (India)
                  </button>
                  <button 
                    className="emergency-call"
                    onClick={() => handlePhoneCall('100', 'Police')}
                  >
                    <Phone className="phone-icon" />
                    100 - Police
                  </button>
                  <button 
                    className="emergency-call"
                    onClick={() => handlePhoneCall('101', 'Fire Department')}
                  >
                    <Phone className="phone-icon" />
                    101 - Fire Department
                  </button>
                  <button 
                    className="emergency-call"
                    onClick={() => handlePhoneCall('112', 'Emergency (EU)')}
                  >
                    <Phone className="phone-icon" />
                    112 - Emergency (EU)
                  </button>
                  <button 
                    className="emergency-call"
                    onClick={() => handlePhoneCall('999', 'Emergency (UK)')}
                  >
                    <Phone className="phone-icon" />
                    999 - Emergency (UK)
                  </button>
                </div>
                <p className="emergency-note">
                  <strong>Note:</strong> Click any number above to initiate an emergency call. 
                  On mobile devices, this will open your phone app directly.
                </p>
              </div>
            </div>

            <div className="sos-confirmation-actions">
              <button 
                className="sos-confirm-btn"
                onClick={confirmSOS}
              >
                <AlertTriangle className="btn-icon" />
                Send SOS Now
              </button>
              <button 
                className="sos-cancel-btn"
                onClick={cancelSOS}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;