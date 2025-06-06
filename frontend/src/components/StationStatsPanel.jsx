import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatISO, subDays, format } from 'date-fns';
import './StationStatsPanel.css'; // Import your CSS styles

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

  if (loading) return (
    <div className="stats-panel">
      <div className="loading-spinner"></div>
      <p>Carregando...</p>
    </div>
  );

  if (error) return (
    <div className="stats-panel">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{error}</p>
      <button onClick={onClose} className="close-btn">
        Fechar
      </button>
    </div>
  );

  if (!stats || stats.sessions === 0) {
    return (
      <div className="stats-panel no-data">
        <div className="no-data-icon">📉</div>
        <h3>Sem dados</h3>
        <p>Não foram encontrados dados para o período escolhido.</p>
        <button onClick={onClose} className="close-btn">
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h2>Estatísticas da Estação</h2>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="date-range">
        <div className="date-input">
          <label>De:</label>
          <input
            type="datetime-local"
            value={range.from.slice(0, 16)}
            onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
          />
        </div>
        <div className="date-input">
          <label>Até:</label>
          <input
            type="datetime-local"
            value={range.to.slice(0, 16)}
            onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
          />
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value">{stats.energyDeliveredKWh.toFixed(1)}</div>
          <div className="kpi-label">kWh Entregues</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{stats.sessions}</div>
          <div className="kpi-label">Sessões</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{stats.averageOccupancyPct.toFixed(1)}%</div>
          <div className="kpi-label">Ocupação Média</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Energia Entregue por Dia (kWh)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyEnergyData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="energyKWh" 
              stroke="#3182ce" 
              fill="#3182ce33" 
              strokeWidth={2} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="panel-footer">
        <button onClick={handleExport} className="export-btn">
          Exportar CSV
        </button>
      </div>
    </div>
  );
};

export default StationStatsPanel;