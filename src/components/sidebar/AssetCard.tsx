import React from 'react';
import { AssetDefinition } from '../../types/assets';
import { CATEGORIES } from '../../config/assetCatalog';
import {
  Speaker,
  Disc,
  Sliders,
  Volume2,
  Radio,
  Mic,
  CircleDot,
  Box,
  Grid,
  Layers,
  Cpu,
  Zap,
  LucideIcon,
  Plus,
} from 'lucide-react';
import { useStageStore } from '../../store/useStageStore';

const iconMap: Record<string, LucideIcon> = {
  Speaker,
  Disc,
  Sliders,
  Volume2,
  Radio,
  Mic,
  CircleDot,
  Box,
  Grid,
  Layers,
  Cpu,
  Zap,
};

interface AssetCardProps {
  asset: AssetDefinition;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const category = CATEGORIES[asset.category];
  const IconComponent = iconMap[asset.iconName] || Box;
  const addElement = useStageStore((s) => s.addElement);
  const stageScale = useStageStore((s) => s.stageScale);
  const stagePos = useStageStore((s) => s.stagePos);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/stageplot-asset', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClickAdd = () => {
    const canvasCenterX = (window.innerWidth / 2 - 150 - stagePos.x) / stageScale;
    const canvasCenterY = (window.innerHeight / 2 - 80 - stagePos.y) / stageScale;
    addElement(asset.id, Math.max(100, canvasCenterX), Math.max(100, canvasCenterY));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClickAdd}
      className="group relative flex items-center justify-between py-2 px-2.5 rounded-lg border border-studio-800 bg-studio-900/80 hover:bg-studio-850 hover:border-studio-700 transition-all cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.01]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${category.accentBg} ${category.borderColor}`}
          style={{ color: category.color }}
        >
          <IconComponent size={15} />
        </div>

        <span className="text-xs font-medium text-studio-200 group-hover:text-white truncate">
          {asset.name}
        </span>
      </div>

      <button
        type="button"
        title="Click to add to canvas"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-studio-750 hover:bg-sky-600 text-studio-300 hover:text-white shrink-0 ml-1"
        onClick={(e) => {
          e.stopPropagation();
          handleClickAdd();
        }}
      >
        <Plus size={12} />
      </button>
    </div>
  );
};
