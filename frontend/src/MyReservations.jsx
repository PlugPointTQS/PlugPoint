import React, { useEffect, useState } from 'react';
import './MyReservations.css';

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [stationInfoMap, setStationInfoMap] = useState({});
  const [chargerMap, setChargerMap] = useState({});
  const userId = 1;

  useEffect(() => {
    const fetchAllReservationDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/reservations/user/${userId}`);
        const reservationsData = await res.json();
        setReservations(reservationsData);

        const chargerMapTemp = {};
        const stationMapTemp = {};

        for (const reservation of reservationsData) {
          const chargerId = reservation.chargerId;

          if (!chargerMapTemp[chargerId]) {
            const chargerRes = await fetch(`http://localhost:8080/api/chargers/${chargerId}`);
            const charger = await chargerRes.json();
            chargerMapTemp[chargerId] = charger;

            if (charger.stationId && !stationMapTemp[charger.stationId]) {
              const stationRes = await fetch(`http://localhost:8080/api/stations/${charger.stationId}`);
              const station = await stationRes.json();
              stationMapTemp[charger.stationId] = station;
            }
          }
        }

        setChargerMap(chargerMapTemp);
        setStationInfoMap(stationMapTemp);
      } catch (error) {
        console.error('Error fetching reservations and data:', error);
      }
    };

    fetchAllReservationDetails();
  }, []);

  const handleCancel = async (reservationId) => {
    try {
      await fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    } catch (err) {
      console.error('Error cancelling reservation:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ACTIVE: 'status-active',
      CANCELLED: 'status-cancelled',
      CONFIRMED: 'status-confirmed',
      PENDING: 'status-pending'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="reservations-page">
      <div className="reservations-header">
        <h2 className="reservations-title">🔌 My Reservations</h2>
        <div className="reservations-count">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</div>
      </div>

      {reservations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔋</div>
          <h3>No reservations found</h3>
          <p>It looks like you haven't made any reservations yet.</p>
        </div>
      ) : (
        <div className="reservation-grid">
          {reservations.map((res) => {
            const charger = chargerMap[res.chargerId];
            const station = charger?.stationId ? stationInfoMap[charger.stationId] : null;
            const startDate = new Date(res.startTime);
            const endDate = new Date(res.endTime);

            return (
              <div key={res.id} className="reservation-card">
                <div className="card-header">
                  <h3 className="station-name">{station?.name || 'Unknown station'}</h3>
                  {getStatusBadge(res.status)}
                </div>
                
                <div className="card-section">
                  <h4 className="section-title">📍 Location</h4>
                  <p className="station-address">{station?.address || '---'}</p>
                </div>

                {charger && (
                  <div className="card-section">
                    <h4 className="section-title">🔌 Charger</h4>
                    <div className="charger-details">
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span>{charger.type}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Power:</span>
                        <span>{charger.power} kW</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="card-section">
                  <h4 className="section-title">🕒 Schedule</h4>
                  <div className="time-details">
                    <div className="time-item">
                      <span className="time-label">Start:</span>
                      <span>{startDate.toLocaleDateString()}</span>
                      <span>{startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="time-item">
                      <span className="time-label">End:</span>
                      <span>{endDate.toLocaleDateString()}</span>
                      <span>{endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="cancel-button" onClick={() => handleCancel(res.id)}>
                    Cancel Reservation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyReservations;
