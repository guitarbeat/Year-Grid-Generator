import React from 'react';
import { motion } from 'motion/react';
import { ViewProps } from './types';
import { Cell } from '../ui/Cell';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDayColor } from '../../utils/colorUtils';
import { getWeekNumber } from '../../utils/dateUtils';

export const Timeline: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick }) => {
  const {
    granularity,
    showMonthAxis,
    showWeekdayAxis,
    showDayNumbers,
    showWeekNumbers,
    gap,
    fontSize,
    colors,
    radius,
    dotSize,
    isMondayFirst
  } = config;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 4}px` }}>
      {months.map(m => {
        const hasWeekdayAxis = granularity === 'day' && showWeekdayAxis;
        return (
          <div key={`${m.year}-${m.month}`} style={{ display: 'flex', gap: `${gap * 2}px`, alignItems: 'center' }}>
            {showMonthAxis && (
              <div style={{ minWidth: `${fontSize * 5}px`, fontSize: `${fontSize}px`, fontWeight: 'bold', color: colors.text, opacity: 0.8 }}>
                {m.name}
              </div>
            )}
            <div style={{ display: 'flex', gap: `${gap}px` }}>
              {granularity === 'day' && m.startOffset > 0 && Array.from({ length: m.startOffset }).map((_, i) => (
                <div key={`empty-${i}`} style={{ width: dotSize, height: dotSize }} />
              ))}
              
              {granularity === 'day' && Array.from({ length: m.daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateObj = new Date(m.year, m.month, day);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                const color = getDayColor(m.year, m.month, day, config, currentDate);
                return (
                  <div key={`day-${day}`} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                    {hasWeekdayAxis && (
                      <span style={{ fontSize: `${fontSize * 0.7}px`, opacity: 0.5, fontWeight: 'bold', fontFamily: 'JetBrains Mono, monospace' }}>
                        {dayName}
                      </span>
                    )}
                    <Cell
                      id={`day-${m.year}-${m.month}-${day}`}
                      color={showDayNumbers ? 'transparent' : color}
                      dotSize={dotSize}
                      radius={radius}
                      fontSize={fontSize}
                      textColor={showDayNumbers ? color : colors.bg}
                      isActive={(m.year * 10000 + m.month * 100 + day) === (currentYear * 10000 + currentMonth * 100 + currentDate.getDate())}
                      activeText={getActiveCellText(m.year, m.month, config, day)}
                      fallbackText={showDayNumbers ? day : null}
                      config={config}
                      onCellClick={onCellClick}
                    />
                  </div>
                );
              })}

              {granularity === 'week' && m.weeksInMonth.map((w: any) => (
                <Cell
                  key={`week-${w.weekNum}`}
                  id={`week-${m.year}-${w.weekNum}`}
                  color={w.color}
                  dotSize={dotSize}
                  radius={radius}
                  fontSize={fontSize}
                  textColor={colors.bg}
                  isActive={m.year === currentYear && w.weekNum === getWeekNumber(currentDate)}
                  activeText={getActiveCellText(m.year, m.month, config, undefined, w.weekNum)}
                  fallbackText={showWeekNumbers ? w.weekNum : null}
                  config={config}
                  onCellClick={onCellClick}
                  isLarge
                />
              ))}

            </div>
          </div>
        );
      })}
    </div>
  );
};
