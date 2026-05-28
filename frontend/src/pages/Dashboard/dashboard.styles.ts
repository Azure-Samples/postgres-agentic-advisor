import styled from 'styled-components';

export const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  zoom: ${({ theme }) => theme.layout.dashboardZoom};
  min-height: calc((100vh - ${({ theme }) => theme.layout.dashboardLayoutOffset}) / ${({ theme }) => theme.layout.dashboardZoom});
`;

export const TypographyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const HeaderBar = styled.div`
  display: flex;
  flex-direction: column;
`;

export const HeaderDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
`;

export const HeaderTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const HeaderRowOne = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const CardRow = styled.div`
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: stretch;
  flex-shrink: 0;
  min-height: 280px;
  & > * {
    flex: 1 1 0;
    min-width: 0;
  }
`;
