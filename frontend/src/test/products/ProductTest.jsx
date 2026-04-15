import React, { useState } from 'react';
import { runTestRequest } from '../utils/apiHelper';

const ProductTest = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
  const [testProductId, setTestProductId] = useState(null);

  const handleAction = async (actionName, method, endpoint, body) => {
    setLoading(true);
    const result = await runTestRequest(method, endpoint, body);
    setLoading(false);
    
    if (actionName === 'Create Test Product' && result.success && result.data) {
      // Try to extract ID from response
      const id = result.data.id || result.data.productId || result.data.product_id;
      if (id) setTestProductId(id);
    }

    onResult({
      module: 'Product',
      action: actionName,
      ...result
    });
  };

  const createProduct = () => {
    handleAction('Create Test Product', 'POST', '/products', {
      name: `darshan-test-product-${Date.now()}`,
      price: 99.99,
      category: 'TestCategory',
      stock: 100
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
        status: 'N/A',
        duration: 0,
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
        status: 'N/A',
        duration: 0,
        data: { error: 'No test product ID available. Create one first.' }
      });
      return;
    }
    handleAction('Update Product Stock', 'PUT', `/products/${testProductId}`, {
      stock: 75
    });
  };

  const deleteProduct = () => {
    if (!testProductId) {
      onResult({
        module: 'Product',
        action: 'Delete Product',
        success: false,
        status: 'N/A',
        duration: 0,
        data: { error: 'No test product ID available. Create one first.' }
      });
      return;
    }
    handleAction('Delete Product', 'DELETE', `/products/${testProductId}`);
    setTestProductId(null);
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
      <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Product Service Tests</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button style={btnStyle} onClick={createProduct} disabled={loading}>
          Create Test Product
        </button>
        <button style={btnStyle} onClick={getProducts} disabled={loading}>
          Get All Products
        </button>
        <button style={btnStyle} onClick={getProductById} disabled={loading}>
          Get Product By ID
        </button>
        <button style={btnStyle} onClick={updateProductStock} disabled={loading}>
          Update Product Stock
        </button>
        <button style={btnStyle} onClick={deleteProduct} disabled={loading}>
          Delete Product
        </button>
      </div>
      {loading && <div style={{ fontSize: '12px', color: '#0071e3', marginTop: '8px' }}>Running test...</div>}
      {testProductId && (
        <div style={{ fontSize: '12px', color: '#86868b', marginTop: '4px' }}>
          Active Test Product ID: {testProductId}
        </div>
      )}
    </div>
  );
};

export default ProductTest;
