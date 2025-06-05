import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminPage.css';
import './MyReservations.css';
import './HomePage.css';
import StationStatsPanel from './components/StationStatsPanel';

const chargerIcon = new L.Icon({
  iconUrl: '/battery-charging.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('stations');
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [isLoadingChargers, setIsLoadingChargers] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const mapRef = useRef(null);
  const statsMapRef = useRef(null);

  const [isAddStationModalOpen, setIsAddStationModalOpen] = useState(false);
  const [newStation, setNewStation] = useState({ name: '', address: '', latitude: '', longitude: '' });
  const [newChargers, setNewChargers] = useState([]);
  const [tempCharger, setTempCharger] = useState({ type: 'TYPE2', power: '', status: 'AVAILABLE' });

  const [showStats, setShowStats] = useState(false);
  const [statsStationId, setStatsStationId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/stations')
      .then((res) => res.json())
      .then((data) => setStations(data))
      .catch((err) => console.error('Erro ao carregar estações:', err));
  }, []);

  const handleFlyTo = async (station) => {
    if (mapRef.current) {
      mapRef.current.flyTo([station.latitude, station.longitude], 14, {
        animate: true,
        duration: 1.5,
      });
    }

    try {
      const res = await fetch(`http://localhost:8080/api/stations/${station.id}`);
      const fullStation = res.ok ? await res.json() : station;
      setSelectedStation(fullStation);
    } catch (err) {
      console.error('Falha a obter detalhes: ', err);
      setSelectedStation(station);
    }

    try {
      setIsLoadingChargers(true);
      const chargersRes = await fetch(`http://localhost:8080/api/chargers/station/${station.id}`);
      if (!chargersRes.ok) throw new Error('Falha carregar carregadores');
      const chargersData = await chargersRes.json();
      setChargers(chargersData);
    } catch (err) {
      console.error('Erro ao buscar carregadores:', err);
      setChargers([]);
    } finally {
      setIsLoadingChargers(false);
    }
  };

  const handleSelectStationForStats = (station) => {
    if (statsMapRef.current) {
      statsMapRef.current.flyTo([station.latitude, station.longitude], 14, {
        animate: true,
        duration: 1.2,
      });
    }
    setStatsStationId(station.id);
    setShowStats(true);
  };

  const closeModal = () => {
    setSelectedStation(null);
    setChargers([]);
    setIsEditing(false);
  };

  const getStatusClass = (status) => {
    if (status === 'AVAILABLE') return 'available';
    if (status === 'IN_USE') return 'unavailable';
    if (status === 'MAINTENANCE') return 'maintenance';
    return '';
  };

  const renderStationDetails = () => {
    if (!selectedStation) return null;
    const { name, address } = selectedStation;

    const handleEditToggle = () => {
      if (isEditing) {
        chargers.forEach((charger) => {
          fetch(`http://localhost:8080/api/chargers/${charger.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(charger),
          })
            .then((res) => {
              if (!res.ok) throw new Error('Erro ao atualizar carregador');
            })
            .catch((err) => console.error(err));
        });
      }
      setIsEditing((prev) => !prev);
    };

    const statusOptions = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'];

    return (
      <>
        <div className="modal-backdrop" onClick={closeModal} />
        <div style={{ position: 'fixed', top: '8%', left: '50%', transform: 'translateX(-50%)', zIndex: 999, width: 'min(500px, 92vw)' }}>
          <div className="station-details" style={{ borderColor: '#1e90ff' }}>
            <div className="address-directions-container">
              <div className="station-address">
                {isEditing ? (
                  <>
                    <input value={selectedStation.name} onChange={(e) => setSelectedStation((prev) => ({ ...prev, name: e.target.value }))} className="edit-input" autoFocus />
                    <input value={selectedStation.address} onChange={(e) => setSelectedStation((prev) => ({ ...prev, address: e.target.value }))} className="edit-input" />
                  </>
                ) : (
                  <>
                    <h3>{name}</h3>
                    <h3>{address}</h3>
                  </>
                )}
              </div>
            </div>

            <div className="station-connections">
              {isLoadingChargers ? (
                <p>Loading chargers…</p>
              ) : chargers.length > 0 ? (
                chargers.map((charger, index) => (
                  <div key={charger.id ?? index} className="connection-card">
                    <div className="charger-info">
                      <h4>Charger {index + 1}</h4>
                      {isEditing ? (
                        <>
                          <input value={charger.type} className="edit-input" onChange={(e) => {
                            const newChargers = [...chargers];
                            newChargers[index] = { ...charger, type: e.target.value };
                            setChargers(newChargers);
                          }} />
                          <input value={charger.power} className="edit-input" onChange={(e) => {
                            const newChargers = [...chargers];
                            newChargers[index] = { ...charger, power: e.target.value };
                            setChargers(newChargers);
                          }} />
                          <div className="status-toggle">
                            {statusOptions.map((status) => (
                              <label key={status} className={`status-option ${getStatusClass(status)}`}>
                                <input type="radio" name={`status-${index}`} value={status} checked={charger.status === status} onChange={() => {
                                  const newChargers = [...chargers];
                                  newChargers[index] = { ...charger, status };
                                  setChargers(newChargers);
                                }} />
                                {status}
                              </label>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <p><strong>Type:</strong> {charger.type}</p>
                          <p><strong>Power:</strong> {charger.power} kW</p>
                          <p className={`status ${getStatusClass(charger.status)}`}>{charger.status}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No chargers available</p>
              )}
            </div>

            <div className="station-footer" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <p style={{ flex: 1 }}>🔌 {chargers.length} charger{chargers.length !== 1 ? 's' : ''} registered</p>
              <button className="edit-button2" onClick={handleEditToggle}>{isEditing ? '✅ Confirmar' : '✏️ Editar'}</button>
              <button className="cancel-button" onClick={closeModal}>Fechar</button>
              <button className="edit-button2" onClick={() => { setStatsStationId(selectedStation.id); setShowStats(true); }}>📊 Estatísticas</button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2 className="admin-title">Administração</h2>
        <ul className="admin-nav">
          <li className={activeTab === 'stations' ? 'active' : ''} onClick={() => setActiveTab('stations')}>Gerir Estações</li>
          <li className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>Estatísticas</li>
          <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Utilizadores</li>
        </ul>
      </div>

      <div className="admin-content">
        {activeTab === 'stations' && (
          <div className="admin-section admin-grid">
            <div className="map-column">
              <MapContainer
                center={[39.5, -8.0]}
                zoom={7}
                scrollWheelZoom
                className="map-view"
                whenCreated={(m) => (mapRef.current = m)}
              >
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {stations.map((s) => (
                  <Marker key={s.id} position={[s.latitude, s.longitude]} icon={chargerIcon} eventHandlers={{ click: () => handleFlyTo(s) }} />
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="admin-section admin-grid">
            <div className="map-column">
              <MapContainer
                center={[39.5, -8.0]}
                zoom={7}
                scrollWheelZoom
                className="map-view"
                whenCreated={(m) => (statsMapRef.current = m)}
              >
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {stations.map((s) => (
                  <Marker key={s.id} position={[s.latitude, s.longitude]} icon={chargerIcon} eventHandlers={{ click: () => handleSelectStationForStats(s) }} />
                ))}
              </MapContainer>
            </div>
            {!showStats && (
              <div className="placeholder">
                <h3>Seleciona uma estação no mapa para ver estatísticas.</h3>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedStation && renderStationDetails()}

      {showStats && (
        <StationStatsPanel stationId={statsStationId} onClose={() => setShowStats(false)} />
      )}
    </div>
  );
};

export default AdminPage;