import React, { useState, useMemo } from 'react';
import { ASSET_CATALOG, CATEGORIES } from '../../config/assetCatalog';
import { AssetCategory } from '../../types/assets';
import { AssetCard } from './AssetCard';
import { Search, ChevronDown, ChevronRight, Layers, HelpCircle } from 'lucide-react';

export const AssetPalette: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const categoriesList: AssetCategory[] = ['foh_pa', 'monitoring', 'backline', 'infrastructure'];

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return ASSET_CATALOG;
    const q = searchQuery.toLowerCase();
    return ASSET_CATALOG.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.badgeText?.toLowerCase().includes(q) ||
        CATEGORIES[a.category].name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <aside className="w-72 bg-white dark:bg-studio-900 border-r border-slate-200 dark:border-studio-800 flex flex-col h-full shrink-0 select-none z-20 transition-colors duration-200">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-200 dark:border-studio-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-studio-200 uppercase tracking-wider">
            <Layers size={14} className="text-sky-600 dark:text-sky-400" />
            <span>Asset Palette</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-studio-500">12 Audio Items</span>
        </div>

        {/* Search Assets Input */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-studio-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sound equipment..."
            className="w-full bg-slate-100 dark:bg-studio-950 border border-slate-200 dark:border-studio-750 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-studio-100 placeholder-slate-400 dark:placeholder-studio-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:text-studio-500 dark:hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Asset Categories & Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {categoriesList.map((catId) => {
          const categoryDef = CATEGORIES[catId];
          const items = filteredAssets.filter((a) => a.category === catId);
          if (items.length === 0) return null;

          const isCollapsed = Boolean(collapsedCategories[catId]);

          return (
            <div key={catId} className="space-y-1.5">
              {/* Category Accordion Header */}
              <button
                type="button"
                onClick={() => toggleCategory(catId)}
                className="w-full flex items-center justify-between py-1 px-1.5 text-xs font-semibold rounded hover:bg-slate-100 dark:hover:bg-studio-800/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: categoryDef.color }}
                  />
                  <span className="text-slate-700 dark:text-studio-200">{categoryDef.name}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 dark:text-studio-500 text-[11px]">
                  <span>{items.length}</span>
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {/* Items List */}
              {!isCollapsed && (
                <div className="space-y-1.5 pl-0.5">
                  {items.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-studio-500 text-xs">
            No assets match &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {/* Footer Info / Drag Hint */}
      <div className="p-2.5 border-t border-slate-200 dark:border-studio-800 bg-slate-50 dark:bg-studio-950/60 text-[11px] text-slate-500 dark:text-studio-400 flex items-center gap-2">
        <HelpCircle size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
        <span className="leading-tight">
          Drag onto stage or click <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-studio-800 rounded text-[9px] font-mono text-slate-700 dark:text-studio-300">+</kbd> to insert.
        </span>
      </div>
    </aside>
  );
};
