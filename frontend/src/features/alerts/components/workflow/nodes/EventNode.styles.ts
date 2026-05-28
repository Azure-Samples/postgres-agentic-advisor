import styled from 'styled-components';

/** Root box for the Event trigger node rendered inside the React Flow canvas. */
export const EventNodeRoot = styled.div`
  position: relative;
  display: inline-flex;
  padding: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.workflow.eventBorder};
  background: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentPrimary};
  white-space: nowrap;
  user-select: none;
`;
