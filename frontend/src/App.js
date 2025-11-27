import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/health`);
      console.log(response.data);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div>
      <header className="App-header" style={{padding: '4rem 2rem'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚡</div>
          <h1 style={{fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700}}>
            Energy-Efficient CPU Scheduling
          </h1>
          <p style={{fontSize: '1.2rem', color: '#94a3b8', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem'}}>
            Academic project demonstrating CPU scheduling algorithms with adaptive DVFS energy modeling for mobile and embedded systems.
          </p>
          <a
            href="/scheduler-index.html"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.3)';
            }}
          >
            Launch Simulator
          </a>
          
          <div style={{marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '4rem auto 0'}}>
            <div style={{padding: '1.5rem', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155'}}>
              <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🔄</div>
              <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>6 Algorithms</h3>
              <p style={{fontSize: '0.9rem', color: '#94a3b8'}}>FCFS, SJF, Round Robin, Priority, and Energy-Aware Hybrid</p>
            </div>
            <div style={{padding: '1.5rem', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155'}}>
              <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>⚡</div>
              <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>DVFS Energy Model</h3>
              <p style={{fontSize: '0.9rem', color: '#94a3b8'}}>Adaptive frequency scaling with power analysis</p>
            </div>
            <div style={{padding: '1.5rem', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155'}}>
              <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>📊</div>
              <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Visual Analytics</h3>
              <p style={{fontSize: '0.9rem', color: '#94a3b8'}}>Gantt charts and energy consumption graphs</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
