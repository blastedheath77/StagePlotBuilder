import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Transformer } from 'react-konva';
import Konva from 'konva';
import { useStageStore } from '../../store/useStageStore';
import { TEMPLATE_MAP, VENUE_TEMPLATES } from '../../assets/templates';
import { VenueLayer } from './VenueLayer';
import { GridLayer } from './GridLayer';
import { AssetNode } from './AssetNode';
import { MulticoreLine } from './MulticoreLine';
import { AlignmentGuides } from './AlignmentGuides';
import { SelectionMarquee } from './SelectionMarquee';
import { CanvasRuler } from './CanvasRuler';
import { InlineLabelEditor } from './InlineLabelEditor';
import { ASSET_MAP } from '../../config/assetCatalog';
import { AssetTypeId } from '../../types/assets';

interface CanvasStageProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({ stageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Store state
  const templateId = useStageStore((s) => s.templateId);
  const elements = useStageStore((s) => s.elements);
  const selectedIds = useStageStore((s) => s.selectedIds);
  const activeGuides = useStageStore((s) => s.activeGuides);
  const stageScale = useStageStore((s) => s.stageScale);
  const stagePos = useStageStore((s) => s.stagePos);
  const gridVisible = useStageStore((s) => s.gridVisible);
  const rulerVisible = useStageStore((s) => s.rulerVisible);

  // Actions
  const setStageScale = useStageStore((s) => s.setStageScale);
  const setStagePos = useStageStore((s) => s.setStagePos);
  const setSelectedIds = useStageStore((s) => s.setSelectedIds);
  const toggleSelectId = useStageStore((s) => s.toggleSelectId);
  const clearSelection = useStageStore((s) => s.clearSelection);
  const addElement = useStageStore((s) => s.addElement);
  const setEditingLabelId = useStageStore((s) => s.setEditingLabelId);
  const setElementRotation = useStageStore((s) => s.setElementRotation);
  const recordHistorySnapshot = useStageStore((s) => s.recordHistorySnapshot);

  const template = TEMPLATE_MAP.get(templateId) || VENUE_TEMPLATES[0];

  // Marquee selection state
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeRect, setMarqueeRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Panning navigation state (Right-click drag, Middle-click drag, or Space + Left-drag)
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panStartStagePos, setPanStartStagePos] = useState({ x: 0, y: 0 });

  // Live element positions for real-time multicore cable drag tracking
  const [livePositions, setLivePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Stage container dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Space key handler for Pan navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update Transformer nodes on selection change
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const selectedNodes: Konva.Node[] = [];

    selectedIds.forEach((id) => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        selectedNodes.push(node);
      }
    });

    transformerRef.current.nodes(selectedNodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, elements, stageRef]);

  // Multicore connection nodes
  const fohDesk = elements.find((e) => e.type === 'foh_console');
  const stageBox = elements.find((e) => e.type === 'stage_box');

  const fohPos = fohDesk
    ? livePositions[fohDesk.id] || { x: fohDesk.x, y: fohDesk.y }
    : null;

  const stageBoxPos = stageBox
    ? livePositions[stageBox.id] || { x: stageBox.x, y: stageBox.y }
    : null;

  const handleLiveDrag = useCallback((id: string, x: number, y: number) => {
    setLivePositions((prev) => ({
      ...prev,
      [id]: { x, y },
    }));
  }, []);

  // Wheel zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.08;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.min(Math.max(newScale, 0.3), 3.0);

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setStageScale(clampedScale);
    setStagePos(newPos);
  };

  // Pointer Down: Right-click / Middle-click / Space-drag starts Pan, Left-click starts Marquee on empty area
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isRightClick = e.evt.button === 2;
    const isMiddleClick = e.evt.button === 1;
    const isSpacePan = isSpacePressed && e.evt.button === 0;

    if (isRightClick || isMiddleClick || isSpacePan) {
      e.evt.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.evt.clientX, y: e.evt.clientY });
      setPanStartStagePos({ x: stagePos.x, y: stagePos.y });
      return;
    }

    if (e.evt.button === 0 && (e.target === e.target.getStage() || e.target.name() === 'venue-bg')) {
      if (!e.evt.shiftKey) {
        clearSelection();
      }

      const stage = stageRef.current;
      if (stage) {
        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = stage.getPointerPosition();
        if (pos) {
          const stageCoords = transform.point(pos);
          setIsMarqueeSelecting(true);
          setMarqueeStart(stageCoords);
          setMarqueeRect({ x: stageCoords.x, y: stageCoords.y, width: 0, height: 0 });
        }
      }
    }
  };

  // Pointer Move
  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      const dx = e.evt.clientX - panStart.x;
      const dy = e.evt.clientY - panStart.y;
      setStagePos({
        x: Math.round(panStartStagePos.x + dx),
        y: Math.round(panStartStagePos.y + dy),
      });
      return;
    }

    if (isMarqueeSelecting && stageRef.current) {
      const stage = stageRef.current;
      const transform = stage.getAbsoluteTransform().copy().invert();
      const pos = stage.getPointerPosition();
      if (pos) {
        const stageCoords = transform.point(pos);
        const width = stageCoords.x - marqueeStart.x;
        const height = stageCoords.y - marqueeStart.y;
        setMarqueeRect({
          x: marqueeStart.x,
          y: marqueeStart.y,
          width,
          height,
        });
      }
    }
  };

  // Pointer Up
  const handleStageMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isMarqueeSelecting) {
      setIsMarqueeSelecting(false);
      const minX = Math.min(marqueeRect.x, marqueeRect.x + marqueeRect.width);
      const maxX = Math.max(marqueeRect.x, marqueeRect.x + marqueeRect.width);
      const minY = Math.min(marqueeRect.y, marqueeRect.y + marqueeRect.height);
      const maxY = Math.max(marqueeRect.y, marqueeRect.y + marqueeRect.height);

      if (Math.abs(marqueeRect.width) > 5 || Math.abs(marqueeRect.height) > 5) {
        const selected = elements
          .filter((el) => {
            const def = ASSET_MAP.get(el.type);
            const w = el.width || def?.width || 50;
            const h = el.height || def?.height || 50;
            const elMinX = el.x - w / 2;
            const elMaxX = el.x + w / 2;
            const elMinY = el.y - h / 2;
            const elMaxY = el.y + h / 2;
            return !(elMaxX < minX || elMinX > maxX || elMaxY < minY || elMinY > maxY);
          })
          .map((el) => el.id);

        setSelectedIds(selected);
      }
      setMarqueeRect({ x: 0, y: 0, width: 0, height: 0 });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage || !containerRef.current) return;

    const assetType = e.dataTransfer.getData('application/stageplot-asset') as AssetTypeId;
    if (!assetType) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const canvasX = (clientX - stagePos.x) / stageScale;
    const canvasY = (clientY - stagePos.y) / stageScale;

    const snappedX = Math.round(canvasX / 15) * 15;
    const snappedY = Math.round(canvasY / 15) * 15;

    addElement(assetType, snappedX, snappedY);
  };

  const handleTransformEnd = () => {
    if (!transformerRef.current) return;
    const nodes = transformerRef.current.nodes();
    if (nodes.length === 0) return;

    recordHistorySnapshot();

    nodes.forEach((node) => {
      const id = node.id();
      let rot = Math.round(node.rotation() % 360);
      if (rot < 0) rot += 360;

      node.scaleX(1);
      node.scaleY(1);

      setElementRotation(id, rot);
    });
  };

  const cursorClass = isPanning
    ? 'cursor-grabbing'
    : isSpacePressed
    ? 'cursor-grab'
    : 'cursor-crosshair';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-studio-950 overflow-hidden select-none ${cursorClass}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer>
          <VenueLayer template={template} />
          {gridVisible && (
            <GridLayer
              width={template.canvasWidth}
              height={template.canvasHeight}
              gridSize={30}
            />
          )}
        </Layer>

        <Layer>
          {fohPos && stageBoxPos && (
            <MulticoreLine
              fohPos={fohPos}
              stageBoxPos={stageBoxPos}
              canvasWidth={template.canvasWidth}
            />
          )}
        </Layer>

        <Layer>
          {elements.map((el) => {
            const isSelected = selectedIds.includes(el.id);
            return (
              <AssetNode
                key={el.id}
                element={el}
                isSelected={isSelected}
                onSelect={(e) => {
                  if (e.evt.button === 2 || e.evt.button === 1 || isSpacePressed) {
                    return;
                  }
                  e.cancelBubble = true;
                  toggleSelectId(el.id, e.evt.shiftKey);
                }}
                onDblClick={(e) => {
                  e.cancelBubble = true;
                  setEditingLabelId(el.id);
                }}
                onLiveDrag={handleLiveDrag}
              />
            );
          })}

          {/* Konva Transformer with Corner Rotation Handles (No extended stick line) */}
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            rotateAnchorOffset={0}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={10}
            borderStroke="#38bdf8"
            borderStrokeWidth={1.5}
            borderDash={[4, 3]}
            anchorStroke="#38bdf8"
            anchorFill="#0f172a"
            anchorSize={8}
            anchorCornerRadius={4}
            onTransformEnd={handleTransformEnd}
          />

          <AlignmentGuides guides={activeGuides} />

          <SelectionMarquee
            x={marqueeRect.x}
            y={marqueeRect.y}
            width={marqueeRect.width}
            height={marqueeRect.height}
            visible={isMarqueeSelecting}
          />

          <CanvasRuler
            canvasWidth={template.canvasWidth}
            canvasHeight={template.canvasHeight}
            pixelsPerMeter={template.pixelsPerMeter}
            visible={rulerVisible}
          />
        </Layer>
      </Stage>

      <InlineLabelEditor stageContainerRef={containerRef} />
    </div>
  );
};
