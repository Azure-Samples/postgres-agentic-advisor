import styled, { css } from 'styled-components';

export const ChipListWrapper = styled.div<{ $wrap?: boolean; $gap: number }>`
	display: flex;
	flex-wrap: ${p => (p.$wrap ? 'wrap' : 'nowrap')};
	gap: ${p => `${p.$gap}px`};
	align-items: flex-start;
`;

export const OverflowList = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing[1]};
	max-width: 260px;
`;