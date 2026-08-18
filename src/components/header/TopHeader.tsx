import React, { useState } from 'react';
import { useStageStore } from '../../store/useStageStore';
import { VENUE_TEMPLATES } from '../../assets/templates';
import { ExportMenu } from './ExportMenu';
import { AuthModal } from './AuthModal';
import Konva from 'konva';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid as GridIcon,
  Magnet,
  Ruler,
  FolderOpen,
  Sliders,
  Sparkles,
  Edit3,
  Sun,
  Moon,
  RefreshCw,
  HardDrive,
  AlertCircle,
} from 'lucide-react';

interface TopHeaderProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ stageRef }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'projects' | 'signin' | 'signup'>('projects');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Store state
  const theme = useStageStore((s) => s.theme);
  const toggleTheme = useStageStore((s) => s.toggleTheme);
  const user = useStageStore((s) => s.user);
  const syncStatus = useStageStore((s) => s.syncStatus);
  const templateId = useStageStore((s) => s.templateId);
  const metadata = useStageStore((s) => s.metadata);
  const stageScale = useStageStore((s) => s.stageScale);
  const gridVisible = useStageStore((s) => s.gridVisible);
  const gridSnap = useStageStore((s) => s.gridSnap);
  const smartGuides = useStageStore((s) => s.smartGuides);
  const rulerVisible = useStageStore((s) => s.rulerVisible);
  const canUndo = useStageStore((s) => s.canUndo);
  const canRedo = useStageStore((s) => s.canRedo);

  // Actions
  const setTemplateId = useStageStore((s) => s.setTemplateId);
  const setMetadata = useStageStore((s) => s.setMetadata);
  const setStageScale = useStageStore((s) => s.setStageScale);
  const resetView = useStageStore((s) => s.resetView);
  const toggleGridVisible = useStageStore((s) => s.toggleGridVisible);
  const toggleGridSnap = useStageStore((s) => s.toggleGridSnap);
  const toggleSmartGuides = useStageStore((s) => s.toggleSmartGuides);
  const toggleRulerVisible = useStageStore((s) => s.toggleRulerVisible);
  const undo = useStageStore((s) => s.undo);
  const redo = useStageStore((s) => s.redo);

  const isDark = theme === 'dark';

  const openProjects = (tab: 'projects' | 'signin' = 'projects') => {
    setAuthInitialTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <header className="h-14 bg-white dark:bg-studio-900 border-b border-slate-200 dark:border-studio-800 px-4 flex items-center justify-between select-none z-30 shrink-0 transition-colors duration-200">
      {/* Left: Brand & Editable Project Name */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sliders size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                StagePlot
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 font-mono font-semibold">
                BUILDER
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-studio-400 leading-none">Live Sound Reinforcement</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-studio-800 shrink-0" />

        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={metadata.name}
              onChange={(e) => setMetadata({ name: e.target.value })}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              className="bg-slate-100 dark:bg-studio-950 border border-sky-500 rounded px-2 py-0.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none w-48"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 group text-left max-w-xs hover:bg-slate-100 dark:hover:bg-studio-800 px-2 py-1 rounded transition-colors"
              title="Click to rename project"
            >
              <span className="text-xs font-semibold text-slate-700 dark:text-studio-200 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                {metadata.name || 'Untitled Stage Plot'}
              </span>
              <Edit3 size={12} className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-studio-400 shrink-0" />
            </button>
          )}

          {/* Auto-Save Status Pill */}
          <button
            type="button"
            onClick={() => openProjects(user ? 'projects' : 'signin')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors border shrink-0 bg-slate-100/80 dark:bg-studio-950/80 border-slate-200 dark:border-studio-800 hover:border-sky-500/50"
            title={
              syncStatus === 'saving'
                ? 'Saving changes...'
                : syncStatus === 'saved'
                ? 'All changes automatically saved to Cloud'
                : syncStatus === 'error'
                ? 'Sync failed, saved locally. Click to retry'
                : 'Saved to LocalStorage. Sign in to enable multi-device cloud sync'
            }
          >
            {syncStatus === 'saving' && (
              <>
                <RefreshCw size={10} className="text-amber-500 animate-spin" />
                <span className="text-amber-600 dark:text-amber-400">Saving...</span>
              </>
            )}
            {syncStatus === 'saved' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
              </>
            )}
            {syncStatus === 'offline' && (
              <>
                <HardDrive size={10} className="text-slate-400" />
                <span className="text-slate-500 dark:text-studio-400">Local Draft</span>
              </>
            )}
            {syncStatus === 'error' && (
              <>
                <AlertCircle size={10} className="text-red-500" />
                <span className="text-red-500">Offline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center: Stage Dimension Switcher & Undo/Redo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-studio-950 border border-slate-200 dark:border-studio-750 rounded-lg px-2.5 py-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-studio-400">Stage:</span>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-studio-100 focus:outline-none cursor-pointer"
          >
            {VENUE_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-studio-900 text-slate-900 dark:text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-studio-950 border border-slate-200 dark:border-studio-750 rounded-lg p-0.5">
          <button
            type="button"
            title="Undo (Ctrl+Z / Cmd+Z)"
            disabled={!canUndo}
            onClick={undo}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Shift+Z / Cmd+Shift+Z)"
            disabled={!canRedo}
            onClick={redo}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 size={14} />
          </button>
        </div>
      </div>

      {/* Right: Theme Toggle, Canvas Toggles, Zoom, Export, Persistence */}
      <div className="flex items-center gap-2">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-studio-950 hover:bg-slate-200 dark:hover:bg-studio-800 border border-slate-200 dark:border-studio-750 text-slate-700 dark:text-studio-200 text-xs font-semibold transition-colors"
        >
          {isDark ? (
            <>
              <Sun size={14} className="text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-sky-600" />
              <span className="hidden sm:inline text-[11px]">Dark</span>
            </>
          )}
        </button>

        <div className="flex items-center bg-slate-100 dark:bg-studio-950 border border-slate-200 dark:border-studio-750 rounded-lg p-0.5">
          <button
            type="button"
            title={`Toggle Grid (${gridVisible ? 'ON' : 'OFF'})`}
            onClick={toggleGridVisible}
            className={`p-1.5 rounded-md transition-colors ${
              gridVisible
                ? 'bg-slate-200 dark:bg-studio-800 text-sky-600 dark:text-sky-400'
                : 'text-slate-500 dark:text-studio-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GridIcon size={14} />
          </button>
          <button
            type="button"
            title={`Toggle Snap-to-Grid (${gridSnap ? 'ON' : 'OFF'})`}
            onClick={toggleGridSnap}
            className={`p-1.5 rounded-md transition-colors ${
              gridSnap
                ? 'bg-slate-200 dark:bg-studio-800 text-sky-600 dark:text-sky-400'
                : 'text-slate-500 dark:text-studio-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Magnet size={14} />
          </button>
          <button
            type="button"
            title={`Toggle Smart Guides (${smartGuides ? 'ON' : 'OFF'})`}
            onClick={toggleSmartGuides}
            className={`p-1.5 rounded-md transition-colors ${
              smartGuides
                ? 'bg-slate-200 dark:bg-studio-800 text-pink-600 dark:text-pink-400'
                : 'text-slate-500 dark:text-studio-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={14} />
          </button>
          <button
            type="button"
            title={`Toggle Metric Ruler (${rulerVisible ? 'ON' : 'OFF'})`}
            onClick={toggleRulerVisible}
            className={`p-1.5 rounded-md transition-colors ${
              rulerVisible
                ? 'bg-slate-200 dark:bg-studio-800 text-amber-600 dark:text-amber-400'
                : 'text-slate-500 dark:text-studio-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ruler size={14} />
          </button>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-studio-950 border border-slate-200 dark:border-studio-750 rounded-lg p-0.5">
          <button
            type="button"
            title="Zoom Out"
            onClick={() => setStageScale((prev) => prev - 0.1)}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-slate-700 dark:text-studio-300 min-w-[42px] text-center">
            {Math.round(stageScale * 100)}%
          </span>
          <button
            type="button"
            title="Zoom In"
            onClick={() => setStageScale((prev) => prev + 0.1)}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            title="Reset View"
            onClick={resetView}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-studio-800 text-slate-600 dark:text-studio-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Maximize size={14} />
          </button>
        </div>

        {/* Projects / User Account Button */}
        <button
          type="button"
          onClick={() => openProjects(user ? 'projects' : 'signin')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-studio-850 hover:bg-slate-200 dark:hover:bg-studio-800 border border-slate-200 dark:border-studio-700 text-slate-700 dark:text-studio-200 text-xs font-semibold transition-colors"
        >
          {user ? (
            <>
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline max-w-[100px] truncate">
                {user.displayName || user.email?.split('@')[0] || 'Projects'}
              </span>
            </>
          ) : (
            <>
              <FolderOpen size={14} className="text-sky-600 dark:text-sky-400" />
              <span>Projects</span>
            </>
          )}
        </button>

        <ExportMenu stageRef={stageRef} />
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authInitialTab}
      />
    </header>
  );
};
