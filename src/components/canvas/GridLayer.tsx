import React from 'react';
import { Group, Line } from 'react-konva';

interface GridLayerProps {
  width: number;
  height: number;
  gridSize?: number; // default 30px (0.5m at 60px/meter)
}

export const GridLayer: React.FC<GridLayerProps> = ({
  width,
  height,
  gridSize = 30,
}) => {
  const lines: React.ReactNode[] = [];
  const majorStep = gridSize * 2; // 1 meter

  // Vertical grid lines
  for (let x = 0; x <= width; x += gridSize) {
    const isMajor = x % majorStep === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={isMajor ? '#334155' : '#1e293b'}
        strokeWidth={isMajor ? 1 : 0.5}
        opacity={isMajor ? 0.7 : 0.4}
        dash={isMajor ? undefined : [2, 4]}
      />
    );
  }

  // Horizontal grid lines
  for (let y = 0; y <= height; y += gridSize) {
    const isMajor = y % majorStep === 0;
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={isMajor ? '#334155' : '#1e293b'}
        strokeWidth={isMajor ? 1 : 0.5}
        opacity={isMajor ? 0.7 : 0.4}
        dash={isMajor ? undefined : [2, 4]}
      />
    );
  }

  return <Group listening={false}>{lines}</Group>;
};
