import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminPage.css';
import './MyReservations.css';
import './HomePage.css';

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

  const [isAddStationModalOpen, setIsAddStationModalOpen] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [newChargers, setNewChargers] = useState([]);
  const [tempCharger, setTempCharger] = useState({ type: 'TYPE2', power: '', status: 'AVAILABLE' });


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

        <div
          style={{
            position: 'fixed',
            top: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            width: 'min(500px, 92vw)',
          }}
        >
          <div className="station-details" style={{ borderColor: '#1e90ff' }}>
            <div className="address-directions-container">
              <div className="station-address">
                {isEditing ? (
                  <>
                    <input
                      value={selectedStation.name}
                      onChange={(e) =>
                        setSelectedStation((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="edit-input"
                      autoFocus
                    />
                    <input
                      value={selectedStation.address}
                      onChange={(e) =>
                        setSelectedStation((prev) => ({ ...prev, address: e.target.value }))
                      }
                      className="edit-input"
                    />
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
                          <input
                            value={charger.type}
                            className="edit-input"
                            onChange={(e) => {
                              const newChargers = [...chargers];
                              newChargers[index] = { ...charger, type: e.target.value };
                              setChargers(newChargers);
                            }}
                          />
                          <input
                            value={charger.power}
                            className="edit-input"
                            onChange={(e) => {
                              const newChargers = [...chargers];
                              newChargers[index] = { ...charger, power: e.target.value };
                              setChargers(newChargers);
                            }}
                          />
                          <div className="status-toggle">
                            {statusOptions.map((status) => (
                              <label key={status} className={`status-option ${getStatusClass(status)}`}>
                                <input
                                  type="radio"
                                  name={`status-${index}`}
                                  value={status}
                                  checked={charger.status === status}
                                  onChange={() => {
                                    const newChargers = [...chargers];
                                    newChargers[index] = { ...charger, status };
                                    setChargers(newChargers);
                                  }}
                                />
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
              <button className="edit-button2" onClick={handleEditToggle}>
                {isEditing ? '✅ Confirmar' : '✏️ Editar'}
              </button>
              <button className="cancel-button" onClick={closeModal}>
                Fechar
              </button>
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
          <li className={activeTab === 'stations' ? 'active' : ''} onClick={() => setActiveTab('stations')}>
            Gerir Estações
          </li>
          <li className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
            Estatísticas
          </li>
          <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            Utilizadores
          </li>
        </ul>
      </div>

      <div className="admin-content">
        {activeTab === 'stations' && (
          <div className="admin-section admin-grid">
            <button className="edit-button2" onClick={() => setIsAddStationModalOpen(true)}>➕ Nova Estação</button>
            {isAddStationModalOpen && (
              <>
                <div className="modal-backdrop" onClick={() => setIsAddStationModalOpen(false)} />
                <div className="edit-modal">
                  <h3>Nova Estação</h3>

                  <input placeholder="Nome" value={newStation.name} onChange={(e) => setNewStation({ ...newStation, name: e.target.value })} />
                  <input placeholder="Morada" value={newStation.address} onChange={(e) => setNewStation({ ...newStation, address: e.target.value })} />
                  <input placeholder="Latitude" value={newStation.latitude} onChange={(e) => setNewStation({ ...newStation, latitude: e.target.value })} />
                  <input placeholder="Longitude" value={newStation.longitude} onChange={(e) => setNewStation({ ...newStation, longitude: e.target.value })} />

                  <h4>Adicionar Charger</h4>
                  <input placeholder="Potência" value={tempCharger.power} onChange={(e) => setTempCharger({ ...tempCharger, power: e.target.value })} />
                  <select value={tempCharger.type} onChange={(e) => setTempCharger({ ...tempCharger, type: e.target.value })}>
                    <option value="TYPE2">TYPE2</option>
                    <option value="CHADEMO">CHADEMO</option>
                    <option value="CCS">CCS</option>
                    <option value="TESLA">TESLA</option>
                    <option value="AC">AC</option>
                    <option value="DC">DC</option>
                  </select>
                  <select value={tempCharger.status} onChange={(e) => setTempCharger({ ...tempCharger, status: e.target.value })}>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="IN_USE">IN_USE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                  <button className="edit-button" onClick={() => {
                    setNewChargers([...newChargers, tempCharger]);
                    setTempCharger({ type: 'TYPE2', power: '', status: 'AVAILABLE' });
                  }}>Adicionar Charger</button>

                  <ul style={{ marginTop: '1rem' }}>
                    {newChargers.map((ch, i) => (
                      <li key={i}>
                        🔌 {ch.type} - {ch.power} kW - {ch.status}
                        <button
                          className="delete-charger-btn"
                          onClick={() => {
                            setNewChargers(newChargers.filter((_, index) => index !== i));
                          }}
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="modal-actions">
                    <button onClick={() => {
                      // 1. Criar estação
                      fetch('http://localhost:8080/api/stations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newStation),
                      })
                        .then(res => res.json())
                        .then(createdStation => {
                          // 2. Criar carregadores associados
                          newChargers.forEach(ch => {
                            fetch('http://localhost:8080/api/chargers', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ...ch, stationId: createdStation.id }),
                            });
                          });
                          // Reset
                          setIsAddStationModalOpen(false);
                          setNewStation({ name: '', address: '', latitude: '', longitude: '' });
                          setNewChargers([]);
                          // Recarrega estações
                          fetch('http://localhost:8080/api/stations')
                            .then((res) => res.json())
                            .then((data) => setStations(data));
                        });
                    }}>✅ Criar Estação</button>

                    <button className="cancel-button" onClick={() => setIsAddStationModalOpen(false)}>Cancelar</button>
                  </div>
                </div>
              </>
            )}

            <div className="map-column">
              <MapContainer
                center={[39.5, -8.0]}
                zoom={7}
                scrollWheelZoom
                className="map-view"
                whenCreated={(m) => (mapRef.current = m)}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {stations.map((s) => (
                  <Marker
                    key={s.id}
                    position={[s.latitude, s.longitude]}
                    icon={chargerIcon}
                    eventHandlers={{ click: () => handleFlyTo(s) }}
                  />
                ))}
              </MapContainer>
            </div>
          </div>
        )}
      </div>

      {selectedStation && renderStationDetails()}
    </div>
  );
};

export default AdminPage;