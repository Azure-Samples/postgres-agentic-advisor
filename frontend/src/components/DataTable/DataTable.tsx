import React from 'react';
import { Table, Card, Button, Input, Select, Space, Typography, Dropdown, Badge, Empty, Tooltip } from 'antd';
import {
  SearchOutlined,
  MoreOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  CloseOutlined,
  TableOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { TableContainer, FilterTag } from './DataTable.styles';

const { Title } = Typography;

export interface TableAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  value: any;
  column: string;
}

export interface DataTableProps<T = any> extends Omit<TableProps<T>, 'columns' | 'title'> {
  /** Table title */
  title?: string;

  /** Table columns configuration */
  columns: ColumnsType<T>;

  /** Table data source */
  dataSource: T[];

  /** Loading state */
  loading?: boolean;

  /** Enable search functionality */
  searchable?: boolean;

  /** Search placeholder text */
  searchPlaceholder?: string;

  /** Current search value */
  searchValue?: string;

  /** Search callback */
  onSearch?: (value: string) => void;

  /** Enable filtering */
  filterable?: boolean;

  /** Active filters */
  activeFilters?: FilterOption[];

  /** Filter change callback */
  onFiltersChange?: (filters: FilterOption[]) => void;

  /** Primary action button */
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };

  /** Secondary actions */
  actions?: TableAction[];

  /** Enable row selection */
  selectable?: boolean;

  /** Selected row keys */
  selectedRowKeys?: React.Key[];

  /** Row selection callback */
  onRowSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;

  /** Enable export functionality */
  exportable?: boolean;

  /** Export callback */
  onExport?: (type: 'csv' | 'xlsx' | 'pdf') => void;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Table settings callback */
  onSettings?: () => void;

  /** Empty state configuration */
  emptyState?: {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };

  /** Custom CSS class */
  className?: string;

  /** Show toolbar */
  showToolbar?: boolean;

  /** Compact mode */
  compact?: boolean;
}

export const DataTable = <T extends Record<string, any>>({
  title,
  columns,
  dataSource,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearch,
  filterable = false,
  activeFilters = [],
  onFiltersChange,
  primaryAction,
  actions = [],
  selectable = false,
  selectedRowKeys = [],
  onRowSelectionChange,
  exportable = false,
  onExport,
  onRefresh,
  onSettings,
  emptyState,
  className = '',
  showToolbar = true,
  compact = false,
  ...tableProps
}: DataTableProps<T>) => {
  const handleFilterRemove = (filterKey: string) => {
    if (onFiltersChange) {
      const newFilters = activeFilters.filter((f) => f.key !== filterKey);
      onFiltersChange(newFilters);
    }
  };

  const handleClearAllFilters = () => {
    if (onFiltersChange) {
      onFiltersChange([]);
    }
  };

  const renderToolbar = () => {
    if (!showToolbar) return null;

    const exportMenuItems = [
      { key: 'csv', label: 'Export as CSV' },
      { key: 'xlsx', label: 'Export as Excel' },
      { key: 'pdf', label: 'Export as PDF' },
    ];

    const moreActionsItems = actions.map((action) => ({
      key: action.key,
      label: action.label,
      icon: action.icon,
      disabled: action.disabled,
      danger: action.danger,
      onClick: action.onClick,
    }));

    return (
      <div className="table-toolbar">
        <div className="toolbar-left">
          {searchable && (
            <Input
              prefix={<SearchOutlined />}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          )}

          {filterable && activeFilters.length > 0 && (
            <Space wrap>
              {activeFilters.map((filter) => (
                <FilterTag key={filter.key}>
                  <span className="filter-label">{filter.label}:</span>
                  <span>{filter.value}</span>
                  <CloseOutlined className="close-icon" onClick={() => handleFilterRemove(filter.key)} />
                </FilterTag>
              ))}
              {activeFilters.length > 1 && (
                <Button size="small" type="link" onClick={handleClearAllFilters}>
                  Clear all
                </Button>
              )}
            </Space>
          )}
        </div>

        <div className="toolbar-right">
          <Space>
            {selectable && selectedRowKeys.length > 0 && (
              <Badge count={selectedRowKeys.length} color="#1890ff">
                <Button icon={<SettingOutlined />}>Bulk Actions</Button>
              </Badge>
            )}

            {onRefresh && (
              <Tooltip title="Refresh">
                <Button icon={<ReloadOutlined />} onClick={onRefresh} />
              </Tooltip>
            )}

            {exportable && (
              <Dropdown
                menu={{
                  items: exportMenuItems,
                  onClick: ({ key }) => onExport?.(key as 'csv' | 'xlsx' | 'pdf'),
                }}
                trigger={['click']}
              >
                <Button icon={<DownloadOutlined />}>Export</Button>
              </Dropdown>
            )}

            {onSettings && (
              <Tooltip title="Table Settings">
                <Button icon={<SettingOutlined />} onClick={onSettings} />
              </Tooltip>
            )}

            {moreActionsItems.length > 0 && (
              <Dropdown menu={{ items: moreActionsItems }} trigger={['click']}>
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </Space>
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    if (!title && !primaryAction) return null;

    return (
      <div className="table-header">
        {title && (
          <Title className="table-title" level={3}>
            {title}
          </Title>
        )}
        {primaryAction && (
          <Button type="primary" icon={primaryAction.icon} onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
      </div>
    );
  };

  const renderEmpty = () => {
    if (!emptyState) {
      return <Empty image={<TableOutlined className="empty-icon" />} description="No data available" />;
    }

    return (
      <div className="empty-state">
        {emptyState.icon && <div className="empty-icon">{emptyState.icon}</div>}
        {emptyState.title && <div className="empty-title">{emptyState.title}</div>}
        {emptyState.description && <div className="empty-description">{emptyState.description}</div>}
        {emptyState.action}
      </div>
    );
  };

  const rowSelection = selectable
    ? {
        selectedRowKeys,
        onChange: onRowSelectionChange,
        preserveSelectedRowKeys: true,
      }
    : undefined;

  return (
    <TableContainer className={className}>
      <div className="enhanced-data-table">
        {renderHeader()}
        {renderToolbar()}

        <Card bordered={false} style={{ borderRadius: 8 }}>
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowSelection={rowSelection}
            locale={{ emptyText: renderEmpty() }}
            size={compact ? 'small' : 'middle'}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['10', '25', '50', '100'],
              defaultPageSize: 25,
            }}
            scroll={{ x: 'max-content' }}
            {...tableProps}
          />
        </Card>
      </div>
    </TableContainer>
  );
};

export default DataTable;
