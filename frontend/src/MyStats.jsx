import React, { useEffect, useState } from 'react';
import './MyStats.css';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Fatores aproximados de CO₂ poupado (kg CO₂ por kWh) dependendo do tipo de carregador.
// Estes valores são meramente indicativos e podem ser ajustados conforme a fonte de energia.
const CO2_FACTORS = {
  TYPE2: 0.20,
  CHADEMO: 0.18,
  CCS: 0.18,
  TESLA: 0.17,
  AC: 0.22,
  DC: 0.19,
};

/**
 * Calcula o CO₂ poupado numa reserva de 1 hora, em kg.
 *
 * A fórmula base: CO₂_poupado = (potência_em_kW × horas) × fator_co2.
 * Como cada reserva é sempre de 1 hora, a componente "horas" é 1.
 *
 * @param {string} chargerType — tipo do carregador (enum ChargerType).
 * @param {number} power — potência do carregador em kW.
 * @returns {number} valor de CO₂ poupado em kg, arredondado a 2 casas decimais.
 */
function calculateCO2Saved(chargerType, power) {
  const factor = CO2_FACTORS[chargerType] || 0.18; // valor padrão caso o tipo não exista no map
  const co2Saved = power * factor * 1; // horas = 1
  return parseFloat(co2Saved.toFixed(2));
}

export default function MyStats() {
  const [reservations, setReservations] = useState([]);
  const [stationInfoMap, setStationInfoMap] = useState({});
  const [chargerMap, setChargerMap] = useState({});
  const userId = 1;

  useEffect(() => {
    const fetchAllReservationDetails = async () => {
      try {
        const res = await fetch(`${baseUrl}/reservations/user/${userId}`);
        const reservationsData = (await res.json()) || [];
        setReservations(reservationsData);

        const chargerMapTemp = {};
        const stationMapTemp = {};

        for (const reservation of reservationsData) {
          // ── Somente reservas CONFIRMED importam para estatísticas
          if (reservation.status !== 'CONFIRMED') continue;

          const chargerId = reservation.chargerId;
          if (!chargerMapTemp[chargerId]) {
            const chargerRes = await fetch(`${baseUrl}/chargers/${chargerId}`);
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
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchAllReservationDetails();
  }, []);

  // ───────────────────────── derived data ──────────────────────────
  const confirmed = reservations.filter((r) => r.status === 'CONFIRMED');

  // Total de potência reservada (kW)
  const totalPower = confirmed.reduce((sum, r) => {
    const ch = chargerMap[r.chargerId];
    return sum + (ch?.power || 0);
  }, 0);

  // Total de CO₂ poupado (kg), somando cada reserva de 1h
  const totalCO2 = confirmed.reduce((sum, r) => {
    const ch = chargerMap[r.chargerId];
    if (!ch) return sum;
    return sum + calculateCO2Saved(ch.type, ch.power);
  }, 0);

  const uniqueStations = new Set(
    confirmed.map((r) => {
      const ch = chargerMap[r.chargerId];
      return ch?.stationId;
    })
  ).size;

  // Componente de badge CONFIRMED
  const ConfirmedBadge = () => (
    <span className="status-badge status-confirmed">CONFIRMED</span>
  );

  return (
    <div className="stats-page">
      <div className="content-wrapper">
        {/* ── LEFT: GRID DE CARTÕES */}
        <div className="cards-column">
          <h2 className="section-title">🔌 Confirmed Reservations</h2>
          {confirmed.length === 0 ? (
            <p className="no-data">No confirmed reservations yet.</p>
          ) : (
            <div className="reservation-grid stats-grid">
              {confirmed.map((res) => {
                const charger = chargerMap[res.chargerId];
                const station = charger?.stationId
                  ? stationInfoMap[charger.stationId]
                  : null;
                const start = new Date(res.startTime);
                const co2Saved = charger
                  ? calculateCO2Saved(charger.type, charger.power)
                  : 0;

                return (
                  <div className="reservation-card sm" key={res.id}>
                    <div className="card-header">
                      <h3 className="station-name">
                        {station?.name || 'Unknown Station'}
                      </h3>
                      <ConfirmedBadge />
                    </div>

                    <div className="card-section">
                      <h4 className="section-sub">
                        📍 {station?.address || 'Unknown address'}
                      </h4>
                    </div>

                    {charger && (
                      <div className="card-section charger-line">
                        <span>{charger.type}</span>
                        <span>{charger.power} kW</span>
                      </div>
                    )}

                    <div className="card-section date-line">
                      <span>
                        {start.toLocaleDateString()} —{' '}
                        {start.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="card-section co2-line">
                      <span>🌿 CO₂ Saved:</span>
                      <span>{co2Saved} kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: PAINEL DE ESTATÍSTICAS */}
        <aside className="stats-panel">
          <h3 className="panel-title">📊 Statistics</h3>
          <ul className="stats-list">
            <li>
              <span>Total confirmed</span>
              <span>{confirmed.length}</span>
            </li>
            <li>
              <span>Unique stations</span>
              <span>{uniqueStations}</span>
            </li>
            <li>
              <span>Total reserved power</span>
              <span>{totalPower.toFixed(1)} kW</span>
            </li>
            <li>
              <span>Total CO₂ Saved</span>
              <span>{totalCO2.toFixed(2)} kg</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
