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
  linkFontDotSize: boolean;
  fontFamily: string;
  colors: AppColors;
  transparentBg: boolean;
  monthsToShow: number;
  monthsPerRow: number;
  showDayNumbers: boolean;
  showWeekNumbers: boolean;
  showMonthNumbers: boolean;
  showMonthLabels: boolean;
  showMonthAxis: boolean;
  showWeekdayAxis: boolean;
  highlightWeekends: boolean;
  dimPastDays: boolean;
  dimPastDaysStrength: number;
  showStats: boolean;
  showActiveLabel: boolean;
  activeLabelFormat: 'date' | 'weekNum' | 'dayName' | 'monthName' | 'monthDate' | 'full';
  startFromJan: boolean;
  groupBy: 'none' | 'day' | 'week' | 'month' | 'season';
  showSeasonLabels: boolean;
  // Visual refinement
  customTitle?: string;
  assetFormat: 'auto' | 'square' | 'ios-widget' | 'ios-wallpaper';
  density: 'compact' | 'normal' | 'spacious';
  resolutionScale: 1 | 2 | 3 | 4;
  overrides: Record<string, string>;
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