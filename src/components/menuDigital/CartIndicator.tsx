"use client";

import { useCartStore } from "@/stores/cartStore";
import { useEffect } from "react";

export default function CartIndicator() {
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearExpiredCart = useCartStore((state) => state.clearExpiredCart);

  // Check for expired cart on component mount
  useEffect(() => {
    clearExpiredCart();
  }, [clearExpiredCart]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium"
        style={{ backgroundColor: "#65A30D" }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">
            shopping_cart
          </span>
          <span>{totalItems} items</span>
        </div>
        <span className="font-bold">${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
