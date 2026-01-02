// src/hooks/useCart.js
import { useContext } from "react";
import CartContext from "../contexts/cartContext"; // 確保檔名大小寫一致

export default function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart 必須在 CartProvider 內使用");
  }
  return context;
}