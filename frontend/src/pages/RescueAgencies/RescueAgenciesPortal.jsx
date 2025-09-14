import React, { useState, useEffect, useRef } from 'react';
import './CSS/RescueAgenciesPortal.css';
import Login from './Login';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const RescueAgenciesPortal = () => {
  // Add error boundary state
  const [componentError, setComponentError] = useState(null);
  
  // Error boundary - catch any JavaScript errors
  if (componentError) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>❌ Component Error</h2>
          <p>Something went wrong with the component</p>
          <button 
            onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}
            className="retry-btn"
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  // Simple fallback to prevent crashes
  try {
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [agencyData, setAgencyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Helper function to safely set error (ensures it's always a string)
  const setSafeError = (errorValue) => {
    if (typeof errorValue === 'string') {
      setError(errorValue);
    } else if (errorValue && typeof errorValue === 'object') {
      setError(errorValue.message || 'An error occurred');
    } else {
      setError('An error occurred');
    }
  };
  
  // Global error handler to catch any unhandled errors
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      setSafeError(event.error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  const [success, setSuccess] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    type: '',
    location: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    emergencyContact: '',
    city: '',
    district: '',
    state: '',
    licenseNumber: '',
    specialization: ''
  });
  const [resources, setResources] = useState({
    vehicles: {
      ambulances: 0,
      fireTrucks: 0,
      policeCars: 0,
      rescueBoats: 0,
      helicopters: 0,
      otherVehicles: 0
    },
    equipment: {
      medicalSupplies: 0,
      fireExtinguishers: 0,
      communicationDevices: 0,
      rescueTools: 0,
      emergencyLights: 0,
      safetyEquipment: 0,
      otherEquipment: 0
    },
    personnel: {
      doctors: 0,
      paramedics: 0,
      firefighters: 0,
      policeOfficers: 0,
      rescueWorkers: 0,
      volunteers: 0,
      totalStaff: 0
    },
    availability: 'Available',
    currentMission: '',
    estimatedResponseTime: 30
  });
  const [missionHistory, setMissionHistory] = useState([
    {
      id: 1,
      type: 'Fire Emergency',
      location: 'Downtown Area',
      date: '2024-01-15',
      status: 'Completed',
      casualties: 0,
      responseTime: '8 minutes'
    },
    {
      id: 2,
      type: 'Medical Emergency',
      location: 'Central Park',
      date: '2024-01-10',
      status: 'Completed',
      casualties: 1,
      responseTime: '12 minutes'
    }
  ]);
  const [allAgencies, setAllAgencies] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAgencyForUpdate, setSelectedAgencyForUpdate] = useState(null);
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

  // Helper function to calculate total staff (moved to top to avoid hoisting issues)
  const calculateTotalStaff = (personnel) => {
    if (!personnel) return 0;
    return Object.values(personnel).reduce((total, count) => {
      return total + (typeof count === 'number' ? count : 0);
    }, 0);
  };

  useEffect(() => {
    try {
      console.log('RescueAgenciesPortal: Component mounted');
      setLoading(true);
      checkAuthenticationStatus();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setComponentError(error);
    }
  }, []);

  // Auto-refresh agency data when authenticated (only once)
  useEffect(() => {
    if (isAuthenticated && agencyData && !agencyData.resources && !hasRefreshed) {
      setHasRefreshed(true);
      // Use setTimeout to prevent immediate execution and potential loops
      const timer = setTimeout(() => {
        refreshAgencyData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasRefreshed]); // Only depend on isAuthenticated and hasRefreshed

    const checkAuthenticationStatus = () => {
    try {
      const token = localStorage.getItem('rescueAgencyToken');
      const savedData = localStorage.getItem('rescueAgencyData');
      
      if (token && savedData) {
        try {
          const agency = JSON.parse(savedData);
          // Ensure agency_id is set for consistency
          const agencyWithId = {
            ...agency,
            agency_id: agency.id || agency.agency_id
          };
          
          // Load resources from saved data
          if (agency.resources) {
            const updatedResources = {
              ...resources,
              ...agency.resources,
              personnel: {
                ...resources.personnel,
                ...agency.resources.personnel,
                totalStaff: calculateTotalStaff(agency.resources.personnel || {})
              }
            };
            setResources(updatedResources);
          }
          
          setAgencyData(agencyWithId);
          setIsAuthenticated(true);
          setIsRegistered(true);
          setShowLogin(false);
        } catch (error) {
          console.error('Error parsing saved data:', error);
          localStorage.removeItem('rescueAgencyToken');
          localStorage.removeItem('rescueAgencyData');
        }
      }
      setLoading(false);
          } catch (error) {
        console.error('Error in checkAuthenticationStatus:', error);
        setHasError(true);
        setSafeError('Failed to check authentication status');
        setLoading(false);
      }
  };

  const handleLogin = (agency) => {
    // Ensure agency_id is set for consistency
    const agencyWithId = {
      ...agency,
      agency_id: agency.id || agency.agency_id
    };
    
    // Update resources with agency data and calculate totals
    if (agency.resources) {
      const updatedResources = {
        ...resources,
        ...agency.resources,
        personnel: {
          ...resources.personnel,
          ...agency.resources.personnel,
          totalStaff: calculateTotalStaff(agency.resources.personnel || {})
        }
      };
      setResources(updatedResources);
    }
    
    setIsAuthenticated(true);
    setIsRegistered(true);
    setAgencyData(agencyWithId);
    setShowLogin(false);
    
    // Update localStorage with the correct data
    localStorage.setItem('rescueAgencyData', JSON.stringify(agencyWithId));
  };

  const handleLogout = () => {
    localStorage.removeItem('rescueAgencyToken');
    localStorage.removeItem('rescueAgencyData');
    setIsAuthenticated(false);
    setIsRegistered(false);
    setAgencyData(null);
    setShowLogin(true);
  };

    const refreshAgencyData = async () => {
    if (!agencyData?.id && !agencyData?.agency_id) {
      setError('No agency ID found to refresh data');
      return;
    }
    
    if (loading) {
      return; // Prevent multiple simultaneous calls
    }
    
    setLoading(true);
    try {
      const agencyId = agencyData?.id || agencyData?.agency_id;
      const response = await fetch(`${BASE_URL}/rescue-agencies/${agencyId}`);
      
      if (response.ok) {
        const result = await response.json();
        const agencyWithId = {
          ...result.agency,
          agency_id: result.agency.id || result.agency.agency_id
        };
        
        // Update resources with backend data and calculate totals
        const backendResources = result.agency.resources || {};
        const updatedResources = {
          ...resources,
          ...backendResources,
          personnel: {
            ...resources.personnel,
            ...backendResources.personnel,
            totalStaff: calculateTotalStaff(backendResources.personnel || {})
          }
        };
        
        setAgencyData(agencyWithId);
        setResources(updatedResources);
        setSuccess('Agency data refreshed successfully');
        
        // Update localStorage
        localStorage.setItem('rescueAgencyData', JSON.stringify(agencyWithId));
      } else {
        setError('Failed to refresh agency data');
      }
    } catch (error) {
      console.error('Error refreshing agency data:', error);
      setError('Failed to refresh agency data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAgencies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/rescue-agencies/`);
      if (response.ok) {
        const result = await response.json();
        setAllAgencies(result.agencies || []);
      } else {
        setError('Failed to fetch agencies for map');
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      setError('Failed to fetch agencies for map');
    }
  };

  const toggleMapView = () => {
    if (!showMap) {
      fetchAllAgencies();
    }
    setShowMap(!showMap);
  };

  // Function to open update modal for an agency
  const openUpdateModal = (agency) => {
    // Check if the agency is trying to update their own details
    if (agency.id !== agencyData?.id && agency.agency_id !== agencyData?.agency_id) {
      setError('You can only update your own agency details');
      return;
    }
    
    setSelectedAgencyForUpdate(agency);
    setUpdateForm({
      name: agency.name || '',
      type: agency.type || '',
      location: agency.location || agency.city || '',
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

  // Function to close update modal
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedAgencyForUpdate(null);
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

  // Function to handle update form input changes
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to detect location for updates
  const detectLocationForUpdate = async () => {
    if (navigator.geolocation) {
      try {
        setLoading(true);
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        setUpdateForm(prev => ({
          ...prev,
          latitude: latitude,
          longitude: longitude
        }));
        
        setSuccess('Location detected successfully! Coordinates: ' + latitude.toFixed(4) + ', ' + longitude.toFixed(4));
        console.log('Location detected for update:', latitude, longitude);
      } catch (geoError) {
        console.error('Geolocation error during update:', geoError);
        setError('Could not detect location. Please ensure location access is enabled.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Geolocation not supported. Please use a modern browser with location access.');
    }
  };

  // Function to submit agency updates
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgencyForUpdate?.id && !selectedAgencyForUpdate?.agency_id) {
      setError('No agency ID found for update');
      return;
    }

    // Double-check permissions - ensure agency can only update their own details
    const selectedAgencyId = selectedAgencyForUpdate?.id || selectedAgencyForUpdate?.agency_id;
    const currentAgencyId = agencyData?.id || agencyData?.agency_id;
    
    if (selectedAgencyId !== currentAgencyId) {
      setError('You can only update your own agency details');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const agencyId = selectedAgencyId;
             const updateData = {
         name: updateForm.name,
         type: updateForm.type,
         location: updateForm.location || updateForm.city, // Use city as location if location not set
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

      console.log('Sending update data:', updateData);

      const response = await fetch(`${BASE_URL}/rescue-agencies/${agencyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('rescueAgencyToken')}`
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Agency details updated successfully!');
        
        // Update the agency in the local state
        setAllAgencies(prev => prev.map(agency => {
          if (agency.id === agencyId || agency.agency_id === agencyId) {
            return { ...agency, ...updateData };
          }
          return agency;
        }));

        // Close modal after successful update
        setTimeout(() => {
          closeUpdateModal();
        }, 1500);
      } else {
        console.error('Update failed:', result);
        const errorMessage = result.detail || result.message || 'Failed to update agency details';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating agency:', error);
      setError('Failed to update agency details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Test function to add sample agencies with coordinates (for development/testing)
  const addSampleAgencies = () => {
    const sampleAgencies = [
      {
        id: 'sample1',
        name: 'Fire & Rescue Station 1',
        type: 'fire',
        city: 'Dehradun',
        state: 'Uttarakhand',
        contactPerson: 'John Doe',
        status: 'Approved',
        latitude: 30.3165,
        longitude: 78.0322,
        resources: {
          availability: 'available',
          estimated_response_time: 15
        }
      },
      {
        id: 'sample2',
        name: 'Medical Emergency Team',
        type: 'medical',
        city: 'Haridwar',
        state: 'Uttarakhand',
        contactPerson: 'Jane Smith',
        status: 'Approved',
        latitude: 29.9457,
        longitude: 78.1642,
        resources: {
          availability: 'busy',
          estimated_response_time: 25
        }
      },
      {
        id: 'sample3',
        name: 'Disaster Response Unit',
        type: 'disaster',
        city: 'Rishikesh',
        state: 'Uttarakhand',
        contactPerson: 'Mike Johnson',
        status: 'Approved',
        latitude: 30.0869,
        longitude: 78.2676,
        resources: {
          availability: 'available',
          estimated_response_time: 20
        }
      }
    ];
    
    setAllAgencies(sampleAgencies);
    setSuccess('Sample agencies added for testing!');
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
  };

  const handleSwitchToLogin = () => {
    setShowLogin(true);
  };

  const checkRegistrationStatus = async () => {
    try {
      const savedData = localStorage.getItem('rescueAgencyData');
      if (savedData) {
        const data = JSON.parse(savedData);
        const agencyId = data.agency_id || data.id;
        
        if (agencyId) {
          // Fetch latest data from backend
          const response = await fetch(`${BASE_URL}/rescue-agencies/${agencyId}`);
          if (response.ok) {
            const result = await response.json();
            const agencyWithId = {
              ...result.agency,
              agency_id: result.agency.id || result.agency.agency_id
            };
            setAgencyData(agencyWithId);
            setResources(result.agency.resources);
            setIsRegistered(true);
          } else {
            // Agency not found in backend, clear localStorage
            localStorage.removeItem('rescueAgencyData');
            setIsRegistered(false);
          }
        } else {
          setAgencyData(data);
          setResources(data.resources || resources);
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      setError('Failed to check registration status');
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (registrationForm.password !== registrationForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (registrationForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Get geolocation
      let latitude = null;
      let longitude = null;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          console.log('GPS coordinates captured:', latitude, longitude);
        } catch (geoError) {
          console.error('Geolocation error:', geoError);
          setError('Could not get GPS location. Please ensure location access is enabled.');
          setLoading(false);
          return;
        }
      } else {
        setError('Geolocation not supported. Please use a modern browser with location access.');
        setLoading(false);
        return;
      }

      const registrationData = {
        name: registrationForm.name,
        type: registrationForm.type,
        location: registrationForm.location,
        contactPerson: registrationForm.contactPerson,
        contactNumber: registrationForm.contactNumber,
        email: registrationForm.email,
        password: registrationForm.password,
        emergencyContact: registrationForm.emergencyContact,
        city: registrationForm.city,
        district: registrationForm.district,
        state: registrationForm.state,
        licenseNumber: registrationForm.licenseNumber,
        specialization: registrationForm.specialization,
        latitude,
        longitude
      };

      const response = await fetch(`${BASE_URL}/rescue-agencies/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        // Don't set isRegistered to true yet - wait for admin approval
        setAgencyData({
          ...registrationData,
          agency_id: result.agency_id,
          resources: resources,
          status: 'Pending',
          last_updated: new Date().toISOString(),
          response_time: 30
        });
        
        // Save to localStorage for persistence
        localStorage.setItem('rescueAgencyData', JSON.stringify({
          ...registrationData,
          agency_id: result.agency_id,
          resources: resources,
          status: 'Pending',
          last_updated: new Date().toISOString(),
          response_time: 30
        }));
        
        // Reset form
        setRegistrationForm({
          name: '',
          type: '',
          location: '',
          contactPerson: '',
          contactNumber: '',
          email: '',
          password: '',
          confirmPassword: '',
          emergencyContact: '',
          city: '',
          district: '',
          state: '',
          licenseNumber: '',
          specialization: ''
        });

        // Show message about waiting for approval
        setTimeout(() => {
          setSuccess('Registration successful! Please wait for admin approval. You can now log in once approved.');
        }, 1000);
      } else {
        setError(result.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceUpdate = async () => {
    console.log('Current agencyData:', agencyData);
    console.log('agency_id:', agencyData?.agency_id);
    console.log('id:', agencyData?.id);
    
    if (!agencyData?.agency_id && !agencyData?.id) {
      setError('Agency not registered - missing ID');
      return;
    }
    
    const agencyId = agencyData?.agency_id || agencyData?.id;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const resourceData = {
        vehicles: resources.vehicles,
        equipment: resources.equipment,
        personnel: resources.personnel,
        availability: resources.availability,
        current_mission: resources.currentMission || null,
        estimated_response_time: resources.estimatedResponseTime
      };

      const response = await fetch(`${BASE_URL}/rescue-agencies/${agencyId}/resources`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Resources updated successfully!');
        
        // Update local state
        setAgencyData(prev => ({
          ...prev,
          resources: resourceData,
          last_updated: new Date().toISOString(),
          response_time: resources.estimatedResponseTime
        }));
        
        // Update localStorage
        const savedData = JSON.parse(localStorage.getItem('rescueAgencyData'));
        savedData.resources = resourceData;
        savedData.last_updated = new Date().toISOString();
        savedData.response_time = resources.estimatedResponseTime;
        localStorage.setItem('rescueAgencyData', JSON.stringify(savedData));
      } else {
        setError(result.detail || 'Failed to update resources');
      }
    } catch (error) {
      console.error('Error updating resources:', error);
      setError('Failed to update resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (newAvailability) => {
    if (!agencyData?.agency_id && !agencyData?.id) {
      setError('Agency not registered - missing ID');
      return;
    }
    
    const agencyId = agencyData?.agency_id || agencyData?.id;

    try {
      const response = await fetch(`${BASE_URL}/rescue-agencies/${agencyId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAvailability),
      });

      if (response.ok) {
        setResources(prev => ({ ...prev, availability: newAvailability }));
        setSuccess(`Status updated to ${newAvailability}`);
        
        // Update localStorage
        const savedData = JSON.parse(localStorage.getItem('rescueAgencyData'));
        savedData.resources.availability = newAvailability;
        localStorage.setItem('rescueAgencyData', JSON.stringify(savedData));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResourceChange = (category, item, value) => {
    setResources(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: parseInt(value) || 0
      }
    }));
  };

  const handleMissionAdd = () => {
    const newMission = {
      id: missionHistory.length + 1,
      type: 'New Mission',
      location: 'Unknown Location',
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      casualties: 0,
      responseTime: 'N/A'
    };
    setMissionHistory(prev => [...prev, newMission]);
  };

  const handleMissionDelete = (id) => {
    setMissionHistory(prev => prev.filter(mission => mission.id !== id));
  };

  const handleMissionEdit = (id, field, value) => {
    setMissionHistory(prev => prev.map(mission => 
      mission.id === id ? { ...mission, [field]: value } : mission
    ));
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-section">
        <div className="welcome-header">
          <h2>Welcome, {agencyData?.name || 'Rescue Agency'}</h2>
          <button 
            onClick={refreshAgencyData}
            className="refresh-btn"
            title="Refresh agency data from server"
          >
            🔄 Refresh Data
          </button>
        </div>
        <p className="status-badge">
          Status: <span className={`status-${resources.availability || 'available'}`}>
            {(resources.availability || 'available').toUpperCase()}
          </span>
        </p>
        <div className="agency-info">
          <p><strong>Agency ID:</strong> {agencyData?.id || agencyData?.agency_id || 'Not available'}</p>
          <p><strong>Status:</strong> {agencyData?.status || 'Unknown'}</p>
        </div>
        <div className="welcome-actions">
          <button onClick={handleLogout} className="welcome-logout-btn">
            🚪 LOGOUT
          </button>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Personnel</h3>
          <div className="stat-number">{resources.personnel?.totalStaff || 0}</div>
          <p>Available Staff</p>
        </div>
        <div className="stat-card">
          <h3>Total Vehicles</h3>
          <div className="stat-number">
            {Object.values(resources.vehicles || {}).reduce((a, b) => a + b, 0)}
          </div>
          <p>Operational Vehicles</p>
        </div>
        <div className="stat-card">
          <h3>Response Time</h3>
          <div className="stat-number">{resources.estimatedResponseTime || 'N/A'}</div>
          <p>Minutes</p>
        </div>
        <div className="stat-card">
          <h3>Missions</h3>
          <div className="stat-number">{missionHistory.length}</div>
          <p>Completed</p>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        {missionHistory.length > 0 ? (
          <div className="activity-list">
            {missionHistory.slice(0, 5).map((mission, index) => (
              <div key={mission.id} className="activity-item">
                <div className="activity-icon">🚨</div>
                <div className="activity-details">
                  <strong>{mission.type}</strong>
                  <p>Location: {mission.location}</p>
                  <small>{new Date(mission.date).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-activity">No recent missions</p>
        )}
      </div>
    </div>
  );

  const renderRegistration = () => (
    <div className="registration-content">
      {/* Error and Success Messages for Registration */}
      {error && (
        <div className="message error-message">
          <span>❌ {typeof error === 'string' ? error : 'An error occurred'}</span>
          <button onClick={() => setError('')} className="message-close">×</button>
        </div>
      )}
      
      {success && (
        <div className="message success-message">
          <span>✅ {success}</span>
          <button onClick={() => setError('')} className="message-close">×</button>
        </div>
      )}

      <div className="form-header">
        <h2>Rescue Agency Registration</h2>
        <p>Register your rescue agency to coordinate with government emergency services</p>
      </div>

      <form onSubmit={handleRegistrationSubmit} className="registration-form">
        <div className="form-section">
          <h3>Agency Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Agency Name *</label>
              <input
                type="text"
                name="name"
                value={registrationForm.name}
                onChange={handleInputChange}
                required
                placeholder="Enter agency name"
              />
            </div>
            <div className="form-group">
              <label>Agency Type *</label>
              <select
                name="type"
                value={registrationForm.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select agency type</option>
                <option value="fire">Fire & Rescue</option>
                <option value="medical">Medical Emergency</option>
                <option value="disaster">Disaster Response</option>
                <option value="search">Search & Rescue</option>
                <option value="volunteer">Volunteer Group</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contact Person *</label>
              <input
                type="text"
                name="contactPerson"
                value={registrationForm.contactPerson}
                onChange={handleInputChange}
                required
                placeholder="Primary contact person"
              />
            </div>
            <div className="form-group">
              <label>Contact Number *</label>
              <input
                type="tel"
                name="contactNumber"
                value={registrationForm.contactNumber}
                onChange={handleInputChange}
                required
                placeholder="Phone number"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={registrationForm.email}
                onChange={handleInputChange}
                required
                placeholder="Email address"
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={registrationForm.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={registrationForm.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm password"
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input
                type="tel"
                name="emergencyContact"
                value={registrationForm.emergencyContact}
                onChange={handleInputChange}
                placeholder="24/7 emergency number"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="location"
                value={registrationForm.location}
                onChange={handleInputChange}
                required
                placeholder="Street address"
              />
            </div>
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={registrationForm.city}
                onChange={handleInputChange}
                required
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label>District *</label>
              <input
                type="text"
                name="district"
                value={registrationForm.district}
                onChange={handleInputChange}
                required
                placeholder="District"
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={registrationForm.state}
                onChange={handleInputChange}
                required
                placeholder="State"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={registrationForm.licenseNumber}
                onChange={handleInputChange}
                placeholder="Government license number"
              />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <textarea
                name="specialization"
                value={registrationForm.specialization}
                onChange={handleInputChange}
                placeholder="Describe your agency's specializations and capabilities"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register Agency'}
          </button>
        </div>

        <div className="form-footer">
          <p>Already have an account?</p>
          <button 
            type="button" 
            className="btn-link" 
            onClick={handleSwitchToLogin}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );

  const renderResources = () => (
    <div className="resources-content">
      <div className="resources-header">
        <h2>Resource Management</h2>
        <p>Update your agency's available resources and current status</p>
      </div>

      <div className="resources-grid">
        <div className="resource-section">
          <h3>Personnel</h3>
          <div className="resource-items">
            <div className="resource-item">
              <label>Doctors</label>
              <input
                type="number"
                value={resources.personnel.doctors}
                onChange={(e) => handleResourceChange('personnel', 'doctors', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Paramedics</label>
              <input
                type="number"
                value={resources.personnel.paramedics}
                onChange={(e) => handleResourceChange('personnel', 'paramedics', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Firefighters</label>
              <input
                type="number"
                value={resources.personnel.firefighters}
                onChange={(e) => handleResourceChange('personnel', 'firefighters', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Rescue Workers</label>
              <input
                type="number"
                value={resources.personnel.rescueWorkers}
                onChange={(e) => handleResourceChange('personnel', 'rescueWorkers', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Volunteers</label>
              <input
                type="number"
                value={resources.personnel.volunteers}
                onChange={(e) => handleResourceChange('personnel', 'volunteers', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="resource-section">
          <h3>Vehicles</h3>
          <div className="resource-items">
            <div className="resource-item">
              <label>Ambulances</label>
              <input
                type="number"
                value={resources.vehicles.ambulances}
                onChange={(e) => handleResourceChange('vehicles', 'ambulances', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Fire Trucks</label>
              <input
                type="number"
                value={resources.vehicles.fireTrucks}
                onChange={(e) => handleResourceChange('vehicles', 'fireTrucks', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Rescue Boats</label>
              <input
                type="number"
                value={resources.vehicles.rescueBoats}
                onChange={(e) => handleResourceChange('vehicles', 'rescueBoats', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Helicopters</label>
              <input
                type="number"
                value={resources.vehicles.helicopters}
                onChange={(e) => handleResourceChange('vehicles', 'helicopters', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Other Vehicles</label>
              <input
                type="number"
                value={resources.vehicles.otherVehicles}
                onChange={(e) => handleResourceChange('vehicles', 'otherVehicles', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="resource-section">
          <h3>Equipment</h3>
          <div className="resource-items">
            <div className="resource-item">
              <label>Medical Supplies</label>
              <input
                type="number"
                value={resources.equipment.medicalSupplies}
                onChange={(e) => handleResourceChange('equipment', 'medicalSupplies', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Rescue Tools</label>
              <input
                type="number"
                value={resources.equipment.rescueTools}
                onChange={(e) => handleResourceChange('equipment', 'rescueTools', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Communication Devices</label>
              <input
                type="number"
                value={resources.equipment.communicationDevices}
                onChange={(e) => handleResourceChange('equipment', 'communicationDevices', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Safety Equipment</label>
              <input
                type="number"
                value={resources.equipment.safetyEquipment}
                onChange={(e) => handleResourceChange('equipment', 'safetyEquipment', e.target.value)}
                min="0"
              />
            </div>
            <div className="resource-item">
              <label>Other Equipment</label>
              <input
                type="number"
                value={resources.equipment.otherEquipment}
                onChange={(e) => handleResourceChange('equipment', 'otherEquipment', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="status-section">
        <h3>Current Status</h3>
        <div className="status-controls">
          <div className="status-group">
            <label>Availability Status:</label>
            <div className="status-buttons">
              <button
                type="button"
                className={`status-btn ${resources.availability === 'available' ? 'active' : ''}`}
                onClick={() => handleAvailabilityChange('available')}
              >
                Available
              </button>
              <button
                type="button"
                className={`status-btn ${resources.availability === 'busy' ? 'active' : ''}`}
                onClick={() => handleAvailabilityChange('busy')}
              >
                Busy
              </button>
              <button
                type="button"
                className={`status-btn ${resources.availability === 'unavailable' ? 'active' : ''}`}
                onClick={() => handleAvailabilityChange('unavailable')}
              >
                Unavailable
              </button>
            </div>
          </div>
          
          <div className="status-group">
            <label>Current Mission:</label>
            <input
              type="text"
              value={resources.currentMission}
              onChange={(e) => setResources(prev => ({ ...prev, currentMission: e.target.value }))}
              placeholder="Describe current mission (if any)"
            />
          </div>
          
          <div className="status-group">
            <label>Estimated Response Time (minutes):</label>
            <input
              type="number"
              value={resources.estimatedResponseTime}
              onChange={(e) => setResources(prev => ({ ...prev, estimatedResponseTime: e.target.value }))}
              placeholder="15"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="resource-actions">
        <button 
          className="btn-primary" 
          onClick={handleResourceUpdate}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Resources'}
        </button>
      </div>
    </div>
  );

  const renderMissions = () => (
    <div className="missions-content">
      <div className="missions-header">
        <h2>Mission History</h2>
        <p>Track your completed rescue operations and missions</p>
      </div>

      {missionHistory.length > 0 ? (
        <div className="missions-list">
          {missionHistory.map((mission, index) => (
            <div key={mission.id} className="mission-card">
              <div className="mission-header">
                <h3>{mission.type}</h3>
                <span className={`mission-status ${mission.status}`}>
                  {mission.status}
                </span>
              </div>
              <div className="mission-details">
                <p><strong>Location:</strong> {mission.location}</p>
                <p><strong>Status:</strong> {mission.status}</p>
                <p><strong>Date:</strong> {new Date(mission.date).toLocaleDateString()}</p>
                <p><strong>Response Time:</strong> {mission.responseTime}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-missions">
          <div className="no-missions-icon">📋</div>
          <h3>No Missions Yet</h3>
          <p>Your mission history will appear here once you complete rescue operations</p>
        </div>
      )}
    </div>
  );

  const renderMap = () => {
    const defaultPosition = [20.5937, 78.9629]; // India center
    const agenciesWithCoords = allAgencies.filter(
      (agency) => agency.latitude != null && agency.longitude != null && 
      !isNaN(parseFloat(agency.latitude)) && !isNaN(parseFloat(agency.longitude))
    );
    
    console.log('All agencies:', allAgencies);
    console.log('Agencies with coordinates:', agenciesWithCoords);
    
    return (
      <div className="map-content">
                 <div className="map-header">
           <h2>🗺️ Agencies Map View</h2>
           <p>View all registered rescue agencies and their locations</p>
           <div className="map-permissions-info">
             <p>📋 <strong>Note:</strong> You can only update your own agency details. Other agencies' locations are shown for coordination purposes.</p>
           </div>
          <div className="map-header-buttons">
            <button 
              onClick={toggleMapView} 
              className="map-toggle-btn"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
            <button 
              onClick={addSampleAgencies} 
              className="sample-agencies-btn"
              title="Add sample agencies for testing"
            >
              🧪 Add Sample Agencies
            </button>
          </div>
        </div>

        {showMap && (
          <div className="map-container">
            <div className="map-info">
              <h3>📍 Registered Agencies: {agenciesWithCoords.length}</h3>
              <p>Click on markers to see agency details</p>
              {agenciesWithCoords.length === 0 && (
                <p style={{color: '#dc3545', fontWeight: 'bold'}}>
                  ⚠️ No agencies with GPS coordinates found. 
                  Agencies need to enable location access during registration.
                </p>
              )}
            </div>
            
            <div className="map-wrapper">
              <div className="map-container-leaflet">
                <MapContainer
                  center={agenciesWithCoords.length > 0 ? 
                    [parseFloat(agenciesWithCoords[0].latitude), parseFloat(agenciesWithCoords[0].longitude)] : 
                    defaultPosition
                  }
                  zoom={agenciesWithCoords.length > 0 ? 8 : 5}
                  style={{ height: "500px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                  />

                  {agenciesWithCoords.map((agency, index) => {
                    const lat = parseFloat(agency.latitude);
                    const lng = parseFloat(agency.longitude);
                    console.log(`Adding marker for ${agency.name} at [${lat}, ${lng}]`);
                    
                    return (
                      <Marker
                        key={agency.id || index}
                        position={[lat, lng]}
                      >
                        <Popup>
                          <div className="agency-popup">
                            <h4><strong>{agency.name}</strong></h4>
                            <p><strong>Type:</strong> {agency.type}</p>
                            <p><strong>Location:</strong> {agency.city}, {agency.state}</p>
                            <p><strong>Contact:</strong> {agency.contactPerson}</p>
                            <p><strong>Status:</strong> {agency.status || 'Pending'}</p>
                            <p><strong>Coordinates:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                            <p><strong>Availability:</strong> 
                              <span className={`popup-status ${agency.resources?.availability || 'unknown'}`}>
                                {agency.resources?.availability || 'Unknown'}
                              </span>
                            </p>
                            {agency.resources && (
                              <>
                                <p><strong>Response Time:</strong> {agency.resources.estimated_response_time || 'N/A'} min</p>
                                <p><strong>Current Mission:</strong> {agency.resources.current_mission || 'None'}</p>
                              </>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
              
              <div className="agencies-list">
                <h4>📍 Registered Agencies ({allAgencies.length})</h4>
                <div className="coordinate-status">
                  <p><strong>GPS Status:</strong> {agenciesWithCoords.length} with coordinates, {allAgencies.length - agenciesWithCoords.length} without coordinates</p>
                </div>
                {allAgencies.length > 0 ? (
                  <div className="agencies-grid">
                    {allAgencies.map((agency, index) => (
                      <div key={agency.id || index} className="agency-marker-card">
                        <div className="marker-header">
                          <span className={`status-indicator ${agency.resources?.availability || 'unknown'}`}>
                            {agency.resources?.availability || 'Unknown'}
                          </span>
                          <h5>{agency.name}</h5>
                        </div>
                                                 <div className="marker-details">
                           <p><strong>Type:</strong> {agency.type}</p>
                           <p><strong>Location:</strong> {agency.city}, {agency.state}</p>
                           <p><strong>Contact:</strong> {agency.contactPerson}</p>
                           <p><strong>Status:</strong> {agency.status || 'Pending'}</p>
                           {agency.latitude && agency.longitude ? (
                             <p><strong>Coordinates:</strong> {parseFloat(agency.latitude).toFixed(4)}, {parseFloat(agency.longitude).toFixed(4)}</p>
                           ) : (
                             <p style={{color: '#dc3545'}}><strong>⚠️ No GPS coordinates</strong></p>
                           )}
                         </div>
                                                   <div className="marker-actions">
                            {/* Only show update button if this is the logged-in agency */}
                            {(agency.id === agencyData?.id || agency.agency_id === agencyData?.agency_id) ? (
                              <button 
                                onClick={() => openUpdateModal(agency)}
                                className="update-agency-btn"
                                title="Update your agency details"
                              >
                                ✏️ Update Your Details
                              </button>
                            ) : (
                              <div className="agency-info-note">
                                📍 Agency Location
                              </div>
                            )}
                          </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-agencies">
                    <p>No agencies found or loading...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "resources":
        return renderResources();
      case "missions":
        return renderMissions();
      case "map":
        return renderMap();
      default:
        return renderDashboard();
    }
  };

  // Show error state for critical errors
  if (hasError) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>❌ Something went wrong</h2>
          <p>{error || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => {
              setHasError(false);
              setError('');
              checkAuthenticationStatus();
            }}
            className="retry-btn"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while refreshing data
  if (loading && isAuthenticated) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h2>🔄 Loading Agency Data...</h2>
          <p>Please wait while we fetch your latest information</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h2>🔄 Loading...</h2>
          <p>Please wait while we check your authentication status</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return <Login onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />;
    } else {
      return renderRegistration();
    }
  }

  try {
    console.log('RescueAgenciesPortal: Rendering main component', { isAuthenticated, agencyData, loading, hasError });
    
    // Simple fallback to prevent crashes
    if (!isAuthenticated && !loading) {
      return (
        <div className="rescue-portal">
          <div className="portal-header">
            <div className="header-content">
              <div className="logo-section">
                <div className="logo">🚨</div>
                <div>
                  <h1>RESCUE AGENCIES PORTAL</h1>
                  <p>Emergency Response Coordination System</p>
                </div>
              </div>
            </div>
          </div>
          <div className="portal-main">
            <div className="login-fallback">
              <h2>Welcome to Rescue Agencies Portal</h2>
              <p>Please log in or register to continue</p>
              <button onClick={() => setShowLogin(true)} className="btn-primary">
                Login
              </button>
              <button onClick={() => setShowLogin(false)} className="btn-secondary">
                Register
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="rescue-portal">
      {/* Error and Success Messages */}
      {error && (
        <div className="message error-message">
          <span>❌ {typeof error === 'string' ? error : 'An error occurred'}</span>
          <button onClick={() => setError('')} className="message-close">×</button>
        </div>
      )}
      
      {success && (
        <div className="message success-message">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')} className="message-close">×</button>
        </div>
      )}

      {/* Header */}
      <div className="portal-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🚨</div>
            <div>
              <h1>RESCUE AGENCIES PORTAL</h1>
              <p>Emergency Response Coordination System</p>
            </div>
          </div>
          <div className="agency-info">
            <h3>{agencyData?.name || 'Agency'}</h3>
            <p>{agencyData?.type || 'Type'} • {agencyData?.city || 'City'}, {agencyData?.state || 'State'}</p>
            <button onClick={handleLogout} className="logout-btn">
              🚪 LOGOUT
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="portal-nav">
        <div className="nav-left">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            Resources
          </button>
                  <button
          className={`nav-item ${activeTab === "missions" ? "active" : ""}`}
          onClick={() => setActiveTab("missions")}
        >
          Missions
        </button>
        <button
          className={`nav-item ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          🗺️ Map View
        </button>
        </div>
        <div className="nav-right">
          <button onClick={handleLogout} className="nav-logout-btn">
            🚪 LOGOUT
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="portal-main">
        {renderContent()}
      </div>

             {/* Footer */}
       <div className="portal-footer">
         <p>© Rescue Agencies Portal | Emergency Response Coordination System</p>
         <p>For support contact: support@rescueportal.gov.in</p>
       </div>

       {/* Update Agency Modal */}
       {showUpdateModal && selectedAgencyForUpdate && (
         <div className="modal-overlay">
           <div className="update-modal">
             <div className="modal-header">
               <h3>✏️ Update Agency Details</h3>
               <button onClick={closeUpdateModal} className="modal-close">×</button>
             </div>
             
             <form onSubmit={handleUpdateSubmit} className="update-form">
               <div className="form-section">
                 <h4>Agency Information</h4>
                 <div className="form-grid">
                   <div className="form-group">
                     <label>Agency Name *</label>
                     <input
                       type="text"
                       name="name"
                       value={updateForm.name}
                       onChange={handleUpdateInputChange}
                       required
                       placeholder="Enter agency name"
                     />
                   </div>
                   <div className="form-group">
                     <label>Agency Type *</label>
                     <select
                       name="type"
                       value={updateForm.type}
                       onChange={handleUpdateInputChange}
                       required
                     >
                       <option value="">Select agency type</option>
                       <option value="fire">Fire & Rescue</option>
                       <option value="medical">Medical Emergency</option>
                       <option value="disaster">Disaster Response</option>
                       <option value="search">Search & Rescue</option>
                       <option value="volunteer">Volunteer Group</option>
                       <option value="other">Other</option>
                     </select>
                   </div>
                   <div className="form-group">
                     <label>Address *</label>
                     <input
                       type="text"
                       name="location"
                       value={updateForm.location}
                       onChange={handleUpdateInputChange}
                       required
                       placeholder="Street address"
                     />
                   </div>
                   <div className="form-group">
                     <label>Contact Person *</label>
                     <input
                       type="text"
                       name="contactPerson"
                       value={updateForm.contactPerson}
                       onChange={handleUpdateInputChange}
                       required
                       placeholder="Primary contact person"
                     />
                   </div>
                   <div className="form-group">
                     <label>Contact Number *</label>
                     <input
                       type="tel"
                       name="contactNumber"
                       value={updateForm.contactNumber}
                       onChange={handleUpdateInputChange}
                       required
                       placeholder="Phone number"
                     />
                   </div>
                   <div className="form-group">
                     <label>Emergency Contact</label>
                     <input
                       type="tel"
                       name="emergencyContact"
                       value={updateForm.emergencyContact}
                       onChange={handleUpdateInputChange}
                       placeholder="24/7 emergency number"
                     />
                   </div>
                 </div>
               </div>

               <div className="form-section">
                 <h4>Location Details</h4>
                 <div className="form-grid">
                   <div className="form-group">
                     <label>City *</label>
                     <input
                       type="text"
                       name="city"
                       value={updateForm.city}
                       onChange={handleUpdateInputChange}
                       required
                       placeholder="City"
                     />
                   </div>
                   <div className="form-group">
                     <label>District *</label>
                     <input
                       type="text"
                       name="district"
                       value={updateForm.district}
                       onChange={handleUpdateInputChange}
                       required
                       placeholder="District"
                     />
                   </div>
                   <div className="form-group">
                     <label>State *</label>
                     <input
                       type="text"
                       name="state"
                       value={updateForm.state}
                       onChange={handleUpdateInputChange}
                       required
                       placeholder="State"
                     />
                   </div>
                 </div>
                 
                 {/* GPS Coordinates Section */}
                 <div className="gps-section">
                   <h5>📍 GPS Coordinates</h5>
                   <div className="gps-controls">
                     <button
                       type="button"
                       onClick={detectLocationForUpdate}
                       className="detect-location-btn"
                       disabled={loading}
                     >
                       {loading ? '🔄 Detecting...' : '📍 Detect Current Location'}
                     </button>
                     
                     {updateForm.latitude && updateForm.longitude ? (
                       <div className="coordinates-display">
                         <p><strong>Latitude:</strong> {parseFloat(updateForm.latitude).toFixed(6)}</p>
                         <p><strong>Longitude:</strong> {parseFloat(updateForm.longitude).toFixed(6)}</p>
                         <p className="coordinates-note">
                           ✅ GPS coordinates detected! This will update your location on the map.
                         </p>
                       </div>
                     ) : (
                       <div className="coordinates-display">
                         <p className="coordinates-note">
                           ⚠️ No GPS coordinates. Click "Detect Current Location" to update your map position.
                         </p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               <div className="form-section">
                 <h4>Additional Information</h4>
                 <div className="form-grid">
                   <div className="form-group">
                     <label>License Number</label>
                     <input
                       type="text"
                       name="licenseNumber"
                       value={updateForm.licenseNumber}
                       onChange={handleUpdateInputChange}
                       placeholder="Government license number"
                     />
                   </div>
                   <div className="form-group">
                     <label>Specialization</label>
                     <textarea
                       name="specialization"
                       value={updateForm.specialization}
                       onChange={handleUpdateInputChange}
                       placeholder="Describe your agency's specializations and capabilities"
                       rows="3"
                     />
                   </div>
                 </div>
               </div>

               <div className="modal-actions">
                 <button type="button" onClick={closeUpdateModal} className="btn-secondary">
                   Cancel
                 </button>
                 <button type="submit" className="btn-primary" disabled={loading}>
                   {loading ? 'Updating...' : 'Update Agency'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   );
   } catch (error) {
     console.error('Error rendering component:', error);
     setComponentError(error);
     return (
       <div className="error-screen">
         <div className="error-content">
           <h2>❌ Rendering Error</h2>
           <p>Something went wrong while rendering the component</p>
           <button 
             onClick={() => {
               setComponentError(null);
               window.location.reload();
             }}
             className="retry-btn"
           >
             🔄 Reload Page
           </button>
         </div>
       </div>
           );
    }
  } catch (error) {
    console.error('Error in RescueAgenciesPortal:', error);
    setComponentError(error);
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>❌ Critical Error</h2>
          <p>Something went wrong while initializing the component</p>
          <button 
            onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}
            className="retry-btn"
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    );
  }
};
  
export default RescueAgenciesPortal;
