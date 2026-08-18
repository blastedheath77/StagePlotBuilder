import React from 'react';
import { Group, Line, Circle, Rect, Text } from 'react-konva';

interface MulticoreLineProps {
  fohPos: { x: number; y: number };
  stageBoxPos: { x: number; y: number };
  canvasWidth: number;
}

export const MulticoreLine: React.FC<MulticoreLineProps> = ({
  fohPos,
  stageBoxPos,
  canvasWidth,
}) => {
  const x1 = fohPos.x;
  const y1 = fohPos.y;
  const x2 = stageBoxPos.x;
  const y2 = stageBoxPos.y;

  // Decide perimeter side based on Stage Box position
  const isRightSide = x2 >= canvasWidth / 2 || x2 >= x1;
  const wallMargin = 55;
  const wallX = isRightSide
    ? Math.min(Math.max(x2 + 35, canvasWidth - wallMargin), canvasWidth - 25)
    : Math.max(Math.min(x2 - 35, wallMargin), 25);

  // Generate 4-point perimeter route: Stage Box -> Perimeter Wall -> Down past Audience -> FOH Desk
  const points = [
    x2, y2,           // Stage Box anchor
    wallX, y2,        // Horizontal out to side wall
    wallX, y1,        // Vertical run down along wall
    x1, y1,           // Horizontal run into FOH Desk
  ];

  // Middle of the vertical wall run for the MULTICORE label
  const labelX = wallX + (isRightSide ? -48 : 48);
  const labelY = (y2 + y1) / 2;

  return (
    <Group listening={false}>
      {/* Outer Glow */}
      <Line
        points={points}
        stroke="#ec4899"
        strokeWidth={7}
        opacity={0.2}
        lineCap="round"
        lineJoin="round"
      />

      {/* Main Solid Multicore Cable */}
      <Line
        points={points}
        stroke="#db2777"
        strokeWidth={3.5}
        lineCap="round"
        lineJoin="round"
      />

      {/* Inner Hi-Viz Core Dashed Line */}
      <Line
        points={points}
        stroke="#fdf2f8"
        strokeWidth={1.5}
        dash={[8, 6]}
        lineCap="round"
        lineJoin="round"
      />

      {/* Corner Cable Turn Nodes */}
      <Circle
        x={wallX}
        y={y2}
        radius={3}
        fill="#ec4899"
        opacity={0.8}
      />
      <Circle
        x={wallX}
        y={y1}
        radius={3}
        fill="#ec4899"
        opacity={0.8}
      />

      {/* FOH Anchor Terminal Node */}
      <Circle
        x={x1}
        y={y1}
        radius={6}
        fill="#db2777"
        stroke="#ffffff"
        strokeWidth={2}
      />

      {/* Stage Box Anchor Terminal Node */}
      <Circle
        x={x2}
        y={y2}
        radius={6}
        fill="#db2777"
        stroke="#ffffff"
        strokeWidth={2}
      />

      {/* Cable Identifier Tag on Wall Run */}
      <Group x={labelX} y={labelY}>
        <Rect
          x={-44}
          y={-10}
          width={88}
          height={20}
          fill="rgba(15, 23, 42, 0.95)"
          stroke="#ec4899"
          strokeWidth={1.5}
          cornerRadius={4}
          shadowColor="#000"
          shadowBlur={4}
        />
        <Text
          x={-44}
          y={-5}
          width={88}
          height={20}
          text="MULTICORE"
          fontSize={8.5}
          fontFamily="Inter, monospace"
          fontStyle="bold"
          fill="#f472b6"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    </Group>
  );
};
