import { AppConfig } from '../../../types';

export interface LayoutGroup {
  id: string;
  label?: string;
  months: any[];
}

export interface LayoutStrategy {
  calculateLayout(months: any[], config: AppConfig): LayoutGroup[];
}
