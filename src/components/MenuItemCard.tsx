import { MenuItem } from "@/types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const handleAddClick = () => {
    onAddToCart?.(item);
  };

  // Fallback image if no imageUrl is provided
  const defaultImage =
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&h=300";

  return (
    <div className="flex flex-col gap-4 bg-white/80 dark:bg-white/10 p-3 rounded-lg cursor-pointer transition-transform hover:scale-[1.02]">
      <div
        className="bg-center bg-no-repeat aspect-video bg-cover rounded-lg h-32"
        style={{
          backgroundImage: `url("${item.imageUrl || defaultImage}")`,
        }}
        title={item.name}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">
            {item.name}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">
            {item.description}
          </p>
          <p className="text-primary text-sm font-bold leading-normal pt-1">
            ${item.price.toFixed(2)}
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={handleAddClick}
            disabled={!item.isAvailable}
            className={`flex size-9 items-center justify-center rounded-full transition-colors ${
              item.isAvailable
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
