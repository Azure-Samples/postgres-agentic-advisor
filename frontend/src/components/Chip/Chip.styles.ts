import styled, { css } from 'styled-components';

export type ChipVariant = 'primary' | 'secondary' | 'source-primary' | 'source-secondary' | 'gen-ai' | 'default';
export type ChipSize = 'xs' | 'sm' | 'md';

interface StyledChipProps { $variant: ChipVariant; $size: ChipSize; $clickable?: boolean; $selected?: boolean; $disabled?: boolean; }

const sizeStyles: Record<ChipSize, ReturnType<typeof css>> = {
	xs: css`
		font-size: ${({ theme }) => theme.typography.fontSize.sm};
		padding: ${({ theme }) => theme.spacing[1.3]} ${({ theme }) => theme.spacing[2.5]};
		gap: ${({ theme }) => theme.spacing[1]};
		font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
	`,
	sm: css`
		font-size: ${({ theme }) => theme.typography.fontSize.sm};
		padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
		gap: ${({ theme }) => theme.spacing[1]};
		font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
	`,
	md: css`
		font-size: ${({ theme }) => theme.typography.fontSize.sm};
		padding: 0 ${({ theme }) => theme.spacing[3]};
		gap: ${({ theme }) => theme.spacing[1.5]};
	`,
};

const variantStyles: Record<ChipVariant, ReturnType<typeof css>> = {
	primary: css`
		background: ${({ theme }) => theme.colors.chipPrimaryBg};
		color: ${({ theme }) => theme.colors.primary};
		border-radius: 0.1875rem; /* 3px */
	`,
	secondary: css`
		background: ${({ theme }) => theme.colors.chipPrimaryBg};
		color: ${({ theme }) => theme.colors.primary};
		border-radius: 0.1875rem; /* 3px – design spec */
		line-height: 1.14;
		letter-spacing: 0.28px;
	`,
	'source-primary': css`
		background: ${({ theme }) => theme.colors.lightGray};
		color: ${({ theme }) => theme.colors['charcoal-blue']};
	`,
	'source-secondary': css`
		background: ${({ theme }) => theme.colors['light-sky-blue-20']};
		color: ${({ theme }) => theme.colors['charcoal-blue']};
	`,
	'gen-ai': css`
		background: ${({ theme }) => theme.colors['light-sky-blue-15']};
		color: ${({ theme }) => theme.colors['light-sky-blue']};
		padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[3]};
		gap: ${({ theme }) => theme.spacing[2]};
		font-size: ${({ theme }) => theme.typography.fontSize.xs};
		font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
	`,
	default: css`
		background: ${({ theme }) => theme.colors.white};
		color: ${({ theme }) => theme.colors['charcoal-blue']};
	`,
};

export const StyledChip = styled.span<StyledChipProps>`
	display: inline-flex;
	align-items: flex-start;
	position: relative;
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	border-radius: ${({ theme }) => theme.borderRadius.full};
	user-select: none;
	border: 1px solid transparent;
	white-space: nowrap;
	max-width: 240px;
	${p => sizeStyles[p.$size]};
	${p => variantStyles[p.$variant]};
	${p => p.$selected && css`box-shadow: 0 0 0 2px rgba(6,115,148,0.25);`};
	${p => p.$disabled && css`opacity: 0.5; cursor: not-allowed;`};
	${p => p.$clickable && !p.$disabled && css`
		cursor: pointer;
		transition: background .18s ease, color .18s ease, border-color .18s ease;
		&:hover { filter: brightness(0.95); }
		&:active { filter: brightness(0.9); }
		&:focus-visible { outline: 2px solid ${p.theme.colors.primary}; outline-offset: 2px; }
	`};
	& > .chip-icon { display: inline-flex; }
	& > .chip-label { overflow: hidden; text-overflow: ellipsis; }
`;
