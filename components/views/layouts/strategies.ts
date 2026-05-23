import { LayoutStrategy, LayoutGroup } from './types';
import { groupMonthsBySeason } from '../../../utils/dateUtils';

export const chunkedStrategy: LayoutStrategy = {
  calculateLayout: (months, config) => {
    const { monthsPerRow = 3 } = config;
    const chunks: LayoutGroup[] = [];
    for (let i = 0; i < months.length; i += monthsPerRow) {
      chunks.push({
        id: `chunk-${i}`,
        months: months.slice(i, i + monthsPerRow)
      });
    }
    return chunks;
  }
};

export const singleGroupStrategy: LayoutStrategy = {
  calculateLayout: (months) => {
    return [{
      id: 'all-months',
      months
    }];
  }
};

export const seasonStrategy: LayoutStrategy = {
  calculateLayout: (months, config) => {
    const grouped = groupMonthsBySeason(months);
    return grouped.map(g => ({
      id: `season-${g.season}`,
      label: g.season,
      months: g.months
    }));
  }
};
