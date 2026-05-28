import React, { useEffect } from 'react';
import { SideDrawerProps } from './types';
import { DrawerOverlay, SideDrawerContainer, DrawerContent } from './SideDrawer.styles';

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, children }) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <DrawerOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <SideDrawerContainer $isOpen={isOpen}>
        <DrawerContent>{children}</DrawerContent>
      </SideDrawerContainer>
    </DrawerOverlay>
  );
};

export default SideDrawer;
