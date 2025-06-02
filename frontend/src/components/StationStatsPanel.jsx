import React, {useState, useEffect} from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatISO, subDays } from 'date-fns';

const StationStatsPanel = ({ stationId, onClose }) => {
  const [range, setRange] = useState({
    from: formatISO(subDays(new Date(), 7)),
    to:   formatISO(new Date())
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!stationId) return;
    (async () => {
      setLoading(true);
      try {
        const q = `from=${range.from}&to=${range.to}`;
        const res = await fetch(`http://localhost:8080/api/admin/stations/${stationId}/stats?${q}`);
        if (!res.ok) throw new Error('Falha a obter estatísticas');
        setStats(await res.json());
      } catch (e) { setError(e.message); }
      finally     { setLoading(false); }
    })();
  }, [stationId, range]);

  const handleExport = async () => {
    const q = `from=${range.from}&to=${range.to}`;
    const res = await fetch(`http://localhost:8080/api/admin/stations/${stationId}/stats/export?${q}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `station-${stationId}-stats.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* UI --------------------------------------- */
  if (loading) return <p>Carregando…</p>;
  if (error)   return <p className="error">{error}</p>;

  if (!stats || stats.sessions === 0)
    return <p>Sem dados para o período escolhido.</p>;

  return (
    <div className="stats-panel">
      <h2>Estatísticas</h2>

      <label>De:&nbsp;
        <input type="datetime-local"
               value={range.from.slice(0,16)}
               onChange={e => setRange(r => ({...r, from: e.target.value}))}/>
      </label>
      <label>Até:&nbsp;
        <input type="datetime-local"
               value={range.to.slice(0,16)}
               onChange={e => setRange(r => ({...r, to: e.target.value}))}/>
      </label>

      <div className="kpi-row">
        <div className="kpi"><span>{stats.energyDeliveredKWh.toFixed(1)}</span> kWh</div>
        <div className="kpi"><span>{stats.sessions}</span> sessões</div>
        <div className="kpi"><span>{stats.averageOccupancyPct.toFixed(1)} %</span> ocupação</div>
      </div>

      {/* **gráfico simples – energia vs tempo (mock porque devolvemos só total)** */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={[stats]} >
          <XAxis dataKey={() => 'Período'} hide />
          <YAxis hide />
          <Tooltip />
          <Area type="monotone" dataKey="energyDeliveredKWh" strokeWidth={1} fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>

      <button onClick={handleExport}>Exportar CSV</button>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
};

export default StationStatsPanel;
