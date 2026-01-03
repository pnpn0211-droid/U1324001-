// src/contexts/CartProvider.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import CartContext from './cartContext';
import * as api from '../services/api';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  
  const { user, isLoaded: isUserLoaded } = useUser(); 
  const userId = user?.id;

  useEffect(() => {
    if (!isUserLoaded) return; 
    if (!userId) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }
    const loadCart = async () => {
      setIsLoading(true);
      try {
        const items = await api.fetchCart(userId);
        setCartItems(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, [userId, isUserLoaded]);

  const refreshCart = useCallback(async () => {
    if (!userId) return;
    try {
      const items = await api.fetchCart(userId);
      setCartItems(items);
    } catch (err) {
      console.error("刷新購物車失敗:", err);
    }
  }, [userId]);

  // 新增：清空購物車函式
  const clearCart = useCallback(async () => {
    if (!userId) return;
    try {
      const userCartItems = await api.fetchCart(userId);
      for (const item of userCartItems) {
        await api.removeCartItem(item.id);
      }
      await refreshCart(); 
    } catch (err) {
      console.error("清空購物車失敗:", err);
      setError(err.message);
    }
  }, [userId, refreshCart]);
  
  // 新增：結帳函式
  const checkout = useCallback(async () => {
    if (!userId || cartItems.length === 0) {
      throw new Error("購物車是空的或使用者未登入");
    }
    
    const orderPayload = {
      userId,
      items: cartItems.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    try {
      await api.createOrder(orderPayload); // 建立訂單
      await clearCart(); // 成功後清空購物車
    } catch (err) {
      setError(err.message);
      throw err; 
    }
  }, [userId, cartItems, clearCart]);

  const addToCart = useCallback(async (menuItem) => {
    if (!userId) throw new Error("請先登入");
    try {
      const existingItem = await api.findCartItemByMenuId(menuItem.id, userId);
      if (existingItem) {
        await api.updateCartItem(existingItem.id, { quantity: existingItem.quantity + 1 });
      } else {
        await api.addCartItem({ ...menuItem, menuItemId: menuItem.id, id: undefined, userId, quantity: 1 });
      }
      await refreshCart(); 
    } catch (err) {
      setError(err.message);
      throw err; 
    }
  }, [userId, refreshCart]);
  
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    const quantity = Math.max(0, newQuantity);
    if (quantity === 0) {
      await api.removeCartItem(itemId);
    } else {
      await api.updateCartItem(itemId, { quantity });
    }
    await refreshCart();
  }, [refreshCart]);

  const removeFromCart = useCallback(async (itemId) => {
    await api.removeCartItem(itemId);
    await refreshCart();
  }, [refreshCart]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const totalAmount = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

  const value = useMemo(() => ({
    cartItems, cartCount, totalAmount, isLoading, error,
    addToCart, removeFromCart, updateQuantity,
    checkout, clearCart // 這裡要把新功能傳出去
  }), [cartItems, cartCount, totalAmount, isLoading, error, addToCart, removeFromCart, updateQuantity, checkout, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}