import React, { useEffect, useRef, useCallback, useState } from 'react';
import { MapPin } from 'lucide-react';

const LocationPicker = ({ latitude, longitude, onLocationSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapKey, setMapKey] = useState(0);

 
  const handleLocationSelect = useCallback((lat, lng) => {
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  }, [onLocationSelect]);

  useEffect(() => {
   
    const resetMap = () => setMapKey(prev => prev + 1);
    
    const initMap = async () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const container = mapRef.current;
        if (!container) return;
        if (container._leaflet_id) {
          delete container._leaflet_id;
        }
        Object.keys(container).forEach(key => {
          if (key.startsWith('_leaflet')) {
            delete container[key];
          }
        });
        container.innerHTML = '';
        if (container._leaflet_id) {
          console.warn('Forcing component re-mount due to persistent Leaflet state');
          resetMap();
          return;
        }
        const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');
        
        if (!mapRef.current) return;
        const map = L.map(container).setView([latitude, longitude], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const createPopupContent = (lat, lng) => `
          <div style="text-align: center; padding: 5px;">
            <strong>📍 Disaster Location</strong><br>
            <small>Lat: ${lat.toFixed(6)}</small><br>
            <small>Lng: ${lng.toFixed(6)}</small><br>
            <em>Drag to adjust</em>
          </div>
        `;

        const marker = L.marker([latitude, longitude], {
          draggable: true
        }).addTo(map);

        marker.bindPopup(createPopupContent(latitude, longitude)).openPopup();

        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          handleLocationSelect(lat, lng);
          marker.bindPopup(createPopupContent(lat, lng)).openPopup();
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          handleLocationSelect(lat, lng);
          marker.bindPopup(createPopupContent(lat, lng)).openPopup();
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    if (latitude && longitude && mapRef.current) {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
      
      const container = mapRef.current;
      if (container && container._leaflet_id) {
        delete container._leaflet_id;
      }
    };
  }, [latitude, longitude, handleLocationSelect]);

  if (!latitude || !longitude) {
    return (
      <div className="location-picker">
        <div className="map-header">
          <MapPin className="map-icon" />
          <div className="map-info">
            <h4 className="map-title">Location Preview</h4>
            <p className="map-description">Please provide coordinates to display map</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="location-picker">
      <div className="map-header">
        <MapPin className="map-icon" />
        <div className="map-info">
          <h4 className="map-title">Location Preview</h4>
          <p className="map-description">Click or drag the marker to adjust the exact location</p>
        </div>
      </div>
      
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      
      <div 
        key={mapKey}
        ref={mapRef} 
        className="location-map"
        style={{ 
          height: '300px', 
          width: '100%', 
          borderRadius: '0.5rem',
          border: '1px solid #d1d5db',
          overflow: 'hidden'
        }}
      />
      
      <div className="map-coordinates">
        <div className="coordinate-display">
          <span className="coordinate-label">Coordinates: </span>
          <span className="coordinate-value">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;