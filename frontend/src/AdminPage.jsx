import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminPage.css';
import StationStatsPanel from './components/StationStatsPanel';
const baseUrl = import.meta.env.VITE_API_BASE_URL;


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
  const [showStats, setShowStats] = useState(false);
  const [statsStationId, setStatsStationId] = useState(null);
  useEffect(() => {
    fetch(`${baseUrl}/stations`)
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
      const res = await fetch(`${baseUrl}/stations/${station.id}`);
      const fullStation = res.ok ? await res.json() : station;
      setSelectedStation(fullStation);
    } catch (err) {
      console.error('Falha a obter detalhes: ', err);
      setSelectedStation(station);
    }

    try {
      setIsLoadingChargers(true);
      const chargersRes = await fetch(`${baseUrl}/chargers/station/${station.id}`);
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
    const statusOptions = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'];
  
    const handleEditToggle = () => {
      if (isEditing) {
        // Lógica para salvar as alterações
        chargers.forEach((charger) => {
          fetch(`${baseUrl}/chargers/${charger.id}`, {
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
  
    return (
      <div className="station-details-modal">
        <div className="modal-backdrop" onClick={closeModal} />
        <div className="modal-content">
          <div className="modal-header">
            {isEditing ? (
              <div className="edit-form-container">
                <div className="edit-form-row">
                  <div className="edit-form-group">
                    <label>Nome da Estação</label>
                    <input
                      type="text"
                      value={selectedStation.name}
                      onChange={(e) => setSelectedStation((prev) => ({ ...prev, name: e.target.value }))}
                      className="edit-form-input"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="edit-form-row">
                  <div className="edit-form-group">
                    <label>Endereço</label>
                    <input
                      type="text"
                      value={selectedStation.address}
                      onChange={(e) => setSelectedStation((prev) => ({ ...prev, address: e.target.value }))}
                      className="edit-form-input"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h3>{selectedStation.name}</h3>
                <p>{selectedStation.address}</p>
              </>
            )}
          </div>
  
          <div className="chargers-section">
            <h4 className="edit-section-title">Carregadores</h4>
            {isLoadingChargers ? (
              <div className="loading-chargers">Carregando...</div>
            ) : chargers.length > 0 ? (
              <div className="chargers-grid">
                {chargers.map((charger, index) => (
                  <div key={charger.id ?? index} className="charger-edit-card">
                    <div className="charger-edit-header">
                      <h5 className="charger-edit-title">Carregador {index + 1}</h5>
                      {isEditing && (
                        <button className="delete-charger-btn">×</button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="charger-edit-form">
                        <div className="edit-form-row">
                          <div className="edit-form-group">
                            <label>Tipo</label>
                            <select
                              value={charger.type}
                              onChange={(e) => {
                                const newChargers = [...chargers];
                                newChargers[index] = { ...charger, type: e.target.value };
                                setChargers(newChargers);
                              }}
                              className="edit-form-input"
                            >
                              <option value="TYPE2">TYPE2</option>
                              <option value="CHADEMO">CHADEMO</option>
                              <option value="CCS">CCS</option>
                            </select>
                          </div>
                          <div className="edit-form-group">
                            <label>Potência (kW)</label>
                            <input
                              type="number"
                              value={charger.power}
                              onChange={(e) => {
                                const newChargers = [...chargers];
                                newChargers[index] = { ...charger, power: e.target.value };
                                setChargers(newChargers);
                              }}
                              className="edit-form-input"
                            />
                          </div>
                        </div>
                        <div className="edit-form-row">
                          <div className="edit-form-group">
                            {/* Substituir a seção de status options por este código */}
                              <div className="status-options-container">
                                <label>Status</label>
                                <div className="status-options-grid">
                                  {statusOptions.map((status) => (
                                    <div key={status} className={`status-option ${getStatusClass(status)}`}>
                                      <label>
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
                                        <span className="status-option-visual">
                                          {status === 'AVAILABLE' && 'Disponível'}
                                          {status === 'IN_USE' && 'Em Uso'}
                                          {status === 'MAINTENANCE' && 'Manutenção'}
                                        </span>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="charger-info">
                        <p><strong>Tipo:</strong> {charger.type}</p>
                        <p><strong>Potência:</strong> {charger.power} kW</p>
                        <p className={`status ${getStatusClass(charger.status)}`}>
                          {charger.status === 'AVAILABLE' && 'Disponível'}
                          {charger.status === 'IN_USE' && 'Em Uso'}
                          {charger.status === 'MAINTENANCE' && 'Em Manutenção'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-chargers">Nenhum carregador disponível</p>
            )}
          </div>
  
          <div className="modal-footer-edit">
            <button className="edit-btn" onClick={handleEditToggle}>
              {isEditing ? '✅ Salvar Alterações' : '✏️ Editar Estação'}
            </button>
            <button className="close-btn" onClick={closeModal}>Fechar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2 className="admin-title">
          <i className="icon-admin"></i> Administração
        </h2>
        <ul className="admin-nav">
          <li 
            className={activeTab === 'stations' ? 'active' : ''} 
            onClick={() => setActiveTab('stations')}
          >
            <i className="icon-stations"></i> Gerir Estações
          </li>
          
          <li 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <i className="icon-users"></i> Utilizadores
          </li>
        </ul>
      </div>

      <div className="admin-content">
        {activeTab === 'stations' && (
          <div className="stations-view">
            <div className="map-container">
              <MapContainer
                center={[39.5, -8.0]}
                zoom={7}
                scrollWheelZoom
                className="admin-map"
                whenCreated={(m) => (mapRef.current = m)}
              >
                <TileLayer 
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
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
            
            <div className="stations-list">
              <div className="list-header">
                <h3>Estações ({stations.length})</h3>
                <button 
                  className="add-station-btn"
                  onClick={() => setIsAddStationModalOpen(true)}
                >
                  <i className="icon-plus"></i> Nova Estação
                </button>
              </div>
              
              <div className="stations-scroll">
                {stations.map(station => (
                  <div 
                    key={station.id} 
                    className={`station-card ${selectedStation?.id === station.id ? 'active' : ''}`}
                    onClick={() => handleFlyTo(station)}
                  >
                    <div className="station-info">
                      <h4>{station.name}</h4>
                      <p>{station.address}</p>
                    </div>
                    <div className="station-actions">
                      <button 
                        className="stats-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStationForStats(station);
                        }}
                      >
                        <i className="icon-stats"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        
      </div>

      {selectedStation && renderStationDetails()}

      {showStats && (
        <StationStatsPanel 
          stationId={statsStationId} 
          onClose={() => setShowStats(false)} 
        />
      )}

      {isAddStationModalOpen && (
        <div className="add-station-modal">
          <div className="modal-backdrop" onClick={() => setIsAddStationModalOpen(false)} />
          <div className="modal-content">
            <h3>Adicionar Nova Estação</h3>
            <div className="form-group">
              <label>Nome</label>
              <input 
                type="text" 
                value={newStation.name}
                onChange={(e) => setNewStation({...newStation, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input 
                type="text" 
                value={newStation.address}
                onChange={(e) => setNewStation({...newStation, address: e.target.value})}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input 
                  type="number" 
                  value={newStation.latitude}
                  onChange={(e) => setNewStation({...newStation, latitude: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input 
                  type="number" 
                  value={newStation.longitude}
                  onChange={(e) => setNewStation({...newStation, longitude: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsAddStationModalOpen(false)}>
                Cancelar
              </button>
              <button className="confirm-btn" onClick={() => {
                // Implementar lógica para adicionar nova estação
                setIsAddStationModalOpen(false);
              }}>
                Adicionar Estação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;