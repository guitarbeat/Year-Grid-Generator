import { AppConfig } from '../../../types';
import { MonthData } from '../../../hooks/useGridData';

export interface LayoutGroup {
  id: string;
  label?: string;
  months: MonthData[];
}

export interface LayoutStrategy {
  calculateLayout(months: MonthData[], config: AppConfig): LayoutGroup[];
}
