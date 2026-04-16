import React, { useState } from 'react';
import { runTestRequest } from '../utils/apiHelper';

const CartTest = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
  const [isTestSuite, setIsTestSuite] = useState(true);

  const getCartData = async () => {
    const res = await runTestRequest('GET', '/cart', null, isTestSuite);
    if (res.success && res.data && Array.isArray(res.data.items)) {
      return res.data.items;
    }
    return [];
  };

  const handleAction = async (actionName, processCartFunc) => {
    setLoading(true);
    let items = [];
    
    if (actionName !== 'Get Cart' && actionName !== 'Clear Cart') {
        items = await getCartData();
    }

    let payloadItems = [];
    
    if (actionName === 'Get Cart') {
      const result = await runTestRequest('GET', '/cart', null, isTestSuite);
      setLoading(false);
      onResult({ module: 'Cart', action: `[${isTestSuite ? 'Integration' : 'Prod'}] Get Trunk`, ...result });
      return;
    } else if (actionName === 'Clear Cart') {
      payloadItems = [];
    } else {
      payloadItems = processCartFunc(items);
    }

    const result = await runTestRequest('POST', '/cart', { items: payloadItems }, isTestSuite);
    setLoading(false);
    onResult({
      module: 'Cart',
      action: `[${isTestSuite ? 'Integration' : 'Prod'}] ${actionName}`,
      ...result
    });
  };

  const addToCart = () => {
    handleAction('Add Item', (items) => {
      return [...items, {
        productId: `test-artifact-${Date.now()}`,
        name: 'Marauder\'s Map',
        price: 50.00,
        quantity: 1
      }];
    });
  };

  const getCart = () => {
    handleAction('Get Cart');
  };

  const updateQuantity = () => {
    handleAction('Transfigure Quantity', (items) => {
      if (items.length === 0) return items;
      return items.map((item, index) => 
        index === 0 ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  };

  const removeItem = () => {
    handleAction('Vanish Item', (items) => {
      if (items.length === 0) return items;
      return items.slice(1);
    });
  };

  const clearCart = () => {
    handleAction('Incendio (Clear Trunk)');
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
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Cinzel', serif", color: '#C5A028' }}>Cart Service Tests</h3>
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
        <button style={btnStyle} onClick={addToCart} disabled={loading}>Add to Trunk</button>
        <button style={btnStyle} onClick={getCart} disabled={loading}>Get Trunk</button>
        <button style={btnStyle} onClick={updateQuantity} disabled={loading}>Transfigure Qty</button>
        <button style={btnStyle} onClick={removeItem} disabled={loading}>Vanish Item</button>
        <button style={btnStyle} onClick={clearCart} disabled={loading}>Incendio</button>
      </div>
    </div>
  );
};

export default CartTest;
