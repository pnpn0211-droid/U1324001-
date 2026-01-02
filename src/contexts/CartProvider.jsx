// src/contexts/CartProvider.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import CartContext from './cartContext';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  // 1. 登出時自動清空購物車
  // 注意：這裡我們拿掉了 loadCart，不再去後端抓資料
  useEffect(() => {
    if (isUserLoaded && !userId) {
      setCartItems([]);
    }
  }, [userId, isUserLoaded]);

  // 2. 更新數量的邏輯 (純前端操作 setCartItems)
  const updateQuantity = useCallback((itemId, newQuantity) => {
    const quantity = Math.max(0, newQuantity);
    setCartItems(prevItems => {
      if (quantity === 0) return prevItems.filter(item => item.id !== itemId);
      return prevItems.map(item => item.id === itemId ? { ...item, quantity } : item);
    });
  }, []);

  // 3. 加入購物車的邏輯 (純前端操作 setCartItems)
  const addToCart = useCallback((menuItem) => {
    if (!userId) return alert("請先登入"); //
    
    setCartItems(prev => {
      const exist = prev.find(i => i.id === menuItem.id);
      if (exist) {
        // 如果已存在，數量 +1
        return prev.map(i => i.id === menuItem.id ? {...i, quantity: i.quantity + 1} : i);
      }
      // 如果不存在，新增一筆
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  }, [userId]);

  // 4. 定義要廣播出去的內容
  const value = useMemo(() => ({
    cartItems,
    cartCount: cartItems.reduce((s, i) => s + i.quantity, 0),
    totalAmount: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    addToCart,
    updateQuantity,
    removeFromCart: (id) => updateQuantity(id, 0)
  }), [cartItems, addToCart, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}