import React, { useState } from 'react';
import { runTestRequest } from '../utils/apiHelper';
import { HP_ARTIFACTS } from '../unit/ArcaneUnitTests';

const ProductTest = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
  const [testProductId, setTestProductId] = useState(null);
  const [isTestSuite, setIsTestSuite] = useState(true); // Default to isolated integration

  const handleAction = async (actionName, method, endpoint, body) => {
    setLoading(true);
    // Integration test uses x-test-suite header for isolation
    const result = await runTestRequest(method, endpoint, body, isTestSuite);
    setLoading(false);
    
    if (actionName.includes('Create') && result.success && result.data) {
      const p = result.data.product || result.data;
      const id = p.id || p.productId || p.product_id;
      if (id) setTestProductId(id);
    }

    onResult({
      module: 'Product',
      action: `${isTestSuite ? '[Integration]' : '[Prod]'} ${actionName}`,
      isIntegration: isTestSuite,
      ...result
    });
  };

  const createProduct = () => {
    const artifact = HP_ARTIFACTS[Math.floor(Math.random() * HP_ARTIFACTS.length)];
    handleAction(`Create ${artifact.name}`, 'POST', '/products', {
      ...artifact,
      name: `${artifact.name} (Test)`,
      id: `test-${Date.now()}`
    });
  };

  const getProducts = () => {
    handleAction('Get All Products', 'GET', '/products');
  };

  const getProductById = () => {
    if (!testProductId) {
      onResult({
        module: 'Product',
        action: 'Get Product By ID',
        success: false,
        data: { error: 'No test product ID available. Create one first.' }
      });
      return;
    }
    handleAction('Get Product By ID', 'GET', `/products/${testProductId}`);
  };

  const updateProductStock = () => {
    if (!testProductId) {
      onResult({
        module: 'Product',
        action: 'Update Product Stock',
        success: false,
        data: { error: 'No test product ID available. Create one first.' }
      });
      return;
    }
    handleAction('Update Product Stock', 'PUT', `/products/${testProductId}`, {
      stock: 50
    });
  };

  const deleteProduct = () => {
    if (!testProductId) {
      onResult({
        module: 'Product',
        action: 'Delete Product',
        success: false,
        data: { error: 'No test product ID available. Create one first.' }
      });
      return;
    }
    handleAction('Delete Product', 'DELETE', `/products/${testProductId}`);
    setTestProductId(null);
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
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Cinzel', serif", color: '#C5A028' }}>Product Service Tests</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={isTestSuite} 
            onChange={(e) => setIsTestSuite(e.target.checked)}
            style={{ accentColor: '#C5A028' }}
          />
          <span style={{ color: isTestSuite ? '#C5A028' : '#888', fontWeight: isTestSuite ? 600 : 400 }}>
            Isolated Test Mode (test-table)
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button style={btnStyle} onClick={createProduct} disabled={loading}>Create Artifact</button>
        <button style={btnStyle} onClick={getProducts} disabled={loading}>Fetch Catalog</button>
        <button style={btnStyle} onClick={getProductById} disabled={loading}>Find by ID</button>
        <button style={btnStyle} onClick={updateProductStock} disabled={loading}>Modify Stock</button>
        <button style={btnStyle} onClick={deleteProduct} disabled={loading}>Vanish Object</button>
      </div>

      {testProductId && (
        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '1rem', fontStyle: 'italic' }}>
          Active Test ID: {testProductId}
        </div>
      )}
    </div>
  );
};

export default ProductTest;
