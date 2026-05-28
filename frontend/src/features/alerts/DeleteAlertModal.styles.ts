import styled from 'styled-components';

export const DeleteModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[1]} 0;
`;

export const DeleteModalMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.tileTitle};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

export const DeleteModalClientName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
`;

export const DeleteModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease-in;
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  box-shadow: none;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.toast.error.closeIcon};
    border-color: ${({ theme }) => theme.colors.toast.error.closeIcon};
    box-shadow: ${({ theme }) => theme.shadows.xs};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
