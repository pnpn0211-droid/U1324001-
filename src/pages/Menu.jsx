// src/pages/Menu.jsx
import React, { useState } from 'react'; 
import useMenu from '../hooks/useMenu';
import { formatCurrency } from '../utils/helpers';
import { useUser } from '@clerk/clerk-react';
import useCart from '../hooks/useCart';

const Menu = () => {
  const { menuItems, isLoading: isMenuLoading, error: menuError } = useMenu();
  const { isSignedIn } = useUser();
  const { addToCart } = useCart();
  
  const [isAdding, setIsAdding] = useState(null); 
  const [feedback, setFeedback] = useState(null); 

  const handleAddToCart = async (item) => {
    if (isAdding) return; 

    setIsAdding(item.id);
    setFeedback(null);
    try {
      await addToCart(item); // 呼叫 CartProvider 的 async addToCart
      setFeedback({ type: 'success', message: `${item.name} 已加入購物車！` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || '加入失敗，請稍後再試' });
    } finally {
      setIsAdding(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (isMenuLoading) return <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>;
  if (menuError) return <div className="alert alert-error">載入錯誤：{menuError}</div>;

  return (
    <div className="space-y-12">
      {feedback && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'} fixed top-4 right-4 z-50 w-auto shadow-xl`}>
          <span>{feedback.message}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">美味菜單</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="card bg-base-100 shadow-xl">
            <figure><img src={item.image} alt={item.name} className="w-full h-48 object-cover" /></figure>
            <div className="card-body">
              <h2 className="card-title">{item.name}</h2>
              <p className="text-lg font-semibold">{formatCurrency(item.price)}</p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary"
                  disabled={!isSignedIn || isAdding === item.id}
                  onClick={() => handleAddToCart(item)}
                >
                  {isAdding === item.id ? (
                    <span className="loading loading-spinner"></span>
                  ) : isSignedIn ? (
                    "加入購物車"
                  ) : (
                    "請先登入"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;