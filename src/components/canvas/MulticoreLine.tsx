import React from 'react';
import { Group, Line, Circle, Rect, Text } from 'react-konva';
import { StageElement } from '../../types/stage';

interface MulticoreLineProps {
  fohElement: StageElement;
  stageBoxElement: StageElement;
}

export const MulticoreLine: React.FC<MulticoreLineProps> = ({
  fohElement,
  stageBoxElement,
}) => {
  const x1 = fohElement.x;
  const y1 = fohElement.y;
  const x2 = stageBoxElement.x;
  const y2 = stageBoxElement.y;

  // Middle point for label
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Calculate subtle curved / segmented routing points
  // For stage diagrams, routing via vertical-horizontal or direct high-contrast line with subtle bezier
  const points = [x1, y1, x2, y2];

  return (
    <Group listening={false}>
      {/* Outer Glow */}
      <Line
        points={points}
        stroke="#ec4899" // High-contrast hot pink / magenta
        strokeWidth={7}
        opacity={0.25}
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

      {/* Cable Identifier Tag */}
      <Group x={midX} y={midY}>
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
