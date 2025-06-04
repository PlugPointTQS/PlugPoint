import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TripPlannerPage.css';

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
    const res = await fetch('http://deti-tqs-13.ua.pt:8080/api/stations');
    return await res.json();
  };

  const fetchChargers = async (stationId) => {
    const res = await fetch(`http://deti-tqs-13.ua.pt:8080/api/chargers/station/${stationId}`);
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
      const res = await fetch('http://deti-tqs-13.ua.pt:8080/api/reservations', {
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
      <h2>Planeador de Viagens</h2>

      <div className="trip-inputs">
        <div className="searchWrapper">
          <input
            type="text"
            placeholder="Origem"
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            onFocus={() => setShowOriginDD(true)}
          />
          {showOriginDD && originSuggestions.length > 0 && (
            <div className="dropdown">
              {originSuggestions.map((c, i) => (
                <div key={i} className="opt" onClick={() => selectOrigin(c)}>{c}</div>
              ))}
            </div>
          )}
        </div>

        <div className="searchWrapper">
          <input
            type="text"
            placeholder="Destino"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            onFocus={() => setShowDestDD(true)}
          />
          {showDestDD && destSuggestions.length > 0 && (
            <div className="dropdown">
              {destSuggestions.map((c, i) => (
                <div key={i} className="opt" onClick={() => selectDestination(c)}>{c}</div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handlePlanTrip}>Planear Viagem</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="map">
        <MapContainer center={[39.5, -8]} zoom={7} className="leaflet" ref={mapRef}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {originCoord && <Marker position={originCoord} icon={startIcon}><Popup>Origem</Popup></Marker>}
          {destCoord && <Marker position={destCoord} icon={endIcon}><Popup>Destino</Popup></Marker>}
          {route && <Polyline positions={route} color="blue" />}
          {chargingStops.map(st => (
            <Marker key={st.id} position={[st.latitude, st.longitude]} icon={chargerIcon}>
              <Popup>
                <b>{st.name}</b><br />
                {st.address}<br />
                {(stationChargers[st.id] || []).map((c, i) => (
                  <div key={i} style={{ marginBottom: '0.5rem' }}>
                    <p>🔌 <strong>{c.type}</strong> - {c.power} kW - <em>{c.status}</em></p>
                    <button
                      disabled={c.status !== 'AVAILABLE'}
                      onClick={() => handleBook(c.id, st.name, c.type, c.power, i)}
                      className="popup-reserve-btn"
                    >
                      Reservar
                    </button>
                  </div>
                ))}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
