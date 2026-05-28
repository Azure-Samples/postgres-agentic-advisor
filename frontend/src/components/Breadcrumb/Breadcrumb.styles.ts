import styled, { css } from 'styled-components';

export const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  text-align: center;
`;

export const Separator = styled.span`
  margin: 0 ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.grayText};
`;

export const Crumb = styled.span`
  color: ${({ theme }) => theme.colors.grayText};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
`;

export const CrumbLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;
