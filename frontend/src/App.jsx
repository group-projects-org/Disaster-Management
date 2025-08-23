import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Classifier from "./pages/Classifier";
import Report from "./pages/Reports";

function App() {
  return (
    <Router>
      <nav style={{ position: "fixed", top: 0, left: 0, width: "100%", padding: "10px", backgroundColor: "#333", color: "#fff", zIndex: 1000 }}>
        <Link to="/" style={{ margin: '0 15px', color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/classifier" style={{ margin: '0 15px', color: '#fff', textDecoration: 'none' }}>Classifier</Link>
        <Link to="/report" style={{ margin: '0 15px', color: '#fff', textDecoration: 'none' }}>Report</Link>
        <Link to="/resources" style={{ margin: '0 15px', color: '#fff', textDecoration: 'none' }}>Resources</Link>
      </nav>

      <div style={{ paddingTop: "44px" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/classifier" element={<Classifier />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;