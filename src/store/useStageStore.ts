import { create } from 'zustand';
import {
  StageElement,
  MulticoreConnection,
  StagePlotExportSchema,
  ProjectMetadata,
  AlignmentGuide,
} from '../types/stage';
import { AssetTypeId } from '../types/assets';
import { VENUE_TEMPLATES, TEMPLATE_MAP } from '../assets/templates';
import { ASSET_MAP } from '../config/assetCatalog';
import { useHistoryStore } from './useHistoryStore';
import { StorageService } from '../services/storageService';

export type AppTheme = 'dark' | 'light';

interface StageStoreState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;

  templateId: string;
  metadata: ProjectMetadata;
  setTemplateId: (id: string) => void;
  setMetadata: (meta: Partial<ProjectMetadata>) => void;

  elements: StageElement[];
  selectedIds: string[];
  clipboard: StageElement[] | null;
  activeGuides: AlignmentGuide[];
  editingLabelId: string | null;

  stageScale: number;
  stagePos: { x: number; y: number };
  gridVisible: boolean;
  gridSnap: boolean;
  smartGuides: boolean;
  rulerVisible: boolean;

  setStageScale: (scale: number | ((prev: number) => number)) => void;
  setStagePos: (pos: { x: number; y: number }) => void;
  resetView: () => void;
  toggleGridVisible: () => void;
  toggleGridSnap: () => void;
  toggleSmartGuides: () => void;
  toggleRulerVisible: () => void;

  setSelectedIds: (ids: string[]) => void;
  toggleSelectId: (id: string, multi?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setEditingLabelId: (id: string | null) => void;
  setActiveGuides: (guides: AlignmentGuide[]) => void;

  addElement: (type: AssetTypeId, x: number, y: number, label?: string, colorTint?: string) => string;
  updateElement: (id: string, updates: Partial<StageElement>, recordHistory?: boolean) => void;
  updateMultipleElements: (updates: { id: string; changes: Partial<StageElement> }[], recordHistory?: boolean) => void;
  setColorTintSelected: (colorTint: string | undefined) => void;
  deleteSelected: () => void;
  deleteElement: (id: string) => void;
  rotateSelected: (degreesStep?: number) => void;
  setElementRotation: (id: string, rotation: number) => void;

  copySelected: () => void;
  paste: () => void;
  duplicateSelected: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  recordHistorySnapshot: () => void;

  getConnections: () => MulticoreConnection[];

  getExportData: () => StagePlotExportSchema;
  loadFromData: (data: StagePlotExportSchema, meta?: Partial<ProjectMetadata>) => void;
  resetToTemplate: () => void;
}

const initialTemplate = VENUE_TEMPLATES[0];
const initialTheme: AppTheme = (localStorage.getItem('stageplot_theme') as AppTheme) || 'dark';

