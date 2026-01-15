import { DEFAULT_ANNOTATION_COLORS } from '@/types/annotation';

const COLOR_NAMES: Record<string, string> = {
  '#FFEB3B': 'giallo',
  '#FF9800': 'arancione',
  '#F44336': 'rosso',
  '#E91E63': 'rosa',
  '#9C27B0': 'viola',
  '#2196F3': 'blu',
  '#4CAF50': 'verde',
};

interface ColorSelectorProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  colors?: string[];
  label?: string;
}

export function ColorSelector({
  selectedColor,
  onColorChange,
  colors = DEFAULT_ANNOTATION_COLORS,
  label = 'Colore',
}: ColorSelectorProps) {
  const getColorName = (color: string): string => {
    return COLOR_NAMES[color] || color;
  };

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {colors.map((color) => {
          const colorName = getColorName(color);
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-6 h-6 rounded-full transition-transform ${
                isSelected ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${colorName}${isSelected ? ', selezionato' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}
