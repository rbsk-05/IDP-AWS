import React, { useState } from 'react';
import { runTestRequest } from '../utils/apiHelper';

const SearchTest = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
  const [isTestSuite, setIsTestSuite] = useState(true);

  const handleAction = async (actionName, query) => {
    setLoading(true);
    const result = await runTestRequest('GET', `/search?q=${encodeURIComponent(query)}`, null, isTestSuite);
    setLoading(false);
    
    onResult({
      module: 'Search',
      action: `[${isTestSuite ? 'Integration' : 'Prod'}] ${actionName}`,
      isIntegration: isTestSuite,
      ...result
    });
  };

  const searchArtifact = () => {
    handleAction('Seek Artifact', 'Nimbus');
  };

  const emptySearch = () => {
    handleAction('Scan Full Catalog', '');
  };

  const btnStyle = {
    padding: '0.6rem 1rem',
    borderRadius: '999px',
    border: '1px solid #C5A02844',
    background: 'none',
    color: '#C5A028',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.85rem',
    fontFamily: "'Spectral', serif",
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '14px', background: 'rgba(197, 160, 40, 0.03)', border: '1px solid rgba(197, 160, 40, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Cinzel', serif", color: '#C5A028' }}>Search Service Tests</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={isTestSuite} 
            onChange={(e) => setIsTestSuite(e.target.checked)}
            style={{ accentColor: '#C5A028' }}
          />
          <span style={{ color: isTestSuite ? '#C5A028' : '#888', fontWeight: isTestSuite ? 600 : 400 }}>
            Isolated Test Mode
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button style={btnStyle} onClick={searchArtifact} disabled={loading}>Seek: "Nimbus"</button>
        <button style={btnStyle} onClick={emptySearch} disabled={loading}>Scan All</button>
      </div>
    </div>
  );
};

export default SearchTest;
