import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css'; // Arquivo CSS separado

function App() {
  const [userType, setUserType] = useState('driver');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Coordenadas de exemplo (Lisboa)
  const position = [38.736946, -9.142685];
  const stations = [
    { id: 1, name: "Estação Central", position: [38.736946, -9.142685], available: true },
    { id: 2, name: "Estação Norte", position: [38.746946, -9.152685], available: false },
  ];

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <h1 className="logo-text">PlugPoint</h1>
        </div>
        
        <div className="nav-links">
          <a href="#">Map</a>
          <a href="#">Reservations</a>
          <a href="#">Profile</a>
          <button className="login-btn">Login</button>
        </div>
      </nav>

      {/* Search Section */}
      <div className="search-section">
        <h1>Find charging stations in a matter of seconds</h1>
        
        <div className="search-form">
          <input 
            type="text" 
            placeholder="Origin" 
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Destination" 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button className="search-btn">Plan Trip</button>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-container">
        <MapContainer center={position} zoom={7} className="map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {stations.map(station => (
            <Marker key={station.id} position={station.position}>
              <Popup>
                {station.name} <br /> 
                {station.available ? "Available" : "Ocupied "}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;