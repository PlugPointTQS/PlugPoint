import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './HomePage.css';

const chargerIcon = new L.Icon({
  iconUrl: '/battery-charging.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const getLocIcon = new L.Icon({
  iconUrl: '/getLoc.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const CITIES = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Evora', 'Faro',
  'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarem', 'Setubal',
  'Viana do Castelo', 'Vila Real', 'Viseu'
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

  useEffect(() => {
    fetch('http://localhost:8080/api/stations')
      .then(r => r.json())
      .then(async data => {
        setStations(data);
        const pairs = await Promise.all(
          data.map(async s => {
            const r = await fetch(`http://localhost:8080/api/chargers/station/${s.id}`);
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

  const displayed = stations.filter(applyFilters);

  const openDetails = async s => {
    if (!stationChargers[s.id]) {
      const r = await fetch(`http://localhost:8080/api/chargers/station/${s.id}`);
      const ch = await r.json();
      setStationChargers(prev => ({ ...prev, [s.id]: ch }));
    }
    setSelected(s);
  };

  return (
    <div className="container">
      <div className="map">
        <MapContainer center={[39.5, -8]} zoom={7} ref={mapRef} className="leaflet">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {displayed.map(s => (
            <Marker key={s.id} position={[s.latitude, s.longitude]} icon={chargerIcon}
              eventHandlers={{ click: () => openDetails(s) }} />
          ))}
          {userLoc && (
            <Marker position={[userLoc.lat, userLoc.lng]} icon={getLocIcon}>
              <Popup>{locLabel || 'Localização'}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <aside className="panel">
        <div className="searchCard">
          <div className="searchWrapper">
            <input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={() => setShowDD(true)}
              placeholder="📍 Origem"
              className="searchInput"
            />
            {showDD && (
              <div className="dropdown">
                <p className="section">LOCALIZAÇÃO ATUAL</p>
                <div className="opt" onClick={useMyLocation}>📍 Localização Atual</div>
                {recent.length > 0 && (
                  <>
                    <p className="section">PESQUISAS RECENTES</p>
                    {recent.map((c, i) => (
                      <div key={`recent-${i}`} className="opt" onClick={() => selectCity(c)}>{c}</div>
                    ))}
                  </>
                )}
                {suggestions.length > 0 && (
                  <>
                    <p className="section">CIDADES</p>
                    {suggestions.map((c, i) => (
                      <div key={`sug-${i}`} className="opt" onClick={() => selectCity(c)}>{c}</div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {locLabel && (
            <p className="info-active-location">
              📍 A mostrar resultados de: <strong>{locLabel}</strong>
            </p>
          )}

          <div className="filters-modern">
            <label className="filter-label">Tipo de Carregador</label>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="TYPE2">TYPE2</option>
              <option value="CHADEMO">CHADEMO</option>
              <option value="CCS">CCS</option>
              <option value="TESLA">TESLA</option>
              <option value="AC">AC</option>
              <option value="DC">DC</option>
            </select>

            <label className="filter-label">
              Potência: <strong>{powerValue} kW</strong>
            </label>
            <input
              type="range"
              className="filter-slider"
              min="0"
              max="250"
              value={powerValue}
              onChange={e => setPowerValue(+e.target.value)}
            />

            <label className="filter-label">
              Distância: <strong>{distanceValue} km</strong>
            </label>
            <input
              type="range"
              className="filter-slider"
              min="0"
              max="250"
              value={distanceValue}
              onChange={e => setDistanceValue(+e.target.value)}
            />

            <button className="clear" onClick={() => {
              setTypeFilter('');
              setPowerValue(250);
              setDistanceValue(250);
            }}>Limpar filtros</button>
          </div>
        </div>

        {selected ? (
          <div className="station-details">
            <div className="station-header">
              <div>
                <h3 className="station-name">{selected.name}</h3>
                <h3 className="station-address">{selected.address}</h3>
              </div>
              <img src="public/getLoc.png" alt="Map" className="station-map-icon" />
            </div>

            <div className="chargers-list">
              {(stationChargers[selected.id] || []).map((c, i) => (
                <div key={i} className="charger-card">
                  <div>
                    <strong>Charger {i + 1}</strong>
                    <p>Type: {c.type}</p>
                    <p>Power: {c.power} kW</p>
                    <p className={c.status === 'AVAILABLE' ? 'available' : 'unavailable'}>
                      {c.status}
                    </p>
                  </div>
                  <button className="reserve-btn">Reserve</button>
                </div>
              ))}
              <p className="chargers-count">
                {(stationChargers[selected.id] || []).length} chargers available
              </p>
            </div>

            <div className="station-footer">
              <button className="fav-btn" onClick={() => alert("Adicionado aos favoritos!")}>
                <img src="/heart-icon.png" alt="Favorito" />
                <span>Adicionar aos favoritos</span>
              </button>
            </div>

            <button onClick={() => setSelected(null)} className="backBtn">← Voltar</button>
          </div>
        ) : (
          <ul className="list">
            {displayed.length === 0 ? (
              <p style={{ padding: '1rem' }}>⚠️ Nenhuma estação corresponde aos filtros.</p>
            ) : (
              displayed.map(s => (
                <li key={s.id} onClick={() => openDetails(s)}>
                  <h4>{s.name}</h4>
                  <p>{s.address}</p>
                  {s.distance && <span>{s.distance.toFixed(1)} km</span>}
                  <button>Detalhes</button>
                </li>
              ))
            )}
          </ul>
        )}
      </aside>
    </div>
  );
}