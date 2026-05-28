import styled from 'styled-components';

export const RelationshipGraphWrapper = styled.div`
  width: 100%;
  height: 360px;
  margin-top: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.workflow.relationshipCanvasBg};
  border: 1px solid ${({ theme }) => theme.colors.workflow.entityCardBorder};
`;

export const EmptyOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.disabledText};
`;
