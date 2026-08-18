import React from 'react';
import { Group, Rect, Line, Text } from 'react-konva';

interface CanvasRulerProps {
  canvasWidth: number;
  canvasHeight: number;
  pixelsPerMeter: number;
  visible: boolean;
}

export const CanvasRuler: React.FC<CanvasRulerProps> = ({
  canvasWidth,
  canvasHeight,
  pixelsPerMeter,
  visible,
}) => {
  if (!visible) return null;

  const RULER_THICKNESS = 22;
  const halfMeter = pixelsPerMeter * 0.5;
  const totalMetersX = Math.ceil(canvasWidth / pixelsPerMeter);
  const totalMetersY = Math.ceil(canvasHeight / pixelsPerMeter);

  return (
    <Group listening={false}>
      {/* Top Ruler Bar Background */}
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={RULER_THICKNESS}
        fill="#0f172a"
        stroke="#334155"
        strokeWidth={1}
      />

      {/* Left Ruler Bar Background */}
      <Rect
        x={0}
        y={0}
        width={RULER_THICKNESS}
        height={canvasHeight}
        fill="#0f172a"
        stroke="#334155"
        strokeWidth={1}
      />

      {/* Top-Left Corner Box with unit tag */}
      <Rect
        x={0}
        y={0}
        width={RULER_THICKNESS}
        height={RULER_THICKNESS}
        fill="#1e293b"
        stroke="#475569"
        strokeWidth={1}
      />
      <Text
        x={3}
        y={6}
        text="m"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fontStyle="bold"
        fill="#38bdf8"
      />

      {/* Top Ruler Metric Ticks */}
      {Array.from({ length: totalMetersX + 1 }).map((_, m) => {
        const xPos = m * pixelsPerMeter;
        if (xPos > canvasWidth) return null;

        return (
          <Group key={`top-m-${m}`} x={xPos}>
            {/* 1.0m Major Mark */}
            <Line
              points={[0, RULER_THICKNESS - 12, 0, RULER_THICKNESS]}
              stroke="#94a3b8"
              strokeWidth={1.5}
            />
            <Text
              x={3}
              y={3}
              text={`${m}m`}
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              fill="#cbd5e1"
            />

            {/* 0.5m Minor Mark */}
            {xPos + halfMeter <= canvasWidth && (
              <Line
                points={[halfMeter, RULER_THICKNESS - 6, halfMeter, RULER_THICKNESS]}
                stroke="#64748b"
                strokeWidth={1}
              />
            )}
          </Group>
        );
      })}

      {/* Left Ruler Metric Ticks */}
      {Array.from({ length: totalMetersY + 1 }).map((_, m) => {
        const yPos = m * pixelsPerMeter;
        if (yPos > canvasHeight) return null;

        return (
          <Group key={`left-m-${m}`} y={yPos}>
            {/* 1.0m Major Mark */}
            <Line
              points={[RULER_THICKNESS - 12, 0, RULER_THICKNESS, 0]}
              stroke="#94a3b8"
              strokeWidth={1.5}
            />
            <Text
              x={2}
              y={2}
              text={`${m}m`}
              fontSize={7.5}
              fontFamily="JetBrains Mono, monospace"
              fill="#cbd5e1"
            />

            {/* 0.5m Minor Mark */}
            {yPos + halfMeter <= canvasHeight && (
              <Line
                points={[RULER_THICKNESS - 6, halfMeter, RULER_THICKNESS, halfMeter]}
                stroke="#64748b"
                strokeWidth={1}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
};
