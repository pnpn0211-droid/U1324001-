// src/contexts/CartProvider.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import CartContext from './cartContext';
import * as api from '../services/api'; //

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  
  const { user, isLoaded: isUserLoaded } = useUser(); 
  const userId = user?.id;

  // 3. 當使用者狀態載入完成或使用者 ID 改變時，從後端獲取購物車
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

  // 重新獲取購物車的輔助函式
  const refreshCart = useCallback(async () => {
    if (!userId) return;
    try {
      const items = await api.fetchCart(userId);
      setCartItems(items);
    } catch (err) {
      console.error("刷新購物車失敗:", err);
    }
  }, [userId]);

  // 4. 改造 addToCart 為 async 函式
  const addToCart = useCallback(async (menuItem) => {
    if (!userId) throw new Error("請先登入");

    try {
      const existingItem = await api.findCartItemByMenuId(menuItem.id, userId);
      
      if (existingItem) {
        await api.updateCartItem(existingItem.id, {
          quantity: existingItem.quantity + 1
        });
      } else {
        await api.addCartItem({
          ...menuItem,
          menuItemId: menuItem.id, 
          id: undefined, 
          userId: userId,
          quantity: 1,
        });
      }
      await refreshCart(); 
    } catch (err) {
      setError(err.message);
      throw err; 
    }
  }, [userId, refreshCart]);
  
  // 5. 改造 updateQuantity 和 removeFromCart
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    const quantity = Math.max(0, newQuantity);
    if (quantity === 0) {
      await api.removeCartItem(itemId);
    } else {
      await api.updateCartItem(itemId, { quantity });
      await refreshCart();
    }
  }, [userId, refreshCart]);

  const removeFromCart = useCallback(async (itemId) => {
    await api.removeCartItem(itemId);
    await refreshCart();
  }, [userId, refreshCart]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const totalAmount = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    cartCount,
    totalAmount,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
  }), [cartItems, cartCount, totalAmount, isLoading, error, addToCart, removeFromCart, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}