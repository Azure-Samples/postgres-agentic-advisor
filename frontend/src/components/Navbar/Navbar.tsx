import React, { useState, useRef, useEffect, useMemo } from 'react';
import AvatarImage from '../AvatarImage/AvatarImage';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../Button';
import ChatDrawer from '../SideDrawer/ChatDrawer';
import {
  NavbarContainer,
  NavbarLeft,
  LogoContainer,
  LogoIcon,
  LogoText,
  NavbarCenter,
  NavLinksContainer,
  NavLink,
  NavbarRight,
  IconButton,
  AvatarContainer,
  Avatar,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
} from './Navbar.styles';
import { BellIcon, GenAiIcon, ResetIcon } from '@/icons';
import { ROUTE_PATTERNS } from '@/constants/navigation';
import { useResetMutation } from '@/api/hooks/useResetMutation';

/**
 * Props interface for the Navbar component.
 */
export interface NavbarProps {
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * The main navigation bar component providing application-wide navigation and user controls.
 *
 * @param {NavbarProps} props - The component props containing navbar configuration.
 * @param {string} [props.className] - Additional CSS class for custom styling.
 * @param {React.CSSProperties} [props.style] - Inline styles for the navbar.
 * @returns {JSX.Element} A responsive navigation bar with logo, nav links, and user controls.
 *
 * @remarks
 * This navbar component provides comprehensive navigation functionality including:
 *
 * Layout sections:
 * - Left: Application logo with icon and text
 * - Center: Primary navigation links (Dashboard, Clients)
 * - Right: Notifications, AI chat access, and user avatar menu
 *
 * Interactive features:
 * - Route-aware active link highlighting
 * - Dropdown user menu with profile, settings, and logout options
 * - Chat drawer toggle for AI assistance
 * - Notification bell (ready for future notification system)
 * - Click-outside handling for dropdown menus
 *
 * The component integrates with React Router for navigation and maintains
 * visual feedback for the current active route. It uses consistent theming
 * and responsive design to work across different screen sizes.
 *
 * User interaction patterns:
 * - Logo click navigates to dashboard/home
 * - Nav links provide primary navigation
 * - Avatar click reveals user management options
 * - AI icon opens contextual chat assistance
 *
 * The navbar automatically closes dropdown menus when clicking outside
 * and handles keyboard navigation for accessibility.
 *
 * @example
 * ```tsx
 * <Navbar className="custom-navbar" />
 * ```
 */
const Navbar: React.FC<NavbarProps> = ({ className, style }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mutate: resetApp, isPending: isResetting } = useResetMutation();

  const navItems = [
    { key: '/dashboard', label: 'Dashboard' },
    { key: '/clients', label: 'Clients' },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname.startsWith('/dashboard');
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    // Preserve the simulated date (?date=MM-DD) across tab switches so the
    // selected date is never lost when navigating between Dashboard and Clients.
    const dateParam = new URLSearchParams(location.search).get('date');
    navigate(dateParam ? `${path}?date=${dateParam}` : path);
  };

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownItemClick = (action: string) => {
    setIsDropdownOpen(false);

    switch (action) {
      case 'profile':
        console.log('Navigate to profile');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'reset':
        resetApp(undefined, {
          onSuccess: () => navigate('/dashboard'),
        });
        break;
      case 'logout':
        console.log('Logout user');
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const ADVISOR_AVATAR_URL = '/jamie.webp';

  const getUserInitials = () => {
    return 'JD'; //we will replace this with actual user initials later
  };

  // Check if we're on the chat page using regex pattern for accurate detection
  const isOnChatPage = useMemo(() => {
    return ROUTE_PATTERNS.CHAT.test(location.pathname);
  }, [location.pathname]);

  return (
    <NavbarContainer className={className} style={style}>
      <NavbarLeft>
        <LogoContainer>
          <LogoIcon>A</LogoIcon>
          <LogoText>Agentic Advisor</LogoText>
        </LogoContainer>
      </NavbarLeft>

      <NavbarCenter>
        <NavLinksContainer>
          {navItems.map((item) => (
            <NavLink key={item.key} $isActive={isActiveRoute(item.key)} onClick={() => handleNavClick(item.key)}>
              {item.label}
            </NavLink>
          ))}
        </NavLinksContainer>
      </NavbarCenter>

      <NavbarRight>
        <IconButton aria-label="Notifications">
          <BellIcon />
        </IconButton>
        <AvatarContainer ref={dropdownRef}>
          <Avatar onClick={handleAvatarClick} aria-label="User menu" style={{ padding: 0, overflow: 'hidden' }}>
            <AvatarImage src={ADVISOR_AVATAR_URL} alt="JD" />
          </Avatar>
          <DropdownMenu $isOpen={isDropdownOpen}>
            <DropdownItem $disabled>Profile</DropdownItem>
            <DropdownItem $disabled>Settings</DropdownItem>
            <DropdownDivider />
            <DropdownItem
              $active
              $disabled={isResetting}
              onClick={() => handleDropdownItemClick('reset')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ResetIcon style={{ flexShrink: 0 }} />
              {isResetting ? 'Resetting…' : 'Reset App'}
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem $disabled>Logout</DropdownItem>
          </DropdownMenu>
        </AvatarContainer>
      </NavbarRight>
      <ChatDrawer isOpen={isChatDrawerOpen} onClose={() => setIsChatDrawerOpen(false)} />
    </NavbarContainer>
  );
};

export default Navbar;
