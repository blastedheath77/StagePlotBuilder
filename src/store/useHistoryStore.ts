import { create } from 'zustand';
import { StageElement } from '../types/stage';

export interface HistoryState {
  past: StageElement[][];
  future: StageElement[][];
  maxDepth: number;
  pushState: (elements: StageElement[]) => void;
  undo: (currentElements: StageElement[]) => StageElement[] | null;
  redo: (currentElements: StageElement[]) => StageElement[] | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  maxDepth: 50,

  pushState: (elements: StageElement[]) => {
    set((state) => {
      const cloned = JSON.parse(JSON.stringify(elements));
      const newPast = [...state.past, cloned].slice(-state.maxDepth);
      return {
        past: newPast,
        future: [], // clear future on new action
      };
    });
  },

  undo: (currentElements: StageElement[]) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [JSON.parse(JSON.stringify(currentElements)), ...future];

    set({ past: newPast, future: newFuture });
    return JSON.parse(JSON.stringify(previous));
  },

  redo: (currentElements: StageElement[]) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, JSON.parse(JSON.stringify(currentElements))];

    set({ past: newPast, future: newFuture });
    return JSON.parse(JSON.stringify(next));
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clearHistory: () => set({ past: [], future: [] }),
}));
