import React from 'react';
import Svg, { Circle, Line, Path, Text as SvgText, G } from 'react-native-svg';

interface SamaTimerLogoProps {
  color: string;
  size?: number;
  variant?: 'vertical' | 'horizontal';
}

// Vertical: viewBox="108 8 184 248"  → aspect ratio 184/248
function VerticalLogo({ color, size = 200 }: { color: string; size: number }) {
  const width = size;
  const height = size * (248 / 184);

  return (
    <Svg width={width} height={height} viewBox="108 8 184 248">
      <Circle cx="200" cy="100" r="82" fill="none" stroke={color} strokeWidth="0.6" opacity="0.22" />
      <Circle cx="200" cy="100" r="62" fill="none" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <Circle cx="200" cy="100" r="42" fill="none" stroke={color} strokeWidth="1.0" opacity="0.68" />
      <G stroke={color} strokeLinecap="round" opacity="0.58">
        <Line x1="200" y1="60"   x2="200" y2="67"   strokeWidth="1.6" />
        <Line x1="221" y1="65.7" x2="217.5" y2="71.7" strokeWidth="1.2" />
        <Line x1="237.3" y1="79.7" x2="232.8" y2="83.8" strokeWidth="1.2" />
        <Line x1="242" y1="100"  x2="235" y2="100"  strokeWidth="1.6" />
        <Line x1="237.3" y1="120.3" x2="232.8" y2="116.2" strokeWidth="1.2" />
        <Line x1="221" y1="134.3" x2="217.5" y2="128.3" strokeWidth="1.2" />
        <Line x1="200" y1="140"  x2="200" y2="133"  strokeWidth="1.6" />
        <Line x1="179" y1="134.3" x2="182.5" y2="128.3" strokeWidth="1.2" />
        <Line x1="162.7" y1="120.3" x2="167.2" y2="116.2" strokeWidth="1.2" />
        <Line x1="158" y1="100"  x2="165" y2="100"  strokeWidth="1.6" />
        <Line x1="162.7" y1="79.7" x2="167.2" y2="83.8" strokeWidth="1.2" />
        <Line x1="179" y1="65.7" x2="182.5" y2="71.7" strokeWidth="1.2" />
      </G>
      <Line x1="200" y1="100" x2="200" y2="67"  stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.72" />
      <Line x1="200" y1="100" x2="233" y2="100" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.72" />
      <Circle cx="200" cy="100" r="2.8" fill={color} opacity="0.82" />
      <Path d="M 146 133 Q 200 163 254 133" fill="none" stroke={color} strokeWidth="1.0" strokeDasharray="3 5" strokeLinecap="round" opacity="0.38" />
      <SvgText x="200" y="206" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="400" fontSize="38" letterSpacing="5" fill={color}>SAMA</SvgText>
      <Line x1="148" y1="217" x2="252" y2="217" stroke={color} strokeWidth="0.5" opacity="0.35" />
      <SvgText x="200" y="244" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="400" fontSize="18" letterSpacing="6" fill={color} opacity="0.72">TIMER</SvgText>
    </Svg>
  );
}

// Horizontal: viewBox="16 14 350 132"  → aspect ratio 350/132
function HorizontalLogo({ color, size = 200 }: { color: string; size: number }) {
  const width = size;
  const height = size * (132 / 350);

  return (
    <Svg width={width} height={height} viewBox="16 14 350 132">
      <Circle cx="80" cy="80" r="62" fill="none" stroke={color} strokeWidth="0.6" opacity="0.22" />
      <Circle cx="80" cy="80" r="47" fill="none" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <Circle cx="80" cy="80" r="32" fill="none" stroke={color} strokeWidth="1.0" opacity="0.68" />
      <G stroke={color} strokeLinecap="round" opacity="0.58">
        <Line x1="80"    y1="50"    x2="80"    y2="55.5"  strokeWidth="1.6" />
        <Line x1="96"    y1="53.8"  x2="93.3"  y2="58.5"  strokeWidth="1.2" />
        <Line x1="107.3" y1="63.7"  x2="103.8" y2="67.1"  strokeWidth="1.2" />
        <Line x1="112"   y1="80"    x2="106.5" y2="80"    strokeWidth="1.6" />
        <Line x1="107.3" y1="96.3"  x2="103.8" y2="92.9"  strokeWidth="1.2" />
        <Line x1="96"    y1="106.2" x2="93.3"  y2="101.5" strokeWidth="1.2" />
        <Line x1="80"    y1="110"   x2="80"    y2="104.5" strokeWidth="1.6" />
        <Line x1="64"    y1="106.2" x2="66.7"  y2="101.5" strokeWidth="1.2" />
        <Line x1="52.7"  y1="96.3"  x2="56.2"  y2="92.9"  strokeWidth="1.2" />
        <Line x1="48"    y1="80"    x2="53.5"  y2="80"    strokeWidth="1.6" />
        <Line x1="52.7"  y1="63.7"  x2="56.2"  y2="67.1"  strokeWidth="1.2" />
        <Line x1="64"    y1="53.8"  x2="66.7"  y2="58.5"  strokeWidth="1.2" />
      </G>
      <Line x1="80" y1="80" x2="80"  y2="52" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.72" />
      <Line x1="80" y1="80" x2="107" y2="80" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.72" />
      <Circle cx="80" cy="80" r="2.5" fill={color} opacity="0.82" />
      <Path d="M 46 102 Q 80 120 114 102" fill="none" stroke={color} strokeWidth="0.9" strokeDasharray="3 4.5" strokeLinecap="round" opacity="0.38" />
      <SvgText x="162" y="74" textAnchor="start" fontFamily="Georgia, serif" fontWeight="400" fontSize="52" letterSpacing="6" fill={color}>SAMA</SvgText>
      <Line x1="162" y1="86" x2="362" y2="86" stroke={color} strokeWidth="0.5" opacity="0.35" />
      <SvgText x="163" y="113" textAnchor="start" fontFamily="Georgia, serif" fontWeight="400" fontSize="20" letterSpacing="8" fill={color} opacity="0.72">TIMER</SvgText>
    </Svg>
  );
}

export function SamaTimerLogo({ color, size = 200, variant = 'vertical' }: SamaTimerLogoProps) {
  if (variant === 'horizontal') {
    return <HorizontalLogo color={color} size={size} />;
  }
  return <VerticalLogo color={color} size={size} />;
}
