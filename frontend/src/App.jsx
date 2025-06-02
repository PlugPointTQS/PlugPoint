import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import MyReservations from './MyReservations';
import AdminPage from './AdminPage';
import TripPlannerPage from './TripPlannerPage';
import FavoritesPage from './FavoritesPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-title">🔌 PlugPoint</div>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/adminPage">Management</Link>
            <Link to="/reservations">My Reservations</Link>
            <Link to="/trip-planner">Trip Planner</Link>
            <Link to="/favorites">Favoritos</Link>

          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/adminPage" element={<AdminPage />} />
          <Route path="/reservations" element={<MyReservations />} />
          <Route path="/trip-planner" element={<TripPlannerPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;