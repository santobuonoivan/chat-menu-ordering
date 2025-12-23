import { IMenuItem } from "@/types/menu";
import ItemChatCard from "./ItemChatCard";
import { useState } from "react";

interface ItemChatCardListProps {
  items: IMenuItem[];
  action: string;
}

export default function ItemChatCardList({
  items,
  action,
}: ItemChatCardListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2 w-[90%] max-w-md">
      {currentItems.map((item: IMenuItem, index: number) => (
        <ItemChatCard key={item.dish_id || index} item={item} action={action} />
      ))}

      {/* Paginador - solo si hay más de 5 items */}
      {items.length > itemsPerPage && (
        <div className="flex items-center justify-between gap-2 mt-2 px-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center justify-center px-1 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_left
            </span>
          </button>

          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center px-1 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
