import React from 'react';
import { Rect } from 'react-konva';

interface SelectionMarqueeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

export const SelectionMarquee: React.FC<SelectionMarqueeProps> = ({
  x,
  y,
  width,
  height,
  visible,
}) => {
  if (!visible || (Math.abs(width) < 2 && Math.abs(height) < 2)) {
    return null;
  }

  const normX = width < 0 ? x + width : x;
  const normY = height < 0 ? y + height : y;
  const normW = Math.abs(width);
  const normH = Math.abs(height);

  return (
    <Rect
      x={normX}
      y={normY}
      width={normW}
      height={normH}
      fill="rgba(56, 189, 248, 0.12)"
      stroke="#38bdf8"
      strokeWidth={1}
      dash={[4, 2]}
      cornerRadius={2}
      listening={false}
    />
  );
};
