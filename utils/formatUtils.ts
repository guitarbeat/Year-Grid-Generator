import { getWeekNumber } from './dateUtils';
import { AppConfig } from '../types';

export const getActiveCellText = (
  year: number, 
  month: number, 
  config: AppConfig,
  day?: number, 
  weekNum?: number
) => {
  const { granularity, activeLabelFormat } = config;
  let text = '';
  const d = day ? new Date(year, month, day) : new Date(year, month, 1);

  const dayNameShort = d.toLocaleDateString('default', { weekday: 'short' });
  const monthNameShort = d.toLocaleDateString('default', { month: 'short' });
  const monthNameLong = d.toLocaleDateString('default', { month: 'long' });
  const dateNum = d.getDate();
  const weekOfMonth = Math.ceil(dateNum / 7);
  const weekOfYear = getWeekNumber(d);

  if (granularity === 'month') {
    if (activeLabelFormat === 'date') text = `${dateNum}`;
    else if (activeLabelFormat === 'weekNum') text = `M${month + 1}`;
    else if (activeLabelFormat === 'dayName') text = monthNameLong;
    else if (activeLabelFormat === 'monthName') text = monthNameLong;
    else if (activeLabelFormat === 'monthDate') text = `${monthNameShort} ${year}`;
    else if (activeLabelFormat === 'full') text = `${monthNameLong} ${year}`;
  } else if (granularity === 'week' && weekNum) {
    if (activeLabelFormat === 'date') text = `W${weekNum}`;
    else if (activeLabelFormat === 'weekNum') text = `W${weekNum}`;
    else if (activeLabelFormat === 'dayName') text = `Week ${weekNum}`;
    else if (activeLabelFormat === 'monthName') text = `${monthNameShort}`;
    else if (activeLabelFormat === 'monthDate') text = `${monthNameShort} W${weekNum}`;
    else if (activeLabelFormat === 'full') text = `Week ${weekNum}, ${year}`;
  } else { 
    if (activeLabelFormat === 'date') text = `${dateNum}`;
    else if (activeLabelFormat === 'weekNum') text = `W${weekOfYear}`;
    else if (activeLabelFormat === 'dayName') text = dayNameShort;
    else if (activeLabelFormat === 'monthName') text = monthNameLong;
    else if (activeLabelFormat === 'monthDate') text = `${monthNameShort} ${dateNum}`;
    else if (activeLabelFormat === 'full') text = `${dayNameShort} Wk${weekOfMonth} ${dateNum}`;
  }

  return text;
};
