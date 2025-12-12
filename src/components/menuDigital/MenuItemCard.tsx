import { useState } from "react";
import { IMenuItem } from "@/types/menu";
import ProductModal from "./ProductModal";
import { useChatStore } from "@/stores/chatStore";

interface MenuItemCardProps {
  item: IMenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // Fallback image if no imageUrl is provided
  const defaultImage =
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&h=300";

  return (
    <>
      <div
        onClick={handleCardClick}
        className="flex flex-col gap-4 bg-white/80 dark:bg-white/10 p-3 rounded-lg cursor-pointer transition-transform hover:scale-[1.02]"
      >
        <div
          className="bg-center bg-no-repeat aspect-video bg-cover rounded-lg h-32"
          style={{
            backgroundImage: `url("${item.image || defaultImage}")`,
          }}
          title={item.dish_name}
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">
              {item.dish_name}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">
              {item.description}
            </p>
            <p
              className="text-sm font-bold leading-normal pt-1"
              style={{ color: "#8E2653" }}
            >
              ${parseFloat(item.dish_price).toFixed(2)}
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={handleAddClick}
              disabled={false}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:opacity-80"
              style={{
                backgroundColor: "rgba(142, 38, 83, 0.2)",
                color: "#8E2653",
              }}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
      />
    </>
  );
}
