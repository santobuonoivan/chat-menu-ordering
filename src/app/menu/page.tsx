"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavigationHeader from "../../components/menuDigital/NavigationHeader";
import CategoryTabs from "../../components/menuDigital/CategoryTabs";
import MenuItemCard from "../../components/menuDigital/MenuItemCard";
import CartIndicator from "../../components/menuDigital/CartIndicator";
import { IMenuItem, IMenuData } from "./../../types/menu";
import { useMenuStore } from "../../stores/menuStore";
import menuDataV2 from "./../../mocks/menuv2.json";

export default function MenuPage() {
  const router = useRouter();
  const { setMenuData, getMenuData } = useMenuStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("ENTRADAS");
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  // Load menu data
  useEffect(() => {
    const data = menuDataV2 as IMenuData;
    setMenuData(data);
    setMenuItems(data.menu);
  }, [setMenuData]);

  // Get unique categories from menu items sorted by category_order
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    menuItems.forEach((item) => {
      categoryMap.set(item.category, item.category_order);
    });
    return Array.from(categoryMap.keys()).sort((a, b) => {
      return (categoryMap.get(a) || 0) - (categoryMap.get(b) || 0);
    });
  }, [menuItems]);

  // Filter items by selected category
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  const handleBack = () => {
    router.push("/");
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
              <MenuItemCard key={item.dish_id} item={item} />
            ))}
          </div>
        </div>
      </div>
      <CartIndicator />
    </div>
  );
}
