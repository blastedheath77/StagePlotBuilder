import React from 'react';
import { Group, Rect, Text, Line } from 'react-konva';
import { VenueTemplate } from '../../types/stage';

interface VenueLayerProps {
  template: VenueTemplate;
}

export const VenueLayer: React.FC<VenueLayerProps> = ({ template }) => {
  return (
    <Group listening={false}>
      {/* Venue Canvas Outer Boundary */}
      <Rect
        x={0}
        y={0}
        width={template.canvasWidth}
        height={template.canvasHeight}
        fill="#090d16"
        stroke="#1e293b"
        strokeWidth={2}
        cornerRadius={8}
      />

      {/* Pre-Configured Zones */}
      {template.zones.map((zone) => {
        return (
          <Group key={zone.id}>
            {/* Zone Fill & Border */}
            <Rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={zone.fillColor}
              stroke={zone.strokeColor}
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
                fill="rgba(15, 23, 42, 0.85)"
                stroke={zone.strokeColor}
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
                fill={zone.labelColor}
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
            stroke="#38bdf8"
            strokeWidth={3}
          />
          <Text
            x={template.zones[0].x + template.zones[0].width / 2 - 40}
            y={template.zones[0].y + template.zones[0].height + 6}
            text="▼ DOWNSTAGE / FRONT LIP ▼"
            fontSize={9}
            fontFamily="Inter, sans-serif"
            fontStyle="600"
            fill="#38bdf8"
          />
        </Group>
      )}
    </Group>
  );
};
