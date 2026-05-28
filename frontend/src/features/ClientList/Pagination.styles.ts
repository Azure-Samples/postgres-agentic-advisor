import styled from 'styled-components';

export const PaginationWrapper = styled.div`
  width: 100%;
  flex: 1;
  background-color: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  .pagination-controls {
    width: 100%;
    height: 40px;
    background: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors['light-sky-blue-20']};
    border-top: none;
    border-radius: 0px 0px ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 ${({ theme }) => theme.spacing[8]};
    gap: ${({ theme }) => theme.spacing[2]};
  }

  .page-size-control {
    display: flex;
    align-items: center;
  }

  .page-size-text {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    color: ${({ theme }) => theme.colors.logoText};
    text-align: center;
  }

  .navigation-controls {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
  }

  .nav-button {
    border-radius: ${({ theme }) => theme.borderRadius.full};
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[1]};
    transition: all 0.2s ease;

    svg {
      width: ${({ theme }) => theme.spacing[6]};
      height: ${({ theme }) => theme.spacing[6]};

      path {
        fill: ${({ theme }) => theme.colors.white};
      }
    }

    &:disabled svg path {
      fill: ${({ theme }) => theme.colors.disabledText};
    }
  }
`;
