import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import MyReservations from './MyReservations';
import TripPlannerPage from './TripPlannerPage';
import FavoritesPage from './FavoritesPage';
import Management from './AdminPage';
import MyStas from './MyStats';


function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-title">🔌 PlugPoint</div>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/reservations">My Reservations</Link>
            <Link to="/mystats">My Stats</Link>
            <Link to="/trip-planner">Trip Planner</Link>
            <Link to="/favorites">Favoritos</Link>
            <Link to='/management'>Management</Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/management" element={<Management />} />
          <Route path="/reservations" element={<MyReservations />} />
          <Route path="/mystats" element={<MyStas />} />
          <Route path="/trip-planner" element={<TripPlannerPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;