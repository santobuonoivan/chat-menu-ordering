interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div
      className="flex gap-2 py-3 overflow-x-auto "
      style={{
        scrollbarColor: "#8E2653 transparent",
        scrollbarWidth: "thin",
      }}
    >
      {categories.map((category) => (
        <div
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 cursor-pointer transition-colors ${
            activeCategory === category
              ? "bg-[#8E2653] hover:bg-[#6E2653]"
              : "bg-white/80 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20"
          }`}
        >
          <p
            className={`text-sm font-medium leading-normal ${
              activeCategory === category
                ? "text-white"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {category.charAt(0).toUpperCase() +
              category.slice(1).toLocaleUpperCase()}
          </p>
        </div>
      ))}
    </div>
  );
}
