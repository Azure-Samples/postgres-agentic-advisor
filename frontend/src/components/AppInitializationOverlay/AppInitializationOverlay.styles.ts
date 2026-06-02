import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(0.5px);
  -webkit-backdrop-filter: blur(0.5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const SpinnerWrapper = styled.div`
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 4px;
`;

export const Track = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4.5px solid rgba(214, 219, 237, 0.5);
`;

export const SpinnerRing = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(6, 115, 148, 0) 0%,
    rgba(17, 148, 188, 0.5) 40%,
    rgba(6, 115, 148, 1) 100%
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4.5px), black 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 4.5px), black 0);
  animation: ${rotate} 1.2s linear infinite;
`;

export const AppName = styled.span`
  color: #272f3a;
  text-align: center;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
`;

export const StatusText = styled.p`
  margin: 0;
  color: #272f3a;
  text-align: center;
  font-family: Inter, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
`;

export const ErrorIconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fff0f0;
  border: 2px solid #ffcccc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  flex-shrink: 0;
`;

export const ErrorIcon = styled.svg`
  width: 28px;
  height: 28px;
`;

export const ErrorTitle = styled.p`
  margin: 0;
  color: #272f3a;
  text-align: center;
  font-family: Inter, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
`;

export const ErrorSubText = styled.p`
  margin: 0;
  color: #617692;
  text-align: center;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  max-width: 280px;
`;
