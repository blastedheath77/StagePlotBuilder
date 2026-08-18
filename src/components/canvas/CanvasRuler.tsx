import React from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import { useStageStore } from '../../store/useStageStore';

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
  const theme = useStageStore((s) => s.theme);
  const isDark = theme === 'dark';

  if (!visible) return null;

  const RULER_THICKNESS = 22;
  const halfMeter = pixelsPerMeter * 0.5;
  const totalMetersX = Math.ceil(canvasWidth / pixelsPerMeter);
  const totalMetersY = Math.ceil(canvasHeight / pixelsPerMeter);

  const rulerBg = isDark ? '#0f172a' : '#f8fafc';
  const rulerStroke = isDark ? '#334155' : '#cbd5e1';
  const cornerBg = isDark ? '#1e293b' : '#e2e8f0';
  const tickMajor = isDark ? '#94a3b8' : '#64748b';
  const tickMinor = isDark ? '#64748b' : '#94a3b8';
  const textFill = isDark ? '#cbd5e1' : '#334155';

  return (
    <Group listening={false}>
      {/* Top Ruler Bar Background */}
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={RULER_THICKNESS}
        fill={rulerBg}
        stroke={rulerStroke}
        strokeWidth={1}
      />

      {/* Left Ruler Bar Background */}
      <Rect
        x={0}
        y={0}
        width={RULER_THICKNESS}
        height={canvasHeight}
        fill={rulerBg}
        stroke={rulerStroke}
        strokeWidth={1}
      />

      {/* Top-Left Corner Box */}
      <Rect
        x={0}
        y={0}
        width={RULER_THICKNESS}
        height={RULER_THICKNESS}
        fill={cornerBg}
        stroke={rulerStroke}
        strokeWidth={1}
      />
      <Text
        x={3}
        y={6}
        text="m"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fontStyle="bold"
        fill={isDark ? '#38bdf8' : '#0284c7'}
      />

      {/* Top Ruler Metric Ticks */}
      {Array.from({ length: totalMetersX + 1 }).map((_, m) => {
        const xPos = m * pixelsPerMeter;
        if (xPos > canvasWidth) return null;

        return (
          <Group key={`top-m-${m}`} x={xPos}>
            <Line
              points={[0, RULER_THICKNESS - 12, 0, RULER_THICKNESS]}
              stroke={tickMajor}
              strokeWidth={1.5}
            />
            <Text
              x={3}
              y={3}
              text={`${m}m`}
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              fill={textFill}
            />

            {xPos + halfMeter <= canvasWidth && (
              <Line
                points={[halfMeter, RULER_THICKNESS - 6, halfMeter, RULER_THICKNESS]}
                stroke={tickMinor}
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
            <Line
              points={[RULER_THICKNESS - 12, 0, RULER_THICKNESS, 0]}
              stroke={tickMajor}
              strokeWidth={1.5}
            />
            <Text
              x={2}
              y={2}
              text={`${m}m`}
              fontSize={7.5}
              fontFamily="JetBrains Mono, monospace"
              fill={textFill}
            />

            {yPos + halfMeter <= canvasHeight && (
              <Line
                points={[RULER_THICKNESS - 6, halfMeter, RULER_THICKNESS, halfMeter]}
                stroke={tickMinor}
                strokeWidth={1}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
};
