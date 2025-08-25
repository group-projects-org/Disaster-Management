import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Civilians/Home";
import WeatherApp from "./pages/Civilians/Weather";
import Reports from "./pages/Civilians/Reports";
import Social from "./pages/Civilians/Social";
import SOSDashboard from "./pages/Government/SOSDashboard";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/user" element={<Home />} />
          <Route path="/user/Weather" element={<WeatherApp />} />
          <Route path="/user/SOS" element={<Reports />} />
          <Route path="/user/Social" element={<Social />} />

          <Route path="/govt" element={<SOSDashboard />} />
          
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/user" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;