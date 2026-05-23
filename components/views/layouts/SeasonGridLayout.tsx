import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutProps } from '../types';
import { seasonStrategy } from './strategies';

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

export const SeasonGridLayout: React.FC<LayoutProps> = ({ config, months, renderMonth, renderSideAxis }) => {
  const { 
    mode, 
    gap, 
    dotSize, 
    fontSize,
    colors,
    radius,
    monthsPerRow = 3, 
    blockAlignment = 'top',
    showSeasonLabels,
    seasonsSideBySide,
    showSideDayAxis
  } = config;

  const grouped = useMemo(() => seasonStrategy.calculateLayout(months, config), [months, config]);

  const gridColsClass = 'grid grid-cols-4';

  const renderOuterSideAxis = showSideDayAxis && mode === 'columns' && seasonsSideBySide;
  const renderInnerSideAxis = showSideDayAxis && mode === 'columns' && !seasonsSideBySide;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'start',
      gap: `${gap * 4}px`,
      width: '100%',
      justifyContent: 'center'
    }}>
      {renderOuterSideAxis && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          paddingTop: `${gap * 4 + 1}px`,
          paddingBottom: `${gap * 4 + 1}px`,
          boxSizing: 'border-box'
        }}>
          {showSeasonLabels && (
            <div style={{
              fontSize: `${fontSize * 1.3}px`,
              fontWeight: 900,
              opacity: 0,
              pointerEvents: 'none',
              userSelect: 'none',
              paddingBottom: `${gap * 2.5}px`,
              marginBottom: `${gap * 3}px`,
              borderBottom: `1.5px solid transparent`,
              textTransform: 'uppercase'
            }}>
              SPACER
            </div>
          )}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap * 4}px`
          }}>
            {renderSideAxis?.()}
          </div>
        </div>
      )}

      <motion.div 
        layout
        className={seasonsSideBySide ? gridColsClass : undefined}
        style={{ 
          display: seasonsSideBySide ? 'grid' : 'flex', 
          flexDirection: seasonsSideBySide ? undefined : 'column', 
          gap: seasonsSideBySide ? `${gap * 6}px` : `${gap * 10}px`, 
          flex: 1,
          alignItems: seasonsSideBySide ? 'start' : (blockAlignment === 'top' ? 'start' : 'center'),
          width: '100%'
        }}
      >
        {grouped.map((g, idx) => (
          <motion.div 
            layout
            key={g.id} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: `${gap * 4}px`,
              backgroundColor: `${colors.text}05`,
              padding: `${gap * 4}px`,
              borderRadius: `${radius * 2}px`,
              border: `1px solid ${colors.text}08`,
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {showSeasonLabels && (
              <motion.div layout style={{ 
                fontSize: `${fontSize * 1.3}px`, 
                fontWeight: 900, 
                letterSpacing: '0.2em', 
                opacity: 0.35,
                textAlign: 'center',
                borderBottom: `1px solid ${colors.text}15`,
                paddingBottom: `${gap * 2.5}px`,
                marginBottom: `${gap * 3}px`,
                textTransform: 'uppercase'
              }}>
                {g.label}
              </motion.div>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: blockAlignment === 'top' ? 'start' : 'center',
              gap: `${gap * 4}px`,
              justifyContent: 'center',
              width: '100%'
            }}>
              {renderInnerSideAxis && renderSideAxis?.()}
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
                  {g.months.map(m => renderMonth(m))}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
