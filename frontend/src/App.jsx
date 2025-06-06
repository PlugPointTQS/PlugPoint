import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import MyReservations from './MyReservations';
import TripPlannerPage from './TripPlannerPage';
import FavoritesPage from './FavoritesPage';
import Management from './AdminPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-title">🔌 PlugPoint</div>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/reservations" className="nav-link">My Reservations</Link>
            <Link to="/trip-planner" className="nav-link">Trip Planner</Link>
            <Link to="/favorites" className="nav-link">Favoritos</Link>
            <Link to="/management" className="nav-link">Management</Link>
          </div>
        </nav>
        
        <main className="page-content">
          <Routes>
            <Route path="/" element={<div className="home-page-wrapper"><HomePage /></div>} />
            <Route path="/home" element={<div className="home-page-wrapper"><HomePage /></div>} />
            <Route path="/management" element={<div className="admin-page-wrapper"><Management /></div>} />
            <Route path="/reservations" element={<div className="reservations-page-wrapper"><MyReservations /></div>} />
            <Route path="/trip-planner" element={<div className="trip-planner-wrapper"><TripPlannerPage /></div>} />
            <Route path="/favorites" element={<div className="favorites-page-wrapper"><FavoritesPage /></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;