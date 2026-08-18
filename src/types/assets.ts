export type AssetCategory = 'foh_pa' | 'monitoring' | 'backline' | 'infrastructure';

export type AssetTypeId =
  | 'main_pa_speaker'
  | 'subwoofer'
  | 'foh_console'
  | 'foldback_wedge'
  | 'side_fill'
  | 'microphone'
  | 'drum_kit'
  | 'amp_cab'
  | 'keyboard_rig'
  | 'pedalboard'
  | 'stage_box'
  | 'power_drop';

export interface AssetDefinition {
  id: AssetTypeId;
  name: string;
  category: AssetCategory;
  defaultLabel: string;
  width: number;       // default canvas width in pixels
  height: number;      // default canvas height in pixels
  realWidthMeters: number;
  realHeightMeters: number;
  iconName: string;
  description: string;
  colorAccent: string;
  badgeText?: string;
}

export interface CategoryDefinition {
  id: AssetCategory;
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
  accentBg: string;
}
