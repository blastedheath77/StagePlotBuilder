import React from 'react';
import { Group, Rect, Text, Line } from 'react-konva';
import { VenueTemplate } from '../../types/stage';
import { useStageStore } from '../../store/useStageStore';

interface VenueLayerProps {
  template: VenueTemplate;
}

export const VenueLayer: React.FC<VenueLayerProps> = ({ template }) => {
  const theme = useStageStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <Group listening={false}>
      {/* Venue Canvas Outer Boundary */}
      <Rect
        x={0}
        y={0}
        width={template.canvasWidth}
        height={template.canvasHeight}
        fill={isDark ? '#090d16' : '#ffffff'}
        stroke={isDark ? '#1e293b' : '#cbd5e1'}
        strokeWidth={2}
        cornerRadius={8}
      />

      {/* Pre-Configured Zones */}
      {template.zones.map((zone) => {
        const isStage = zone.id === 'stage_zone';
        const isAudience = zone.id === 'audience_zone';

        // Adapt colors for light mode
        let zoneFill = zone.fillColor;
        let zoneStroke = zone.strokeColor;
        let labelColor = zone.labelColor;

        if (!isDark) {
          if (isStage) {
            zoneFill = 'rgba(224, 242, 254, 0.55)'; // Light Sky tint
            zoneStroke = '#0284c7';
            labelColor = '#0369a1';
          } else if (isAudience) {
            zoneFill = 'rgba(241, 245, 249, 0.6)'; // Light Slate floor
            zoneStroke = '#94a3b8';
            labelColor = '#475569';
          } else {
            zoneFill = 'rgba(238, 242, 255, 0.65)'; // Light Indigo FOH
            zoneStroke = '#3b82f6';
            labelColor = '#1d4ed8';
          }
        }

        return (
          <Group key={zone.id}>
            {/* Zone Fill & Border */}
            <Rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={zoneFill}
              stroke={zoneStroke}
              strokeWidth={1.5}
              dash={zone.dashed ? [6, 4] : undefined}
              cornerRadius={4}
            />

            {/* Zone Label Header */}
            <Group x={zone.x + 12} y={zone.y + 10}>
              <Rect
                x={-4}
                y={-3}
                width={zone.name.length * 7 + 16}
                height={18}
                fill={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)'}
                stroke={zoneStroke}
                strokeWidth={1}
                cornerRadius={3}
              />
              <Text
                x={4}
                y={0}
                text={zone.name}
                fontSize={10}
                fontFamily="Inter, sans-serif"
                fontStyle="600"
                fill={labelColor}
                letterSpacing={0.5}
              />
            </Group>
          </Group>
        );
      })}

      {/* Stage Front Lip / Downstage Edge Indicator */}
      {template.zones[0] && (
        <Group>
          <Line
            points={[
              template.zones[0].x,
              template.zones[0].y + template.zones[0].height,
              template.zones[0].x + template.zones[0].width,
              template.zones[0].y + template.zones[0].height,
            ]}
            stroke={isDark ? '#38bdf8' : '#0284c7'}
            strokeWidth={3}
          />
          <Text
            x={template.zones[0].x + template.zones[0].width / 2 - 40}
            y={template.zones[0].y + template.zones[0].height + 6}
            text="▼ DOWNSTAGE / FRONT LIP ▼"
            fontSize={9}
            fontFamily="Inter, sans-serif"
            fontStyle="600"
            fill={isDark ? '#38bdf8' : '#0284c7'}
          />
        </Group>
      )}
    </Group>
  );
};
