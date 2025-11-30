"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavigationHeader from "./../../components/NavigationHeader";
import CategoryTabs from "./../../components/CategoryTabs";
import MenuItemCard from "./../../components/MenuItemCard";
import { MenuItem, MenuData } from "./../../types/menu";
import menuData from "./../../mocks/menu.json";

export default function MenuPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Platos Fuertes");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Load menu data
  useEffect(() => {
    const data = menuData as MenuData;
    setMenuItems(data.items);
  }, []);

  // Get unique categories from menu items
  const categories = useMemo(() => {
    return Array.from(new Set(menuItems.map((item) => item.category)));
  }, [menuItems]);

  // Filter items by selected category
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  const handleBack = () => {
    router.push("/");
  };

  const handleAddToCart = (
    item: MenuItem,
    modifiers?: any[],
    quantity?: number
  ) => {
    console.log("Añadir al carrito:", {
      item,
      modifiers: modifiers || [],
      quantity: quantity || 1,
    });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start bg-background-light dark:bg-background-dark py-10 px-4 group/design-root">
      <div className="flex h-full w-full max-w-[450px] flex-col overflow-hidden rounded-xl bg-white/60 dark:bg-black/30 shadow-2xl shadow-gray-500/10 backdrop-blur-xl ring-1 ring-black/5">
        {/* Header */}
        <NavigationHeader title="Menú del Día" onBack={handleBack} />

        {/* Content */}
        <div className="overflow-y-auto px-4">
          {/* Title */}
          <div className="flex flex-wrap justify-between gap-3 pt-4 pb-2">
            <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
              Selección de Productos
            </p>
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Menu Items */}
          <div className="flex flex-col gap-3 pb-6">
            <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pt-5 pb-3">
              {selectedCategory}
            </h2>

            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
