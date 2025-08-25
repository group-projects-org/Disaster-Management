import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "./CSS/SafeHouses.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SafeHouses = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);
  const routeControlRef = useRef(null);const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch( `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.length > 0) {
        const newLoc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setUserLocation(newLoc);
        mapRef.current.setView([newLoc.lat, newLoc.lng], 14);
        L.marker([newLoc.lat, newLoc.lng])
          .addTo(mapRef.current)
          .bindPopup(`📍 ${searchQuery}`)
          .openPopup();
        fetchShelters(newLoc.lat, newLoc.lng);
      } else {
        setError("Location not found. Try a different search.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch location. Try again.");
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Shelter icon (Leaflet custom icon)
  const shelterIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4117/4117166.png",
    iconSize: [32, 32],
  });

  // Fetch shelters from Overpass API
  const fetchShelters = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setShelters([]);

    const query = `[out:json];
    (
      node["amenity"="school"](around:5000,${lat},${lon});
      node["amenity"="hospital"](around:5000,${lat},${lon});
      node["amenity"="police"](around:5000,${lat},${lon});
    );
    out;`;

    const servers = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];

    for (const server of servers) {
      try {
        const res = await fetch(`${server}?data=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!data.elements.length) continue;

        const shelterData = data.elements.map((el) => ({
          id: el.id,
          name: el.tags?.name || `${el.tags?.amenity || "Safe"} House`,
          type: el.tags?.amenity || "shelter",
          position: [el.lat, el.lon],
          distance: calculateDistance(lat, lon, el.lat, el.lon),
        }));

        shelterData.sort((a, b) => a.distance - b.distance);
        setShelters(shelterData);
        addMarkersToMap(shelterData);
        setLoading(false);
        return;
      } catch (err) {
        console.error(`Failed to fetch from ${server}`, err);
      }
    }

    setLoading(false);
    setError("No shelters found within 5 km or API request failed.");
  };

  // Add markers to Leaflet map
  const addMarkersToMap = (shelters) => {
    const map = mapRef.current;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    shelters.forEach((shelter) => {
      const marker = L.marker(shelter.position, { icon: shelterIcon })
        .addTo(map)
        .bindPopup(`🏠 <b>${shelter.name}</b><br>Type: ${shelter.type}`);
      markersRef.current.push(marker);
    });
  };

  // Show route from user to shelter on map
  const showRoute = (lat, lon) => {
    const map = mapRef.current;
    if (!userLocation) return alert("User location not available");

    if (routeControlRef.current) {
      map.removeControl(routeControlRef.current);
    }

    routeControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(lat, lon),
      ],
      routeWhileDragging: false,
      createMarker: () => null,
    }).addTo(map);

    map.setView([lat, lon], 15);
  };

  // Get user location on mount
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          L.marker([loc.lat, loc.lng]).addTo(map).bindPopup("📍 You are here").openPopup();
          map.setView([loc.lat, loc.lng], 14);
          fetchShelters(loc.lat, loc.lng);
        },
        (err) => {
          setLoading(false);
          setError("Unable to retrieve your location. Please enable location access.");
          console.error(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setError("Geolocation not supported by your browser");
    }

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <>
      <Header section="SafeHouses" />
      <div className="safe-houses-app">
        {/* Header */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">🔍 Search</button>
        </form>

        <div className="map-header">
          <h2>🏠 Safe Houses Near You</h2>
          {userLocation && <p>📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>}
        </div>

        {/* Emergency Button */}
        <div className="emergency-button" onClick={() => window.open("tel:112")}>
          🚨 EMERGENCY CALL 112
        </div>

        {/* Map */}
        <div ref={mapContainerRef} style={{ height: "60vh", width: "100%" }}></div>

        {/* Loading */}
        {loading && <p className="loading">Finding safe houses near you...</p>}

        {/* Error */}
        {error && (
          <div className="error">
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button onClick={() => userLocation && fetchShelters(userLocation.lat, userLocation.lng)}>Retry</button>
          </div>
        )}

        {/* Shelters List */}
        {shelters.length > 0 && (
          <div className="shelters-grid">
            {shelters.map((shelter) => (
              <div key={shelter.id} className="shelter-card">
                <h3>{shelter.name}</h3>
                <p>Type: {shelter.type}</p>
                <p>Distance: {shelter.distance.toFixed(1)} km</p>
                <button onClick={() => showRoute(shelter.position[0], shelter.position[1])}>🗺️ Show on Map</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SafeHouses;
