import React from 'react';
import { Chip } from '../Chip';
import { ChipAvatar } from '@/icons';
import {
  ChatHistoryTileContainer,
  ClientTitleWrapper,
  Subtitle,
  SubtitleTimeWrapper,
  DateStamp,
  Title,
} from './ChatHistoryTile.styles';
import { formatDateToRelativeTime } from '@/utils/dateUtils';

/**
 * Props interface for the ChatHistoryTile component.
 */
export interface ChatHistoryTileProps {
  /** Unique identifier for the chat history tile */
  id?: string;
  /** Name of the client associated with the chat session */
  clientName?: string;
  /** Primary title of the chat session */
  title: string;
  /** Secondary text providing chat context or preview */
  subtitle: string;
  /** Human-readable time since the chat occurred */
  timeAgo: string;
  /** Timestamp when the chat was created */
  createdAt?: Date | string;
  /** Callback fired when the tile is clicked */
  onClick?: (e: React.MouseEvent) => void;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * A tile component for displaying chat history entries with client information and timestamps.
 *
 * @param {ChatHistoryTileProps} props - The component props containing chat history data.
 * @param {string} props.title - Primary title of the chat session.
 * @param {string} props.subtitle - Secondary text providing chat context.
 * @param {string} props.timeAgo - Human-readable time since the chat occurred.
 * @param {string} [props.clientName] - Optional client name displayed as a chip.
 * @param {Function} [props.onClick] - Click handler for tile selection.
 * @returns {JSX.Element} A styled chat history tile with client info and metadata.
 *
 * @remarks
 * This component displays chat history information in a structured format:
 * - Optional client name shown as a secondary variant chip with avatar icon
 * - Chat title for quick identification
 * - Subtitle providing preview or context information
 * - Timestamp showing when the chat occurred
 *
 * The layout adapts based on whether client information is available,
 * maintaining visual consistency while maximizing information density.
 *
 * The component is designed for use in chat history lists where users
 * can browse and select previous conversations for continuation or reference.
 *
 * Click interactions enable navigation to specific chat sessions,
 * supporting seamless conversation resumption.
 *
 * @example
 * ```tsx
 * <ChatHistoryTile
 *   title="Product Integration Discussion"
 *   subtitle="Discussed API authentication methods..."
 *   clientName="TechCorp Inc"
 *   timeAgo="3 hours ago"
 *   onClick={handleChatSelect}
 * />
 * ```
 */
const ChatHistoryTile: React.FC<ChatHistoryTileProps> = ({
  id,
  clientName,
  title,
  subtitle,
  timeAgo,
  onClick,
  className,
  style,
}) => {
  return (
    <ChatHistoryTileContainer className={className} style={style} onClick={onClick}>
      <ClientTitleWrapper>
        {clientName ? <Chip variant="secondary" startIcon={<ChipAvatar />} label={clientName} /> : null}
        <Title>{title}</Title>
      </ClientTitleWrapper>
      <SubtitleTimeWrapper>
        <Subtitle>{subtitle}</Subtitle>
        {/* <DateStamp>{formatDateToRelativeTime(timeAgo)}</DateStamp> */}
      </SubtitleTimeWrapper>
    </ChatHistoryTileContainer>
  );
};

export default ChatHistoryTile;
