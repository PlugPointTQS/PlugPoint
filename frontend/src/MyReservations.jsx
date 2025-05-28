import React, { useEffect, useState } from 'react';
import './MyReservations.css';

function MyReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('reservations');
    if (stored) {
      setReservations(JSON.parse(stored));
    }
  }, []);

  const handleCancel = (index) => {
    const updated = [...reservations];
    updated.splice(index, 1);
    setReservations(updated);
    localStorage.setItem('reservations', JSON.stringify(updated));
  };

  return (
    <div className="reservations-page">
      <h2 className="reservations-title">🔌 Minhas Reservas</h2>
      {reservations.length === 0 ? (
        <p className="empty-message">⚠️ Nenhuma reserva encontrada.</p>
      ) : (
        <div className="reservation-grid">
          {reservations.map((res, i) => (
            <div key={i} className="reservation-card">
              <h3>📍 {res.title}</h3>
              <p><strong>📫 Morada:</strong> {res.address}</p>
              <p><strong>🏙️ Cidade:</strong> {res.city}</p>
              <p><strong>📮 Código Postal:</strong> {res.postcode}</p>
              <button className="cancel-button" onClick={() => handleCancel(i)}>Cancelar Reserva</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReservations;
