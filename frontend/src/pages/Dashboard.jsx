import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Clock, TrendingUp, MapPin, RefreshCw, Download } from 'lucide-react';
import './../CSS/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeData, setTimeData] = useState([]);
  const [severityData, setSeverityData] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/reports");
        const data = await res.json();
        setRecentReports(data);
        setTimeData(computeTimeData(data));
        setSeverityData(computeSeverityData(data));
        const totalReports = data.length;
        const disasterTypes = {};
        let highSeverity = 0;
        let criticalAlerts = 0;

        data.forEach(r => {
          const type = r.label_name || "other";
          disasterTypes[type] = (disasterTypes[type] || 0) + 1;

          if (r.severity === "high") highSeverity += 1;
          if (r.severity === "critical") criticalAlerts += 1;
        });

        setStats({
          total_reports: totalReports,
          total_disasters: data.filter(r => r.label_name === "disaster").length,
          high_severity: highSeverity,
          critical_alerts: criticalAlerts,
          by_type: disasterTypes,
          avg_response_time: "N/A"
        });

        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  const computeTimeData = (reports) => {
    const slots = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
    const counts = [0, 0, 0, 0, 0, 0];

    reports.forEach(r => {
      const date = new Date(r.timestamp);
      const hour = date.getHours();

      if (hour >= 6 && hour < 9) counts[0]++;
      else if (hour >= 9 && hour < 12) counts[1]++;
      else if (hour >= 12 && hour < 15) counts[2]++;
      else if (hour >= 15 && hour < 18) counts[3]++;
      else if (hour >= 18 && hour < 21) counts[4]++;
      else if (hour >= 21 && hour < 24) counts[5]++;
    });

    return slots.map((time, idx) => ({
      time,
      reports: counts[idx]
    }));
  };

  const computeSeverityData = (reports) => {
    const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    reports.forEach(r => {
      const sev = r.severity?.toLowerCase();
      if (sev === 'critical') severityCounts.Critical++;
      else if (sev === 'high') severityCounts.High++;
      else if (sev === 'medium') severityCounts.Medium++;
      else if (sev === 'low') severityCounts.Low++;
    });

    const colors = { Critical: '#EF4444', High: '#F59E0B', Medium: '#10B981', Low: '#3B82F6' };

    return Object.entries(severityCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name]
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'earthquake': return '⛰️';
      case 'landslide': return '🪨';
      default: return '⚠️';
    }
  };

  const chartData = Object.entries(stats.by_type || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value
  }));

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'];

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  };


  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              <AlertTriangle className="title-icon" size={32} />
              Dashboard Overview
            </h1>
            <p className="dashboard-subtitle">Real-time disaster monitoring and analytics</p>
          </div>
          <button
            onClick={refreshData}
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Total Reports</p>
                <p className="stat-value">{stats.total_reports}</p>
              </div>
              <div className="stat-icon blue-bg">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card stat-red">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Active Disasters</p>
                <p className="stat-value">{stats.total_disasters}</p>
              </div>
              <div className="stat-icon red-bg">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card stat-orange">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">High Severity</p>
                <p className="stat-value">{stats.high_severity}</p>
              </div>
              <div className="stat-icon orange-bg">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card stat-green">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Avg Response</p>
                <p className="stat-value">{stats.avg_response_time}</p>
              </div>
              <div className="stat-icon green-bg">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Last Updated</p>
                <p className="stat-time">{lastUpdated.toLocaleTimeString()}</p>
              </div>
              <div className="stat-icon purple-bg">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Reports by Type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Reports Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reports" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-grid">
          {/* Disaster Distribution Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Disaster Types</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Distribution */}
          <div className="chart-card">
            <h3 className="chart-title">Severity Levels</h3>
            <div className="severity-list">
              {severityData.map((item, index) => (
                <div key={index} className="severity-item">
                  <div className="severity-info">
                    <div 
                      className="severity-dot"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="severity-name">{item.name}</span>
                  </div>
                  <div className="severity-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          backgroundColor: item.color,
                          width: `${(item.value / 30) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="severity-count">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="chart-card">
            <h3 className="chart-title">Recent Reports</h3>
            <div className="reports-list">
              {recentReports.slice(0, 4).map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-content">
                    <div className="report-header">
                      <span className="report-icon">{getTypeIcon(report.label_name)}</span>
                      <span className="report-location">{report.location}</span>
                      <span className={`severity-badge ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </div>
                    <p className="report-text">
                      {report.text.length > 60 ? `${report.text.slice(0, 60)}...` : report.text}
                    </p>
                    <p className="report-time">
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;