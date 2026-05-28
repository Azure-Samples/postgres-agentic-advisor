import styled, { css } from 'styled-components';
import { Layout as AntLayout } from 'antd';

const { Content } = AntLayout;

export const StyledLayout = styled(AntLayout)`
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

export const StyledContent = styled(Content)`
  margin: 0;
  padding: 14px ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[8]};
  width: 100%;
`;