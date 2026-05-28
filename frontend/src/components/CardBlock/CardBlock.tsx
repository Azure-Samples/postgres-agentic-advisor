import React from 'react';
import { Calendar } from '@/components/Calendar';
import {
  CardBlockContainer,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderText,
  CardTitle,
} from './CardBlock.styles';

export interface CardBlockProps {
  title: string;
  description?: string;
  showCalendar?: boolean;
  calendarLabel?: string;
  selectedDate?: Date | string | null;
  onDateChange?: (date: Date) => void;
  onCalendarClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const CardBlock: React.FC<CardBlockProps> = ({
  title,
  description,
  showCalendar,
  calendarLabel = 'Today',
  selectedDate,
  onDateChange,
  onCalendarClick,
  children,
  className,
}) => {
  return (
    <CardBlockContainer className={className}>
      <CardHeader>
        <CardHeaderText>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeaderText>
        {showCalendar && (
          <Calendar
            value={selectedDate}
            placeholder={calendarLabel}
            onChange={(date) => {
              onDateChange?.(date);
              onCalendarClick?.();
            }}
          />
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </CardBlockContainer>
  );
};

export default CardBlock;
