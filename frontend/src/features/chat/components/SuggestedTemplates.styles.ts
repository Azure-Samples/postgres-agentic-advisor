import styled, { keyframes } from 'styled-components';

export const SuggestedTemplatesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  width: 100%;
`;

export const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
  max-width: 456px;
  align-items: stretch;
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

export const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #e8ecef 25%, #f0f3f4 50%, #e8ecef 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 8px;
`;

export const SkeletonPill = styled(SkeletonBase)`
  width: 100%;
  height: 42px;
`;

export const SkeletonTitle = styled(SkeletonBase)`
  width: 280px;
  height: 24px;
  border-radius: 6px;
`;
