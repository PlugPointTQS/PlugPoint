import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatISO, subDays, format } from 'date-fns';

const StationStatsPanel = ({ stationId, onClose }) => {
  const [range, setRange] = useState({
    from: formatISO(subDays(new Date(), 7)),
    to: formatISO(new Date())
  });
  const [stats, setStats] = useState(null);
  const [dailyEnergyData, setDailyEnergyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stationId) return;

    (async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ from: range.from, to: range.to }).toString();

        // fetch estatísticas totais
        const res = await fetch(`http://localhost:8080/api/admin/stations/${stationId}/stats?${q}`);
        if (!res.ok) throw new Error('Falha a obter estatísticas');
        setStats(await res.json());

        // fetch energia diária
        const energyRes = await fetch(`http://localhost:8080/api/admin/stations/${stationId}/stats/daily-energy?${q}`);
        if (!energyRes.ok) throw new Error('Falha a obter energia por dia');
        const daily = await energyRes.json();

        // formatar datas para o gráfico (recharts precisa de strings no eixo X)
        const formatted = daily.map(entry => ({
          ...entry,
          date: format(new Date(entry.date), 'dd/MM')
        }));

        setDailyEnergyData(formatted);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [stationId, range]);

  const handleExport = async () => {
    const q = new URLSearchParams({ from: range.from, to: range.to }).toString();
    const res = await fetch(`http://localhost:8080/api/admin/stations/${stationId}/stats/export?${q}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `station-${stationId}-stats.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="stats-panel"><p>Carregando…</p></div>;
  if (error) return <div className="stats-panel"><p className="error">{error}</p></div>;
  if (!stats || stats.sessions === 0) {
    return (
      <div className="stats-panel" style={{
        background: '#13293d',
        color: '#e6f4ff',
        border: '2px solid #1e90ff',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        margin: '0 auto',
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        boxShadow: '0 0 20px rgba(0,0,0,0.4)',
        zIndex: 9999,
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>📉 Sem dados</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.85 }}>
          Não foram encontrados dados para o período escolhido.
        </p>
        <button onClick={onClose} style={{
          marginTop: '1.5rem',
          background: '#e53e3e',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '0.6rem 1.2rem',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div className="stats-panel" style={panelStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>📊 Estatísticas</h2>

      <div style={dateRowStyle}>
        <label>De:&nbsp;
          <input type="datetime-local"
                 value={range.from.slice(0, 16)}
                 onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
                 style={inputStyle} />
        </label>
        <label>Até:&nbsp;
          <input type="datetime-local"
                 value={range.to.slice(0, 16)}
                 onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
                 style={inputStyle} />
        </label>
      </div>

      <div style={kpiRowStyle}>
        <div><span style={valueStyle}>{stats.energyDeliveredKWh.toFixed(1)}</span><br />kWh</div>
        <div><span style={valueStyle}>{stats.sessions}</span><br />sessões</div>
        <div><span style={valueStyle}>{stats.averageOccupancyPct.toFixed(1)}%</span><br />ocupação</div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={dailyEnergyData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="energyKWh" stroke="#4a90e2" fill="#4a90e244" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>

      <div style={footerStyle}>
        <button onClick={handleExport} style={buttonStyle}>Exportar CSV</button>
        <button onClick={onClose} style={{ ...buttonStyle, background: '#e53e3e' }}>Fechar</button>
      </div>
    </div>
  );
};

const panelStyle = {
  background: '#13293d',
  color: '#e6f4ff',
  border: '2px solid #1e90ff',
  borderRadius: '12px',
  padding: '1.5rem',
  maxWidth: '620px',
  margin: '0 auto',
  position: 'fixed',
  top: '10%',
  left: '50%',
  transform: 'translateX(-50%)',
  boxShadow: '0 0 20px rgba(0,0,0,0.4)',
  zIndex: 9999
};

const dateRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  marginBottom: '1rem'
};

const inputStyle = {
  background: '#1c3a57',
  color: 'white',
  border: '1px solid #4a90e2',
  borderRadius: 6,
  padding: '0.3rem',
  fontSize: '0.95rem'
};

const kpiRowStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: '1.2rem',
  textAlign: 'center'
};

const valueStyle = {
  fontSize: '1.6rem',
  fontWeight: 'bold',
  color: '#ffffff'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '1rem'
};

const buttonStyle = {
  background: '#1e90ff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.6rem 1.2rem',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default StationStatsPanel;
