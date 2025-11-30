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
          className="flex h-8 cursor-pointer items-center justify-center gap-x-2 rounded-full bg-green-900 hover:bg-primary/30 text-white dark:text-white dark:bg-primary/40 dark:hover:bg-primary/50 px-3 transition-colors"
        >
          <p className="text-sm font-medium">{chip}</p>
        </div>
      ))}
    </div>
  );
}
