import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import MyReservations from './MyReservations';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-title">🔌 PlugPoint</div>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/reservations">My Reservations</Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/reservations" element={<MyReservations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;