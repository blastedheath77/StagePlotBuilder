import React from 'react';
import { Group, Rect, Circle, Line, Path } from 'react-konva';
import { AssetTypeId } from '../../types/assets';

interface AssetShapeProps {
  type: AssetTypeId;
  width: number;
  height: number;
  isSelected?: boolean;
  colorTint?: string;
}

export const AssetShape: React.FC<AssetShapeProps> = ({
  type,
  width,
  height,
  colorTint,
}) => {
  const halfW = width / 2;
  const halfH = height / 2;

  // Primary accent fallback colors
  const fohColor = colorTint || '#3b82f6';
  const monColor = colorTint || '#f97316';
  const backlineColor = colorTint || '#10b981';
  const infraColor = colorTint || '#f59e0b';

  const renderTintOverlay = (isCircle = false) => {
    if (!colorTint) return null;
    if (isCircle) {
      return (
        <Circle
          radius={width / 2}
          fill={colorTint}
          opacity={0.16}
          listening={false}
        />
      );
    }
    return (
      <Rect
        x={-halfW}
        y={-halfH}
        width={width}
        height={height}
        fill={colorTint}
        opacity={0.16}
        cornerRadius={4}
        listening={false}
      />
    );
  };

  switch (type) {
    case 'microphone':
      return (
        <Group>
          {/* Circular Microphone Base */}
          <Circle
            x={0}
            y={0}
            radius={width / 2 - 2}
            fill="#1e293b"
            stroke={backlineColor}
            strokeWidth={2}
            shadowColor="#000"
            shadowBlur={4}
            shadowOpacity={0.4}
          />
          {/* Inner Base Concentric Ring */}
          <Circle
            x={0}
            y={0}
            radius={width * 0.26}
            fill="#0f172a"
            stroke={backlineColor}
            strokeWidth={1}
          />
          {/* Center Stand Post / Joint */}
          <Circle
            x={0}
            y={0}
            radius={3.5}
            fill={backlineColor}
          />
          {/* Boom Arm pointing up */}
          <Line
            points={[0, 0, 0, -width * 0.38]}
            stroke={backlineColor}
            strokeWidth={2.5}
            lineCap="round"
          />
          {/* Microphone Capsule Head */}
          <Circle
            x={0}
            y={-width * 0.38}
            radius={4.5}
            fill="#f8fafc"
            stroke={backlineColor}
            strokeWidth={1.5}
          />
          {/* Directional Sound Wave Indicator Arc */}
          <Path
            data={`M -6 ${-width * 0.44} A 7 7 0 0 1 6 ${-width * 0.44}`}
            stroke={backlineColor}
            strokeWidth={1.2}
            opacity={0.85}
          />
          {renderTintOverlay(true)}
        </Group>
      );

    case 'main_pa_speaker':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#1e293b"
              stroke={fohColor}
              strokeWidth={2}
              cornerRadius={4}
              shadowColor="#000"
              shadowBlur={4}
              shadowOpacity={0.4}
            />
            <Path
              data={`M 8 8 L ${width - 8} 8 L ${width / 2 + 6} ${height / 2 - 2} L ${width / 2 - 6} ${height / 2 - 2} Z`}
              fill={fohColor}
              opacity={0.35}
              stroke={fohColor}
              strokeWidth={1}
            />
            <Circle
              x={width / 2}
              y={height * 0.72}
              radius={width * 0.22}
              fill="#0f172a"
              stroke={fohColor}
              strokeWidth={1.5}
            />
            <Circle
              x={width / 2}
              y={height * 0.72}
              radius={width * 0.08}
              fill={fohColor}
            />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'subwoofer':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#0f172a"
              stroke={fohColor}
              strokeWidth={2.5}
              cornerRadius={3}
              shadowColor="#000"
              shadowBlur={5}
              shadowOpacity={0.5}
            />
            <Circle
              x={width / 2}
              y={height / 2}
              radius={Math.min(width, height) * 0.38}
              fill="#1e293b"
              stroke={fohColor}
              strokeWidth={2}
            />
            <Circle
              x={width / 2}
              y={height / 2}
              radius={Math.min(width, height) * 0.16}
              fill={fohColor}
            />
            <Circle x={8} y={8} radius={3.5} fill={fohColor} opacity={0.6} />
            <Circle x={width - 8} y={8} radius={3.5} fill={fohColor} opacity={0.6} />
            <Circle x={8} y={height - 8} radius={3.5} fill={fohColor} opacity={0.6} />
            <Circle x={width - 8} y={height - 8} radius={3.5} fill={fohColor} opacity={0.6} />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'foh_console':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#0f172a"
              stroke={fohColor}
              strokeWidth={2}
              cornerRadius={4}
              shadowColor="#000"
              shadowBlur={6}
              shadowOpacity={0.6}
            />
            <Rect
              x={4}
              y={4}
              width={width - 8}
              height={height * 0.32}
              fill="#1e293b"
              stroke="#334155"
              strokeWidth={1}
              cornerRadius={2}
            />
            <Rect
              x={width * 0.35}
              y={6}
              width={width * 0.3}
              height={height * 0.24}
              fill={fohColor}
              opacity={0.8}
              cornerRadius={2}
            />
            {Array.from({ length: 6 }).map((_, i) => {
              const faderX = 8 + i * ((width - 16) / 5);
              return (
                <Group key={i}>
                  <Line
                    points={[faderX, height * 0.44, faderX, height - 8]}
                    stroke="#475569"
                    strokeWidth={2}
                  />
                  <Rect
                    x={faderX - 3}
                    y={height * 0.62 + (i % 2 === 0 ? -4 : 4)}
                    width={6}
                    height={5}
                    fill={fohColor}
                    cornerRadius={1}
                  />
                </Group>
              );
            })}
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'foldback_wedge':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Path
              data={`M 6 0 L ${width - 6} 0 L ${width} ${height} L 0 ${height} Z`}
              fill="#1e293b"
              stroke={monColor}
              strokeWidth={2}
              shadowColor="#000"
              shadowBlur={4}
            />
            <Path
              data={`M 10 4 L ${width - 10} 4 L ${width - 4} ${height - 4} L 4 ${height - 4} Z`}
              fill="#0f172a"
              stroke={monColor}
              strokeWidth={1}
            />
            <Path
              data={`M ${width / 2} 8 L ${width / 2 - 8} 20 L ${width / 2 + 8} 20 Z`}
              fill={monColor}
              opacity={0.85}
            />
            <Circle
              x={width / 2}
              y={height * 0.7}
              radius={width * 0.18}
              fill={monColor}
              opacity={0.4}
            />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'side_fill':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#1e293b"
              stroke={monColor}
              strokeWidth={2}
              cornerRadius={3}
            />
            <Rect
              x={6}
              y={6}
              width={width - 12}
              height={height * 0.35}
              fill="#0f172a"
              stroke={monColor}
              strokeWidth={1}
              cornerRadius={2}
            />
            <Circle
              x={width / 2}
              y={height * 0.68}
              radius={width * 0.28}
              fill="#0f172a"
              stroke={monColor}
              strokeWidth={1.5}
            />
            <Circle
              x={width / 2}
              y={height * 0.68}
              radius={width * 0.1}
              fill={monColor}
            />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'drum_kit':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="rgba(16, 185, 129, 0.08)"
              stroke={backlineColor}
              strokeWidth={1}
              cornerRadius={6}
            />
            <Rect
              x={width * 0.32}
              y={height * 0.08}
              width={width * 0.36}
              height={height * 0.42}
              fill="#064e3b"
              stroke={backlineColor}
              strokeWidth={2}
              cornerRadius={4}
            />
            <Circle
              x={width * 0.25}
              y={height * 0.62}
              radius={width * 0.16}
              fill="#1e293b"
              stroke={backlineColor}
              strokeWidth={1.5}
            />
            <Circle
              x={width * 0.12}
              y={height * 0.45}
              radius={width * 0.11}
              fill="#fbbf24"
              opacity={0.7}
              stroke="#d97706"
              strokeWidth={1.5}
            />
            <Circle
              x={width * 0.34}
              y={height * 0.35}
              radius={width * 0.12}
              fill="#0f172a"
              stroke={backlineColor}
              strokeWidth={1.5}
            />
            <Circle
              x={width * 0.66}
              y={height * 0.35}
              radius={width * 0.12}
              fill="#0f172a"
              stroke={backlineColor}
              strokeWidth={1.5}
            />
            <Circle
              x={width * 0.74}
              y={height * 0.64}
              radius={width * 0.18}
              fill="#1e293b"
              stroke={backlineColor}
              strokeWidth={1.5}
            />
            <Circle
              x={width * 0.82}
              y={height * 0.25}
              radius={width * 0.14}
              fill="#fbbf24"
              opacity={0.7}
              stroke="#d97706"
              strokeWidth={1.5}
            />
            <Circle
              x={width * 0.5}
              y={height * 0.78}
              radius={width * 0.1}
              fill="#047857"
              stroke={backlineColor}
              strokeWidth={1.5}
            />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'amp_cab':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#1e293b"
              stroke={backlineColor}
              strokeWidth={2}
              cornerRadius={3}
              shadowColor="#000"
              shadowBlur={4}
            />
            <Circle
              x={width * 0.32}
              y={height * 0.55}
              radius={height * 0.28}
              fill="#0f172a"
              stroke={backlineColor}
              strokeWidth={1.5}
            />
            <Circle
              x={width * 0.68}
              y={height * 0.55}
              radius={height * 0.28}
              fill="#0f172a"
              stroke={backlineColor}
              strokeWidth={1.5}
            />
            <Rect
              x={4}
              y={3}
              width={width - 8}
              height={height * 0.18}
              fill="#064e3b"
              stroke={backlineColor}
              strokeWidth={1}
              cornerRadius={1}
            />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'keyboard_rig':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#0f172a"
              stroke={backlineColor}
              strokeWidth={2}
              cornerRadius={3}
            />
            {Array.from({ length: 8 }).map((_, i) => {
              const keyW = (width - 8) / 8;
              return (
                <Rect
                  key={i}
                  x={4 + i * keyW}
                  y={height * 0.35}
                  width={keyW - 1}
                  height={height * 0.55}
                  fill="#f8fafc"
                  stroke="#64748b"
                  strokeWidth={0.5}
                  cornerRadius={1}
                />
              );
            })}
            {[1, 2, 4, 5, 6].map((k) => {
              const keyW = (width - 8) / 8;
              return (
                <Rect
                  key={k}
                  x={4 + k * keyW - keyW * 0.3}
                  y={height * 0.35}
                  width={keyW * 0.6}
                  height={height * 0.32}
                  fill="#0f172a"
                  cornerRadius={1}
                />
              );
            })}
            <Rect
              x={width * 0.3}
              y={4}
              width={width * 0.4}
              height={height * 0.22}
              fill={backlineColor}
              cornerRadius={1}
            />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'pedalboard':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#1e293b"
              stroke={backlineColor}
              strokeWidth={1.5}
              cornerRadius={3}
            />
            <Rect
              x={4}
              y={4}
              width={width * 0.24}
              height={height - 8}
              fill="#047857"
              stroke={backlineColor}
              strokeWidth={1}
              cornerRadius={2}
            />
            <Rect
              x={width * 0.38}
              y={4}
              width={width * 0.24}
              height={height - 8}
              fill="#b45309"
              stroke={backlineColor}
              strokeWidth={1}
              cornerRadius={2}
            />
            <Rect
              x={width * 0.72}
              y={4}
              width={width * 0.24}
              height={height - 8}
              fill="#1d4ed8"
              stroke={backlineColor}
              strokeWidth={1}
              cornerRadius={2}
            />
            <Circle x={width * 0.16} y={height * 0.7} radius={2.5} fill="#cbd5e1" />
            <Circle x={width * 0.5} y={height * 0.7} radius={2.5} fill="#cbd5e1" />
            <Circle x={width * 0.84} y={height * 0.7} radius={2.5} fill="#cbd5e1" />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'stage_box':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#1e293b"
              stroke={infraColor}
              strokeWidth={2}
              cornerRadius={3}
              shadowColor="#000"
              shadowBlur={4}
            />
            {Array.from({ length: 6 }).map((_, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              const portX = 8 + col * ((width - 16) / 2);
              const portY = 8 + row * ((height - 16) / 1);
              return (
                <Circle
                  key={i}
                  x={portX}
                  y={portY}
                  radius={3}
                  fill="#0f172a"
                  stroke={infraColor}
                  strokeWidth={1}
                />
              );
            })}
            <Rect
              x={width / 2 - 6}
              y={height - 3}
              width={12}
              height={3}
              fill={infraColor}
              cornerRadius={1}
            />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    case 'power_drop':
      return (
        <Group>
          <Group x={-halfW} y={-halfH}>
            <Rect
              width={width}
              height={height}
              fill="#1e1b0c"
              stroke={infraColor}
              strokeWidth={2}
              cornerRadius={6}
              shadowColor={infraColor}
              shadowBlur={3}
              shadowOpacity={0.3}
            />
            <Path
              data={`M ${width * 0.58} ${height * 0.16} L ${width * 0.28} ${height * 0.52} L ${width * 0.52} ${height * 0.52} L ${width * 0.42} ${height * 0.84} L ${width * 0.74} ${height * 0.44} L ${width * 0.52} ${height * 0.44} Z`}
              fill={infraColor}
              stroke={infraColor}
              strokeWidth={0.5}
            />
          </Group>
          {renderTintOverlay()}
        </Group>
      );

    default:
      return (
        <Group x={-halfW} y={-halfH}>
          <Rect
            width={width}
            height={height}
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth={1.5}
            cornerRadius={4}
          />
        </Group>
      );
  }
};
