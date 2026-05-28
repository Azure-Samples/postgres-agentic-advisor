import styled from 'styled-components';

export const ClientsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  overflow: hidden;
  height: calc(100vh - 136px);
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
export const HeaderRowTwo = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing[2]};
    margin-top: ${({ theme }) => theme.spacing[4]};
`;

export const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const SortSection = styled.div`
  display: flex;
  align-items: center;
`;
