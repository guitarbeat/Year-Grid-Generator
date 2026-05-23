import React from 'react';
import { motion } from 'motion/react';
import { AppConfig } from '../../types';

export interface ViewProps {
  config: AppConfig;
  months: any[];
  currentDate: Date;
  onCellClick?: (id: string) => void;
  isDownloading?: boolean;
}

export interface LayoutProps {
  config: AppConfig;
  months: any[];
  renderMonth: (month: any) => React.ReactNode;
  renderSideAxis?: () => React.ReactNode;
}
