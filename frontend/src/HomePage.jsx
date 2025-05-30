import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './HomePage.css';
import { motion, AnimatePresence } from 'framer-motion';

const chargerIconUrl = '/battery-charging.png';
const getLocUrl = '/getLoc.png';

const getLocIcon = new L.Icon({
  iconUrl: getLocUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const chargerIcon = new L.Icon({
  iconUrl: chargerIconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function HomePage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [isLoadingChargers, setIsLoadingChargers] = useState(false);
  const mapRef = useRef(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/stations')
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(err => console.error('Failed to fetch stations:', err));
  }, []);

  const handleMarkerClick = async (station) => {
    setIsLoadingChargers(true);
    setSelectedStation(station);
    
    try {
      const response = await fetch(`http://localhost:8080/api/chargers/station/${station.id}`);
      const chargersData = await response.json();
      setChargers(chargersData);
    } catch (err) {
      console.error('Failed to fetch chargers:', err);
      setChargers([]);
    } finally {
      setIsLoadingChargers(false);
    }

    if (mapRef.current) {
      mapRef.current.flyTo(
        [station.latitude, station.longitude],
        14,
        {
          animate: true,
          duration: 2.0,
          easeLinearity: 0.2,
          noMoveStart: false
        }
      );
    }
  };
  const createReservation = async (chargerId, stationName, stationAddress, index) => {
    const userId =1
    const now = new Date();
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // +1 hora

    const reservationData = {
      userId,
      chargerId,
      startTime,
      endTime,
      status: "CONFIRMED"
    };

    try {
      const response = await fetch('http://localhost:8080/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) throw new Error("Erro ao criar reserva");

      alert(`Reserva criada com sucesso para: ${stationName} - Charger ${index + 1}`);
    } catch (error) {
      console.error("Erro na reserva:", error);
      alert("Erro ao fazer a reserva.");
    }
  };
  return (
    <div className="homepage-container">
      <div className="map-column">
        <MapContainer
          center={[39.5, -8.0]}
          zoom={7}
          scrollWheelZoom={true}
          className="map-view"
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map(station => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={chargerIcon}
              eventHandlers={{ click: () => handleMarkerClick(station) }}
            />
          ))}
        </MapContainer>
      </div>

      <div className="list-column">
        <h2>Charging Stations</h2>
        <div className="station-details-wrapper">
          <AnimatePresence mode="wait">
            {selectedStation ? (
              <motion.div
                key={selectedStation.id}
                className="station-details-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.15 }}
              >
                <div className="station-details">
                  <div className="address-directions-container">
                    <div className="station-address">
                      <h3>{selectedStation.name}</h3>
                      <h3>{selectedStation.address}</h3>
                    </div>
                    <div className="station-directions">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="directions-button"
                      >
                        <img src={getLocUrl} alt="Direções" style={{ width: '60px', height: '60px' }} />
                      </a>
                    </div>
                  </div>

                  <div className="station-connections">
                    {isLoadingChargers ? (
                      <p>Loading chargers...</p>
                    ) : chargers.length > 0 ? (
                      chargers.map((charger, index) => (
                        <div key={index} className="connection-card">
                          <div className="charger-info">
                            <h4>Charger {index + 1}</h4>
                            <p><strong>Type:</strong> {charger.type}</p>
                            <p><strong>Power:</strong> {charger.power} kW</p>
                            <p className={`status ${charger.status === 'AVAILABLE' ? 'available' : charger.status === 'MAINTENANCE' ? 'manutenance' : 'unavailable'}`}>
                            </p>
                          </div>
                          <div className="charger-actions">
                            <button
                              className="reserve-button"
                              onClick={() => createReservation(charger.id, selectedStation.name, selectedStation.address, index)}
                            >
                              Reserve
                            </button>
                           
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No chargers available</p>
                    )}
                  </div>

                  <div className="station-footer">
                    <p>🔌 {chargers.length} chargers available</p>
                  <div className="station-actions">

                      <button
                        className="favorite-button"
                        onClick={() => setIsFavorited(prev => !prev)}
                        title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        {isFavorited ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="red" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                            2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                            4.5 2.09C13.09 3.81 14.76 3 16.5 
                            3 19.58 3 22 5.42 22 8.5c0 
                            3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="red" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 
                            8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                            4.5 2.09C13.09 3.81 14.76 3 16.5 
                            3 19.58 3 22 5.42 22 8.5c0 
                            3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        )}
                      </button>
                    </div>    
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.ul
                key="station-list"
                className="station-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {stations.map(station => (
                  <li key={station.id} className="station-item">
                    <h3>{station.name}</h3>
                    <p>{station.address}</p>
                    <button onClick={() => handleMarkerClick(station)}>
                      View Details
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}