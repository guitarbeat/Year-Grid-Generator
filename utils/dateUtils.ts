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

export const getSeasonGroupInfo = (year: number, month: number) => {
  const season = getSeason(month);
  if (season === 'WINTER') {
    if (month === 11) { // December
      return {
        seasonKey: `WINTER ${year}-${year + 1}`,
        sortTime: new Date(year, 11, 1).getTime()
      };
    } else { // January or February
      return {
        seasonKey: `WINTER ${year - 1}-${year}`,
        sortTime: new Date(year - 1, 11, 1).getTime()
      };
    }
  } else {
    // SPRING, SUMMER, FALL
    const startMonth = season === 'SPRING' ? 2 : season === 'SUMMER' ? 5 : 8;
    return {
      seasonKey: `${season} ${year}`,
      sortTime: new Date(year, startMonth, 1).getTime()
    };
  }
};

export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface SeasonGroup<T> {
  season: string;
  months: T[];
}

export const SEASONS_ORDER = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const;

export function groupMonthsBySeason<T = any>(months: T[]): SeasonGroup<T>[] {
  const list = months as any[];
  const groupsMap = new Map<string, { sortTime: number; months: any[] }>();

  for (const m of list) {
    if (!m) continue;
    const { seasonKey, sortTime } = getSeasonGroupInfo(m.year, m.month);
    if (!groupsMap.has(seasonKey)) {
      groupsMap.set(seasonKey, { sortTime, months: [] });
    }
    groupsMap.get(seasonKey)!.months.push(m);
  }

  return Array.from(groupsMap.entries())
    .map(([key, value]) => {
      const sortedMonths = value.months.sort((a, b) => {
        return (a.year * 12 + a.month) - (b.year * 12 + b.month);
      });
      return {
        season: key,
        months: sortedMonths
      };
    })
    .sort((a, b) => {
      const timeA = groupsMap.get(a.season)!.sortTime;
      const timeB = groupsMap.get(b.season)!.sortTime;
      return timeA - timeB;
    });
}
