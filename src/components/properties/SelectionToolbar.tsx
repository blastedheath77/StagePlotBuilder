import React, { useState } from 'react';
import { useStageStore } from '../../store/useStageStore';
import { ASSET_MAP, CATEGORIES } from '../../config/assetCatalog';
import {
  RotateCcw,
  RotateCw,
  Trash2,
  Copy,
  Edit2,
  Layers,
  Palette,
} from 'lucide-react';

const TINT_COLORS = [
  { name: 'Default', value: undefined, bg: 'bg-slate-400 dark:bg-studio-700' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
  { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Green', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Slate', value: '#94a3b8', bg: 'bg-slate-400' },
];

export const SelectionToolbar: React.FC = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const selectedIds = useStageStore((s) => s.selectedIds);
  const elements = useStageStore((s) => s.elements);
  const rotateSelected = useStageStore((s) => s.rotateSelected);
  const deleteSelected = useStageStore((s) => s.deleteSelected);
  const duplicateSelected = useStageStore((s) => s.duplicateSelected);
  const setEditingLabelId = useStageStore((s) => s.setEditingLabelId);
  const setColorTintSelected = useStageStore((s) => s.setColorTintSelected);

  if (selectedIds.length === 0) return null;

  const selectedElements = elements.filter((e) => selectedIds.includes(e.id));
  const singleItem = selectedElements.length === 1 ? selectedElements[0] : null;
  const def = singleItem ? ASSET_MAP.get(singleItem.type) : null;
  const category = def ? CATEGORIES[def.category] : null;
  const currentColor = singleItem?.colorTint || category?.color || '#38bdf8';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Color Tint Swatches Popover */}
      {showColorPicker && (
        <div className="flex items-center gap-1.5 p-2 bg-white/95 dark:bg-studio-900/95 border border-slate-300 dark:border-studio-700 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <span className="text-[10px] font-mono text-slate-500 dark:text-studio-400 uppercase pr-1">Tint:</span>
          {TINT_COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => {
                setColorTintSelected(c.value);
                setShowColorPicker(false);
              }}
              className={`w-5 h-5 rounded-full ${c.bg} border-2 transition-transform hover:scale-125 ${
                singleItem?.colorTint === c.value || (!singleItem?.colorTint && !c.value)
                  ? 'border-white ring-2 ring-sky-500/50'
                  : 'border-transparent'
              }`}
            />
          ))}
        </div>
      )}

      {/* Main Floating Selection Bar */}
      <div className="flex items-center gap-2 px-3.5 py-2 bg-white/95 dark:bg-studio-900/95 border border-slate-300 dark:border-studio-700/80 rounded-xl shadow-2xl backdrop-blur-md text-slate-800 dark:text-studio-200">
        {/* Selection Info */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-studio-750">
          {singleItem ? (
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentColor }}
              />
              <span className="text-xs font-semibold text-slate-900 dark:text-white max-w-[120px] truncate">
                {singleItem.label || def?.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
              <Layers size={14} />
              <span>{selectedIds.length} items</span>
            </div>
          )}
        </div>

        {/* Color Tint Button */}
        <button
          type="button"
          title="Color Tint Asset"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-xs font-medium ${
            showColorPicker
              ? 'bg-slate-100 dark:bg-studio-800 text-sky-600 dark:text-sky-400'
              : 'hover:bg-slate-100 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette size={14} style={{ color: currentColor }} />
          <span>Color</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-studio-750" />

        {/* Rotation Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Rotate 45° Counter-Clockwise"
            onClick={() => rotateSelected(-45)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw size={15} />
          </button>

          {singleItem && (
            <div className="flex items-center gap-1 px-1">
              <span className="text-[11px] font-mono text-slate-500 dark:text-studio-400">
                {singleItem.rotation}°
              </span>
            </div>
          )}

          <button
            type="button"
            title="Rotate 45° Clockwise"
            onClick={() => rotateSelected(45)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCw size={15} />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-studio-750" />

        {/* Edit Label (Single item) */}
        {singleItem && singleItem.type !== 'power_drop' && (
          <button
            type="button"
            title="Edit Label (Double Click on stage)"
            onClick={() => setEditingLabelId(singleItem.id)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-studio-800 text-xs font-medium text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Edit2 size={13} />
            <span>Label</span>
          </button>
        )}

        {/* Duplicate */}
        <button
          type="button"
          title="Duplicate (Ctrl+C / Ctrl+V)"
          onClick={duplicateSelected}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Copy size={15} />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-studio-750" />

        {/* Delete */}
        <button
          type="button"
          title="Delete (Backspace/Delete)"
          onClick={deleteSelected}
          className="p-1.5 rounded-lg hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
