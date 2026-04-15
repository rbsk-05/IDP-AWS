import React, { useState } from 'react';
import { runTestRequest } from '../utils/apiHelper';

const CartTest = ({ onResult }) => {
  const [loading, setLoading] = useState(false);

  const getCartData = async () => {
    const res = await runTestRequest('GET', '/cart');
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
      const result = await runTestRequest('GET', '/cart');
      setLoading(false);
      onResult({ module: 'Cart', action: actionName, ...result });
      return;
    } else if (actionName === 'Clear Cart') {
      payloadItems = [];
    } else {
      payloadItems = processCartFunc(items);
    }

    const result = await runTestRequest('POST', '/cart', { items: payloadItems });
    setLoading(false);
    onResult({
      module: 'Cart',
      action: actionName,
      ...result
    });
  };

  const addToCart = () => {
    handleAction('Add to Cart', (items) => {
      return [...items, {
        productId: `darshan-test-item-${Date.now()}`,
        name: 'Darshan Test Cart Item',
        price: 19.99,
        quantity: 1
      }];
    });
  };

  const getCart = () => {
    handleAction('Get Cart');
  };

  const updateQuantity = () => {
    handleAction('Update Quantity', (items) => {
      if (items.length === 0) return items;
      return items.map((item, index) => 
        index === 0 ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  };

  const removeItem = () => {
    handleAction('Remove Item', (items) => {
      if (items.length === 0) return items;
      return items.slice(1);
    });
  };

  const clearCart = () => {
    handleAction('Clear Cart');
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
      <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Cart Service Tests</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button style={btnStyle} onClick={addToCart} disabled={loading}>
          Add to Cart
        </button>
        <button style={btnStyle} onClick={getCart} disabled={loading}>
          Get Cart
        </button>
        <button style={btnStyle} onClick={updateQuantity} disabled={loading}>
          Update Quantity
        </button>
        <button style={btnStyle} onClick={removeItem} disabled={loading}>
          Remove Item
        </button>
        <button style={btnStyle} onClick={clearCart} disabled={loading}>
          Clear Cart
        </button>
      </div>
      {loading && <div style={{ fontSize: '12px', color: '#0071e3', marginTop: '8px' }}>Running test...</div>}
    </div>
  );
};

export default CartTest;
