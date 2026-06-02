import React, { useEffect } from 'react';
import {
  Overlay,
  Content,
  SpinnerWrapper,
  Track,
  SpinnerRing,
  AppName,
  StatusText,
  ErrorIconWrapper,
  ErrorIcon,
  ErrorTitle,
  ErrorSubText,
} from './AppInitializationOverlay.styles';

interface AppInitializationOverlayProps {
  isError?: boolean;
}

export const AppInitializationOverlay: React.FC<AppInitializationOverlayProps> = ({ isError = false }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <Overlay>
      <Content>
        {isError ? (
          <>
            <ErrorIconWrapper>
              <ErrorIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" />
                <path d="M12 7v5" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="#DC2626" />
              </ErrorIcon>
            </ErrorIconWrapper>
            <ErrorTitle>Something went wrong</ErrorTitle>
            <ErrorSubText>Unable to connect to the server. Please refresh the page to try again.</ErrorSubText>
          </>
        ) : (
          <>
            <SpinnerWrapper>
              <Track />
              <SpinnerRing />
            </SpinnerWrapper>
            <AppName>Agentic Advisor</AppName>
            <StatusText>Databases are being initialized .. please wait</StatusText>
          </>
        )}
      </Content>
    </Overlay>
  );
};

export default AppInitializationOverlay;
