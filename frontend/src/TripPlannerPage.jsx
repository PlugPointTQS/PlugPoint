import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TripPlannerPage.css';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const CITIES = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Evora', 'Faro',
  'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarem', 'Setubal',
  'Viana do Castelo', 'Vila Real', 'Viseu', 'Valpaços', 'Mirandela'
];

const chargerIcon = new L.Icon({
  iconUrl: '/battery-charging.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const startIcon = new L.Icon({
  iconUrl: '/newcheckpoint.png',
  iconSize: [70, 70],
  iconAnchor: [35, 50],
});

const endIcon = new L.Icon({
  iconUrl: '/bandeira-de-chegada.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function TripPlannerPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [chargingStops, setChargingStops] = useState([]);
  const [error, setError] = useState('');
  const [route, setRoute] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showOriginDD, setShowOriginDD] = useState(false);
  const [showDestDD, setShowDestDD] = useState(false);
  const [originCoord, setOriginCoord] = useState(null);
  const [destCoord, setDestCoord] = useState(null);
  const [stationChargers, setStationChargers] = useState({});
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const fetchCoords = async (city) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city},Portugal`);
    const data = await res.json();
    if (!data.length) return null;
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  };

  const fetchRoute = async (start, end) => {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.join(',')};${end.join(',')}?overview=full&geometries=geojson`);
    const data = await res.json();
    return data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  };

  const fetchStations = async () => {
    const res = await fetch(`${baseUrl}/stations`);
    return await res.json();
  };

  const fetchChargers = async (stationId) => {
    const res = await fetch(`${baseUrl}/chargers/station/${stationId}`);
    return await res.json();
  };

  const handleBook = async (chargerId, stationName, type, power, index) => {
    const userId = 1;
    const now = new Date();
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    const reservationData = {
      userId,
      chargerId,
      startTime,
      endTime,
      status: "CONFIRMED"
    };

    try {
      const res = await fetch(`${baseUrl}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      });

      if (!res.ok) throw new Error();

      alert(`Reserva criada com sucesso para: ${stationName} - ${type} ${power} kW`);
    } catch (err) {
      alert("Erro ao fazer a reserva.");
    }
  };

  const calculateDistance = (a, b) => {
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLon = (b[1] - a[1]) * Math.PI / 180;
    const lat1 = a[0] * Math.PI / 180;
    const lat2 = b[0] * Math.PI / 180;
    const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  };

  const handlePlanTrip = async () => {
    setError('');
    setChargingStops([]);
    setRoute(null);

    const orig = await fetchCoords(origin);
    const dest = await fetchCoords(destination);
    if (!orig || !dest) {
      setError('Localizações inválidas.');
      return;
    }

    setOriginCoord([orig[1], orig[0]]);
    setDestCoord([dest[1], dest[0]]);

    const path = await fetchRoute(orig, dest);
    setRoute(path);

    const stations = await fetchStations();
    const filtered = stations.filter(station =>
      path.some(([lat, lon]) => calculateDistance([lat, lon], [station.latitude, station.longitude]) < 30)
    );

    if (filtered.length === 0) {
      setError('Nenhuma estação encontrada ao longo da rota. Tente outro trajeto ou ajuste os filtros.');
    } else {
      setChargingStops(filtered);
      const chargerData = await Promise.all(
        filtered.map(async s => [s.id, await fetchChargers(s.id)])
      );
      setStationChargers(Object.fromEntries(chargerData));
      mapRef.current?.flyTo(path[Math.floor(path.length / 2)], 8);
    }
  };

  const onOriginChange = (val) => {
    setOrigin(val);
    setShowOriginDD(true);
    setOriginSuggestions(CITIES.filter(c => c.toLowerCase().startsWith(val.toLowerCase())));
  };

  const onDestinationChange = (val) => {
    setDestination(val);
    setShowDestDD(true);
    setDestSuggestions(CITIES.filter(c => c.toLowerCase().startsWith(val.toLowerCase())));
  };

  const selectOrigin = (city) => {
    setOrigin(city);
    setShowOriginDD(false);
  };

  const selectDestination = (city) => {
    setDestination(city);
    setShowDestDD(false);
  };

  return (
    <div className="trip-planner-container">
      <div className="trip-header">
        <h2>Planeador de Viagem</h2>
        <p>Planeie a sua viagem e encontre estações de carregamento ao longo do percurso</p>
      </div>

      <div className="trip-controls">
        <div className="input-group">
          <label>Origem</label>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Cidade de partida"
              value={origin}
              onChange={(e) => onOriginChange(e.target.value)}
              onFocus={() => setShowOriginDD(true)}
            />
            {showOriginDD && originSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {originSuggestions.map((c, i) => (
                  <div key={i} className="suggestion-item" onClick={() => selectOrigin(c)}>
                    <i className="icon-location"></i> {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label>Destino</label>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Cidade de destino"
              value={destination}
              onChange={(e) => onDestinationChange(e.target.value)}
              onFocus={() => setShowDestDD(true)}
            />
            {showDestDD && destSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {destSuggestions.map((c, i) => (
                  <div key={i} className="suggestion-item" onClick={() => selectDestination(c)}>
                    <i className="icon-location"></i> {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="plan-trip-btn" onClick={handlePlanTrip}>
          <i className="icon-plan"></i> Planear Viagem
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="icon-warning"></i>
          <p>{error}</p>
        </div>
      )}

      {route && (
        <div className="route-summary">
          <h3>Resumo da Rota</h3>
          <div className="route-info">
            <div className="route-leg">
              <i className="icon-start">Origem:</i>
              <span>{origin}</span>
            </div>
            <div className="route-leg">
              <i className="icon-end">Destino:</i>
              <span>{destination}</span>
            </div>
            {chargingStops.length > 0 && (
              <div className="route-leg">
                <i className="icon-charger"></i>
                <span>{chargingStops.length} paragen{chargingStops.length !== 1 ? 's' : ''} de carregamento</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="map-container">
        <MapContainer center={[39.5, -8]} zoom={7} className="trip-map" ref={mapRef}>
          <TileLayer 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          {originCoord && <Marker position={originCoord} icon={startIcon}><Popup>Origem</Popup></Marker>}
          {destCoord && <Marker position={destCoord} icon={endIcon}><Popup>Destino</Popup></Marker>}
          {route && <Polyline positions={route} color="#3182ce" weight={4} />}
          {chargingStops.map(st => (
            <Marker key={st.id} position={[st.latitude, st.longitude]} icon={chargerIcon}>
              <Popup>
                <div className="popup-content">
                  <h4>{st.name}</h4>
                  <p>{st.address}</p>
                  {(stationChargers[st.id] || []).map((c, i) => (
                    <div key={i} className="popup-charger">
                      <p><strong>{c.type}</strong> - {c.power} kW</p>
                      <button
                        className="popup-reserve-btn"
                        disabled={c.status !== 'AVAILABLE'}
                        onClick={() => handleBook(c.id, st.name, c.type, c.power, i)}
                      >
                        {c.status === 'AVAILABLE' ? 'Reservar' : 'Indisponível'}
                      </button>
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {chargingStops.length > 0 && (
        <div className="charging-stops">
          <h3>Paradas de Carregamento</h3>
          <div className="stops-list">
            {chargingStops.map((stop, index) => (
              <div key={stop.id} className="stop-card">
                <div className="stop-header">
                  <span className="stop-number">{index + 1}</span>
                  <h4>{stop.name}</h4>
                </div>
                <p className="stop-address">{stop.address}</p>
                
                <div className="chargers-list">
                  {(stationChargers[stop.id] || []).map((c, i) => (
                    <div key={i} className="charger-item">
                      <div className="charger-info">
                        <span className="charger-type">{c.type}</span>
                        <span className="charger-power">{c.power} kW</span>
                        <span className={`charger-status ${c.status === 'AVAILABLE' ? 'available' : 'unavailable'}`}>
                          {c.status === 'AVAILABLE' ? 'Disponível' : 'Indisponível'}
                        </span>
                      </div>
                      <button
                        className="reserve-btn"
                        disabled={c.status !== 'AVAILABLE'}
                        onClick={() => handleBook(c.id, stop.name, c.type, c.power, i)}
                      >
                        Reservar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}