import styled from 'styled-components';

export const HistoryTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  color: ${({ theme }) => theme.colors.contentSecondary};
  margin: 0;
  flex-shrink: 0;
  text-align: left;
`;

export const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  height: ${({ theme }) => theme.layout.searchInputHeight};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  flex-shrink: 0;
`;

export const SearchIconWrap = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.inputPlaceholder};
  background: transparent;
  &::placeholder {
    color: ${({ theme }) => theme.colors.inputPlaceholder};
  }
`;

export const GroupLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.historyLabel};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeight.loose};
`;

export const GroupSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
`;

export const TileWrapper = styled.div`
  position: relative;
`;

export const HistoryTileRow = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ $isActive, theme }) => ($isActive ? theme.colors.cardBorder : theme.colors.neutralGray)};
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.cardBorder};

    > button {
      opacity: 1;
    }
  }
`;

export const TileLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  flex: 1;
  min-width: 0;

  svg {
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

export const TileTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const TileDate = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.historyLabel};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

export const TileTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.contentSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TileMoreButton = styled.button<{ $menuOpen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing[6]};
  height: ${({ theme }) => theme.spacing[6]};
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  flex-shrink: 0;
  opacity: ${({ $menuOpen }) => ($menuOpen ? 1 : 0)};
  transition: opacity 0.15s ease;
  padding: 0;

  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonHoverOverlay};
  }
`;

export const TileDropdown = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => theme.spacing[1]});
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.nav};
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  min-width: ${({ theme }) => theme.layout.tileDropdownMinWidth};
  overflow: hidden;
`;

export const TileDropdownItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ $danger, theme }) => ($danger ? theme.colors.dangerText : theme.colors.contentSecondary)};
  text-align: left;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.neutralGray};
  }
`;

export const RenameInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  border-bottom: ${({ theme }) => theme.layout.renameBorderWidth} solid ${({ theme }) => theme.colors.primary};
  outline: none;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.contentSecondary};
  padding: 0 ${({ theme }) => theme.spacing[0.5]};
`;

export const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing[6]};
  height: ${({ theme }) => theme.spacing[6]};
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  flex-shrink: 0;
  padding: 0;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.chipPrimaryBg};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
