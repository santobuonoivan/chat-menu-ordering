import { useState, useEffect } from "react";
import { RiRobot3Line } from "react-icons/ri";
import { FaShoppingCart } from "react-icons/fa";
import { useCartStore } from "@/stores/cartStore";
import CartModal from "@/components/CartModal";
import { useSessionStore } from "@/stores/sessionStore";
import { useMenuStore } from "@/stores/menuStore";

interface TopNavBarProps {
  onClose?: () => void;
}

export default function TopNavBar({ onClose }: TopNavBarProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [showMenuPopover, setShowMenuPopover] = useState(false);
  const { getTotalItems, items } = useCartStore();
  const { getSessionData } = useSessionStore();
  useEffect(() => {
    setTotalItems(getTotalItems());
  }, [getTotalItems, items]);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const handdleGoToDigitalMenu = async () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = `/menu?${params.toString()}`;
  };
  return (
    <>
      <header className="flex items-center justify-between  whitespace-nowrap border-b border-slate-200/80 dark:border-slate-700/80 p-4 shrink-0">
        <div className="flex items-center gap-3 text-text-light dark:text-text-dark w-[calc(100%-100px)]">
          <div className="size-6 text-primary shrink-0">
            <RiRobot3Line size={24} color="#8E2653" />
          </div>
          <h4 className="text-md text-[#8E2653] font-bold tracking-tight truncate">
            {/*Asistente AI*/} {getSessionData()?.rest.title || "Restaurante"}
          </h4>
        </div>
        <div className="flex w-[100px] justify-end gap-3">
          <button
            className="relative flex items-center justify-center size-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-600/50 text-[#8E2653] dark:text-text-white transition-colors"
            onClick={handdleGoToDigitalMenu}
          >
            <span className="material-symbols-outlined text-xl">
              restaurant_menu
            </span>
          </button>
          <button
            onClick={handleCartClick}
            className={`relative flex items-center justify-center size-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-600/50 text-[#8E2653] dark:text-text-white transition-colors ${
              totalItems > 0 ? "animate-bounce" : ""
            }`}
          >
            <FaShoppingCart />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-600/50 text-[#8E2653] dark:text-text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={handleCartClose} />
    </>
  );
}
