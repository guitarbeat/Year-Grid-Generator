import React from 'react';
import { motion } from 'motion/react';
import { AppConfig } from '../../types';
import { MonthData } from '../../hooks/useGridData';

export interface ViewProps {
  config: AppConfig;
  months: MonthData[];
  currentDate: Date;
  onCellClick?: (id: string) => void;
  isDownloading?: boolean;
}

export interface LayoutProps {
  config: AppConfig;
  months: MonthData[];
  renderMonth: (month: MonthData) => React.ReactNode;
  renderSideAxis?: () => React.ReactNode;
}
