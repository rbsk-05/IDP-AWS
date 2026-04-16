import React, { useState } from 'react';
import ProductTest from './products/ProductTest';
import CartTest from './cart/CartTest';
import SearchTest from './search/SearchTest';
import { runFullRegressionSuite } from './regression/RegressionSuite';
import { runProductUnitTests, runCartUnitTests, runSearchUnitTests } from './unit/ArcaneUnitTests';
import OrderHistory from './orders/OrderHistory';

const TestDashboard = ({ darkMode }) => {
  const [results, setResults] = useState([]);
  const [isCasting, setIsCasting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'history'

  const addResult = (result) => {
    setResults((prev) => [
      {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        ...result
      },
      ...prev
    ].slice(0, 50));
  };

  const clearResults = () => {
    setResults([]);
    setSummary(null);
  };

  const runUnitTests = () => {
    setIsCasting(true);
    const allUnitResults = [
      ...runProductUnitTests(),
      ...runCartUnitTests(),
      ...runSearchUnitTests()
    ];
    
    allUnitResults.forEach(res => {
      addResult({ module: 'Unit', action: res.test, success: res.success, status: res.success ? 200 : 'FAIL', duration: 0, data: { message: res.message } });
    });
    
    setSummary({
      title: 'Unit Test Results',
      passed: allUnitResults.filter(r => r.success).length,
      total: allUnitResults.length
    });
    setIsCasting(false);
  };

  const runRegression = async () => {
    setIsCasting(true);
    addResult({ module: 'System', action: 'Full Regression Started', success: true, status: 'INFO', duration: 0, data: { info: 'Running Unit and Isolated Integration suites...' } });
    
    const report = await runFullRegressionSuite((moduleName, results) => {
      addResult({ 
        module: `Regression: ${moduleName}`, 
        action: 'Sub-suite Complete', 
        success: results.failed === 0, 
        status: results.failed === 0 ? 'PASS' : 'FAIL', 
        duration: 0, 
        data: results 
      });
    });

    setSummary({
      title: 'Full Regression Report',
      passed: report.unit.passed + report.integration.passed,
      total: report.unit.passed + report.unit.failed + report.integration.passed + report.integration.failed
    });
    setIsCasting(false);
  };

  const cardStyle = {
    background: darkMode ? '#1c1c1e' : '#ffffff',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(197, 160, 40, 0.08)',
    border: darkMode ? '1px solid rgba(197, 160, 40, 0.15)' : '1px solid rgba(197, 160, 40, 0.1)',
    color: darkMode ? '#f5f5f7' : '#1A0A0A',
    fontFamily: "'Spectral', serif"
  };

  const mainBtnStyle = {
    padding: '0.8rem 1.8rem',
    borderRadius: '999px',
    border: 'none',
    background: '#C5A028',
    color: '#000',
    fontWeight: 600,
    fontFamily: "'Cinzel', serif",
    cursor: isCasting ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 12px rgba(197, 160, 40, 0.2)',
    transition: 'all 0.3s ease'
  };

  const resultItemStyle = (success) => ({
    padding: '1rem',
    borderLeft: `3px solid ${success ? '#C5A028' : '#B01B1B'}`,
    background: darkMode 
      ? (success ? 'rgba(197, 160, 40, 0.04)' : 'rgba(176, 27, 27, 0.08)')
      : (success ? '#fdfbf7' : '#fff5f5'),
    marginBottom: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem'
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontFamily: "'Cinzel', serif", color: '#C5A028', marginBottom: '0.5rem' }}>The Arcane Test Dashboard</h2>
        <p style={{ color: '#888', fontStyle: 'italic', marginBottom: '2rem' }}>Validating the integrity of the wizarding marketplace.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={mainBtnStyle} onClick={runRegression} disabled={isCasting}>
            {isCasting ? 'Casting Spell...' : 'Full Regression Run'}
          </button>
          <button style={{ ...mainBtnStyle, background: 'transparent', border: '1px solid #C5A028', color: '#C5A028' }} onClick={runUnitTests} disabled={isCasting}>
            Cast Unit Tests (Mock)
          </button>
          <button style={{ ...mainBtnStyle, background: 'none', boxShadow: 'none', border: 'none', color: '#888', fontWeight: 400 }} onClick={clearResults}>
            Clear Scrolls
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(197, 160, 40, 0.2)', marginBottom: '2rem', gap: '2rem' }}>
        <button 
          onClick={() => setActiveTab('tests')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'tests' ? '2px solid #C5A028' : 'none',
            color: activeTab === 'tests' ? '#C5A028' : '#888',
            padding: '0.5rem 1rem',
            fontFamily: "'Cinzel', serif",
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          Service Tests
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2px solid #C5A028' : 'none',
            color: activeTab === 'history' ? '#C5A028' : '#888',
            padding: '0.5rem 1rem',
            fontFamily: "'Cinzel', serif",
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          Order History
        </button>
      </div>

      {summary && (
        <div style={{ ...cardStyle, background: 'rgba(197, 160, 40, 0.05)', textAlign: 'center', border: '2px solid #C5A028' }}>
          <h4 style={{ margin: '0 0 0.5rem', fontFamily: "'Cinzel', serif" }}>{summary.title}</h4>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {summary.passed} / {summary.total} Magical Pass Rates
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        <div>
          {activeTab === 'tests' ? (
            <>
              <ProductTest onResult={addResult} />
              <CartTest onResult={addResult} />
              <SearchTest onResult={addResult} />
            </>
          ) : (
            <OrderHistory isTestSuite={true} />
          )}
        </div>

        <div>
           <div style={{ ...cardStyle, height: '700px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', fontFamily: "'Cinzel', serif", color: '#C5A028' }}>Arcane Responses</h3>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {results.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', marginTop: '100px', fontStyle: 'italic' }}>
                    Click a test button to invoke a magical validation.
                  </div>
                ) : (
                  results.map((res) => (
                    <div key={res.id} style={resultItemStyle(res.success)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: res.success ? '#C5A028' : '#B01B1B' }}>{res.module}</span>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>{res.timestamp}</span>
                      </div>
                      <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{res.action}</div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#888' }}>
                        <span>Status: {res.status}</span>
                        <span>Time: {res.duration}ms</span>
                      </div>
                      <pre style={{ 
                        margin: '0.75rem 0 0', 
                        padding: '0.75rem', 
                        background: 'rgba(0,0,0,0.03)', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        border: '1px solid rgba(0,0,0,0.05)',
                        fontFamily: "'Spectral', serif"
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
