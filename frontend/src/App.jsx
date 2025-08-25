import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Civilians/Home";
import Classifier from "./pages/Civilians/Classifier";
import WeatherApp from "./pages/Civilians/Weather";
import Reports from "./pages/Civilians/Reports";
import SOSDashboard from "./pages/Government/SOSDashboard";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/user" element={<Home />} />
          <Route path="/user/Social" element={<Classifier />} />
          <Route path="/user/Weather" element={<WeatherApp />} />
          <Route path="/user/SOS" element={<Reports />} />

          <Route path="/govt" element={<SOSDashboard />} />
          
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/user" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;