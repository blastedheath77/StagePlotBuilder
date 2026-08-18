import { StageElement, AlignmentGuide } from '../types/stage';
import { ASSET_MAP } from '../config/assetCatalog';

export interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

const SNAP_THRESHOLD = 6; // pixels

export class AlignmentService {
  /**
   * Snap position to grid
   */
  static snapToGrid(val: number, gridSize: number): number {
    return Math.round(val / gridSize) * gridSize;
  }

  /**
   * Calculate alignment guides and snap coordinates against other elements
   */
  static calculateSnapping(
    activeId: string,
    proposedX: number,
    proposedY: number,
    elements: StageElement[],
    options: {
      gridSnapEnabled: boolean;
      smartGuidesEnabled: boolean;
      gridSize: number;
    }
  ): SnapResult {
    let finalX = proposedX;
    let finalY = proposedY;
    const guides: AlignmentGuide[] = [];

    // 1. Grid snapping (if enabled)
    if (options.gridSnapEnabled && options.gridSize > 0) {
      finalX = this.snapToGrid(finalX, options.gridSize);
      finalY = this.snapToGrid(finalY, options.gridSize);
    }

    // 2. Smart alignment guides (if enabled)
    if (options.smartGuidesEnabled) {
      const activeEl = elements.find((e) => e.id === activeId);
      if (!activeEl) {
        return { x: finalX, y: finalY, guides };
      }

      const activeDef = ASSET_MAP.get(activeEl.type);
      const activeW = activeEl.width || activeDef?.width || 50;
      const activeH = activeEl.height || activeDef?.height || 50;

      const activeLeft = finalX - activeW / 2;
      const activeRight = finalX + activeW / 2;
      const activeCenterX = finalX;

      const activeTop = finalY - activeH / 2;
      const activeBottom = finalY + activeH / 2;
      const activeCenterY = finalY;

      let closestDiffX = SNAP_THRESHOLD;
      let snapXGuide: AlignmentGuide | null = null;
      let snapTargetX: number | null = null;

      let closestDiffY = SNAP_THRESHOLD;
      let snapYGuide: AlignmentGuide | null = null;
      let snapTargetY: number | null = null;

      for (const el of elements) {
        if (el.id === activeId) continue;
        const def = ASSET_MAP.get(el.type);
        const w = el.width || def?.width || 50;
        const h = el.height || def?.height || 50;

        const otherLeft = el.x - w / 2;
        const otherRight = el.x + w / 2;
        const otherCenterX = el.x;

        const otherTop = el.y - h / 2;
        const otherBottom = el.y + h / 2;
        const otherCenterY = el.y;

        // Vertical alignments (matching X coordinates)
        const xChecks = [
          { activeVal: activeCenterX, otherVal: otherCenterX, adjust: 0 },
          { activeVal: activeLeft, otherVal: otherLeft, adjust: activeW / 2 },
          { activeVal: activeRight, otherVal: otherRight, adjust: -activeW / 2 },
          { activeVal: activeLeft, otherVal: otherRight, adjust: activeW / 2 },
          { activeVal: activeRight, otherVal: otherLeft, adjust: -activeW / 2 },
        ];

        for (const check of xChecks) {
          const diff = Math.abs(check.activeVal - check.otherVal);
          if (diff < closestDiffX) {
            closestDiffX = diff;
            snapTargetX = check.otherVal + check.adjust;
            const minY = Math.min(activeTop, otherTop) - 20;
            const maxY = Math.max(activeBottom, otherBottom) + 20;
            snapXGuide = {
              orientation: 'vertical',
              position: check.otherVal,
              start: minY,
              end: maxY,
            };
          }
        }

        // Horizontal alignments (matching Y coordinates)
        const yChecks = [
          { activeVal: activeCenterY, otherVal: otherCenterY, adjust: 0 },
          { activeVal: activeTop, otherVal: otherTop, adjust: activeH / 2 },
          { activeVal: activeBottom, otherVal: otherBottom, adjust: -activeH / 2 },
          { activeVal: activeTop, otherVal: otherBottom, adjust: activeH / 2 },
          { activeVal: activeBottom, otherVal: otherTop, adjust: -activeH / 2 },
        ];

        for (const check of yChecks) {
          const diff = Math.abs(check.activeVal - check.otherVal);
          if (diff < closestDiffY) {
            closestDiffY = diff;
            snapTargetY = check.otherVal + check.adjust;
            const minX = Math.min(activeLeft, otherLeft) - 20;
            const maxX = Math.max(activeRight, otherRight) + 20;
            snapYGuide = {
              orientation: 'horizontal',
              position: check.otherVal,
              start: minX,
              end: maxX,
            };
          }
        }
      }

      if (snapTargetX !== null && snapXGuide) {
        finalX = snapTargetX;
        guides.push(snapXGuide);
      }

      if (snapTargetY !== null && snapYGuide) {
        finalY = snapTargetY;
        guides.push(snapYGuide);
      }
    }

    return { x: finalX, y: finalY, guides };
  }
}
