import { useEffect, useState } from "react";
import "./CSS/SOSDashboard.css";
import SOSMap from "./SOSMap"; 
<<<<<<< HEAD
import SOSSupply from "./SOSSupply"
import Activate from "./Activate"
=======
import SOSSupply from "./SOSSupply";
import Reports from "./Reports";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
>>>>>>> eb02bfd (Rescue Agency Part Update)

export default function GovtDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [agencyToUpdate, setAgencyToUpdate] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    name: '',
    type: '',
    location: '',
    contactPerson: '',
    contactNumber: '',
    emergencyContact: '',
    city: '',
    district: '',
    state: '',
    licenseNumber: '',
    specialization: '',
    latitude: null,
    longitude: null
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/sos");
      const data = await res.json();
      
      if (data && data.data) {
        console.log('📡 Fetched SOS alerts:', data.data.length);
        setAlerts(data.data);
      } else {
        console.log('📡 No SOS alerts data received');
        setAlerts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching alerts:", error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  // Define fetchAgencies function first
  const [agencies, setAgencies] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);

  const fetchAgencies = async () => {
    setAgenciesLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/rescue-agencies/`);
      if (response.ok) {
        const result = await response.json();
        setAgencies(result.agencies || []);
      } else {
        console.error('Failed to fetch agencies');
        setAgencies([]);
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      setAgencies([]);
    } finally {
      setAgenciesLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAlerts();
<<<<<<< HEAD
    const interval = setInterval(fetchAlerts, 10000);
=======
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing SOS alerts...');
      fetchAlerts();
    }, 10000);
    
>>>>>>> eb02bfd (Rescue Agency Part Update)
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "severity-badge severity-critical";
      case "high":
        return "severity-badge severity-high";
      case "medium":
        return "severity-badge severity-medium";
      case "low":
        return "severity-badge severity-low";
      default:
        return "severity-badge severity-unknown";
    }
  };

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAlert(null);
  };

  const closeAgencyModal = () => {
    setShowAgencyModal(false);
    setSelectedAgency(null);
  };

  const handleUpdateAgency = (agency) => {
    setAgencyToUpdate(agency);
    setUpdateForm({
      name: agency.name || '',
      type: agency.type || '',
      location: agency.location || '',
      contactPerson: agency.contactPerson || '',
      contactNumber: agency.contactNumber || '',
      emergencyContact: agency.emergencyContact || '',
      city: agency.city || '',
      district: agency.district || '',
      state: agency.state || '',
      licenseNumber: agency.licenseNumber || '',
      specialization: agency.specialization || '',
      latitude: agency.latitude || null,
      longitude: agency.longitude || null
    });
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setAgencyToUpdate(null);
    setUpdateForm({
      name: '',
      type: '',
      location: '',
      contactPerson: '',
      contactNumber: '',
      emergencyContact: '',
      city: '',
      district: '',
      state: '',
      licenseNumber: '',
      specialization: '',
      latitude: null,
      longitude: null
    });
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!agencyToUpdate?.id) {
      alert('No agency ID found for update');
      return;
    }

    try {
      const updateData = {
        name: updateForm.name,
        type: updateForm.type,
        location: updateForm.location,
        contactPerson: updateForm.contactPerson,
        contactNumber: updateForm.contactNumber,
        emergencyContact: updateForm.emergencyContact,
        city: updateForm.city,
        district: updateForm.district,
        state: updateForm.state,
        licenseNumber: updateForm.licenseNumber,
        specialization: updateForm.specialization,
        latitude: updateForm.latitude ? parseFloat(updateForm.latitude) : null,
        longitude: updateForm.longitude ? parseFloat(updateForm.longitude) : null
      };

      const response = await fetch(`${BASE_URL}/rescue-agencies/${agencyToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert('Agency details updated successfully!');
        closeUpdateModal();
        fetchAgencies(); // Refresh the agencies list
      } else {
        const error = await response.json();
        alert(`Failed to update agency: ${error.detail}`);
      }
    } catch (error) {
      alert('Error updating agency. Please try again.');
    }
  };

  const handleViewAgencyDetails = (agency) => {
    setSelectedAgency(agency);
    setShowAgencyModal(true);
  };

  const handleApproveAgency = async (agencyId) => {
    try {
      const response = await fetch(`${BASE_URL}/rescue-agencies/${agencyId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh agencies list
        fetchAgencies();
        alert('Agency approved successfully!');
      } else {
        const error = await response.json();
        alert(`Error approving agency: ${error.detail}`);
      }
    } catch (error) {
        alert('Error approving agency. Please try again.');
    }
  };

  const handleRejectAgency = async (agencyId) => {
    try {
      const response = await fetch(`${BASE_URL}/rescue-agencies/${agencyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh agencies list
        fetchAgencies();
        alert('Agency rejected and removed successfully!');
      } else {
        const error = await response.json();
        alert(`Error rejecting agency: ${error.detail}`);
      }
    } catch (error) {
        alert('Error rejecting agency. Please try again.');
    }
  };

  // Initialize map when agencies data changes
  useEffect(() => {
    if (agencies.length > 0 && activeNav === 'agencies') {
      // Clear any existing map first
      if (window.agenciesMap) {
        window.agenciesMap.remove();
        window.agenciesMap = null;
      }
      if (window.agencyMarkers) {
        window.agencyMarkers.clear();
      }
      initializeAgenciesMap();
    }
  }, [agencies, activeNav]);

  // Real-time location tracking - refresh every 15 seconds
  useEffect(() => {
    let locationInterval;
    
    if (activeNav === 'agencies' && agencies.length > 0) {
      // Set up real-time location updates
      locationInterval = setInterval(() => {
        console.log('🔄 Refreshing live locations...');
        updateLiveLocations();
      }, 15000); // Update every 15 seconds
    }

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [activeNav, agencies]);

  // Function to initialize the agencies map
  const initializeAgenciesMap = () => {
    try {
      // Check if Leaflet is available
      if (typeof L === 'undefined') {
        console.error('Leaflet is not loaded');
        return;
      }

      // Check if map container exists
      const mapContainer = document.getElementById('agencies-map');
      if (!mapContainer) {
        console.log('Map container not found');
        return;
      }

      // Check if map is already initialized
      if (window.agenciesMap) {
        console.log('Map already initialized, removing old instance');
        window.agenciesMap.remove();
        window.agenciesMap = null;
      }

      // Clear previous map content
      mapContainer.innerHTML = '';

      // Create map using Leaflet
      const map = L.map('agencies-map').setView([28.7041, 77.1025], 8); // Default to Delhi area

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Store map reference globally
      window.agenciesMap = map;
      
      // Add live location tracking controls
      addLiveTrackingControls(map);
      
      // Add markers for each agency
      addAgencyMarkers(map);
      
      // Fit map bounds to show all markers
      fitMapToMarkers(map);
      
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Function to add live tracking controls
  const addLiveTrackingControls = (map) => {
    // Live tracking status indicator
    const liveStatusControl = L.control({ position: 'topright' });
    
          liveStatusControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'live-tracking-control');
        div.innerHTML = `
          <div class="live-status">
            <span class="live-indicator">🟢</span>
            <span class="live-text">LIVE TRACKING ACTIVE</span>
            <div class="last-update">Last: ${new Date().toLocaleTimeString()}</div>
          </div>
        `;
        return div;
      };
    
    liveStatusControl.addTo(map);
  };

  // Function to add agency markers with live tracking
  const addAgencyMarkers = (map) => {
    if (!window.agencyMarkers) {
      window.agencyMarkers = new Map();
    }

    agencies.forEach((agency) => {
      if (agency.latitude && agency.longitude) {
        // Create custom icon for live tracking
        const customIcon = L.divIcon({
          className: 'live-agency-marker',
          html: `
            <div class="marker-content">
              <div class="marker-pulse"></div>
              <div class="marker-icon">🚨</div>
              <div class="marker-label">${agency.name}</div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([agency.latitude, agency.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div class="map-popup live-popup">
              <h4>🏢 ${agency.name}</h4>
              <p><strong>Type:</strong> ${agency.type}</p>
              <p><strong>Location:</strong> ${agency.location || agency.city || 'N/A'}</p>
              <p><strong>Contact:</strong> ${agency.contactPerson}</p>
              <p><strong>Status:</strong> ${agency.resources?.availability || 'Unknown'}</p>
              <div class="live-info">
                <p><strong>📍 Live Coordinates:</strong> ${agency.latitude.toFixed(6)}, ${agency.longitude.toFixed(6)}</p>
                <p><strong>🕒 Last Updated:</strong> ${agency.last_updated ? new Date(agency.last_updated).toLocaleTimeString() : 'Unknown'}</p>
              </div>
              <div class="map-popup-actions">
                <button onclick="window.handleViewAgencyFromMap('${agency.id}')" class="map-popup-btn">
                  View Details
                </button>
                <button onclick="window.handleUpdateAgencyFromMap('${agency.id}')" class="map-popup-btn update-btn">
                  ✏️ Update
                </button>
              </div>
            </div>
          `);

        // Store marker reference for live updates
        window.agencyMarkers.set(agency.id, {
          marker: marker,
          agency: agency,
          lastPosition: [agency.latitude, agency.longitude]
        });

        // Add click event to marker
        marker.on('click', () => {
          window.currentMapAgency = agency;
        });
      }
    });
  };

  // Function to fit map to show all markers
  const fitMapToMarkers = (map) => {
    const markers = agencies
      .filter(agency => agency.latitude && agency.longitude)
      .map(agency => [agency.latitude, agency.longitude]);

    if (markers.length > 0) {
      map.fitBounds(markers);
    }
  };

  // Function to update live locations
  const updateLiveLocations = async () => {
    try {
      // Fetch latest agency data
      const response = await fetch(`${BASE_URL}/rescue-agencies/`);
      if (response.ok) {
        const result = await response.json();
        const updatedAgencies = result.agencies || [];
        
        // Update markers with new positions
        updatedAgencies.forEach((updatedAgency) => {
          const markerData = window.agencyMarkers?.get(updatedAgency.id);
          if (markerData && updatedAgency.latitude && updatedAgency.longitude) {
            const newPosition = [updatedAgency.latitude, updatedAgency.longitude];
            const oldPosition = markerData.lastPosition;
            
            // Check if position changed
            if (oldPosition && (oldPosition[0] !== newPosition[0] || oldPosition[1] !== newPosition[1])) {
              // Position changed - animate movement
              markerData.marker.setLatLng(newPosition);
              
              // Add movement trail
              if (window.agencyMarkers) {
                const trail = L.polyline([oldPosition, newPosition], {
                  color: '#ff4444',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '5, 5'
                }).addTo(window.agenciesMap);
                
                // Remove trail after 10 seconds
                setTimeout(() => {
                  window.agenciesMap.removeLayer(trail);
                }, 10000);
              }
              
              console.log(`🔄 ${updatedAgency.name} moved to new position`);
            }
            
            // Update last position
            markerData.lastPosition = newPosition;
            markerData.agency = updatedAgency;
          }
        });
        
        // Update last refresh time
        updateLiveStatus();
      }
    } catch (error) {
      console.error('Error updating live locations:', error);
    }
  };

  // Function to update live status display
  const updateLiveStatus = () => {
    const liveStatusElement = document.querySelector('.live-status');
    if (liveStatusElement) {
      const lastUpdateElement = liveStatusElement.querySelector('.last-update');
      if (lastUpdateElement) {
        lastUpdateElement.textContent = `Last: ${new Date().toLocaleTimeString()}`;
      }
    }
  };

  // Global functions for map popup actions
  useEffect(() => {
    window.handleViewAgencyFromMap = (agencyId) => {
      const agency = agencies.find(a => a.id === agencyId);
      if (agency) {
        handleViewAgencyDetails(agency);
      }
    };

    window.handleUpdateAgencyFromMap = (agencyId) => {
      const agency = agencies.find(a => a.id === agencyId);
      if (agency) {
        handleUpdateAgency(agency);
      }
    };

    return () => {
      // Cleanup global functions
      delete window.handleViewAgencyFromMap;
      delete window.handleUpdateAgencyFromMap;
      delete window.currentMapAgency;
    };
  }, [agencies]);

  // Cleanup map when switching away from agencies tab
  useEffect(() => {
    if (activeNav !== 'agencies') {
      // Clean up map when not on agencies tab
      if (window.agenciesMap) {
        console.log('Cleaning up map - switching away from agencies tab');
        window.agenciesMap.remove();
        window.agenciesMap = null;
      }
      if (window.agencyMarkers) {
        window.agencyMarkers.clear();
      }
    }
  }, [activeNav]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Destroy map if exists
      if (window.agenciesMap) {
        console.log('Cleaning up map - component unmounting');
        window.agenciesMap.remove();
        window.agenciesMap = null;
      }
      if (window.agencyMarkers) {
        window.agencyMarkers.clear();
      }
    };
  }, []);

  const renderAgenciesDashboard = () => {

    return (
      <>
        <div className="govt-page-header">
          <h2 className="govt-page-title">RESCUE AGENCIES COORDINATION</h2>
          <p className="govt-page-subtitle">
            Monitor and coordinate with registered rescue agencies | Last Updated: {new Date().toLocaleString()}
            <button 
              className="govt-refresh-btn"
              onClick={fetchAgencies}
              disabled={agenciesLoading}
            >
              {agenciesLoading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </p>
        </div>

        {/* Agencies Map View */}
        <div className="govt-map-section">
          <div className="map-header-controls">
            <div className="map-title-section">
              <h3 className="govt-section-title">🗺️ LIVE AGENCIES TRACKING MAP</h3>
              <p className="govt-section-subtitle">Real-time location tracking of all registered rescue agencies</p>
            </div>
            <div className="map-controls">
              <button 
                className="live-refresh-btn"
                onClick={updateLiveLocations}
                title="Refresh live locations"
              >
                🔄 Live Refresh
              </button>
              <div className="tracking-status">
                <span className="status-dot">🟢</span>
                <span>Live Tracking Active</span>
              </div>
            </div>
          </div>
          
          <div className="agencies-map-container">
            <div id="agencies-map" className="agencies-map">
              {typeof L === 'undefined' && (
                <div className="map-fallback">
                  <p>🗺️ Map loading...</p>
                  <p>Please ensure Leaflet is properly loaded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending Approvals Section */}
        {agencies.filter(a => a.status === 'Pending').length > 0 && (
          <div className="pending-approvals">
            <h3 className="govt-section-title">PENDING AGENCY APPROVALS</h3>
            <div className="approval-cards">
              {agencies.filter(a => a.status === 'Pending').map(agency => (
                <div key={agency.id} className="approval-card">
                  <div className="approval-info">
                    <h4>{agency.name}</h4>
                    <div className="agency-details-grid">
                      <div className="detail-section">
                        <h5>🏢 Agency Information</h5>
                        <p><strong>Type:</strong> {agency.type}</p>
                        <p><strong>Status:</strong> {agency.status}</p>
                        <p><strong>License Number:</strong> {agency.licenseNumber || 'Not provided'}</p>
                        <p><strong>Specialization:</strong> {agency.specialization || 'Not specified'}</p>
                      </div>
                      
                      <div className="detail-section">
                        <h5>📍 Location Details</h5>
                        <p><strong>Address:</strong> {agency.location}</p>
                        <p><strong>City:</strong> {agency.city || 'Not provided'}</p>
                        <p><strong>District:</strong> {agency.district || 'Not provided'}</p>
                        <p><strong>State:</strong> {agency.state || 'Not provided'}</p>
                      </div>
                      
                      <div className="detail-section">
                        <h5>📞 Contact Information</h5>
                        <p><strong>Contact Person:</strong> {agency.contactPerson}</p>
                        <p><strong>Contact Number:</strong> {agency.contactNumber}</p>
                        <p><strong>Email:</strong> {agency.email}</p>
                        <p><strong>Emergency Contact:</strong> {agency.emergencyContact || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button 
                      onClick={() => handleApproveAgency(agency.id)}
                      className="btn-approve"
                    >
                      ✅ Approve
                    </button>
                    <button 
                      onClick={() => handleRejectAgency(agency.id)}
                      className="btn-reject"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="govt-summary-box">
          <h3 className="govt-summary-title">AGENCIES OVERVIEW</h3>
          <div className="govt-summary-grid">
            <div className="govt-summary-item">
              <strong>Total Agencies:</strong> {agencies.length}
            </div>
            <div className="govt-summary-item">
              <strong>Available:</strong> {agencies.filter(a => a.resources?.availability === 'Available').length}
            </div>
            <div className="govt-summary-item">
              <strong>On Mission:</strong> {agencies.filter(a => a.resources?.availability === 'On Mission').length}
            </div>
            <div className="govt-summary-item">
              <strong>Total Personnel:</strong> {agencies.reduce((sum, a) => sum + Object.values(a.resources?.personnel || {}).reduce((pSum, p) => pSum + (p || 0), 0), 0)}
            </div>
          </div>
        </div>

        <div className="govt-table-container">
          <div className="govt-table-header">REGISTERED RESCUE AGENCIES</div>
          
          <table className="govt-table">
            <thead>
              <tr>
                <th>AGENCY NAME</th>
                <th>TYPE</th>
                <th>LOCATION</th>
                <th>CONTACT PERSON</th>
                <th>CONTACT NUMBER</th>
                <th>STATUS</th>
                <th>RESOURCES</th>
                <th>RESPONSE TIME</th>
                <th>LAST UPDATED</th>
                <th className="center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {agenciesLoading ? (
                <tr>
                  <td colSpan="10" className="center">
                    <div className="loading-indicator">Loading agencies...</div>
                  </td>
                </tr>
              ) : agencies.length === 0 ? (
                <tr>
                  <td colSpan="10" className="center">
                    <div className="govt-no-data">
                      <p className="govt-no-data-title">NO AGENCIES REGISTERED</p>
                      <p className="govt-no-data-subtitle">
                        Rescue agencies can register through the Rescue Agencies Portal
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                agencies.map((agency) => (
                  <tr key={agency.id}>
                    <td>
                      <strong>{agency.name}</strong>
                    </td>
                    <td>
                      <span className="agency-type-badge">
                        {agency.type}
                      </span>
                    </td>
                    <td>{agency.location}</td>
                    <td>
                      <div><strong>{agency.contactPerson}</strong></div>
                    </td>
                    <td>
                      <div><strong>{agency.contactNumber}</strong></div>
                    </td>
                    <td>
                      <span className={`status-badge status-${agency.resources?.availability?.toLowerCase() || 'unknown'}`}>
                        {agency.resources?.availability || 'UNKNOWN'}
                      </span>
                    </td>
                    <td>
                      <div className="resource-summary">
                        <div>👥 {Object.values(agency.resources?.personnel || {}).reduce((sum, p) => sum + (p || 0), 0)} Staff</div>
                        <div>🚗 {Object.values(agency.resources?.vehicles || {}).reduce((sum, v) => sum + (v || 0), 0)} Vehicles</div>
                      </div>
                    </td>
                    <td className="response-time">
                      {agency.response_time || agency.resources?.estimated_response_time || 0} min
                    </td>
                    <td className="monospace">
                      {agency.last_updated ? new Date(agency.last_updated).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : 'N/A'}
                    </td>
                    <td className="center">
                      <div className="action-buttons">
                        <button 
                          className="govt-action-btn"
                          onClick={() => handleViewAgencyDetails(agency)}
                        >
                          View Details
                        </button>
                        <button 
                          className="govt-action-btn update-btn"
                          onClick={() => handleUpdateAgency(agency)}
                        >
                          ✏️ Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <>
            {/* Page Title */}
            <div className="govt-page-header">
              <h2 className="govt-page-title">SOS ALERT MONITORING DASHBOARD</h2>
                             <p className="govt-page-subtitle">
                 Real-time monitoring of emergency distress signals | Last Updated:{" "}
                 {new Date().toLocaleString()}
                 <button 
                   className="govt-refresh-btn"
                   onClick={fetchAlerts}
                   disabled={loading}
                   style={{ marginLeft: '20px' }}
                 >
                   {loading ? '🔄 Refreshing...' : '🔄 Manual Refresh'}
                 </button>
                 {loading && <span className="loading-indicator">● Refreshing...</span>}
               </p>
            </div>

            {/* Summary Box */}
            <div className="govt-summary-box">
              <h3 className="govt-summary-title">ALERT SUMMARY</h3>
              <div className="govt-summary-grid">
                <div className="govt-summary-item">
                  <strong>Total Alerts:</strong> {alerts.length}
                </div>
                <div className="govt-summary-item">
                  <strong>Critical:</strong>{" "}
                  {alerts.filter((a) => a.severity?.toLowerCase() === "critical").length}
                </div>
                <div className="govt-summary-item">
                  <strong>High Priority:</strong>{" "}
                  {alerts.filter((a) => a.severity?.toLowerCase() === "high").length}
                </div>
                <div className="govt-summary-item">
                  <strong>System Status:</strong>{" "}
                  <span className="status-operational">OPERATIONAL</span>
                </div>
              </div>
            </div>

            {/* Alerts Table */}
            <div className="govt-table-container">
              <div className="govt-table-header">EMERGENCY ALERTS REGISTRY</div>

              {alerts.length === 0 ? (
                <div className="govt-no-data">
                  <p className="govt-no-data-title">NO ACTIVE ALERTS REGISTERED</p>
                  <p className="govt-no-data-subtitle">
                    System is actively monitoring for emergency situations
                  </p>
                </div>
              ) : (
                <table className="govt-table">
                  <thead>
                    <tr>
                      <th>SL. NO.</th>
                      <th>SEVERITY LEVEL</th>
                      <th>REPORTER NAME</th>
                      <th>INCIDENT DESCRIPTION</th>
                      <th>COORDINATES</th>
                      <th>DATE & TIME</th>
                      <th className="center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert, index) => (
                      <tr key={index}>
                        <td className="serial-number">{String(index + 1).padStart(3, "0")}</td>
                        <td>
                          <span className={getSeverityClass(alert.severity)}>
                            {alert.severity || "UNKNOWN"}
                          </span>
                        </td>
                        <td>{alert.reporter || "NOT SPECIFIED"}</td>
                        <td>{alert.description || "NO DETAILS PROVIDED"}</td>
                        <td className="monospace">
                          {alert.latitude != null && alert.longitude != null
                            ? `${parseFloat(alert.latitude).toFixed(6)}, ${parseFloat(
                                alert.longitude
                              ).toFixed(6)}`
                            : "COORDINATES NOT AVAILABLE"}
                        </td>
                        <td className="monospace">
                          {alert.timestamp
                            ? new Date(alert.timestamp).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "TIME NOT RECORDED"}
                        </td>
                        <td className="center">
                          <button 
                            className="govt-action-btn" 
                            onClick={() => handleViewDetails(alert)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        );

      case "track":
        return <SOSMap />;

      case "supplies":
        return <SOSSupply />; // placeholder

      case "reports":
<<<<<<< HEAD
        return <Activate />
=======
        return <Reports />;

      case "agencies":
        return renderAgenciesDashboard();
>>>>>>> eb02bfd (Rescue Agency Part Update)

      default:
        return null;
    }
  };

  return (
    <div className="govt-container">
      {/* Government Header */}
      <div className="govt-header">
        <div className="govt-header-content">
        <img
  src="https://tse1.mm.bing.net/th/id/OIP.Uc7lmWjrvY3haMicb-mczgHaHZ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
  alt="Government Logo"
  className="govt-logo"
/>

          <div>
            <h1 className="govt-title">GOVERNMENT OF INDIA</h1>
            <h2 className="govt-subtitle">
              Ministry of Home Affairs - Emergency Response Division
            </h2>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="govt-nav">
        <div className="govt-nav-content">
          <button
            className={`govt-nav-item ${activeNav === "dashboard" ? "active" : ""}`}
            onClick={() => handleNavClick("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`govt-nav-item ${activeNav === "track" ? "active" : ""}`}
            onClick={() => handleNavClick("track")}
          >
            Track
          </button>
          <button
            className={`govt-nav-item ${activeNav === "supplies" ? "active" : ""}`}
            onClick={() => handleNavClick("supplies")}
          >
            Supplies
          </button>
          <button
            className={`govt-nav-item ${activeNav === "reports" ? "active" : ""}`}
            onClick={() => handleNavClick("reports")}
          >
            Activate Alert
          </button>
          <button
            className={`govt-nav-item ${activeNav === "agencies" ? "active" : ""}`}
            onClick={() => handleNavClick("agencies")}
          >
            Rescue Agencies
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="govt-breadcrumb">
        <div className="govt-breadcrumb-content">
          Home &gt; Emergency Services &gt;{" "}
          {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
        </div>
      </div>

      {/* Main Content */}
      <div className="govt-main">{renderContent()}</div>

      {/* Footer */}
      <div className="govt-footer">
        <p>© Government of India | Ministry of Home Affairs | Emergency Response Division</p>
        <p>
          This system is for official use only. Unauthorized access is prohibited under IT Act
          2000.
        </p>
        <p>For technical support contact: tech-support@mha.gov.in | Helpline: 1800-XXX-XXXX</p>
      </div>

             {/* View Details Modal */}
       {showDetailsModal && selectedAlert && (
         <div className="modal-overlay" onClick={closeDetailsModal}>
           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3>ALERT DETAILS</h3>
               <button className="modal-close" onClick={closeDetailsModal}>×</button>
             </div>
             
             <div className="modal-body">
               <div className="detail-section">
                 <h4>Basic Information</h4>
                 <div className="detail-grid">
                   <div className="detail-item">
                     <strong>Reporter:</strong> {selectedAlert.reporter || "NOT SPECIFIED"}
                   </div>
                   <div className="detail-item">
                     <strong>Severity:</strong> 
                     <span className={getSeverityClass(selectedAlert.severity)}>
                       {selectedAlert.severity || "UNKNOWN"}
                     </span>
                   </div>
                   <div className="detail-item">
                     <strong>Timestamp:</strong> {selectedAlert.timestamp ? 
                       new Date(selectedAlert.timestamp).toLocaleString("en-IN") : "NOT RECORDED"}
                   </div>
                   <div className="detail-item">
                     <strong>Alert Type:</strong> {selectedAlert.isSOSAlert ? "SOS ALERT" : "REGULAR REPORT"}
                   </div>
                 </div>
               </div>

               <div className="detail-section">
                 <h4>Location Details</h4>
                 <div className="detail-grid">
                   <div className="detail-item">
                     <strong>Latitude:</strong> {selectedAlert.latitude ? 
                       parseFloat(selectedAlert.latitude).toFixed(6) : "NOT AVAILABLE"}
                   </div>
                   <div className="detail-item">
                     <strong>Longitude:</strong> {selectedAlert.longitude ? 
                       parseFloat(selectedAlert.longitude).toFixed(6) : "NOT AVAILABLE"}
                   </div>
                   <div className="detail-item">
                     <strong>Coordinates:</strong> {selectedAlert.latitude && selectedAlert.longitude ? 
                       `${parseFloat(selectedAlert.latitude).toFixed(6)}, ${parseFloat(selectedAlert.longitude).toFixed(6)}` : 
                       "COORDINATES NOT AVAILABLE"}
                   </div>
                 </div>
               </div>

               <div className="detail-section">
                 <h4>Incident Description</h4>
                 <div className="description-box">
                   {selectedAlert.description || selectedAlert.text || "NO DETAILS PROVIDED"}
                 </div>
               </div>

               {selectedAlert.photo && (
                 <div className="detail-section">
                   <h4>Photo Evidence</h4>
                   <div className="photo-container">
                     <img 
                       src={selectedAlert.photo} 
                       alt="Incident Photo" 
                       className="incident-photo"
                     />
                   </div>
                 </div>
               )}

               {selectedAlert.voice_note && (
                 <div className="detail-section">
                   <h4>Voice Note</h4>
                   <div className="voice-container">
                     <audio controls className="voice-player">
                       <source src={selectedAlert.voice_note} type="audio/webm" />
                       Your browser does not support the audio element.
                     </audio>
                   </div>
                 </div>
               )}
             </div>

             <div className="modal-footer">
               <button className="modal-btn primary" onClick={closeDetailsModal}>
                 Close
               </button>
               <button className="modal-btn secondary">
                 Export Details
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Agency Details Modal */}
       {showAgencyModal && selectedAgency && (
         <div className="modal-overlay" onClick={closeAgencyModal}>
           <div className="modal-content agency-modal" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3>AGENCY DETAILS - {selectedAgency.name}</h3>
               <button className="modal-close" onClick={closeAgencyModal}>×</button>
             </div>
             
             <div className="modal-body">
               {/* Agency Information */}
               <div className="detail-section">
                 <h4>🏢 Agency Information</h4>
                 <div className="detail-grid">
                   <div className="detail-item">
                     <strong>Name:</strong> {selectedAgency.name}
                   </div>
                   <div className="detail-item">
                     <strong>Type:</strong> 
                     <span className="agency-type-badge">{selectedAgency.type}</span>
                   </div>
                   <div className="detail-item">
                     <strong>Status:</strong> 
                     <span className={`status-badge status-${selectedAgency.status?.toLowerCase() || 'unknown'}`}>
                       {selectedAgency.status || 'Unknown'}
                     </span>
                   </div>
                   <div className="detail-item">
                     <strong>License Number:</strong> {selectedAgency.licenseNumber || 'Not provided'}
                   </div>
                   <div className="detail-item">
                     <strong>Specialization:</strong> {selectedAgency.specialization || 'Not specified'}
                   </div>
                 </div>
               </div>

               {/* Location Details */}
               <div className="detail-section">
                 <h4>📍 Location Details</h4>
                 <div className="detail-grid">
                   <div className="detail-item">
                     <strong>Address:</strong> {selectedAgency.location}
                   </div>
                   <div className="detail-item">
                     <strong>City:</strong> {selectedAgency.city || 'Not provided'}
                   </div>
                   <div className="detail-item">
                     <strong>District:</strong> {selectedAgency.district || 'Not provided'}
                   </div>
                   <div className="detail-item">
                     <strong>State:</strong> {selectedAgency.state || 'Not provided'}
                   </div>
                   <div className="detail-item">
                     <strong>Coordinates:</strong> {selectedAgency.latitude && selectedAgency.longitude ? 
                       `${parseFloat(selectedAgency.latitude).toFixed(6)}, ${parseFloat(selectedAgency.longitude).toFixed(6)}` : 
                       'Not available'}
                   </div>
                 </div>
               </div>

               {/* Contact Information */}
               <div className="detail-section">
                 <h4>📞 Contact Information</h4>
                 <div className="detail-grid">
                   <div className="detail-item">
                     <strong>Contact Person:</strong> {selectedAgency.contactPerson}
                   </div>
                   <div className="detail-item">
                     <strong>Contact Number:</strong> {selectedAgency.contactNumber}
                   </div>
                   <div className="detail-item">
                     <strong>Email:</strong> {selectedAgency.email}
                   </div>
                   <div className="detail-item">
                     <strong>Emergency Contact:</strong> {selectedAgency.emergencyContact || 'Not provided'}
                   </div>
                 </div>
               </div>

               {/* Available Resources */}
               <div className="detail-section">
                 <h4>🚨 Available Resources</h4>
                 
                 {/* Personnel Resources */}
                 <div className="resource-category">
                   <h5>👥 Personnel</h5>
                   <div className="resource-grid">
                     {Object.entries(selectedAgency.resources?.personnel || {}).map(([role, count]) => (
                       <div key={role} className="resource-item">
                         <span className="resource-label">{role.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                         <span className="resource-count">{count || 0}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Vehicle Resources */}
                 <div className="resource-category">
                   <h5>🚗 Vehicles</h5>
                   <div className="resource-grid">
                     {Object.entries(selectedAgency.resources?.vehicles || {}).map(([type, count]) => (
                       <div key={type} className="resource-item">
                         <span className="resource-label">{type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                         <span className="resource-count">{count || 0}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Equipment Resources */}
                 <div className="resource-category">
                   <h5>🛠️ Equipment</h5>
                   <div className="resource-grid">
                     {Object.entries(selectedAgency.resources?.equipment || {}).map(([type, count]) => (
                       <div key={type} className="resource-item">
                         <span className="resource-label">{type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                         <span className="resource-count">{count || 0}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Current Status */}
                 <div className="resource-category">
                   <h5>📊 Current Status</h5>
                   <div className="status-grid">
                     <div className="status-item">
                       <strong>Availability:</strong> 
                       <span className={`status-badge status-${selectedAgency.resources?.availability?.toLowerCase() || 'unknown'}`}>
                         {selectedAgency.resources?.availability || 'Unknown'}
                       </span>
                     </div>
                     <div className="status-item">
                       <strong>Response Time:</strong> {selectedAgency.response_time || selectedAgency.resources?.estimated_response_time || 0} minutes
                     </div>
                     <div className="status-item">
                       <strong>Current Mission:</strong> {selectedAgency.resources?.current_mission || 'None'}
                     </div>
                     <div className="status-item">
                       <strong>Last Updated:</strong> {selectedAgency.last_updated ? 
                         new Date(selectedAgency.last_updated).toLocaleString("en-IN") : 'N/A'}
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             <div className="modal-footer">
               <button className="modal-btn primary" onClick={closeAgencyModal}>
                 Close
               </button>
               <button className="modal-btn secondary">
                 Export Details
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Update Agency Modal */}
       {showUpdateModal && agencyToUpdate && (
         <div className="modal-overlay" onClick={closeUpdateModal}>
           <div className="modal-content update-modal" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3>✏️ UPDATE AGENCY - {agencyToUpdate.name}</h3>
               <button className="modal-close" onClick={closeUpdateModal}>×</button>
             </div>
             
             <form onSubmit={handleUpdateSubmit} className="update-form">
               <div className="modal-body">
                 {/* Agency Information */}
                 <div className="detail-section">
                   <h4>🏢 Agency Information</h4>
                   <div className="detail-grid">
                     <div className="detail-item">
                       <label><strong>Agency Name:</strong></label>
                       <input
                         type="text"
                         name="name"
                         value={updateForm.name}
                         onChange={handleUpdateInputChange}
                         required
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>Type:</strong></label>
                       <select
                         name="type"
                         value={updateForm.type}
                         onChange={handleUpdateInputChange}
                         required
                       >
                         <option value="fire">Fire & Rescue</option>
                         <option value="medical">Medical Emergency</option>
                         <option value="disaster">Disaster Response</option>
                         <option value="search">Search & Rescue</option>
                         <option value="volunteer">Volunteer Group</option>
                         <option value="other">Other</option>
                       </select>
                     </div>
                     <div className="detail-item">
                       <label><strong>License Number:</strong></label>
                       <input
                         type="text"
                         name="licenseNumber"
                         value={updateForm.licenseNumber}
                         onChange={handleUpdateInputChange}
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>Specialization:</strong></label>
                       <textarea
                         name="specialization"
                         value={updateForm.specialization}
                         onChange={handleUpdateInputChange}
                         rows="3"
                       />
                     </div>
                   </div>
                 </div>

                 {/* Location Details */}
                 <div className="detail-section">
                   <h4>📍 Location Details</h4>
                   <div className="detail-grid">
                     <div className="detail-item">
                       <label><strong>Address:</strong></label>
                       <input
                         type="text"
                         name="location"
                         value={updateForm.location}
                         onChange={handleUpdateInputChange}
                         required
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>City:</strong></label>
                       <input
                         type="text"
                         name="city"
                         value={updateForm.city}
                         onChange={handleUpdateInputChange}
                         required
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>District:</strong></label>
                       <input
                         type="text"
                         name="district"
                         value={updateForm.district}
                         onChange={handleUpdateInputChange}
                         required
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>State:</strong></label>
                       <input
                         type="text"
                         name="state"
                         value={updateForm.state}
                         onChange={handleUpdateInputChange}
                         required
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>Latitude:</strong></label>
                       <input
                         type="number"
                         step="any"
                         name="latitude"
                         value={updateForm.latitude || ''}
                         onChange={handleUpdateInputChange}
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>Longitude:</strong></label>
                       <input
                         type="number"
                         step="any"
                         name="longitude"
                         value={updateForm.longitude || ''}
                         onChange={handleUpdateInputChange}
                       />
                     </div>
                   </div>
                 </div>

                 {/* Contact Information */}
                 <div className="detail-section">
                   <h4>📞 Contact Information</h4>
                   <div className="detail-grid">
                     <div className="detail-item">
                       <label><strong>Contact Person:</strong></label>
                       <input
                         type="text"
                         name="contactPerson"
                         value={updateForm.contactPerson}
                         onChange={handleUpdateInputChange}
                         required
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>Contact Number:</strong></label>
                       <input
                         type="tel"
                         name="contactNumber"
                         value={updateForm.contactNumber}
                         onChange={handleUpdateInputChange}
                         required
                       />
                     </div>
                     <div className="detail-item">
                       <label><strong>Emergency Contact:</strong></label>
                       <input
                         type="tel"
                         name="emergencyContact"
                         value={updateForm.emergencyContact}
                         onChange={handleUpdateInputChange}
                       />
                     </div>
                   </div>
                 </div>
               </div>

               <div className="modal-footer">
                 <button type="button" className="modal-btn secondary" onClick={closeUpdateModal}>
                   Cancel
                 </button>
                 <button type="submit" className="modal-btn primary">
                   Update Agency
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
    </div>
  );
}