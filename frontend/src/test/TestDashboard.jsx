import React, { useState, useRef } from 'react';
import ProductTest from './products/ProductTest';
import CartTest from './cart/CartTest';
import SearchTest from './search/SearchTest';

const TestDashboard = ({ darkMode }) => {
  const [results, setResults] = useState([]);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const addResult = (result) => {
    setResults((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        ...result
      },
      ...prev
    ].slice(0, 50)); // Keep last 50 results
  };

  const clearResults = () => setResults([]);

  const runAllTests = async () => {
    setIsRunningAll(true);
    addResult({ module: 'System', action: 'Run All Tests Started', success: true, status: 'INFO', duration: 0, data: {} });
    
    setTimeout(() => {
      setIsRunningAll(false);
      addResult({ module: 'System', action: 'Run All Tests Completed (Manual triggers suggested for specific flows)', success: true, status: 'INFO', duration: 0, data: {} });
    }, 1000);
  };

  const cardStyle = {
    background: darkMode ? '#1c1c1e' : '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(197, 160, 40, 0.08)',
    border: darkMode ? '1px solid rgba(197, 160, 40, 0.2)' : '1px solid rgba(197, 160, 40, 0.1)',
    color: darkMode ? '#f5f5f7' : '#1A0A0A',
    fontFamily: "'Spectral', serif"
  };

  const resultItemStyle = (success) => ({
    padding: '12px',
    borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f2f2f7',
    fontSize: '13px',
    borderLeft: `4px solid ${success ? '#C5A028' : '#B01B1B'}`,
    background: darkMode 
      ? (success ? 'rgba(197, 160, 40, 0.05)' : 'rgba(176, 27, 27, 0.1)')
      : (success ? '#fdfbf7' : '#fff2f2'),
    marginBottom: '8px',
    borderRadius: '4px',
    color: darkMode ? '#f5f5f7' : '#1A0A0A'
  });


  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, fontFamily: "'Cinzel', serif", color: '#C5A028' }}>Arcane Test Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={runAllTests} 
            disabled={isRunningAll}
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              border: 'none',
              background: '#C5A028',
              color: '#000000',
              fontWeight: 600,
              fontFamily: "'Cinzel', serif",
              cursor: isRunningAll ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {isRunningAll ? 'Spellcasting...' : 'Cast All Tests'}
          </button>
          <button 
            onClick={clearResults}
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              border: '1px solid #C5A028',
              background: 'transparent',
              color: darkMode ? '#C5A028' : '#1A0A0A',
              fontFamily: "'Spectral', serif",
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Clear Scrolls
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <section style={cardStyle}>
            <ProductTest onResult={addResult} />
          </section>
          
          <section style={cardStyle}>
            <CartTest onResult={addResult} />
          </section>

          <section style={cardStyle}>
            <SearchTest onResult={addResult} />
          </section>
        </div>

        <div>
           <div style={{ ...cardStyle, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px', fontFamily: "'Cinzel', serif", color: '#C5A028' }}>Arcane Responses</h3>
             <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                {results.length === 0 ? (
                  <div style={{ color: '#86868b', textAlign: 'center', marginTop: '40px' }}>
                    No test results yet. Click a button to start testing.
                  </div>
                ) : (
                  results.map((res) => (
                    <div key={res.id} style={resultItemStyle(res.success)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{res.module}: {res.action}</span>
                        <span style={{ color: '#86868b' }}>{res.timestamp}</span>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ background: res.success ? '#C5A028' : '#B01B1B', color: res.success ? '#000' : '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', marginRight: '8px', fontWeight: 600 }}>
                          {res.status}
                        </span>
                        <span>{res.duration}ms</span>
                      </div>
                      <pre style={{ 
                        margin: '8px 0 0', 
                        padding: '8px', 
                        background: 'rgba(0,0,0,0.03)', 
                        borderRadius: '4px', 
                        fontSize: '11px',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '150px',
                        overflowY: 'auto'
                      }}>
                        {JSON.stringify(res.data, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
