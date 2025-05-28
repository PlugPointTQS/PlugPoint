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
  const mapRef = useRef(null);
  const [isFavorited, setIsFavorited] = useState(false);


  useEffect(() => {
    fetch('https://api.openchargemap.io/v3/poi/?output=json&countrycode=PT&maxresults=100', {
      headers: {
        'X-API-Key': 'b81e1a41-bb0e-4422-9626-2bb193fe32e5'
      }
    })
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(err => console.error('Failed to fetch stations:', err));
  }, []);

  const handleMarkerClick = (station) => {
    setSelectedStation(station);
    if (mapRef.current) {
      mapRef.current.flyTo(
        [station.AddressInfo.Latitude, station.AddressInfo.Longitude],
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
            station.AddressInfo?.Latitude && station.AddressInfo?.Longitude && (
              <Marker
                key={station.ID}
                position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
                icon={chargerIcon}
                eventHandlers={{ click: () => handleMarkerClick(station) }}
              />
            )
          ))}
        </MapContainer>
      </div>

      <div className="list-column">
        <h2>Charging Stations</h2>
        <div className="station-details-wrapper">
        <AnimatePresence mode="wait">
          {selectedStation ? (
            <motion.div
              key={selectedStation.ID}
              className="station-details-inner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.15 }}
            >
              <div className="station-details">
                <div className="address-directions-container">
                  <div className="station-address">
                    <p>{selectedStation.AddressInfo.AddressLine1}</p>
                    <p>{selectedStation.AddressInfo.Town},</p>
                    <p>{selectedStation.AddressInfo.Postcode}</p>
                  </div>
                  <div className="station-directions">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.AddressInfo?.Latitude},${selectedStation.AddressInfo?.Longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="directions-button"
                    >
                      <img src={getLocUrl} alt="Direções" style={{ width: '60px', height: '60px' }} />
                    </a>
                  </div>
                </div>

                <div className="station-connections">
                  {selectedStation.Connections?.map((conn, index) => (
                    <div key={index} className="connection-card">
                      <h4>{conn.ConnectionType?.Title}</h4>
                      <p><strong>{conn.PowerKW} kW</strong> · {conn.CurrentType?.Title}</p>
                      <p className={`status ${conn.StatusType?.IsOperational ? 'available' : 'unavailable'}`}>
                        {conn.StatusType?.Title || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="station-footer">
                  <p>🔌 {selectedStation.NumberOfPoints ?? selectedStation.Connections?.length} tomadas disponíveis</p>
                  {selectedStation.OperatorInfo?.WebsiteURL && (
                    <p>
                      🌐 <a href={selectedStation.OperatorInfo.WebsiteURL} target="_blank" rel="noopener noreferrer">
                        Visitar Website
                      </a>
                    </p>
                  )}
                  <div className="station-actions">
                  <button
                    className="reserve-button"
                    onClick={() => {
                      const reservation = {
                        title: selectedStation.AddressInfo?.Title,
                        address: selectedStation.AddressInfo?.AddressLine1,
                        city: selectedStation.AddressInfo?.Town,
                        postcode: selectedStation.AddressInfo?.Postcode,
                      };

                      const existing = JSON.parse(localStorage.getItem('reservations')) || [];
                      localStorage.setItem('reservations', JSON.stringify([...existing, reservation]));

                      alert(`Reserva efetuada para: ${reservation.title}`);
                    }}
                  >
                    Reservar
                  </button>

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
                station.AddressInfo && (
                  <li key={station.ID} className="station-item">
                    <h3>{station.AddressInfo.Title}</h3>
                    <p>{station.AddressInfo.Town}</p>
                    <button onClick={() => handleMarkerClick(station)}>
                      View Details
                    </button>
                  </li>
                )
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}