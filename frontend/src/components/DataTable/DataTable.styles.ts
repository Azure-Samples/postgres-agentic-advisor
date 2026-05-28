import styled, { css } from 'styled-components';

export const TableContainer = styled.div`
  .enhanced-data-table {
    .ant-table {
      border-radius: ${({ theme }) => theme.borderRadius.lg};
      overflow: hidden;
      box-shadow: ${({ theme }) => theme.shadows.sm};

      .ant-table-thead > tr > th {
        background: ${({ theme }) => theme.colors.lightGray};
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
        color: ${({ theme }) => theme.colors.contentPrimary};
        border-bottom: ${({ theme }) => theme.border.light};
        padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
        font-size: ${({ theme }) => theme.typography.fontSize.sm};

        &:first-of-type {
          border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
        }

        &:last-of-type {
          border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
        }
      }

      .ant-table-tbody > tr {
        transition: background-color 0.2s ease;

        &:hover {
          background-color: ${({ theme }) => theme.colors.neutralGray};
        }

        > td {
          padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
          border-bottom: ${({ theme }) => theme.border.light};
          font-size: ${({ theme }) => theme.typography.fontSize.sm};

          &.actions-cell {
            .action-buttons {
              opacity: 0;
              transition: opacity 0.2s ease;
            }
          }
        }

        &:hover .actions-cell .action-buttons {
          opacity: 1;
        }
      }

      .ant-table-pagination.ant-pagination {
        margin: ${({ theme }) => theme.spacing[4]} 0;
        padding: 0 ${({ theme }) => theme.spacing[4]};
      }
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${({ theme }) => theme.spacing[4]};

      .table-title {
        margin: 0;
        font-size: ${({ theme }) => theme.typography.fontSize.xl};
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
        color: ${({ theme }) => theme.colors.contentPrimary};
      }

      .table-actions {
        display: flex;
        gap: ${({ theme }) => theme.spacing[2]};
        align-items: center;
      }
    }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${({ theme }) => theme.spacing[4]};
      padding: ${({ theme }) => theme.spacing[3]} 0;

      .toolbar-left {
        display: flex;
        gap: ${({ theme }) => theme.spacing[3]};
        align-items: center;
        flex-wrap: wrap;
      }

      .toolbar-right {
        display: flex;
        gap: ${({ theme }) => theme.spacing[2]};
        align-items: center;
      }
    }

    .empty-state {
      text-align: center;
      padding: ${({ theme }) => theme.spacing[10]} ${({ theme }) => theme.spacing[5]};
      color: ${({ theme }) => theme.colors.contentTertiary};

      .empty-icon {
        font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
        margin-bottom: ${({ theme }) => theme.spacing[4]};
        opacity: 0.5;
        color: ${({ theme }) => theme.colors.grayText};
      }

      .empty-title {
        font-size: ${({ theme }) => theme.typography.fontSize.lg};
        font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
        margin-bottom: ${({ theme }) => theme.spacing[2]};
        color: ${({ theme }) => theme.colors.contentSecondary};
      }

      .empty-description {
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        margin-bottom: ${({ theme }) => theme.spacing[4]};
        color: ${({ theme }) => theme.colors.contentTertiary};
      }
    }
  }
`;

export const FilterTag = styled.div`
  display: inline-flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.SuggestionPillBg};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  margin-right: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  .filter-label {
    margin-right: ${({ theme }) => theme.spacing[1]};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  .close-icon {
    cursor: pointer;
    margin-left: ${({ theme }) => theme.spacing[1]};
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
      color: ${({ theme }) => theme.colors.hoverPrimary};
    }
  }
`;
