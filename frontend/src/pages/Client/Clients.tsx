import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClientList } from '@/features/ClientList';
import { clientFilterOptions, clientSortOptions, clientPageDefaults } from '@/mocks/clientPageData';
import { FilterIcon, SortIcon } from '@/icons';
import {
  ClientsWrapper,
  HeaderBar,
  HeaderDescription,
  HeaderRowOne,
  HeaderRowTwo,
  HeaderTitle,
  TypographyWrapper,
  FilterSection,
  SortSection,
} from './clients.styles';
import { Button, Search, Dropdown } from '@/components';
import { useClientsListQuery } from '@/api/hooks/useClientsQuery';
import { mapClientListItem, mapSortToApi } from '@/utils/clientUtils';
import type { ClientFilterValue } from '@/api/types/client.types';

const Clients: React.FC = () => {
  // ── Simulated date (forwarded from Dashboard via ?date=MM-DD) ──────────────
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const simulatedDate = dateParam ? `2023-${dateParam}` : undefined;

  // ── Filter / sort state ────────────────────────────────────────────────────
  const [selectedFilter, setSelectedFilter] = useState<string>(clientPageDefaults.defaultFilter);
  const [selectedSort, setSelectedSort] = useState<string>(clientPageDefaults.defaultSort);

  // ── Search state (input value + debounced value sent to the API) ───────────
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchInput);
      // Reset to page 1 whenever the search term settles
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ── Pagination state ───────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── API query ──────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useClientsListQuery({
    page: currentPage,
    page_size: pageSize,
    filter: selectedFilter as ClientFilterValue,
    sort: mapSortToApi(selectedSort),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  }, simulatedDate);

  // Map raw API items → table rows
  const tableData = useMemo(
    () => (data?.clients ?? []).map(mapClientListItem),
    [data],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (value: string | number) => {
    setSelectedFilter(value as string);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string | number) => {
    setSelectedSort(value as string);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ClientsWrapper>
      <HeaderBar>
        <HeaderRowOne>
          <TypographyWrapper>
            <HeaderTitle>Clients</HeaderTitle>
            <HeaderDescription>
              Review client movements and be ready with timely recommendations.
            </HeaderDescription>
          </TypographyWrapper>
          <Button variant="primary" size="md" disabled>
            Add New Client
          </Button>
        </HeaderRowOne>

        <HeaderRowTwo>
          <FilterSection>
            <Dropdown
              options={clientFilterOptions}
              value={selectedFilter}
              onChange={handleFilterChange}
              placeholder="Filter"
              size="md"
              renderSelected={(option) => (
                <>
                  <FilterIcon style={{ marginRight: '8px' }} />
                  <span>{option.label}</span>
                </>
              )}
            />

            <Search
              placeholder={clientPageDefaults.searchPlaceholder}
              value={searchInput}
              onChange={(value) => setSearchInput(value)}
              size="sm"
              style={{
                width: 'min(400px, 100%)',
                minWidth: '260px',
              }}
              allowClear
            />
          </FilterSection>

          <SortSection>
            <Dropdown
              options={clientSortOptions}
              value={selectedSort}
              onChange={handleSortChange}
              placeholder={clientPageDefaults.sortPlaceholder}
              size="md"
              renderSelected={(option) => (
                <>
                  <SortIcon style={{ marginRight: '8px' }} />
                  <span>{option.label}</span>
                </>
              )}
            />
          </SortSection>
        </HeaderRowTwo>
      </HeaderBar>

      <ClientList
        data={tableData}
        isLoading={isLoading || isFetching}
        total={data?.total ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </ClientsWrapper>
  );
};

export default Clients;
