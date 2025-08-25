import './../CSS/Header.css';
import logo from './../assets/Disaster-Relief.jpeg';
import homeBackground0 from './../assets/Slideshow/home-background-0.jpeg';
import homeBackground1 from './../assets/Slideshow/home-background-1.jpeg';
import homeBackground2 from './../assets/Slideshow/home-background-2.jpeg';
import homeBackground3 from './../assets/Slideshow/home-background-3.jpeg';
import homeBackground4 from './../assets/Slideshow/home-background-4.jpeg';
import { useState, useEffect } from 'react';

const Header = ({ section }) => {
  const [curTab, setCurTab] = useState(section ?? "Home");
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const homeBackgrounds = [homeBackground0, homeBackground1, homeBackground2, homeBackground3, homeBackground4];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(prev => (prev + 1) % homeBackgrounds.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleErrorClose = () => {
    if (error !== "Logging Out...") setError(null);
  };

  return (
    <div>
      {error && (
        <>
          <div className="toast-overlay" onClick={handleErrorClose} />
          <div className="toast-message error" onClick={handleErrorClose}>{error}</div>
        </>
      )}
      <div className={`hero-section ${curTab == "Home"? "Home" : ""}`}>
        {curTab == "Home" && (<img className="home-background" src={homeBackgrounds[count]} alt="Home Background" />)}
        <div className="header">
          <img className="logo" src={logo} alt="App Logo" />
          <div className="right-section">
            <nav className="navbar">
              {["Home", "Weather", "SOS", "SafeHouses", "Medics", "Social"].map(tab => (
                <a key={tab} className={curTab === tab ? "active" : ""} href={`/user/${tab == "Home"? "" : tab}`} onClick={() => setCurTab(tab)} > {tab} </a>
              ))}
            </nav>
          </div>
        </div>
        {curTab == "Home" && (<><p className="Slogan" style={{ fontSize: "90px" }}>Together We Can Stop</p>
        <p className="Slogan" style={{ color: "#ED0707", fontSize: "90px", lineHeight: "1", marginBottom: "15px" }}>THE SUFFERING</p>
        <p className="Slogan" style={{ fontFamily: "DM Sans", fontSize: "18px", margin: "10px 36px", marginTop: "30px" }}>We don't ask for much, just be there when it</p>
        <p className="Slogan" style={{ fontFamily: "DM Sans", fontSize: "18px", margin: "10px 36px" }}>matters most - Your Aid, Skill or Time</p></>)}
      </div>
    </div>
  );
};

export default Header;