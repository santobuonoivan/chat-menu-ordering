interface ActionChipsProps {
  chips: string[];
  onChipClick?: (chip: string) => void;
}

export default function ActionChips({ chips, onChipClick }: ActionChipsProps) {
  const defaultChips = ["Ver Menú Digital"];

  const chipsToRender = chips.length > 0 ? chips : defaultChips;

  return (
    <div className="flex gap-2 p-3 flex-wrap ml-11">
      {chipsToRender.map((chip, index) => (
        <div
          key={index}
          onClick={() => onChipClick?.(chip)}
          className="flex h-8 cursor-pointer items-center justify-center gap-x-2 rounded-full bg-[#8E2653] hover:bg-[#7A2044] text-white dark:text-[#e9edef] dark:bg-[#005c4b] dark:hover:bg-[#00a884] px-3 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md active:shadow-sm"
        >
          <p className="text-sm font-medium">{chip}</p>
        </div>
      ))}
    </div>
  );
}
