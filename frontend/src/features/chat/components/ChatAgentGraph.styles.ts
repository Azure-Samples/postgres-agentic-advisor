import styled from 'styled-components';

/** Outer card — white rounded box matching the Figma frame */
export const ChatAgentGraphCard = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid #e5e5e5;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: ${({ theme }) => theme.spacing[3]};
  overflow: hidden;
`;

/** Fixed-height React Flow canvas host */
export const ChatAgentGraphCanvas = styled.div`
  width: 100%;
  height: 360px;
`;

const BaseNode = styled.div`
  padding: 8px 12px;
  border-radius: 4px;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
  pointer-events: none;
  user-select: none;
`;

/** Query node — white background, purple border */
export const QueryNodeEl = styled(BaseNode)`
  border: 1px solid ${({ theme }) => theme.colors.workflow.eventBorder};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

/** Agent node — white background, active purple border */
export const AgentNodeEl = styled(BaseNode)`
  border: 1.5px solid ${({ theme }) => theme.colors.workflow.entityRingBorder};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

/** Response node — purple gradient, white text */
export const ResponseNodeEl = styled(BaseNode)`
  background: ${({ theme }) => theme.colors.workflow.insightGradient};
  color: ${({ theme }) => theme.colors.white};
  border: none;
`;
