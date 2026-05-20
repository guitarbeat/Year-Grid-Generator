export const getWeekNumber = (d: Date) => {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
};

export const getSeason = (month: number) => {
  if (month >= 2 && month <= 4) return 'SPRING';
  if (month >= 5 && month <= 7) return 'SUMMER';
  if (month >= 8 && month <= 10) return 'FALL';
  return 'WINTER';
};

export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface SeasonGroup<T> {
  season: string;
  months: T[];
}

export const SEASONS_ORDER = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const;

export function groupMonthsBySeason<T = any>(months: T[]): SeasonGroup<T>[] {
  const list = months as any[];
  return SEASONS_ORDER.map(s => {
    const seasonMonths = list
      .filter(m => m && m.season === s)
      .sort((a, b) => {
        const wA = (a.month + 1) % 12;
        const wB = (b.month + 1) % 12;
        return wA - wB;
      });
    return { season: s, months: seasonMonths };
  }).filter(g => g.months.length > 0);
}
