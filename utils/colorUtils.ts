import { AppConfig } from '../types';

export const getDimmedColor = (color: string, dimPastDaysStrength: number, dimPastDays: boolean) => {
  if (!dimPastDays) return color;
  const opacity = Math.round((dimPastDaysStrength || 50) * 2.55).toString(16).padStart(2, '0');
  return `${color}${opacity}`;
};

export const getDayColor = (
  year: number, 
  month: number, 
  day: number, 
  config: AppConfig, 
  currentDate: Date
) => {
  const { colors, highlightWeekends, dimPastDays, dimPastDaysStrength, overrides } = config;
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  const id = `day-${year}-${month}-${day}`;
  if (overrides[id]) {
    return colors[overrides[id] as keyof typeof colors] || overrides[id];
  }

  const absCurrent = currentYear * 10000 + currentMonth * 100 + currentDay;
  const absTarget = year * 10000 + month * 100 + day;

  const isPast = absTarget < absCurrent;
  const isToday = absTarget === absCurrent;

  if (isToday) return colors.today;

  // Weekend check
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay();
  if (highlightWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return isPast ? getDimmedColor(colors.weekend, dimPastDaysStrength, dimPastDays) : colors.weekend;
  }

  if (isPast) {
    return getDimmedColor(colors.pastDay, dimPastDaysStrength, dimPastDays);
  }
  return colors.futureDay;
};
