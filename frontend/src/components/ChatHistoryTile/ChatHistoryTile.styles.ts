import styled from 'styled-components';

export const ChatHistoryTileContainer = styled.button`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: ${({ theme }) => theme.border.light};
  box-shadow: 0 2px 4px 0 ${({ theme }) => theme.colors.drawerShadow};
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[4]};
  width: 100%;
`;

export const ClientTitleWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
  justify-content: flex-start;
`;

export const SubtitleTimeWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.black};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const Subtitle = styled.span`
  overflow: hidden;
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
`;

export const DateStamp = styled.span`
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  white-space: nowrap;
`;
