import React, { useState, useRef, useEffect } from 'react';
import { Download, FileImage, FileText, Code2, Upload, ChevronDown } from 'lucide-react';
import { useStageStore } from '../../store/useStageStore';
import { ExportService } from '../../services/exportService';
import Konva from 'konva';

interface ExportMenuProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ stageRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const metadata = useStageStore((s) => s.metadata);
  const getExportData = useStageStore((s) => s.getExportData);
  const loadFromData = useStageStore((s) => s.loadFromData);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleExportPng = () => {
    if (!stageRef.current) return;
    ExportService.exportToPng(stageRef.current, metadata.name);
    setIsOpen(false);
  };

  const handleExportPdf = () => {
    if (!stageRef.current) return;
    ExportService.exportToPdf(stageRef.current, metadata, getExportData());
    setIsOpen(false);
  };

  const handleExportJson = () => {
    ExportService.exportToJson(getExportData(), metadata.name);
    setIsOpen(false);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = ExportService.parseImportJson(content);
        loadFromData(parsed, {
          name: file.name.replace(/\.json$/i, ''),
        });
      } catch (err: any) {
        alert(err.message || 'Invalid stage plot JSON file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm shadow-sky-600/30 transition-colors"
      >
        <Download size={14} />
        <span>Export</span>
        <ChevronDown size={13} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-studio-900 border border-studio-700/80 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-studio-500">
            Export Diagram
          </div>

          <button
            type="button"
            onClick={handleExportPng}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-studio-200 hover:bg-studio-800 hover:text-white transition-colors text-left"
          >
            <FileImage size={15} className="text-sky-400" />
            <div>
              <div className="font-medium">Export PNG</div>
              <div className="text-[10px] text-studio-400">High-resolution stage graphic</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-studio-200 hover:bg-studio-800 hover:text-white transition-colors text-left"
          >
            <FileText size={15} className="text-red-400" />
            <div>
              <div className="font-medium">Export PDF Document</div>
              <div className="text-[10px] text-studio-400">Printable stage plot with title block</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-studio-200 hover:bg-studio-800 hover:text-white transition-colors text-left"
          >
            <Code2 size={15} className="text-emerald-400" />
            <div>
              <div className="font-medium">Export JSON</div>
              <div className="text-[10px] text-studio-400">Standard PRD data schema</div>
            </div>
          </button>

          <div className="my-1.5 border-t border-studio-800" />

          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-studio-500">
            Import
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-studio-200 hover:bg-studio-800 hover:text-white transition-colors text-left"
          >
            <Upload size={15} className="text-amber-400" />
            <div>
              <div className="font-medium">Import JSON File...</div>
              <div className="text-[10px] text-studio-400">Load existing stage plot data</div>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportJson}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
