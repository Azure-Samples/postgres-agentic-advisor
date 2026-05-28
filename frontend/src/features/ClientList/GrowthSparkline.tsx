import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export interface GrowthSparklineProps {
  data: number[];
  width?: number; // defaults to 70
  height?: number; // defaults to 16
}

const POS_STROKE = '#06904E';
const NEG_STROKE = '#B82020';
const NEU_STROKE = '#FFA600';

const GRADIENT_COLORS = {
  positive: 'rgba(0, 135, 108',
  negative: 'rgba(212, 61, 81',
  neutral: 'rgba(235, 188, 69',
};

export const GrowthSparkline: React.FC<GrowthSparklineProps> = ({ data, width = 70, height = 16 }) => {
  // Add defensive checks
  if (!data || data.length === 0 || width <= 0 || height <= 0) {
    return <div style={{ width, height, minWidth: width, minHeight: height, display: 'inline-block' }} />;
  }

  const points = data.map((y, x) => ({ x, y }));
  const delta = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const stroke = delta > 0 ? POS_STROKE : delta < 0 ? NEG_STROKE : NEU_STROKE;
  
  const gradientColor =
    delta > 0
      ? GRADIENT_COLORS.positive
      : delta < 0
      ? GRADIENT_COLORS.negative
      : GRADIENT_COLORS.neutral;
  const gradientId = delta > 0 ? 'sparkPos' : delta < 0 ? 'sparkNeg' : 'sparkNeu';

  return (
    <div style={{ width, height, minWidth: width, minHeight: height, display: 'inline-block' }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={height} minWidth={width}>
        <AreaChart data={points} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`${gradientColor}, 0.8)`} />
              <stop offset="100%" stopColor={`${gradientColor}, 0)`} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={stroke} strokeWidth={1} fill={`url(#${gradientId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthSparkline;
