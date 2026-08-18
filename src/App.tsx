import React, { useRef, useEffect } from 'react';
import Konva from 'konva';
import { TopHeader } from './components/header/TopHeader';
import { AssetPalette } from './components/sidebar/AssetPalette';
import { CanvasStage } from './components/canvas/CanvasStage';
import { SelectionToolbar } from './components/properties/SelectionToolbar';
import { useStageStore } from './store/useStageStore';
import { StorageService } from './services/storageService';

export const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);

  // Store actions
  const undo = useStageStore((s) => s.undo);
  const redo = useStageStore((s) => s.redo);
  const deleteSelected = useStageStore((s) => s.deleteSelected);
  const copySelected = useStageStore((s) => s.copySelected);
  const paste = useStageStore((s) => s.paste);
  const duplicateSelected = useStageStore((s) => s.duplicateSelected);
  const selectAll = useStageStore((s) => s.selectAll);
  const clearSelection = useStageStore((s) => s.clearSelection);
  const loadFromData = useStageStore((s) => s.loadFromData);

  // Load cached active state if present on initial mount
  useEffect(() => {
    const cached = StorageService.loadActiveState();
    if (cached && cached.plotData) {
      loadFromData(cached.plotData, cached.metadata);
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (
        (isCmdOrCtrl && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        (isCmdOrCtrl && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Copy: Cmd/Ctrl + C
      if (isCmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }

      // Paste: Cmd/Ctrl + V
      if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        paste();
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Select All: Cmd/Ctrl + A
      if (isCmdOrCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll();
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Escape: Deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected, copySelected, paste, duplicateSelected, selectAll, clearSelection]);

  return (
    <div className="flex flex-col h-screen w-screen bg-studio-950 overflow-hidden text-studio-100 font-sans">
      {/* Top Navigation & Controls */}
      <TopHeader stageRef={stageRef} />

      {/* Main Workspace: Left Sidebar + Canvas */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Asset Palette */}
        <AssetPalette />

        {/* Canvas Area */}
        <main className="flex-1 relative overflow-hidden">
          <CanvasStage stageRef={stageRef} />
          {/* Floating Contextual Selection Toolbar */}
          <SelectionToolbar />
        </main>
      </div>
    </div>
  );
};

export default App;
