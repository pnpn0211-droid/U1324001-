// src/pages/Cart.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { formatCurrency } from '../utils/helpers';

const CartPage = () => {
  const { cartItems, cartCount, totalAmount, updateQuantity, removeFromCart } = useCart();

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
      <div className="mt-6 text-right">
        <p className="text-2xl font-bold">總計：{formatCurrency(totalAmount)}</p>
      </div>
    </div>
  );
};
export default CartPage;