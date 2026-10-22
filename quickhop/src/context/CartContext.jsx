import { createContext, useContext, useEffect, useState } from "react";
import { BASE_API } from "../utils/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Auto-enrich cart items missing SKU from backend API
  useEffect(() => {
    cartItems.forEach(async (item) => {
      if (!item.sku && item.id) {
        try {
          const res = await fetch(`${BASE_API}/product/${item.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.sku) {
              setCartItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, sku: data.sku } : i))
              );
            }
          }
        } catch (e) {
          console.error("Failed to auto-fetch SKU for item", item.id, e);
        }
      }
    });
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity: product.quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
