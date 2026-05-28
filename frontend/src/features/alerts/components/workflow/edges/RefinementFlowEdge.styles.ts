import styled from 'styled-components';

/** Floating pill label rendered via EdgeLabelRenderer on a refinement loop edge. */
export const EdgeLabel = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  transform: translate(-50%, -50%) translate(${({ $x }) => $x}px, ${({ $y }) => $y}px);
  pointer-events: none;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.workflow.refinementLabelColor};
  background: ${({ theme }) => theme.colors.workflow.refinementLabelBg};
  border: 1px solid ${({ theme }) => theme.colors.workflow.refinementLabelBorder};
  border-radius: 5px;
  padding: 2px 8px;
  white-space: nowrap;
  line-height: 1.5;
`;
