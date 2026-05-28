import styled, { css } from 'styled-components';

export const StyledSuggestionPill = styled.div`
	padding:  ${({ theme }) => theme.spacing[3]};
	border-radius: ${({ theme }) => theme.borderRadius.lg};
	background: ${({ theme }) => theme.colors.SuggestionPillBg}; 
	width: fit-content;
	cursor: pointer;
`;

export const MessageText = styled.span`
	color: ${({ theme }) => theme.colors.contentPrimary};
	text-align: center;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
	word-break: break-word;
`;

export const BracketText = styled.span`
	color: ${({ theme }) => theme.colors.contentPrimary};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const InlineWrapper = styled.span`
	display: inline;
`;

export const Content = styled.span`
	display: inline;
	white-space: pre-wrap; 
`;
