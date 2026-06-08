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
  config: Pick<AppConfig, 'colors' | 'highlightWeekends' | 'dimPastDays' | 'dimPastDaysStrength' | 'overrides'>, 
  absCurrent: number
) => {

  const { colors, highlightWeekends, dimPastDays, dimPastDaysStrength, overrides } = config;
  
  const id = `day-${year}-${month}-${day}`;
  if (overrides[id]) {
    const val = overrides[id];
    const colorKey = val.includes('|') ? val.split('|')[0] : val;
    return colors[colorKey as keyof typeof colors] || colorKey;
  }

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
