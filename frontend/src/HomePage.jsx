import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './HomePage.css';
const baseUrl = import.meta.env.VITE_API_BASE_URL;


const chargerIcon = new L.Icon({
  iconUrl: '/battery-charging.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const getLocIcon = new L.Icon({
  iconUrl: '/newcheckpoint.png',
  iconSize: [70, 70],
  iconAnchor: [35, 50],
});

const CITIES = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Evora', 'Faro',
  'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarem', 'Setubal',
  'Viana do Castelo', 'Vila Real', 'Viseu', 'Mirandela', 'Valpaços'
];

const dist = (la1, lo1, la2, lo2) => {
  const R = 6371, dLat = (la2 - la1) * Math.PI / 180, dLon = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(la1*Math.PI/180) * Math.cos(la2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function HomePage() {
  const [stations, setStations] = useState([]);
  const [stationChargers, setStationChargers] = useState({});
  const [selected, setSelected] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [locLabel, setLocLabel] = useState('');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [showDD, setShowDD] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [powerValue, setPowerValue] = useState(250);
  const [distanceValue, setDistanceValue] = useState(250);
  const mapRef = useRef(null);

  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });
  
  const toggleFavorite = (stationId) => {
    const updated = favorites.includes(stationId)
      ? favorites.filter(id => id !== stationId)
      : [...favorites, stationId];
  
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  useEffect(() => {
    fetch(`${baseUrl}/stations`)
      .then(r => r.json())
      .then(async data => {
        setStations(data);
        const pairs = await Promise.all(
          data.map(async s => {
            const r = await fetch(`${baseUrl}/chargers/station/${s.id}`);
            const ch = await r.json();
            return [s.id, ch];
          })
        );
        setStationChargers(Object.fromEntries(pairs));
      });
  }, []);

  const refreshDistances = loc => {
    const upd = stations.map(s => ({
      ...s,
      distance: dist(loc.lat, loc.lng, s.latitude, s.longitude)
    })).sort((a, b) => a.distance - b.distance);
    setStations(upd);
  };

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(async pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLoc(loc);
      refreshDistances(loc);
      mapRef.current?.flyTo([loc.lat, loc.lng], 12);

      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`);
      const d = await r.json();
      const city = d.address?.city || d.address?.town || 'Localização Atual';
      setLocLabel(city);
      addRecent(city);
      setShowDD(false);
    }, () => alert('Permissão de localização negada'));
  };

  const onSearchChange = v => {
    setSearch(v);
    setShowDD(true);
    setSuggestions(CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase())));
  };

  const selectCity = async city => {
    setSearch('');
    setLocLabel(city);
    addRecent(city);
    setShowDD(false);
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city},Portugal`);
    const d = await r.json();
    if (!d.length) return;
    const loc = { lat: +d[0].lat, lng: +d[0].lon };
    setUserLoc(loc);
    refreshDistances(loc);
    mapRef.current?.flyTo([loc.lat, loc.lng], 12);
  };

  const addRecent = city => {
    setRecent(p => [city, ...p.filter(x => x !== city)].slice(0, 5));
  };

  const applyFilters = s => {
    const chargers = stationChargers[s.id] || [];
    if (typeFilter && !chargers.some(c => c.type === typeFilter)) return false;
    if (!chargers.some(c => c.power <= powerValue)) return false;
    if (s.distance && s.distance > distanceValue) return false;
    return true;
  };

  const createReservation = async (chargerId, stationName, stationAddress, index) => {
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
      const response = await fetch(`${baseUrl}/reservations`, {
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

  const displayed = stations.filter(applyFilters);

  const openDetails = async s => {
    if (!stationChargers[s.id]) {
      const r = await fetch(`${baseUrl}/chargers/station/${s.id}`);
      const ch = await r.json();
      setStationChargers(prev => ({ ...prev, [s.id]: ch }));
    }
    setSelected(s);
  };

  return (
    <div className="home-container">
      <div className="map-section">
        <MapContainer center={[39.5, -8]} zoom={7} ref={mapRef} className="map-view">
          <TileLayer 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          {displayed.map(s => (
            <Marker 
              key={s.id} 
              position={[s.latitude, s.longitude]} 
              icon={chargerIcon}
              eventHandlers={{ click: () => openDetails(s) }}
            />
          ))}
          {userLoc && (
            <Marker position={[userLoc.lat, userLoc.lng]} icon={getLocIcon}>
              <Popup>{locLabel || 'Localização'}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div className="panel-section">
        <div className="search-card">
          <div className="search-container">
            <div className="search-input-wrapper">
              <i className="icon-search"></i>
              <input
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                onFocus={() => setShowDD(true)}
                placeholder="Pesquisar localização..."
                className="search-input"
              />
            </div>
            
            {showDD && (
              <div className="dropdown-menu">
                <div className="dropdown-section">
                  <h4>Localização Atual</h4>
                  <div className="dropdown-item" onClick={useMyLocation}>
                    <i className="icon-location"></i> Usar minha localização
                  </div>
                </div>
                
                {recent.length > 0 && (
                  <div className="dropdown-section">
                    <h4>Recentes</h4>
                    {recent.map((c, i) => (
                      <div key={`recent-${i}`} className="dropdown-item" onClick={() => selectCity(c)}>
                        <i className="icon-clock"></i> {c}
                      </div>
                    ))}
                  </div>
                )}
                
                {suggestions.length > 0 && (
                  <div className="dropdown-section">
                    <h4>Cidades</h4>
                    {suggestions.map((c, i) => (
                      <div key={`sug-${i}`} className="dropdown-item" onClick={() => selectCity(c)}>
                        <i className="icon-city"></i> {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {locLabel && (
            <div className="location-label">
              <i className="icon-pin"></i>
              <span>Mostrando resultados próximos de <strong>{locLabel}</strong></span>
            </div>
          )}

          <div className="filters-container">
            <h4 className="filters-title">Filtros</h4>
            
            <div className="filter-group">
              <label>Tipo de Carregador</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos</option>
                <option value="TYPE2">TYPE2</option>
                <option value="CHADEMO">CHADEMO</option>
                <option value="CCS">CCS</option>
                <option value="TESLA">TESLA</option>
                <option value="AC">AC</option>
                <option value="DC">DC</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Potência Mínima: <span>{powerValue} kW</span></label>
              <input
                type="range"
                min="0"
                max="250"
                value={powerValue}
                onChange={e => setPowerValue(+e.target.value)}
                className="filter-slider"
              />
            </div>
            
            <div className="filter-group">
              <label>Distância Máxima: <span>{distanceValue} km</span></label>
              <input
                type="range"
                min="0"
                max="250"
                value={distanceValue}
                onChange={e => setDistanceValue(+e.target.value)}
                className="filter-slider"
              />
            </div>
            
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setTypeFilter('');
                setPowerValue(250);
                setDistanceValue(250);
              }}
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {selected ? (
          <div className="station-details-card">
            <div className="station-header">
              <div>
                <h3>{selected.name}</h3>
                <p className="station-address">{selected.address}</p>
              </div>
              <button 
                className="favorite-btn"
                onClick={() => toggleFavorite(selected.id)}
              >
                <i className={favorites.includes(selected.id) ? "icon-heart-filled" : "icon-heart"}></i>
              </button>
            </div>
            
            <div className="chargers-list">
              <h4>Carregadores Disponíveis</h4>
              {(stationChargers[selected.id] || []).map((c, i) => (
                <div key={i} className="charger-card">
                  <div className="charger-info">
                    <div className="charger-type">
                      <i className="icon-charger"></i>
                      <span>Carregador {i+1}</span>
                    </div>
                    <div className="charger-specs">
                      <span><strong>Tipo:</strong> {c.type}</span>
                      <span><strong>Potência:</strong> {c.power} kW</span>
                    </div>
                    <span className={`status ${c.status === 'AVAILABLE' ? 'available' : 'unavailable'}`}>
                      {c.status === 'AVAILABLE' ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                  <button 
                    className="reserve-btn"
                    onClick={() => createReservation(c.id, selected.name, selected.address, i)}
                    disabled={c.status !== 'AVAILABLE'}
                  >
                    Reservar
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              className="back-btn"
              onClick={() => setSelected(null)}
            >
              <i className="icon-arrow-left"></i> Voltar à lista
            </button>
          </div>
        ) : (
          <div className="stations-list">
            {displayed.length === 0 ? (
              <div className="empty-state">
                <i className="icon-warning"></i>
                <p>Nenhuma estação corresponde aos filtros aplicados</p>
              </div>
            ) : (
              displayed.map(s => (
                <div 
                  key={s.id} 
                  className="station-card"
                  onClick={() => openDetails(s)}
                >
                  <div className="station-info">
                    <h4>{s.name}</h4>
                    <p>{s.address}</p>
                    {s.distance && (
                      <div className="distance-badge">
                        <i className="icon-distance"></i>
                        {s.distance.toFixed(1)} km
                      </div>
                    )}
                  </div>
                  <div className="station-actions">
                    <button className="details-btn">
                      Ver detalhes <i className="icon-arrow-right"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}