import React, { useState, useMemo } from 'react';
import { CalendarIcon, ChevronDownIcon } from '@/icons';
import { CalendarWrapper, CalendarTriggerButton } from './Calendar.styles';
import type { CalendarProps } from './types';
import { parseDateValue, isSameDay, getTodayDate } from './utils';
import { DEFAULT_PLACEHOLDER, CALENDAR_FORMAT_OPTIONS } from './constants';
import DateSelectModal from './DateSelectModal';

/**
 * Calendar
 *
 * A controlled date-picker that opens a modal on click.
 * The trigger button shows the currently selected date (without year).
 * All date selection logic lives inside DateSelectModal.
 *
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date | null>(null);
 * return <Calendar value={date} onChange={setDate} />;
 * ```
 */
export const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  id,
  disabled = false,
  className,
  style,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedDate = useMemo(() => (value === null ? null : (parseDateValue(value) ?? null)), [value]);

  const formattedLabel = useMemo(() => {
    if (!selectedDate) return placeholder;
    if (isSameDay(selectedDate, getTodayDate())) return 'Today';
    return selectedDate.toLocaleDateString('en-US', CALENDAR_FORMAT_OPTIONS);
  }, [selectedDate, placeholder]);

  const handleConfirm = (date: Date) => {
    onChange?.(date);
    setIsModalOpen(false);
  };

  return (
    <CalendarWrapper className={className}>
      <CalendarTriggerButton
        type="button"
        id={id}
        style={style}
        disabled={disabled}
        onClick={() => !disabled && setIsModalOpen(true)}
        aria-label={`Select date, currently ${formattedLabel}`}
        aria-haspopup="dialog"
        data-testid="calendar-trigger"
      >
        <CalendarIcon role="presentation" />
        <span>{formattedLabel}</span>
        <ChevronDownIcon role="presentation" />
      </CalendarTriggerButton>

      <DateSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentValue={selectedDate}
        onConfirm={handleConfirm}
      />
    </CalendarWrapper>
  );
};
