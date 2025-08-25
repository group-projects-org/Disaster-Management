import Header from "../../components/Header";
import './CSS/Social.css';

function Social() {
  const openLink = (url) => window.open(url, "_blank");
  return (
    <> <Header section="Social"/>

      {/* Stats Section */}
      <section className="s-stats-section">
        <div className="button-wrapper">
          <button className="btn btn-primary" onClick={() => openLink("https://ndrf.gov.in")}>Get Involved</button>
          <button className="btn btn-secondary" onClick={() => openLink("https://ndrf.gov.in")}>Learn More</button>
        </div>
        <div className="s-container">
          <div className="s-stats-grid">
            {[
              { icon: "fa-users", target: 5000, label: "Lives Saved" },
              { icon: "fa-hands-helping", target: 250, label: "Volunteers" },
              { icon: "fa-globe", target: 50, label: "Countries Served" },
              { icon: "fa-clock", target: 24, label: "24/7 Response" },
            ].map((stat, index) => (
              <div key={index} className="s-stat-card">
                <div className="s-stat-icon">
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <div className="s-stat-number" data-target={stat.target}>
                  {stat.target}
                </div>
                <div className="s-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">How We Help</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-ambulance"></i></div>
              <h3>Emergency Response</h3>
              <p>Rapid deployment of rescue teams and medical aid during disasters and emergencies.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-graduation-cap"></i></div>
              <h3>Training Programs</h3>
              <p>Comprehensive training for volunteers and communities in disaster preparedness and response.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-home"></i></div>
              <h3>Recovery Support</h3>
              <p>Long-term assistance in rebuilding communities and restoring normalcy after disasters.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><i className="fas fa-shield-alt"></i></div>
              <h3>Prevention & Planning</h3>
              <p>Proactive disaster risk reduction and community preparedness planning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Get the latest updates on our disaster response activities and volunteer opportunities</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <i className="fas fa-hand-holding-heart"></i>
                <span>Disaster Management</span>
              </div>
              <p>
                Dedicated to saving lives and building resilient communities through emergency response and disaster preparedness.
              </p>
            </div>

            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Get Involved</h3>
              <ul>
                <li><a href="#">Volunteer</a></li>
                <li><a href="#">Donate</a></li>
                <li><a href="#">Training</a></li>
                <li><a href="#">Partnerships</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Contact Info</h3>
              <div className="contact-info">
                <p><i className="fas fa-phone"></i> +1-800-DISASTER</p>
                <p><i className="fas fa-envelope"></i> info@disastercare.org</p>
                <p><i className="fas fa-map-marker-alt"></i> Emergency Response Center</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="social-links">
              <span className="follow-text">Follow us:</span>
              <a href="https://www.instagram.com/ndrfindia/" target="_blank" aria-label="Instagram" rel="noreferrer">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
              </a>
              <a href="https://www.facebook.com/HQNDRF" target="_blank" aria-label="Facebook" rel="noreferrer">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
              </a>
              <a href="https://x.com/ndrfhq" target="_blank" aria-label="Twitter" rel="noreferrer">
                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968958.png" alt="Twitter" />
              </a>
              <a href="https://www.youtube.com/channel/UCnITGBejfoA1Gzgv_Cshgig" target="_blank" aria-label="YouTube" rel="noreferrer">
                <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" />
              </a>
            </div>
            <p>&copy; 2025. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Social;