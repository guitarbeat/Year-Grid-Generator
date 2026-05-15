import React from 'react';
import { motion } from 'motion/react';
import { AppConfig } from '../../types';

export interface ViewProps {
  config: AppConfig;
  months: any[];
  currentDate: Date;
  onCellClick?: (id: string) => void;
}
