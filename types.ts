export interface AppColors {
  bg: string;
  text: string;
  empty: string;
  fill: string;
  // New colors from Scriptable script
  pastDay: string;
  futureDay: string;
  today: string;
  significant: string;
  weekend: string;
  stats: string;
}

export interface AppConfig {
  date: string; // YYYY-MM-DD
  mode: 'grid' | 'rows' | 'columns' | 'timeline';
  granularity: 'day' | 'week' | 'month';
  itemsPerRow: number;
  isMondayFirst: boolean;
  showYearLabel: boolean;
  dotSize: number;
  gap: number;
  radius: number;
  fontSize: number;
  fontFamily: string;
  colors: AppColors;
  transparentBg: boolean;
  monthsToShow: number;
  monthsPerRow: number;
  monthOffset: number;
  showDayNumbers: boolean;
  highlightWeekends: boolean;
  dimPastDays: boolean;
  showStats: boolean;
  startFromJan: boolean;
}

export interface DayData {
  date?: Date;
  label: string;
  filled: boolean;
  active?: boolean;
  // For Day view specific metadata
  dayOfWeek?: number;
  month?: number;
  weekIndex?: number; // New property
}