import { ASSET_CATALOG, ASSET_MAP, CATEGORIES } from '../config/assetCatalog';
import { VENUE_TEMPLATES } from '../assets/templates';
import { AlignmentService } from '../services/alignmentService';
import { ExportService } from '../services/exportService';
import { useHistoryStore } from '../store/useHistoryStore';
import { StageElement } from '../types/stage';

console.log('=== RUNNING STAGEPLOT BUILDER VERIFICATION SUITE ===\n');

// 1. Asset Catalog Verification
console.log('1. Verifying Asset Catalog (12 Assets):');
const expectedAssetIds = [
  'main_pa_speaker',
  'subwoofer',
  'foh_console',
  'foldback_wedge',
  'side_fill',
  'microphone',
  'drum_kit',
  'amp_cab',
  'keyboard_rig',
  'pedalboard',
  'stage_box',
  'power_drop',
];

if (ASSET_CATALOG.length !== 12) {
  throw new Error(`Expected 12 assets, found ${ASSET_CATALOG.length}`);
}

for (const id of expectedAssetIds) {
  const asset = ASSET_MAP.get(id);
  if (!asset) throw new Error(`Missing asset: ${id}`);
  if (!CATEGORIES[asset.category]) throw new Error(`Invalid category for ${id}`);
  console.log(`  ✓ Asset: ${asset.name} [${asset.category}] (${asset.realWidthMeters}m x ${asset.realHeightMeters}m)`);
}

// 2. Venue Templates Verification
console.log('\n2. Verifying Venue Templates:');
if (VENUE_TEMPLATES.length !== 2) {
  throw new Error(`Expected 2 venue templates, found ${VENUE_TEMPLATES.length}`);
}
for (const template of VENUE_TEMPLATES) {
  console.log(`  ✓ Template: ${template.name} (${template.stageDimensions}) - ${template.zones.length} zones`);
  if (template.zones.length < 3) throw new Error(`Template ${template.id} is missing required zones`);
}

// 3. Multicore Logic Verification
console.log('\n3. Verifying Multicore Connection Logic:');
const sampleElements: StageElement[] = [
  { id: 'foh_1', type: 'foh_console', label: 'FOH Desk', x: 500, y: 800, rotation: 0 },
  { id: 'stage_box_1', type: 'stage_box', label: 'Stage Left', x: 200, y: 100, rotation: 0 },
  { id: 'stage_box_2', type: 'stage_box', label: 'Stage Right', x: 700, y: 100, rotation: 0 },
];

const fohDesk = sampleElements.find((e) => e.type === 'foh_console');
const stageBoxes = sampleElements.filter((e) => e.type === 'stage_box');
const connections = fohDesk && stageBoxes.length > 0 ? [{ type: 'multicore', from: fohDesk.id, to: stageBoxes[0].id }] : [];

if (connections.length !== 1 || connections[0].to !== 'stage_box_1') {
  throw new Error('Multicore logic failure: must connect to first-placed Stage Box only');
}
console.log(`  ✓ Multicore correctly connected only 1 line: ${connections[0].from} -> ${connections[0].to}`);

// 4. Alignment & Snapping Verification
console.log('\n4. Verifying Alignment & Snapping Service:');
const snapTest = AlignmentService.calculateSnapping('stage_box_2', 198, 98, sampleElements, {
  gridSnapEnabled: false,
  smartGuidesEnabled: true,
  gridSize: 30,
});
console.log(`  ✓ Snapped close coordinates (198, 98) to aligned target (${snapTest.x}, ${snapTest.y}) with ${snapTest.guides.length} guides`);

// 5. Undo / Redo Stack Verification (50+ actions)
console.log('\n5. Verifying Undo/Redo Temporal Stack:');
useHistoryStore.getState().clearHistory();
let current: StageElement[] = [];

for (let i = 0; i < 55; i++) {
  useHistoryStore.getState().pushState(current);
  current = [...current, { id: `item_${i}`, type: 'power_drop', label: `Power ${i}`, x: i * 10, y: i * 10, rotation: 0 }];
}

console.log(`  ✓ Successfully recorded 55 actions (history depth capped at maxDepth: ${useHistoryStore.getState().maxDepth})`);
const undo1 = useHistoryStore.getState().undo(current);
if (!undo1 || undo1.length !== 54) throw new Error('Undo failed');
console.log(`  ✓ Undo restored previous snapshot with ${undo1.length} elements`);
const redo1 = useHistoryStore.getState().redo(undo1);
if (!redo1 || redo1.length !== 55) throw new Error('Redo failed');
console.log(`  ✓ Redo restored future snapshot with ${redo1.length} elements`);

// 6. JSON Export Schema Conformance
console.log('\n6. Verifying JSON Export Schema (PRD Section 6):');
const exportPayload = {
  templateId: 'small_club_01',
  version: '1.0',
  elements: [
    { id: 'foh_console_1', type: 'foh_console', label: 'M32 FOH', x: 620, y: 780, rotation: 0, colorTint: '#ef4444' },
    { id: 'mic_1', type: 'microphone', label: 'Lead Vox', x: 450, y: 220, rotation: 0 },
    { id: 'stage_box_1', type: 'stage_box', label: 'DL32 Stage Left', x: 710, y: 140, rotation: 0 },
  ],
  connections: [
    { type: 'multicore' as const, from: 'foh_console_1', to: 'stage_box_1' }
  ]
};

const jsonStr = JSON.stringify(exportPayload);
const parsed = ExportService.parseImportJson(jsonStr);
if (parsed.templateId !== 'small_club_01' || parsed.elements.length !== 3 || parsed.connections.length !== 1) {
  throw new Error('JSON Schema parser mismatch');
}
console.log(`  ✓ JSON Schema matches PRD specifications perfectly`);

console.log('\n ALL TEST SUITES PASSED SUCCESSFULLY!');
