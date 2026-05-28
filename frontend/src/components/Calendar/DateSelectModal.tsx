import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, SelectedCheckIcon } from '@/icons';
import theme from '@/styles/theme';
import type { DateSelectModalProps } from './types';
import { FIXED_YEAR, MONTHS, PRESET_DATES } from './constants';
import { formatOrdinalDate, isSameDay, getCalendarGrid } from './utils';
import {
  ModalSubtitle,
  SectionLabel,
  PresetCardsRow,
  PresetCard,
  PresetCardInner,
  PresetCardIcon,
  PresetCardDate,
  PresetCardSub,
  PresetCardSelectedBadge,
  OrDivider,
  SelectCustomButton,
  BackButton,
  CalendarContainer,
  CalendarNavRow,
  CalendarNavBtn,
  CalendarMonthLabel,
  CalendarGrid,
  WeekdayLabel,
  DayCell,
  MonthPickerGrid,
  MonthPickerCell,
  FooterActions,
} from './DateSelectModal.styles';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type ModalView = 'presets' | 'custom';

/**
 * DateSelectModal
 *
 * Two-view date selection modal:
 *  - "presets" view: quick-select recommended demo dates + button to switch to custom
 *  - "custom" view: month-navigable calendar grid for any 2023 date
 *
 * The year (2023) is fixed and never shown in the UI.
 * Selections are only committed when the user clicks Done.
 */
const DateSelectModal: React.FC<DateSelectModalProps> = ({ isOpen, onClose, currentValue, onConfirm }) => {
  const [view, setView] = useState<ModalView>('presets');
  const [staged, setStaged] = useState<Date | null>(currentValue ?? PRESET_DATES[0]);
  const [viewMonth, setViewMonth] = useState<number>(currentValue?.getMonth() ?? PRESET_DATES[0].getMonth());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Reset internal state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setView('presets');
      setStaged(currentValue ?? PRESET_DATES[0]);
      setViewMonth(currentValue?.getMonth() ?? PRESET_DATES[0].getMonth());
      setShowMonthPicker(false);
    }
  }, [isOpen, currentValue]);

  const handlePresetSelect = useCallback((date: Date) => {
    setStaged((prev) => (prev && isSameDay(prev, date) ? null : date));
  }, []);

  const handleDaySelect = useCallback((date: Date) => {
    setStaged(date);
  }, []);

  const handleDone = useCallback(() => {
    if (staged) onConfirm(staged);
    onClose();
  }, [staged, onConfirm, onClose]);

  const prevMonth = useCallback(() => setViewMonth((m) => Math.max(0, m - 1)), []);
  const nextMonth = useCallback(() => setViewMonth((m) => Math.min(11, m + 1)), []);

  const monthLabel = new Date(FIXED_YEAR, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
  });

  const weeks = getCalendarGrid(FIXED_YEAR, viewMonth);

  const footer = (
    <FooterActions>
      <Button variant="outline" size="sm" onClick={onClose} htmlType="button">
        Cancel
      </Button>
      <Button variant="primary" size="sm" onClick={handleDone} htmlType="button" disabled={!staged}>
        Done
      </Button>
    </FooterActions>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Date"
      width={600}
      footer={footer}
      headerProps={{ style: { paddingBottom: 0 } }}
      bodyProps={{ style: { paddingTop: 0 } }}
      footerProps={{ style: { borderTop: 'none' } }}
    >
      <ModalSubtitle>View dashboard activity for the selected date.</ModalSubtitle>

      {view === 'presets' ? (
        <>
          <SectionLabel>Recommended Demo Dates</SectionLabel>

          <PresetCardsRow>
            {PRESET_DATES.map((date) => {
              const selected = isSameDay(date, staged);
              return (
                <PresetCard
                  key={date.toISOString()}
                  $selected={selected}
                  onClick={() => handlePresetSelect(date)}
                  type="button"
                >
                  <PresetCardInner $selected={selected}>
                    <PresetCardIcon $selected={selected}>
                      <CalendarIcon width={24} height={24} />
                    </PresetCardIcon>
                    <PresetCardDate $selected={selected}>{formatOrdinalDate(date)}</PresetCardDate>
                    {selected ? (
                      <PresetCardSelectedBadge>
                        <SelectedCheckIcon style={{ color: theme.colors.successGreen }} />
                        Selected
                      </PresetCardSelectedBadge>
                    ) : (
                      <PresetCardSub>Click to Select</PresetCardSub>
                    )}
                  </PresetCardInner>
                </PresetCard>
              );
            })}
          </PresetCardsRow>

          <OrDivider>OR</OrDivider>

          <SelectCustomButton type="button" onClick={() => setView('custom')}>
            <CalendarIcon width={16} height={16} />
            Select a Custom Date
          </SelectCustomButton>
        </>
      ) : (
        <>
          <BackButton type="button" onClick={() => setView('presets')}>
            <ChevronLeftIcon width={16} height={16} />
            Back
          </BackButton>

          <CalendarContainer>
            <CalendarNavRow>
              <CalendarNavBtn type="button" onClick={prevMonth} disabled={viewMonth === 0} aria-label="Previous month">
                <ChevronLeftIcon width={16} height={16} />
              </CalendarNavBtn>

              <CalendarMonthLabel
                type="button"
                onClick={() => setShowMonthPicker((v) => !v)}
                data-open={showMonthPicker}
              >
                {monthLabel}
                <ChevronDownIcon width={14} height={14} />
              </CalendarMonthLabel>

              <CalendarNavBtn type="button" onClick={nextMonth} disabled={viewMonth === 11} aria-label="Next month">
                <ChevronRightIcon width={16} height={16} />
              </CalendarNavBtn>
            </CalendarNavRow>

            {showMonthPicker ? (
              <MonthPickerGrid>
                {MONTHS.map((name, idx) => (
                  <MonthPickerCell
                    key={name}
                    type="button"
                    $selected={idx === viewMonth}
                    onClick={() => {
                      setViewMonth(idx);
                      setShowMonthPicker(false);
                    }}
                  >
                    {name.slice(0, 3)}
                  </MonthPickerCell>
                ))}
              </MonthPickerGrid>
            ) : (
              <CalendarGrid>
                {WEEKDAY_LABELS.map((label) => (
                  <WeekdayLabel key={label}>{label}</WeekdayLabel>
                ))}

                {weeks.flat().map((date, idx) => (
                  <DayCell
                    key={idx}
                    type="button"
                    $selected={isSameDay(date, staged)}
                    $today={isSameDay(date, currentValue)}
                    $empty={date === null}
                    onClick={() => date && handleDaySelect(date)}
                    aria-label={date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : undefined}
                    aria-pressed={isSameDay(date, staged)}
                  >
                    {date?.getDate()}
                  </DayCell>
                ))}
              </CalendarGrid>
            )}
          </CalendarContainer>
        </>
      )}
    </Modal>
  );
};

export default DateSelectModal;
