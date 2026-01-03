// src/pages/Cart.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 引入跳轉功能
import useCart from '../hooks/useCart';
import { formatCurrency } from '../utils/helpers';

const CartPage = () => {
  // 從 Hook 拿取 checkout 函式
  const { cartItems, cartCount, totalAmount, updateQuantity, removeFromCart, checkout } = useCart();
  const navigate = useNavigate(); 
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // 處理結帳點擊
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      await checkout(); 
      alert("下單成功！感謝您的購買！");
      navigate('/'); // 成功後回首頁
    } catch (err) {
      setCheckoutError(err.message || "結帳失敗，請稍後再試。");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">你的購物車是空的</h1>
        <p className="mb-6">快去看看我們的美味菜單，把喜歡的都加進來！</p>
        <Link to="/menu" className="btn btn-primary">前往菜單</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">我的購物車</h1>
      <table className="table w-full">
        <thead>
          <tr><th>商品</th><th>單價</th><th>數量</th><th>操作</th></tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{formatCurrency(item.price)}</td>
              <td>
                <button className="btn btn-xs" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span className="mx-2">{item.quantity}</span>
                <button className="btn btn-xs" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </td>
              <td><button className="btn btn-error btn-xs" onClick={() => removeFromCart(item.id)}>移除</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 結帳區域 */}
      <div className="mt-8 flex flex-col items-end">
        <div className="card w-96 bg-base-200 shadow-xl p-6">
          <p className="text-xl mb-2">商品總數：{cartCount}</p>
          <p className="text-2xl font-bold mb-4">總計：{formatCurrency(totalAmount)}</p>
          
          {checkoutError && <div className="alert alert-error mb-4"><span>{checkoutError}</span></div>}
          
          <button 
            className="btn btn-primary w-full" 
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? <span className="loading loading-spinner"></span> : "確認結帳"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CartPage;