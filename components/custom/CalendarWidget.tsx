"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarWidget({
  onDateSelect,
  selectedDate: selectedDateProp,
}: {
  onDateSelect?: (day: number) => void;
  selectedDate?: number | null;
} = {}) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [internalSelected, setInternalSelected] = useState<number | null>(null);

  const selectedDate = selectedDateProp !== undefined ? selectedDateProp : internalSelected;
  const handleDateSelect = (day: number) => {
    setInternalSelected(day);
    onDateSelect?.(day);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Previous month days to fill
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: { day: number; isCurrentMonth: boolean }[] = [];

    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    return days;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfMonth, prevMonthDays]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="p-4 bg-surface rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold font-headline">
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <div className="flex gap-2">
          <button
            onClick={goToPrevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-container transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-container transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] font-bold text-on-surface-variant uppercase font-label py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((item, i) => (
          <button
            key={i}
            disabled={!item.isCurrentMonth}
            onClick={() => item.isCurrentMonth && handleDateSelect(item.day)}
            className={`text-xs py-2 rounded-md transition-colors ${
              !item.isCurrentMonth
                ? "text-outline/40 cursor-default"
                : selectedDate === item.day
                ? "bg-primary text-white font-bold shadow-md"
                : "hover:bg-primary/10 cursor-pointer"
            }`}
          >
            {item.day}
          </button>
        ))}
      </div>
    </div>
  );
}