export const useStageStore = create<StageStoreState>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    localStorage.setItem('stageplot_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme: AppTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  templateId: initialTemplate.id,
  metadata: {
    id: `plot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: 'Main Stage Layout',
    venueName: 'The Soundstage',
    engineerName: 'FOH Tech',
    bandName: 'Live Band Setup',
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  elements: initialTemplate.defaultElements ? JSON.parse(JSON.stringify(initialTemplate.defaultElements)) : [],
  selectedIds: [],
  clipboard: null,
  activeGuides: [],
  editingLabelId: null,

  stageScale: 1.0,
  stagePos: { x: 40, y: 40 },
  gridVisible: true,
  gridSnap: false,
  smartGuides: true,
  rulerVisible: true,

  canUndo: false,
  canRedo: false,

  setTemplateId: (id: string) => {
    const template = TEMPLATE_MAP.get(id);
    if (!template) return;
    const current = get();
    useHistoryStore.getState().pushState(current.elements);
    const newElements = template.defaultElements ? JSON.parse(JSON.stringify(template.defaultElements)) : [];
    set({
      templateId: id,
      elements: newElements,
      selectedIds: [],
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    });
    get().resetView();
  },

  setMetadata: (meta) => {
    set((state) => {
      const updated = { ...state.metadata, ...meta, updatedAt: Date.now() };
      StorageService.saveActiveState(get().getExportData(), updated);
      return { metadata: updated };
    });
  },

  setStageScale: (scale) => {
    set((state) => {
      const newScale = typeof scale === 'function' ? scale(state.stageScale) : scale;
      const clamped = Math.min(Math.max(newScale, 0.3), 3.0);
      return { stageScale: Number(clamped.toFixed(2)) };
    });
  },

  setStagePos: (pos) => set({ stagePos: pos }),

  resetView: () => {
    set({ stageScale: 1.0, stagePos: { x: 40, y: 40 } });
  },

  toggleGridVisible: () => set((s) => ({ gridVisible: !s.gridVisible })),
  toggleGridSnap: () => set((s) => ({ gridSnap: !s.gridSnap })),
  toggleSmartGuides: () => set((s) => ({ smartGuides: !s.smartGuides })),
  toggleRulerVisible: () => set((s) => ({ rulerVisible: !s.rulerVisible })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  toggleSelectId: (id, multi = false) => {
    set((state) => {
      if (!multi) {
        return { selectedIds: [id] };
      }
      if (state.selectedIds.includes(id)) {
        return { selectedIds: state.selectedIds.filter((item) => item !== id) };
      }
      return { selectedIds: [...state.selectedIds, id] };
    });
  },

  selectAll: () => {
    set((state) => ({ selectedIds: state.elements.map((e) => e.id) }));
  },

  clearSelection: () => set({ selectedIds: [], activeGuides: [] }),

  setEditingLabelId: (id) => set({ editingLabelId: id }),

  setActiveGuides: (guides) => set({ activeGuides: guides }),

  recordHistorySnapshot: () => {
    const { elements } = get();
    useHistoryStore.getState().pushState(elements);
    set({
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    });
  },

  addElement: (type, x, y, label, colorTint) => {
    const def = ASSET_MAP.get(type);
    const newId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newEl: StageElement = {
      id: newId,
      type,
      label: label || def?.defaultLabel || type,
      x: Math.round(x),
      y: Math.round(y),
      rotation: 0,
      width: def?.width || 50,
      height: def?.height || 50,
      colorTint,
    };

    get().recordHistorySnapshot();

    set((state) => ({
      elements: [...state.elements, newEl],
      selectedIds: [newId],
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    }));

    return newId;
  },

  updateElement: (id, updates, recordHistory = false) => {
    if (recordHistory) {
      get().recordHistorySnapshot();
    }
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    }));
  },

  updateMultipleElements: (updates, recordHistory = false) => {
    if (recordHistory) {
      get().recordHistorySnapshot();
    }
    const updateMap = new Map(updates.map((u) => [u.id, u.changes]));
    set((state) => ({
      elements: state.elements.map((el) => {
        const changes = updateMap.get(el.id);
        return changes ? { ...el, ...changes } : el;
      }),
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    }));
  },

  setColorTintSelected: (colorTint) => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;

    get().recordHistorySnapshot();

    set((state) => ({
      elements: state.elements.map((el) =>
        selectedIds.includes(el.id) ? { ...el, colorTint } : el
      ),
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    }));
  },

  deleteSelected: () => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;

    get().recordHistorySnapshot();

    set((state) => ({
      elements: state.elements.filter((el) => !selectedIds.includes(el.id)),
      selectedIds: [],
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    }));
  },

  deleteElement: (id) => {
    get().recordHistorySnapshot();
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedIds: state.selectedIds.filter((selId) => selId !== id),
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    }));
  },

  rotateSelected: (degreesStep = 45) => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;

    get().recordHistorySnapshot();

    set((state) => ({
      elements: state.elements.map((el) => {
        if (!selectedIds.includes(el.id)) return el;
        const newRot = (el.rotation + degreesStep) % 360;
        return { ...el, rotation: newRot < 0 ? newRot + 360 : newRot };
      }),
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    }));
  },

  setElementRotation: (id, rotation) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation: (rotation % 360 + 360) % 360 } : el
      ),
    }));
  },

  copySelected: () => {
    const { selectedIds, elements } = get();
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    if (selected.length > 0) {
      set({ clipboard: JSON.parse(JSON.stringify(selected)) });
    }
  },

  paste: () => {
    const { clipboard } = get();
    if (!clipboard || clipboard.length === 0) return;

    get().recordHistorySnapshot();

    const OFFSET = 25;
    const newElements: StageElement[] = [];
    const newSelectedIds: string[] = [];

    for (const item of clipboard) {
      const newId = `${item.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const duplicated: StageElement = {
        ...item,
        id: newId,
        x: item.x + OFFSET,
        y: item.y + OFFSET,
      };
      newElements.push(duplicated);
      newSelectedIds.push(newId);
    }

    set((state) => ({
      elements: [...state.elements, ...newElements],
      selectedIds: newSelectedIds,
      clipboard: newElements,
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    }));
  },

  duplicateSelected: () => {
    get().copySelected();
    get().paste();
  },

  undo: () => {
    const { elements } = get();
    const prev = useHistoryStore.getState().undo(elements);
    if (prev) {
      set({
        elements: prev,
        selectedIds: [],
        canUndo: useHistoryStore.getState().canUndo(),
        canRedo: useHistoryStore.getState().canRedo(),
      });
    }
  },

  redo: () => {
    const { elements } = get();
    const next = useHistoryStore.getState().redo(elements);
    if (next) {
      set({
        elements: next,
        selectedIds: [],
        canUndo: useHistoryStore.getState().canUndo(),
        canRedo: useHistoryStore.getState().canRedo(),
      });
    }
  },

  getConnections: () => {
    const { elements } = get();
    const fohDesk = elements.find((e) => e.type === 'foh_console');
    const stageBoxes = elements.filter((e) => e.type === 'stage_box');

    if (fohDesk && stageBoxes.length > 0) {
      return [
        {
          type: 'multicore',
          from: fohDesk.id,
          to: stageBoxes[0].id,
        },
      ];
    }
    return [];
  },

  getExportData: () => {
    const { templateId, elements } = get();
    return {
      templateId,
      version: '1.0',
      elements: elements.map((el) => ({
        id: el.id,
        type: el.type,
        label: el.label,
        x: Math.round(el.x),
        y: Math.round(el.y),
        rotation: Math.round(el.rotation),
        colorTint: el.colorTint,
      })),
      connections: get().getConnections(),
    };
  },

  loadFromData: (data, meta) => {
    useHistoryStore.getState().clearHistory();
    const template = TEMPLATE_MAP.get(data.templateId) || initialTemplate;
    set({
      templateId: template.id,
      elements: data.elements.map((el) => {
        const def = ASSET_MAP.get(el.type);
        return {
          id: el.id,
          type: el.type as AssetTypeId,
          label: el.label || def?.defaultLabel || el.type,
          x: el.x,
          y: el.y,
          rotation: el.rotation || 0,
          width: def?.width || 50,
          height: def?.height || 50,
          colorTint: el.colorTint,
        };
      }),
      selectedIds: [],
      metadata: meta ? { ...get().metadata, ...meta, updatedAt: Date.now() } : get().metadata,
      canUndo: false,
      canRedo: false,
    });
    get().resetView();
  },

  resetToTemplate: () => {
    const { templateId } = get();
    const template = TEMPLATE_MAP.get(templateId) || initialTemplate;
    get().recordHistorySnapshot();
    set({
      elements: template.defaultElements ? JSON.parse(JSON.stringify(template.defaultElements)) : [],
      selectedIds: [],
      canUndo: useHistoryStore.getState().canUndo(),
      canRedo: useHistoryStore.getState().canRedo(),
    });
  },
}));
