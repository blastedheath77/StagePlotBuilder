import React from 'react';
import { Group, Line } from 'react-konva';
import { AlignmentGuide } from '../../types/stage';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ guides }) => {
  if (!guides || guides.length === 0) return null;

  return (
    <Group listening={false}>
      {guides.map((guide, idx) => {
        const isVert = guide.orientation === 'vertical';
        const points = isVert
          ? [guide.position, guide.start, guide.position, guide.end]
          : [guide.start, guide.position, guide.end, guide.position];

        return (
          <Line
            key={idx}
            points={points}
            stroke="#f43f5e" // Rose/Magenta smart guide line
            strokeWidth={1}
            dash={[4, 2]}
            opacity={0.9}
          />
        );
      })}
    </Group>
  );
};
