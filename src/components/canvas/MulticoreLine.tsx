import React from 'react';
import { Group, Line, Circle, Rect, Text } from 'react-konva';

interface MulticoreLineProps {
  fohPos: { x: number; y: number };
  stageBoxPos: { x: number; y: number };
  canvasWidth: number;
  index?: number;
  total?: number;
  label?: string;
  colorTint?: string;
}

export const MulticoreLine: React.FC<MulticoreLineProps> = ({
  fohPos,
  stageBoxPos,
  canvasWidth,
  index = 0,
  total = 1,
  label = 'MULTICORE',
  colorTint,
}) => {
  const x1 = fohPos.x;
  const y1 = fohPos.y;
  const x2 = stageBoxPos.x;
  const y2 = stageBoxPos.y;

  // Decide perimeter side based on Stage Box position
  const isRightSide = x2 >= canvasWidth / 2 || x2 >= x1;
  const baseMargin = 45;
  const laneOffset = index * 14;

  const wallX = isRightSide
    ? Math.min(Math.max(x2 + 35, canvasWidth - baseMargin - laneOffset), canvasWidth - 18)
    : Math.max(Math.min(x2 - 35, baseMargin + laneOffset), 18);

  // Generate 4-point perimeter route: Stage Box -> Perimeter Wall -> Down past Audience -> FOH Desk
  const points = [
    x2, y2,           // Stage Box anchor
    wallX, y2,        // Horizontal out to side wall
    wallX, y1,        // Vertical run down along wall
    x1, y1,           // Horizontal run into FOH Desk
  ];

  // Stagger label position if multiple lines share the wall
  const staggerY = total > 1 ? (index - (total - 1) / 2) * 36 : 0;
  const labelX = wallX + (isRightSide ? -52 : 52);
  const labelY = (y2 + y1) / 2 + staggerY;

  const strokeColor = colorTint || '#db2777';
  const glowColor = colorTint || '#ec4899';

  return (
    <Group listening={false}>
      {/* Outer Glow */}
      <Line
        points={points}
        stroke={glowColor}
        strokeWidth={7}
        opacity={0.25}
        lineCap="round"
        lineJoin="round"
      />

      {/* Main Solid Multicore Cable */}
      <Line
        points={points}
        stroke={strokeColor}
        strokeWidth={3.5}
        lineCap="round"
        lineJoin="round"
      />

      {/* Inner Hi-Viz Core Dashed Line */}
      <Line
        points={points}
        stroke="#ffffff"
        strokeWidth={1.5}
        dash={[8, 6]}
        lineCap="round"
        lineJoin="round"
        opacity={0.9}
      />

      {/* Corner Cable Turn Nodes */}
      <Circle
        x={wallX}
        y={y2}
        radius={3}
        fill={glowColor}
        opacity={0.8}
      />
      <Circle
        x={wallX}
        y={y1}
        radius={3}
        fill={glowColor}
        opacity={0.8}
      />

      {/* FOH Anchor Terminal Node */}
      <Circle
        x={x1}
        y={y1}
        radius={5.5}
        fill={strokeColor}
        stroke="#ffffff"
        strokeWidth={1.5}
      />

      {/* Stage Box Anchor Terminal Node */}
      <Circle
        x={x2}
        y={y2}
        radius={5.5}
        fill={strokeColor}
        stroke="#ffffff"
        strokeWidth={1.5}
      />

      {/* Cable Identifier Tag on Wall Run */}
      <Group x={labelX} y={labelY}>
        <Rect
          x={-48}
          y={-10}
          width={96}
          height={20}
          fill="rgba(15, 23, 42, 0.95)"
          stroke={glowColor}
          strokeWidth={1.5}
          cornerRadius={4}
          shadowColor="#000"
          shadowBlur={4}
        />
        <Text
          x={-48}
          y={-5}
          width={96}
          height={20}
          text={label}
          fontSize={8}
          fontFamily="Inter, monospace"
          fontStyle="bold"
          fill={colorTint || '#f472b6'}
          align="center"
          verticalAlign="middle"
        />
      </Group>
    </Group>
  );
};
