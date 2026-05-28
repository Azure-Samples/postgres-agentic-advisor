import styled from 'styled-components';

export const UserMessageContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding: 0 ${({ theme }) => theme.spacing[5]};
`;

export const UserMessageBubble = styled.div`
  background-color: ${({ theme }) => theme.colors.neutralGray};
  color: ${({ theme }) => theme.colors.black};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => `${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 ${theme.borderRadius.xl}`};
  max-width: 469px;
  word-break: break-word;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const UserAvatar = styled.div`
  width: ${({ theme }) => theme.spacing[10]};
  height: ${({ theme }) => theme.spacing[10]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
`;
