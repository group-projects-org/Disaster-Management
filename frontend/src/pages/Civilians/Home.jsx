import Header from './../../components/Header';
import Dashboard from '../../components/Civilians/Dashboard';
import './CSS/Home.css'

const Home = () => {
  return (
    <div>
      <Header />
      <div className="ndma-container">
        <h1 className="title">NDMA PORTAL</h1>
        <h2 className="subtitle">India&apos;s Official Platform for Disaster Management</h2> <hr className="divider" />
        <p className="description">
          Managed by the National Disaster Management Authority, this portal empowers citizens, agencies, and state authorities with real-time updates, resources, and support during emergencies.</p>
        <p className="description">
          From early warnings and relief coordination to recovery efforts, we ensure rapid response and unified action across the nation.</p>
        <p className="highlight">
          Together with you, we strengthen India&apos;s resilience against disasters—saving lives and restoring communities.</p>
      </div>
      <section className="why-disaster-section">
        <div className="content">
          <h2>Why Disaster Management?</h2>
          <hr className="divider" style={{backgroundColor: "white", marginBottom:"30px"}}/>
          <p> India is one of the most disaster prone countries in the world, 23 out of 28 
            states are multi-disaster prone regions. Every year millions of Indians were 
            affected by natural disasters. These disasters leave people traumatised by the 
            death of family, friends and their lives devastated by their loss of livelihood. The impact is high and it has been increasing dramatically in the last few decades in terms of number of people affected and the length of time they are affected for. This trend is expected to keep rising in coming years.
          </p>
          <p>To deal with disasters, there is an urgent need of local institution, which can play a pro-active role in disaster management. This resulted in the establishment of Rapid Response, a registered Indian charity dedicated to provide disaster response and preparedness activities across India.
          </p>
        </div>
      </section>
      <Dashboard />
    </div>
  );
};

export default Home;