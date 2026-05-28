import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/icons';
import { Dropdown, type DropdownOption } from '@/components/Dropdown';
import { PaginationWrapper } from './Pagination.styles';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const pageSizeOptions = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
];

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const handlePageSizeChange = (value: string | number, option: DropdownOption) => {
    onPageSizeChange(typeof value === 'string' ? parseInt(value, 10) : value);
  };

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <PaginationWrapper>
      <div className="pagination-controls">
        <div className="page-size-control">
          <Dropdown
            options={pageSizeOptions}
            value={pageSize.toString()}
            onChange={handlePageSizeChange}
            renderSelected={(option) => (
              <span className="page-size-text">Show rows: {option.label}</span>
            )}
            size="sm"
          />
        </div>
        
        <div className="navigation-controls">
          <button
            className="nav-button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
          >
            <ChevronLeftIcon />
          </button>
          
          <button
            className="nav-button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </PaginationWrapper>
  );
};

export default Pagination;