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

export const DisclaimerBar = styled.div`
  width: 100%;
  height: 27px;
  border-top: 1px solid #EFEFEF;
  background: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter, sans-serif;
  font-size: 12px;
  color: #617692;
  line-height: normal;
`;