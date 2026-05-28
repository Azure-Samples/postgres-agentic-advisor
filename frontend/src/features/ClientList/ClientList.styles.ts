import styled, { keyframes } from 'styled-components';

// Shared shimmer animation for skeleton cells
const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

/** Generic shimmer block — use for text-like skeleton cells */
export const SkeletonCell = styled.div<{ $width?: string }>`
  height: 14px;
  width: ${({ $width }) => $width ?? '70%'};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutralGray} 25%,
    ${({ theme }) => theme.colors.coolGray} 50%,
    ${({ theme }) => theme.colors.neutralGray} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

/** Circular shimmer block used for avatar placeholders */
export const SkeletonAvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutralGray} 25%,
    ${({ theme }) => theme.colors.coolGray} 50%,
    ${({ theme }) => theme.colors.neutralGray} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;

export const ClientListWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  height: 100%;

  .client-list {
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    overflow: hidden;
    background: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors['light-sky-blue-20']};
    border-bottom: none;
    display: flex;
    flex-direction: column;
    height: 100%;

    .ant-table {
      box-shadow: none;
      width: 100%;

      .ant-table-container {
        border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
        border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
        overflow-x: auto;
      }

      .ant-table-thead > tr > th {
        background: ${({ theme }) => theme.colors.white};
        height: 44px;
        padding: ${({ theme }) => theme.spacing[2.5]} ${({ theme }) => theme.spacing[5]};
        color: ${({ theme }) => theme.colors.logoText};
        font-family: ${({ theme }) => theme.typography.fontFamily.primary};
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
        border-bottom: 2px solid ${({ theme }) => theme.colors.coolGray};
        white-space: nowrap;

        &:first-of-type {
          border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
          border-left: 1px solid ${({ theme }) => theme.colors['light-sky-blue-20']};
        }
        &:last-of-type {
          border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
          border-right: 1px solid ${({ theme }) => theme.colors['light-sky-blue-20']};
        }
      }

      .ant-table-tbody > tr > td {
        height: 56px;
        padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[5]};
        border-bottom: 1px solid ${({ theme }) => theme.colors['lavender-gray-40']};
        font-family: ${({ theme }) => theme.typography.fontFamily.primary};
        font-size: ${({ theme }) => theme.typography.fontSize.base};
        font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
        color: ${({ theme }) => theme.colors.logoText};
        white-space: nowrap; /* Prevent cell content wrapping */
        min-height: 56px;
        
        /* Ensure chart containers have proper space */
        & > div {
          min-height: 20px;
        }
      }

      .ant-table-cell {
        box-shadow: none !important;
      }
    }
  }

  .client-name {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};

    .name {
      font-family: ${({ theme }) => theme.typography.fontFamily.primary};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      font-size: ${({ theme }) => theme.typography.fontSize.base};
      color: ${({ theme }) => theme.colors.contentSecondary};
    }
  }

  .net-worth {
    color: ${({ theme }) => theme.colors.contentPrimary};
  }

  .sector-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
  /* Default — fallback for any unlisted sector */
  .sector-pill { background: ${({ theme }) => theme.colors['light-sky-blue-15']}; color: ${({ theme }) => theme.colors['light-sky-blue']}; }
  /* API sector values slugified to CSS classes */
  .sector-pill.information-technology { background: rgba(0,111,255,0.15);   color: #006DDA; }
  .sector-pill.financials             { background: rgba(5,150,105,0.15);   color: #059669; }
  .sector-pill.industrials            { background: rgba(100,116,139,0.15); color: #475569; }
  .sector-pill.consumer-discretionary { background: rgba(255,166,0,0.15);  color: #FFA600; }
  .sector-pill.consumer-staples       { background: rgba(255,166,0,0.15);  color: #FFA600; }

  .risk-profile {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme }) => theme.colors.contentPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`
