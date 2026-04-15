import React, { useState } from 'react';
import { runTestRequest } from '../utils/apiHelper';

const SearchTest = ({ onResult }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionName, endpoint) => {
    setLoading(true);
    const result = await runTestRequest('GET', endpoint);
    setLoading(false);
    onResult({
      module: 'Search',
      action: actionName,
      ...result
    });
  };

  const searchByName = () => {
    // Using a likely exists name or Generic term
    handleAction('Search by Product Name', '/search?q=iPhone');
  };

  const searchByCategory = () => {
    handleAction('Search by Category', '/search?q=Electronics');
  };

  const emptySearch = () => {
    handleAction('Empty Search Test', '/search?q=nonexistent_product_12345');
  };

  const btnStyle = {
    padding: '8px 16px',
    margin: '4px',
    borderRadius: '6px',
    border: '1px solid #d2d2d7',
    background: '#fff',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    opacity: loading ? 0.7 : 1
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Search Service Tests</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button style={btnStyle} onClick={searchByName} disabled={loading}>
          Search by Product Name
        </button>
        <button style={btnStyle} onClick={searchByCategory} disabled={loading}>
          Search by Category
        </button>
        <button style={btnStyle} onClick={emptySearch} disabled={loading}>
          Empty Search Test
        </button>
      </div>
      {loading && <div style={{ fontSize: '12px', color: '#0071e3', marginTop: '8px' }}>Running test...</div>}
    </div>
  );
};

export default SearchTest;
