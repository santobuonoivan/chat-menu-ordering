"use client";

import { useCartStore } from "@/stores/cartStore";
import { useEffect } from "react";
import CartModal from "../CartModal";

export default function CartIndicator() {
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearExpiredCart = useCartStore((state) => state.clearExpiredCart);
  const { setIsCartOpen, isCartOpen } = useCartStore();

  // Check for expired cart on component mount
  useEffect(() => {
    clearExpiredCart();
  }, [clearExpiredCart]);

  if (totalItems === 0) {
    return null;
  }
  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium cursor-pointer transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#65A30D" }}
        onClick={handleCartClick}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">
            shopping_cart
          </span>
          <span>{totalItems} items</span>
        </div>
        <span className="font-bold">${totalPrice.toFixed(2)}</span>
      </div>
      <CartModal isOpen={isCartOpen} onClose={handleCartClose} />
    </div>
  );
}
