import { useMemo } from 'react';
import { AppConfig } from '../types';
import { getWeekNumber, monthNames } from '../utils/dateUtils';
import { getDimmedColor } from '../utils/colorUtils';

export interface WeekData {
  weekNum: number;
  color: string;
  identifier: string; // Add identifier for robust matching e.g., year-weekNum
}

export interface MonthData {
  year: number;
  month: number;
  name: string;
  daysInMonth: number;
  weeksInMonth: WeekData[];
  startOffset: number;
}

export const useGridData = (targetDate: Date, config: AppConfig): MonthData[] => {
  const {
    startFromJan,
    monthOffset = 0,
    monthsToShow = 12,
    isMondayFirst,
    colors,
    dimPastDays,
    dimPastDaysStrength = 50,
    overrides
  } = config;

  return useMemo(() => {
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth();
    const currentWeekNumber = getWeekNumber(targetDate);
    
    const result: MonthData[] = [];
    const effectiveOffset = (startFromJan ? -currentMonth + (monthOffset * 12) : monthOffset);
    
    for (let i = effectiveOffset; i < effectiveOffset + monthsToShow; i++) {
      let targetMonthIndex = currentMonth + i;
      const year = currentYear + Math.floor(targetMonthIndex / 12);
      const month = ((targetMonthIndex % 12) + 12) % 12;

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const startOffset = (firstDayOfMonth - (isMondayFirst ? 1 : 0) + 7) % 7;

      // Group weeks that start in this month
      const weeksInMonth: WeekData[] = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        if (d.getDay() === (isMondayFirst ? 1 : 0) || day === 1) {
          const weekNum = getWeekNumber(d);
          const isPast = year < currentYear || (year === currentYear && weekNum < currentWeekNumber);
          const isToday = year === currentYear && weekNum === currentWeekNumber;
          
          let color = colors.futureDay;
          const id = `week-${year}-${weekNum}`;
          if (overrides[id]) {
            color = colors[overrides[id] as keyof typeof colors] || overrides[id];
          } else if (isToday) {
            color = colors.today;
          } else if (isPast) {
            color = getDimmedColor(colors.pastDay, dimPastDaysStrength, dimPastDays);
          }

          if (!weeksInMonth.find(w => w.weekNum === weekNum)) {
            weeksInMonth.push({ weekNum, color, identifier: `${year}-${weekNum}` });
          }
        }
      }

      result.push({
        year,
        month,
        name: monthNames[month],
        daysInMonth,
        weeksInMonth,
        startOffset
      });
    }
    return result;
  }, [
    targetDate, 
    startFromJan, 
    monthOffset, 
    monthsToShow, 
    isMondayFirst, 
    colors, 
    dimPastDays, 
    dimPastDaysStrength, 
    overrides
  ]);
};
