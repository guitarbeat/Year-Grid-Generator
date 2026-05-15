import React from 'react';
import { ViewProps } from './types';
import { Cell } from '../ui/Cell';
import { getActiveCellText } from '../../utils/formatUtils';
import { getDimmedColor } from '../../utils/colorUtils';

export const FlatMonths: React.FC<ViewProps> = ({ config, months, currentDate, onCellClick }) => {
  const {
    mode,
    groupBy,
    showSeasonLabels,
    showMonthAxis,
    showMonthLabels,
    gap,
    fontSize,
    colors,
    radius,
    itemsPerRow = 4,
    dotSize
  } = config;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const getMonthColor = (year: number, month: number, isToday: boolean, isPast: boolean) => {
    let color = colors.futureDay;
    const id = `month-${year}-${month}`;
    if (config.overrides[id]) {
      color = colors[config.overrides[id] as keyof typeof colors] || config.overrides[id];
    } else if (isToday) {
      color = colors.today;
    } else if (isPast) {
      color = getDimmedColor(colors.pastDay, config.dimPastDaysStrength || 50, config.dimPastDays);
    }
    return color;
  };

  const cols = mode === 'columns' ? 1 : mode === 'rows' ? 12 : itemsPerRow;

  if (groupBy === 'season') {
    const seasonsOrder = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 8}px`, width: '100%' }}>
        {seasonsOrder.map(s => {
          const seasonMonths = months
            .filter(m => m.season === s)
            .sort((a, b) => {
              const wA = (a.month + 1) % 12;
              const wB = (b.month + 1) % 12;
              return wA - wB;
            });
          if (seasonMonths.length === 0) return null;
          return (
            <div 
              key={s} 
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
                  {s}
                </div>
              )}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: mode === 'rows' ? '1fr' : `repeat(${seasonMonths.length}, auto)`,
                gap: `${gap * 4}px`, 
                justifyContent: 'center'
              }}>
                {seasonMonths.map(m => {
                  const isPast = m.year < currentYear || (m.year === currentYear && m.month < currentMonth);
                  const isToday = m.year === currentYear && m.month === currentMonth;
                  const color = getMonthColor(m.year, m.month, isToday, isPast);

                  return (
                    <div key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${gap}px` }}>
                      {showMonthAxis && <span style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5 }}>{m.name}</span>}
                      <Cell
                        id={`month-${m.year}-${m.month}`}
                        color={color}
                        dotSize={dotSize * 2.5 / 1.5} // Cell applies size = dotSize * 1.5 if isLarge. 
                        // Wait, creating custom sizing inline:
                        radius={radius}
                        fontSize={fontSize * 1.5}
                        textColor={colors.bg}
                        isActive={isToday}
                        activeText={getActiveCellText(m.year, m.month, config)}
                        fallbackText={showMonthLabels ? m.name.toUpperCase().substring(0, 3) : null}
                        config={config}
                        onCellClick={onCellClick}
                        isLarge
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, auto)`,
      gap: mode === 'grid' ? `${gap * 3}px` : `${gap * 2}px`,
      justifyContent: 'center'
    }}>
      {months.map(m => {
        const isPast = m.year < currentYear || (m.year === currentYear && m.month < currentMonth);
        const isToday = m.year === currentYear && m.month === currentMonth;
        const color = getMonthColor(m.year, m.month, isToday, isPast);

        return (
          <div key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${gap}px` }}>
            {showMonthAxis && <span style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5 }}>{m.name}</span>}
            <Cell
              id={`month-${m.year}-${m.month}`}
              color={color}
              // In Cell, isLarge uses dotSize * 1.5. To get dotSize * 2.5, pass custom dotSize
              dotSize={(dotSize * 2.5) / 1.5} 
              radius={radius}
              fontSize={fontSize * 1.3}
              textColor={colors.bg}
              isActive={isToday}
              activeText={getActiveCellText(m.year, m.month, config)}
              fallbackText={showMonthLabels ? m.name.toUpperCase().substring(0, 3) : null}
              config={config}
              onCellClick={onCellClick}
              isLarge
            />
          </div>
        );
      })}
    </div>
  );
};
