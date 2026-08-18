import React from 'react';
import { useStageStore } from '../../store/useStageStore';
import { ASSET_MAP, CATEGORIES } from '../../config/assetCatalog';
import {
  RotateCcw,
  RotateCw,
  Trash2,
  Copy,
  Edit2,
  Layers,
} from 'lucide-react';

export const SelectionToolbar: React.FC = () => {
  const selectedIds = useStageStore((s) => s.selectedIds);
  const elements = useStageStore((s) => s.elements);
  const rotateSelected = useStageStore((s) => s.rotateSelected);
  const deleteSelected = useStageStore((s) => s.deleteSelected);
  const duplicateSelected = useStageStore((s) => s.duplicateSelected);
  const setEditingLabelId = useStageStore((s) => s.setEditingLabelId);

  if (selectedIds.length === 0) return null;

  const selectedElements = elements.filter((e) => selectedIds.includes(e.id));
  const singleItem = selectedElements.length === 1 ? selectedElements[0] : null;
  const def = singleItem ? ASSET_MAP.get(singleItem.type) : null;
  const category = def ? CATEGORIES[def.category] : null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3.5 py-2 bg-studio-900/95 border border-studio-700/80 rounded-xl shadow-2xl backdrop-blur-md text-studio-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2 pr-3 border-r border-studio-750">
        {singleItem ? (
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: category?.color || '#38bdf8' }}
            />
            <span className="text-xs font-semibold text-white max-w-[120px] truncate">
              {singleItem.label || def?.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
            <Layers size={14} />
            <span>{selectedIds.length} items selected</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Rotate 45° Counter-Clockwise"
          onClick={() => rotateSelected(-45)}
          className="p-1.5 rounded-lg hover:bg-studio-800 text-studio-300 hover:text-white transition-colors"
        >
          <RotateCcw size={15} />
        </button>

        {singleItem && (
          <div className="flex items-center gap-1 px-1">
            <span className="text-[11px] font-mono text-studio-400">
              {singleItem.rotation}°
            </span>
          </div>
        )}

        <button
          type="button"
          title="Rotate 45° Clockwise"
          onClick={() => rotateSelected(45)}
          className="p-1.5 rounded-lg hover:bg-studio-800 text-studio-300 hover:text-white transition-colors"
        >
          <RotateCw size={15} />
        </button>
      </div>

      <div className="h-4 w-px bg-studio-750" />

      {singleItem && (
        <button
          type="button"
          title="Edit Label (Double Click on stage)"
          onClick={() => setEditingLabelId(singleItem.id)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-studio-800 text-xs font-medium text-studio-300 hover:text-white transition-colors"
        >
          <Edit2 size={13} />
          <span>Label</span>
        </button>
      )}

      <button
        type="button"
        title="Duplicate (Ctrl+C / Ctrl+V)"
        onClick={duplicateSelected}
        className="p-1.5 rounded-lg hover:bg-studio-800 text-studio-300 hover:text-white transition-colors"
      >
        <Copy size={15} />
      </button>

      <div className="h-4 w-px bg-studio-750" />

      <button
        type="button"
        title="Delete (Backspace/Delete)"
        onClick={deleteSelected}
        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};
