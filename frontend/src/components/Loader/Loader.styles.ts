import styled, { keyframes, css } from 'styled-components';

export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderSpeed = 'slow' | 'normal' | 'fast';

// Base dimensions for the SVG spinner; will scale according to size
const sizeMap: Record<LoaderSize, { w: number; h: number; stroke: number }> = {
  sm: { w: 16, h: 16, stroke: 3 },
  md: { w: 32, h: 32, stroke: 4 },
  lg: { w: 48, h: 48, stroke: 5 },
};

const speedMap: Record<LoaderSpeed, string> = {
  slow: '1.5s',
  normal: '1s',
  fast: '0.6s',
};

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoaderWrapper = styled.span<{ $inline?: boolean; $center?: boolean }>`
  display: ${({ $inline }) => ($inline ? 'inline-flex' : 'flex')};
  align-items: center;
  justify-content: center;
  ${({ $center }) => $center && css`width: 100%;`};
`;

export const Spinner = styled.svg<{ $size: LoaderSize; $speed: LoaderSpeed }>`
  ${({ $speed }) => css`animation: ${rotate} ${speedMap[$speed]} linear infinite;`}
  ${({ $size }) => {
    const s = sizeMap[$size];
    return css`
      width: ${s.w}px;
      height: ${s.h}px;
      & .track { stroke-width: ${s.stroke}px; }
      & .indicator { stroke-width: ${s.stroke}px; }
    `;
  }}
`;

export const getAriaLabel = (label?: string) => label || 'Loading';
