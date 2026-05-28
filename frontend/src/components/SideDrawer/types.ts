import { ReactNode } from 'react';

export interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}