import React, { useState, useEffect, useRef } from 'react';
import { useStageStore } from '../../store/useStageStore';
import { ASSET_MAP } from '../../config/assetCatalog';

interface InlineLabelEditorProps {
  stageContainerRef?: React.RefObject<HTMLDivElement>;
}

export const InlineLabelEditor: React.FC<InlineLabelEditorProps> = () => {
  const editingLabelId = useStageStore((s) => s.editingLabelId);
  const elements = useStageStore((s) => s.elements);
  const stageScale = useStageStore((s) => s.stageScale);
  const stagePos = useStageStore((s) => s.stagePos);
  const updateElement = useStageStore((s) => s.updateElement);
  const setEditingLabelId = useStageStore((s) => s.setEditingLabelId);

  const activeElement = elements.find((e) => e.id === editingLabelId);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeElement) {
      setValue(activeElement.label);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [activeElement?.id]);

  if (!activeElement || !editingLabelId) return null;

  const def = ASSET_MAP.get(activeElement.type);
  const assetHeight = activeElement.height || def?.height || 50;

  const screenX = activeElement.x * stageScale + stagePos.x;
  const screenY = (activeElement.y + assetHeight / 2 + 10) * stageScale + stagePos.y;

  const handleCommit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== activeElement.label) {
      updateElement(activeElement.id, { label: trimmed }, true);
    }
    setEditingLabelId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingLabelId(null);
    }
  };

  return (
    <div
      className="absolute z-50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto shadow-2xl"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
      }}
    >
      <div className="flex items-center bg-studio-900/95 border border-sky-500 rounded-md px-2 py-1 shadow-lg shadow-sky-500/20 backdrop-blur-sm">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCommit}
          className="bg-transparent text-white text-xs font-medium focus:outline-none w-36 text-center"
          placeholder="Enter label name..."
        />
      </div>
    </div>
  );
};
