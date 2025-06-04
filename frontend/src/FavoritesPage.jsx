import React, { useEffect, useState } from 'react';
import './FavoritesPage.css';

export default function FavoritesPage() {
  const [stations, setStations] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    fetch('http://deti-tqs-13.ua.pt:8080/api/stations')
      .then(res => res.json())
      .then(data => setStations(data));
  }, []);

  const favoriteStations = stations.filter(s => favorites.includes(s.id));

  const removeFromFavorites = (id) => {
    const updated = favorites.filter(favId => favId !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div className="favorites-container">
      <h2>⭐ Estações Favoritas</h2>
      {favoriteStations.length === 0 ? (
        <p>Não tens estações favoritas.</p>
      ) : (
        <ul className="favorites-list">
          {favoriteStations.map(station => (
            <li key={station.id} className="favorite-card">
              <div className="fav-card-content">
                <div>
                  <h3>{station.name}</h3>
                  <p>{station.address}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver no Google Maps
                  </a>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromFavorites(station.id)}
                  title="Remover dos favoritos"
                >
                  🗑️ Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
