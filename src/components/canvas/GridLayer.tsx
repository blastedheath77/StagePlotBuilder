import React from 'react';
import { Group, Line } from 'react-konva';
import { useStageStore } from '../../store/useStageStore';

interface GridLayerProps {
  width: number;
  height: number;
  gridSize?: number;
}

export const GridLayer: React.FC<GridLayerProps> = ({
  width,
  height,
  gridSize = 30,
}) => {
  const theme = useStageStore((s) => s.theme);
  const isDark = theme === 'dark';

  const majorColor = isDark ? '#334155' : '#cbd5e1';
  const minorColor = isDark ? '#1e293b' : '#e2e8f0';

  const lines: React.ReactNode[] = [];
  const majorStep = gridSize * 2; // 1 meter

  // Vertical grid lines
  for (let x = 0; x <= width; x += gridSize) {
    const isMajor = x % majorStep === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={isMajor ? majorColor : minorColor}
        strokeWidth={isMajor ? 1 : 0.5}
        opacity={isMajor ? (isDark ? 0.7 : 0.8) : (isDark ? 0.4 : 0.5)}
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
        stroke={isMajor ? majorColor : minorColor}
        strokeWidth={isMajor ? 1 : 0.5}
        opacity={isMajor ? (isDark ? 0.7 : 0.8) : (isDark ? 0.4 : 0.5)}
        dash={isMajor ? undefined : [2, 4]}
      />
    );
  }

  return <Group listening={false}>{lines}</Group>;
};
