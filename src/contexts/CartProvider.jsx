// src/contexts/CartProvider.jsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import CartContext from './cartContext';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  // 使用一個 Ref 來記錄上一次的登入狀態，解決妳截圖中的效能警告
  const prevUserId = useRef(userId);

  useEffect(() => {
    // 只有當「本來有登入」變成「現在沒登入」時才清空
    if (isUserLoaded && prevUserId.current && !userId) {
      setCartItems([]);
    }
    prevUserId.current = userId;
  }, [userId, isUserLoaded]);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    const quantity = Math.max(0, newQuantity);
    setCartItems(prev => {
      if (quantity === 0) return prev.filter(item => item.id !== itemId);
      return prev.map(item => item.id === itemId ? { ...item, quantity } : item);
    });
  }, []);

  const addToCart = useCallback((menuItem) => {
    if (!userId) return alert("請先登入");
    setCartItems(prev => {
      const exist = prev.find(i => i.id === menuItem.id);
      if (exist) return prev.map(i => i.id === menuItem.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  }, [userId]);

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