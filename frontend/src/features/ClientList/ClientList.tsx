import React from 'react';
import { Table, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ClientListWrapper, SkeletonCell, SkeletonAvatarCircle } from './ClientList.styles';
import { GrowthSparkline } from './GrowthSparkline';
import { ChipList } from '@/components/ChipList';
import { RiskProfileIcon } from '@/icons';
import { Pagination } from './Pagination';
import { getAvatarColor, getInitials } from '@/utils/clientAvatarMap';
import { formatRiskProfile } from '@/utils/clientUtils';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ClientListRow {
  id: number;
  name: string;
  avatar?: string;
  netWorth: string;
  growthPercent: number;
  growthSeries: number[];
  /** Raw sector string from the API — e.g. "Information Technology", "Financials", "Industrials" */
  topSector: string;
  holdings: string[];
  /** Raw risk profile string from the API — e.g. "Growth-oriented", "Conservative", "Balanced" */
  riskProfile: string;
}

export interface ClientListProps {
  data: ClientListRow[];
  isLoading?: boolean;
  /** Total number of records on the server (for pagination). */
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// ─── Skeleton support ─────────────────────────────────────────────────────────

/** Placeholder row rendered while data is loading. */
type SkeletonRow = { _isSkeletonRow: true; id: string };

/** Union of real data rows and loading-placeholder rows. */
type TableRowType = ClientListRow | SkeletonRow;

function isSkeletonRow(row: TableRowType): row is SkeletonRow {
  return '_isSkeletonRow' in row && (row as SkeletonRow)._isSkeletonRow === true;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getRiskProfileIcon = () => <RiskProfileIcon />;

/** Converts an API sector name to a CSS-class-friendly slug.
 *  e.g. "Information Technology" → "information-technology" */
const sectorSlug = (sector: string) =>
  sector.toLowerCase().replace(/\s+/g, '-');

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: ColumnsType<TableRowType> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 74,
    align: 'center',
    render: (_, record) => {
      if (isSkeletonRow(record)) return <SkeletonCell $width="36px" style={{ margin: '0 auto' }} />;
      return record.id;
    },
  },
  {
    title: 'Client Name',
    dataIndex: 'name',
    key: 'name',
    width: 236,
    render: (_, record) => {
      if (isSkeletonRow(record)) {
        return (
          <div className="client-name">
            <SkeletonAvatarCircle />
            <SkeletonCell $width="120px" />
          </div>
        );
      }
      return (
        <div className="client-name">
          <Avatar
            size={32}
            src={record.avatar || undefined}
            style={
              !record.avatar
                ? { backgroundColor: getAvatarColor(record.name), flexShrink: 0, fontSize: 12, fontWeight: 600 }
                : { flexShrink: 0 }
            }
          >
            {!record.avatar ? getInitials(record.name) : null}
          </Avatar>
          <span className="name">{record.name}</span>
        </div>
      );
    },
  },
  {
    title: 'Net Worth',
    dataIndex: 'netWorth',
    key: 'netWorth',
    width: 140,
    render: (_, record) => {
      if (isSkeletonRow(record)) return <SkeletonCell $width="80px" />;
      return <span className="net-worth">{record.netWorth}</span>;
    },
  },
  {
    title: 'Growth',
    dataIndex: 'growthPercent',
    key: 'growth',
    width: 214,
    render: (_, record) => {
      if (isSkeletonRow(record)) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SkeletonCell $width="52px" />
            <SkeletonCell $width="70px" style={{ height: '16px' }} />
          </div>
        );
      }
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minHeight: 20,
            height: 'auto',
          }}
        >
          <span>
            {`${record.growthPercent > 0 ? '+' : ''}${record.growthPercent.toFixed(1)}%`}
          </span>
          <GrowthSparkline data={record.growthSeries} />
        </div>
      );
    },
  },
  {
    title: 'Top Sector',
    dataIndex: 'topSector',
    key: 'topSector',
    width: 150,
    render: (_, record) => {
      if (isSkeletonRow(record)) {
        return (
          <SkeletonCell $width="80px" style={{ height: '24px', borderRadius: '999px' }} />
        );
      }
      return (
        <span className={`sector-pill ${sectorSlug(record.topSector)}`}>{record.topSector}</span>
      );
    },
  },
  {
    title: 'Holdings',
    dataIndex: 'holdings',
    key: 'holdings',
    width: 260,
    render: (_, record) => {
      if (isSkeletonRow(record)) {
        return (
          <div style={{ display: 'flex', gap: 6 }}>
            <SkeletonCell $width="44px" style={{ height: '22px', borderRadius: '999px' }} />
            <SkeletonCell $width="44px" style={{ height: '22px', borderRadius: '999px' }} />
            <SkeletonCell $width="28px" style={{ height: '22px', borderRadius: '999px' }} />
          </div>
        );
      }
      return (
        <ChipList
          items={record.holdings.map((t, idx) => ({
            key: idx,
            label: t,
            variant: 'source-primary',
            size: 'sm',
          }))}
          maxVisible={3}
          size="sm"
          variant="source-primary"
          overflowLabelBuilder={(n) => `+${n}`}
        />
      );
    },
  },
  {
    title: 'Risk Profile',
    dataIndex: 'riskProfile',
    key: 'riskProfile',
    width: 160,
    render: (_, record) => {
      if (isSkeletonRow(record)) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SkeletonAvatarCircle style={{ width: 20, height: 20 }} />
            <SkeletonCell $width="80px" />
          </div>
        );
      }
      return (
        <div className="risk-profile">
          {record.riskProfile !== 'None' && getRiskProfileIcon()}
          <span>{formatRiskProfile(record.riskProfile)}</span>
        </div>
      );
    },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ClientList: React.FC<ClientListProps> = ({
  data,
  isLoading = false,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(total / pageSize) || 1;

  /** Show skeleton rows while loading; real data otherwise. */
  const dataSource: TableRowType[] = isLoading
    ? Array.from({ length: pageSize }, (_, i) => ({
        _isSkeletonRow: true as const,
        id: `sk-${i}`,
      }))
    : data;

  return (
    <ClientListWrapper>
      <div className="client-list">
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowKey={(r) => String(r.id)}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </ClientListWrapper>
  );
};

export default ClientList;
