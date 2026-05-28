import styled, { css } from 'styled-components';

/** Subtitle line rendered below the modal title */
export const ModalSubtitle = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing[5]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-style: normal;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.contentTertiary};
`;

/** "Recommended Demo Dates" section heading */
export const SectionLabel = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-style: normal;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.contentTertiary};
`;

/** Two-column grid holding preset date cards */
export const PresetCardsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

/** Selectable preset date card — outer container */
export const PresetCard = styled.button<{ $selected: boolean }>`
  display: flex;
  flex: 1;
  height: 184px;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.buttonSubtle};
  transition: border-color 0.15s ease;

  ${({ $selected, theme }) =>
    $selected
      ? css`
          border: 1.5px solid ${theme.colors.primary};
        `
      : css`
          border: 1px solid ${theme.colors.presetCardBorder};

          &:hover {
            border-color: ${theme.colors.primary};
          }
        `}
`;

/** Inner content area of a preset card */
export const PresetCardInner = styled.div<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};

  ${({ $selected }) =>
    $selected
      ? css`
          background: ${({ theme }) => theme.colors.presetCardSelectedBg};
          border: 1px solid ${({ theme }) => theme.colors.presetCardSelectedBorder};
        `
      : css`
          background: ${({ theme }) => theme.colors.presetCardUnselectedBg};
        `}
`;

/** Calendar icon wrapper inside a preset card */
export const PresetCardIcon = styled.span<{ $selected: boolean }>`
  display: flex;
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.contentTertiary};
`;

/** Date label inside a preset card, e.g. "12th May" */
export const PresetCardDate = styled.span<{ $selected: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.dateLabel};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.presetDateUnselected};
`;

/** "Click to Select" helper text inside a preset card */
export const PresetCardSub = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentTertiary};
`;

/** "✓ Selected" badge shown inside a preset card when it is selected */
export const PresetCardSelectedBadge = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.successGreen};
`;

/** "OR" row with horizontal rules on each side */
export const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin: ${({ theme }) => theme.spacing[3]} 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentTertiary};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

/** Full-width outlined button that opens the custom calendar view */
export const SelectCustomButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.buttonSubtle};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.presetCardBorder};
  color: ${({ theme }) => theme.colors.dropDownText};
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

/** Back button shown at the top of the custom calendar view */
export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  margin: 0 0 ${({ theme }) => theme.spacing[4]};
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.contentTertiary};
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

/** Container around the calendar grid with a border */
export const CalendarContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

/** Month navigation row at the top of the custom calendar */
export const CalendarNavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2.5]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

/** Prev / Next arrow button for month navigation */
export const CalendarNavBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.contentTertiary};
  transition: background 0.12s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.neutralGray};
    color: ${({ theme }) => theme.colors.contentPrimary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

/** "Jun ▾" button in the calendar navigation — opens month picker */
export const CalendarMonthLabel = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentPrimary};
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background 0.12s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutralGray};
  }

  svg {
    transition: transform 0.2s ease;
  }

  &[data-open='true'] svg {
    transform: rotate(180deg);
  }
`;

/** 4-column grid shown inside the calendar when month picker is open */
export const MonthPickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
`;

/** Individual month button inside the month picker */
export const MonthPickerCell = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  ${({ $selected, theme }) =>
    $selected
      ? css`
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
          border: none;
        `
      : css`
          background: transparent;
          color: ${theme.colors.contentPrimary};
          border: 1px solid transparent;

          &:hover {
            background: ${theme.colors.neutralGray};
          }
        `}
`;

/** 7-column grid for weekday labels + day cells */
export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-items: center;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[3]};
  gap: ${({ theme }) => theme.spacing[1]};
`;

/** Mon / Tue / … column header */
export const WeekdayLabel = styled.div`
  width: 36px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentTertiary};
`;

/** Individual day cell */
export const DayCell = styled.button<{
  $selected: boolean;
  $today: boolean;
  $empty: boolean;
}>`
  width: 35px;
  height: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: ${({ $empty }) => ($empty ? 'default' : 'pointer')};
  transition: background 0.12s ease, color 0.12s ease;

  ${({ $selected, $today, $empty, theme }) => {
    if ($empty)
      return css`
        background: transparent;
        border: none;
        color: transparent;
        pointer-events: none;
      `;
    if ($selected)
      return css`
        background: ${theme.colors.primary};
        border: none;
        color: ${theme.colors.white};
        font-family: ${theme.typography.fontFamily.primary};
        font-size: ${theme.typography.fontSize.smPlus};
        font-style: normal;
        font-weight: ${theme.typography.fontWeight.semibold};
        line-height: ${theme.spacing[6]};
      `;
    if ($today)
      return css`
        background: transparent;
        border: 2px solid ${theme.colors.primary};
        color: ${theme.colors.contentPrimary};
        font-weight: ${theme.typography.fontWeight.semibold};
      `;
    return css`
      background: transparent;
      border: 2px solid transparent;
      color: ${theme.colors.contentPrimary};
      font-weight: ${theme.typography.fontWeight.normal};

      &:hover {
        background: ${theme.colors.neutralGray};
      }
    `;
  }}
`;

/** Right-aligned container for footer action buttons */
export const FooterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: flex-end;
  width: 100%;
`;
