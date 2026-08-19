import React, { useRef } from 'react';
import { Group, Text, Rect } from 'react-konva';
import Konva from 'konva';
import { StageElement } from '../../types/stage';
import { ASSET_MAP } from '../../config/assetCatalog';
import { AssetShape } from './AssetShape';
import { AlignmentService } from '../../services/alignmentService';
import { useStageStore } from '../../store/useStageStore';

interface AssetNodeProps {
  element: StageElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onLiveDrag?: (id: string, x: number, y: number) => void;
}

export const AssetNode: React.FC<AssetNodeProps> = ({
  element,
  isSelected,
  onSelect,
  onDblClick,
  onLiveDrag,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const def = ASSET_MAP.get(element.type);

  const width = element.width || def?.width || 50;
  const height = element.height || def?.height || 50;

  const theme = useStageStore((s) => s.theme);
  const isDark = theme === 'dark';

  const elements = useStageStore((s) => s.elements);
  const gridSnap = useStageStore((s) => s.gridSnap);
  const smartGuides = useStageStore((s) => s.smartGuides);
  const updateElement = useStageStore((s) => s.updateElement);
  const setActiveGuides = useStageStore((s) => s.setActiveGuides);

  const handleDragStart = () => {};

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const rawX = node.x();
    const rawY = node.y();

    const snapResult = AlignmentService.calculateSnapping(
      element.id,
      rawX,
      rawY,
      elements,
      {
        gridSnapEnabled: gridSnap,
        smartGuidesEnabled: smartGuides,
        gridSize: 30,
      }
    );

    node.x(snapResult.x);
    node.y(snapResult.y);
    setActiveGuides(snapResult.guides);

    if (onLiveDrag) {
      onLiveDrag(element.id, snapResult.x, snapResult.y);
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setActiveGuides([]);
    const finalX = Math.round(node.x());
    const finalY = Math.round(node.y());

    if (onLiveDrag) {
      onLiveDrag(element.id, finalX, finalY);
    }

    updateElement(
      element.id,
      {
        x: finalX,
        y: finalY,
      },
      true
    );
  };

  // Power drops do not show labels by default for a clean, compact footprint
  const isPowerDrop = element.type === 'power_drop';
  const showLabel = !isPowerDrop && Boolean(element.label || def?.name);

  const labelText = element.label || def?.name || element.type;
  const estimatedCharWidth = 6.4;
  const textWidth = Math.max(labelText.length * estimatedCharWidth + 14, 38);
  const textHeight = 18;
  const labelOffsetY = height / 2 + 12;

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <AssetShape
        type={element.type}
        width={width}
        height={height}
        isSelected={isSelected}
        colorTint={element.colorTint}
      />

      {/* Label Pill without borders */}
      {showLabel && (
        <Group y={labelOffsetY} listening={false}>
          <Rect
            x={-textWidth / 2}
            y={-textHeight / 2}
            width={textWidth}
            height={textHeight}
            fill={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)'}
            cornerRadius={4}
            shadowColor="#000"
            shadowBlur={isDark ? 3 : 1}
            shadowOpacity={isDark ? 0.4 : 0.1}
          />
          <Text
            x={-textWidth / 2}
            y={-textHeight / 2}
            width={textWidth}
            height={textHeight}
            text={labelText}
            fontSize={9.5}
            fontFamily="Inter, sans-serif"
            fontStyle="600"
            fill={isDark ? '#f8fafc' : '#0f172a'}
            align="center"
            verticalAlign="middle"
            padding={0}
            lineHeight={1}
            ellipsis={true}
          />
        </Group>
      )}
    </Group>
  );
};
