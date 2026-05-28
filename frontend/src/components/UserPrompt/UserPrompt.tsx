import React from 'react';
import { UserMessageContainer, UserMessageBubble, UserAvatar } from './UserPrompt.styles';
import AvatarImage from '../AvatarImage/AvatarImage';

/**
 * Props interface for the UserPrompt component.
 */
export interface UserPromptProps {
  /** The message content from the user */
  content: string;
  /** Optional avatar image URL or identifier */
  avatar?: string;
}

/**
 * A component for displaying user messages in chat interfaces with avatar support.
 *
 * @param {UserPromptProps} props - The component props containing user message data.
 * @param {string} props.content - The message text content from the user.
 * @param {string} [props.avatar] - Optional avatar image or identifier.
 * @returns {JSX.Element} A styled user message with content bubble and avatar.
 *
 * @remarks
 * This component renders user-generated messages in chat conversations with:
 * - Message content displayed in a styled bubble
 * - User avatar or initials shown alongside the message
 * - Consistent styling that differentiates user messages from AI responses
 * - Fallback to user initials when no avatar image is provided
 *
 * The component follows chat interface conventions by positioning the user
 * avatar and message bubble in a way that clearly indicates the message origin.
 *
 * Avatar handling:
 * - Uses provided avatar URL/image if available
 * - Falls back to generated user initials (currently hardcoded as 'JD')
 * - Future enhancement planned to get initials from user context
 *
 * This component is typically used in conjunction with AI response components
 * to create a complete conversational interface.
 *
 * @example
 * ```tsx
 * <UserPrompt
 *   content="Can you help me analyze this data?"
 *   avatar="/images/user-avatar.jpg"
 * />
 * ```
 */
const ADVISOR_AVATAR_URL = '/jamie.webp';

export const UserPrompt: React.FC<UserPromptProps> = ({ content, avatar }) => {
  const getUserInitials = () => {
    // TODO: Get from user context
    return 'JD';
  };

  const avatarSrc = avatar || ADVISOR_AVATAR_URL;

  return (
    <UserMessageContainer>
      <UserMessageBubble>{content}</UserMessageBubble>
      <UserAvatar>
        <AvatarImage src={avatarSrc} alt="Advisor" imgStyle={{ borderRadius: '50%' }} />
      </UserAvatar>
    </UserMessageContainer>
  );
};

export default UserPrompt;
