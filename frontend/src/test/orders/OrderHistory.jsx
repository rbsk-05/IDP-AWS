import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/apiHelper';

const OrderHistory = ({ isTestSuite = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [isTestSuite]);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await apiHelpers.getOrderHistory(isTestSuite);
    if (result.success) {
      setOrders(result.data);
      setError(null);
    } else {
      setError(result.data.error || 'Failed to fetch the ancient scrolls of commerce.');
    }
    setLoading(false);
  };

  if (loading) return <div className="arcane-loading">Consulting the Ministry archives...</div>;

  return (
    <div className="order-history-panel">
      <h3 className="section-title">Past Scrolls of Purchase</h3>
      {error && <div className="error-msg">{error}</div>}
      
      {orders.length === 0 ? (
        <p className="empty-msg">No magical records found. Perhaps a memory charm was used?</p>
      ) : (
        <div className="scroll-list">
          {orders.map((order) => (
            <div key={order.orderId} className="order-scroll">
              <div className="scroll-header">
                <span className="order-id">{order.orderId}</span>
                <span className="order-date">
                  {new Date(order.timestamp * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="scroll-content">
                <ul className="item-summary">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.name}
                    </li>
                  ))}
                </ul>
                <div className="order-total">
                  <span>Total Offering:</span>
                  <span className="gold-price">${parseFloat(order.total).toFixed(2)}</span>
                </div>
                <div className="order-status badge-placed">{order.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button className="arcane-button secondary" onClick={fetchOrders} style={{ marginTop: '1rem' }}>
        Refresh Scrolls
      </button>

      <style jsx>{`
        .order-history-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--accent-gold);
          border-radius: 12px;
          padding: 1.5rem;
          color: white;
          font-family: 'Cinzel', serif;
        }
        .section-title {
          color: var(--accent-gold);
          text-align: center;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .scroll-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-height: 500px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .order-scroll {
          background: rgba(212, 175, 55, 0.05);
          border-left: 3px solid var(--accent-gold);
          padding: 1rem;
          border-radius: 4px;
          transition: transform 0.3s ease;
        }
        .order-scroll:hover {
          transform: translateX(5px);
          background: rgba(212, 175, 55, 0.1);
        }
        .scroll-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .order-id {
          color: var(--accent-gold);
          font-weight: bold;
        }
        .item-summary {
          list-style: none;
          padding: 0;
          font-size: 0.85rem;
          opacity: 0.8;
          margin-bottom: 1rem;
        }
        .order-total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          padding-top: 0.5rem;
        }
        .gold-price {
          color: var(--accent-gold);
        }
        .badge-placed {
          display: inline-block;
          margin-top: 0.5rem;
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          text-transform: uppercase;
        }
        .arcane-button {
          width: 100%;
          padding: 0.8rem;
          background: transparent;
          border: 1px solid var(--accent-gold);
          color: var(--accent-gold);
          font-family: 'Cinzel', serif;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .arcane-button:hover {
          background: var(--accent-gold);
          color: black;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
