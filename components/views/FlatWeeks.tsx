import React from 'react';
import { ViewProps } from './types';
import { Cell } from '../ui/Cell';
import { getActiveCellText } from '../../utils/formatUtils';
import { getWeekNumber } from '../../utils/dateUtils';

export const FlatWeeks: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick }) => {
  const {
    mode,
    groupBy,
    showSeasonLabels,
    showMonthAxis,
    showWeekNumbers,
    showMonthNumbers,
    gap,
    fontSize,
    colors,
    radius,
    itemsPerRow = 13,
    monthsPerRow = 3,
    dotSize
  } = config;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentWeekNumber = getWeekNumber(currentDate);

  if (groupBy === 'season') {
    const seasonsOrder = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    const grouped = seasonsOrder.map(s => ({
      season: s,
      months: months.filter(m => m.season === s).sort((a, b) => {
        const wA = (a.month + 1) % 12;
        const wB = (b.month + 1) % 12;
        return wA - wB;
      })
    })).filter(g => g.months.length > 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 8}px`, width: '100%' }}>
        {grouped.map(g => (
          <div 
            key={g.season} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: `${gap * 4}px`,
              backgroundColor: `${colors.text}05`,
              padding: `${gap * 4}px`,
              borderRadius: `${radius * 2}px`,
              border: `1px solid ${colors.text}08`
            }}
          >
            {showSeasonLabels && (
              <div style={{ 
                fontSize: `${fontSize * 1.5}px`, 
                fontWeight: 900, 
                opacity: 0.2, 
                textAlign: 'center',
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}>
                {g.season}
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: `${gap * 6}px`, 
              justifyContent: 'center'
            }}>
              {g.months.map(m => (
                 <div key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, alignItems: 'center' }}>
                  {showMonthAxis && <span style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5 }}>{m.name}</span>}
                  <div style={{ display: 'flex', flexDirection: mode === 'columns' ? 'column' : 'row', gap: `${gap}px` }}>
                    {m.weeksInMonth.map(w => (
                       <Cell
                        key={w.weekNum}
                        id={`week-${m.year}-${w.weekNum}`}
                        color={w.color}
                        dotSize={dotSize}
                        radius={radius}
                        fontSize={fontSize}
                        textColor={colors.bg}
                        isActive={m.year === currentYear && w.weekNum === currentWeekNumber}
                        activeText={getActiveCellText(m.year, m.month, config, undefined, w.weekNum)}
                        fallbackText={showWeekNumbers ? w.weekNum : (showMonthNumbers ? m.month + 1 : null)}
                        config={config}
                        onCellClick={onCellClick}
                        isLarge
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If showMonthAxis is on, we'll use a grouped approach to show month labels
  if (showMonthAxis) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${monthsPerRow}, auto)`,
        gap: `${gap * 4}px`,
        justifyContent: 'center'
      }}>
        {months.map(m => (
          <div key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, alignItems: 'center' }}>
            <span style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5 }}>{m.name}</span>
            <div style={{ display: 'flex', flexDirection: mode === 'columns' ? 'column' : 'row', gap: `${gap}px` }}>
              {m.weeksInMonth.map(w => (
                 <Cell
                  key={w.weekNum}
                  id={`week-${m.year}-${w.weekNum}`}
                  color={w.color}
                  dotSize={dotSize}
                  radius={radius}
                  fontSize={fontSize}
                  textColor={colors.bg}
                  isActive={m.year === currentYear && w.weekNum === currentWeekNumber}
                  activeText={getActiveCellText(m.year, m.month, config, undefined, w.weekNum)}
                  fallbackText={showWeekNumbers ? w.weekNum : (showMonthNumbers ? m.month + 1 : null)}
                  config={config}
                  onCellClick={onCellClick}
                  isLarge
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fully flat weeks
  const allWeeks = months.flatMap(m => m.weeksInMonth.map(w => ({ ...w, month: m.month, year: m.year })));
  const cols = mode === 'columns' ? 1 : mode === 'rows' ? 52 : itemsPerRow;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, auto)`,
      gap: `${gap}px`,
      justifyContent: 'center'
    }}>
      {allWeeks.map((w, i) => (
        <Cell
          key={`${w.identifier}-${i}`}
          id={`week-${w.year}-${w.weekNum}`}
          color={w.color}
          dotSize={dotSize}
          radius={radius}
          fontSize={fontSize}
          textColor={colors.bg}
          isActive={w.year === currentYear && w.weekNum === currentWeekNumber}
          activeText={getActiveCellText(currentYear, currentMonth, config, undefined, currentWeekNumber)}
          fallbackText={showWeekNumbers ? w.weekNum : null}
          config={config}
          onCellClick={onCellClick}
          isLarge
        />
      ))}
    </div>
  );
};
