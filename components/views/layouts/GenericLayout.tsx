import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutProps } from '../types';
import { chunkedStrategy, singleGroupStrategy } from './strategies';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02
    }
  }
};

export const GenericLayout: React.FC<LayoutProps> = ({ config, months, renderMonth, renderSideAxis }) => {
  const { mode, gap, dotSize, monthsPerRow = 3, blockAlignment = 'top', groupBy } = config;

  const groupedMonths = useMemo(() => {
    // If we're not in grid mode, we don't naturally chunk by monthsPerRow
    // (though columns/rows might just be a single group for iterating)
    const strategy = (mode === 'grid' && (!groupBy || groupBy === 'none')) 
      ? chunkedStrategy 
      : singleGroupStrategy;
      
    return strategy.calculateLayout(months, config);
  }, [months, config, mode, groupBy]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 10}px`,
      width: '100%',
      alignItems: blockAlignment === 'top' ? 'start' : 'center'
    }}>
      {groupedMonths.map((group, rowIdx) => (
        <div 
          key={group.id || `row-${rowIdx}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: blockAlignment === 'top' ? 'start' : 'center',
            gap: `${gap * 4}px`,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {config.showSideDayAxis && mode === 'columns' && renderSideAxis?.()}
          <motion.div 
            layout 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: mode === 'rows' 
                ? '1fr' 
                : (mode === 'columns' ? `repeat(${monthsPerRow}, ${dotSize}px)` : `repeat(${monthsPerRow}, 1fr)`),
              gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
              flex: mode === 'columns' ? 'none' : 1,
              justifyItems: 'center',
              alignItems: blockAlignment === 'top' ? 'start' : 'center'
            }}
          >
            <AnimatePresence mode="popLayout">
              {group.months.map((m) => renderMonth(m))}
            </AnimatePresence>
          </motion.div>
        </div>
      ))}
    </div>
  );
};
