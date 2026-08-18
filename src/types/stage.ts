import { AssetTypeId } from './assets';

export interface StageElement {
  id: string;
  type: AssetTypeId;
  label: string;
  x: number;
  y: number;
  rotation: number; // in degrees: 0, 45, 90, 135, etc.
  width?: number;
  height?: number;
}

export interface MulticoreConnection {
  type: 'multicore';
  from: string; // FOH console element id
  to: string;   // Stage box element id
}

export interface VenueZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  labelColor: string;
  dashed?: boolean;
}

export interface VenueTemplate {
  id: string;
  name: string;
  description: string;
  capacity: string;
  stageDimensions: string;
  stageWidthMeters: number;
  stageHeightMeters: number;
  canvasWidth: number;   // In pixels at 1:1 base scale
  canvasHeight: number;
  pixelsPerMeter: number;
  zones: VenueZone[];
  defaultElements?: StageElement[];
}

export interface StagePlotExportSchema {
  templateId: string;
  version: string;
  elements: Array<{
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    rotation: number;
  }>;
  connections: Array<{
    type: 'multicore';
    from: string;
    to: string;
  }>;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  venueName?: string;
  engineerName?: string;
  bandName?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  ownerId?: string;
}

export interface AlignmentGuide {
  orientation: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}
