import React from 'react';
import { LayoutProps } from './types';
import { GenericLayout } from './GenericLayout';
import { SeasonGridLayout } from './SeasonGridLayout';

export const getLayoutStrategyRenderer = (groupBy?: string): React.FC<LayoutProps> => {
  const layouts: Record<string, React.FC<LayoutProps>> = {
    season: SeasonGridLayout,
    none: GenericLayout,
    chunked: GenericLayout
  };

  return layouts[groupBy || 'none'] || GenericLayout;
};
