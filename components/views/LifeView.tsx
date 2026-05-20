import React from 'react';
import { ViewProps } from './types';
import { Cell } from '../ui/Cell';
import { getDimmedColor } from '../../utils/colorUtils';

export const LifeView: React.FC<ViewProps> = ({ config, currentDate, onCellClick }) => {
  const {
    birthDate = '2000-01-01',
    lifeExpectancy = 80,
    lifeGranularity = 'week',
    colors,
    dotSize,
    gap,
    radius,
    fontSize,
    overrides = {},
    showLifeStats = true
  } = config;

  // 1. Parse dates safely
  const birth = React.useMemo(() => {
    const d = new Date(birthDate);
    return isNaN(d.getTime()) ? new Date('2000-01-01') : d;
  }, [birthDate]);

  const now = currentDate || new Date();

  // 2. Calculations based on granularity
  const isWeekGranular = lifeGranularity === 'week';
  
  const totalUnits = isWeekGranular ? lifeExpectancy * 52 : lifeExpectancy * 12;
  const unitsPerYear = isWeekGranular ? 52 : 12;

  // Elapsed units since birth
  const elapsedUnits = React.useMemo(() => {
    if (now < birth) return 0;
    
    if (isWeekGranular) {
      const msDiff = now.getTime() - birth.getTime();
      const weeks = Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000));
      return Math.min(totalUnits - 1, Math.max(0, weeks));
    } else {
      // Month-based calculation
      const yearsDiff = now.getFullYear() - birth.getFullYear();
      const monthsDiff = now.getMonth() - birth.getMonth();
      const months = (yearsDiff * 12) + monthsDiff;
      return Math.min(totalUnits - 1, Math.max(0, months));
    }
  }, [birth, now, isWeekGranular, totalUnits]);

  // Render rows representing years
  const rows = [];
  for (let year = 0; year < lifeExpectancy; year++) {
    const cells = [];
    for (let unit = 0; unit < unitsPerYear; unit++) {
      const globalIndex = (year * unitsPerYear) + unit;
      const cellId = `life-${isWeekGranular ? 'W' : 'M'}-${globalIndex}`;
      
      const isPast = globalIndex < elapsedUnits;
      const isCurrent = globalIndex === elapsedUnits;
      
      // Determine dot color
      let color = colors.futureDay; // Unfilled/future Default
      
      if (overrides[cellId]) {
        // Custom override applied by user clicking cell
        color = colors[overrides[cellId] as keyof typeof colors] || overrides[cellId];
      } else if (isCurrent) {
        color = colors.today;
      } else if (isPast) {
        color = colors.fill || colors.pastDay;
        // Optionally apply a very subtle dimming or keep it elegant
        if (config.dimPastDays) {
          color = getDimmedColor(color, config.dimPastDaysStrength || 40, true);
        }
      } else {
        color = colors.empty;
      }

      // Readable label for the tooltip
      let activeText = '';
      if (isWeekGranular) {
        const ageNum = Math.floor(globalIndex / 52);
        const weekNum = (globalIndex % 52) + 1;
        activeText = `Age ${ageNum}, Week ${weekNum}`;
        if (isCurrent) activeText += ' (CURRENT)';
      } else {
        const ageNum = Math.floor(globalIndex / 12);
        const monthNum = (globalIndex % 12) + 1;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        activeText = `Age ${ageNum}, ${monthNames[monthNum - 1] || monthNum}`;
        if (isCurrent) activeText += ' (CURRENT)';
      }

      cells.push({
        id: cellId,
        color,
        isActive: isCurrent,
        activeText,
        unitNum: unit + 1,
        year
      });
    }
    rows.push({
      year,
      cells
    });
  }

  // Calculate live stats
  const percentageLived = Math.min(100, Math.max(0, (elapsedUnits / totalUnits) * 100));
  const unitsRemaining = Math.max(0, totalUnits - elapsedUnits);

  return (
    <div className="flex flex-col items-center w-full" style={{ gap: `${gap * 3}px` }}>
      
      {/* Legend / Status bar inside the component */}
      <div className="flex items-center gap-6 text-[10px] uppercase tracking-wider font-mono opacity-60 mb-2">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, backgroundColor: colors.fill || colors.pastDay, borderRadius: radius }} />
          <span>Lived</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="animate-pulse" style={{ width: 8, height: 8, backgroundColor: colors.today, borderRadius: radius }} />
          <span>This {isWeekGranular ? 'Week' : 'Month'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, backgroundColor: colors.empty, borderRadius: radius }} />
          <span>Future</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, backgroundColor: colors.significant, borderRadius: radius }} />
          <span>Milestone (Click)</span>
        </div>
      </div>

      {/* Main Matrix Grid wrapper */}
      <div className="flex flex-col gap-0.5 select-none" style={{ gap: `${gap}px` }}>
        {/* Top Header Row of column indices (optional labels, spaced out) */}
        <div className="flex items-center font-mono opacity-40 text-[7px]" style={{ gap: `${gap}px` }}>
          {/* Spacer for row numbering width */}
          <div className="w-8 text-right pr-2" />
          {Array.from({ length: unitsPerYear }).map((_, colIdx) => (
            <div 
              key={colIdx} 
              style={{ 
                width: `${dotSize}px`, 
                textAlign: 'center',
                visibility: (colIdx === 0 || colIdx === unitsPerYear - 1 || (colIdx + 1) % 10 === 0) ? 'visible' : 'hidden' 
              }}
            >
              {colIdx + 1}
            </div>
          ))}
        </div>

        {/* Year Rows */}
        {rows.map((r) => {
          // Highlight decade starts or label them clearly
          const isDecadeStart = r.year % 10 === 0;
          
          return (
            <div 
              key={r.year} 
              className="flex items-center" 
              style={{ gap: `${gap}px` }}
            >
              {/* Row Label (Decades receive prominent typography, intermediate years are subtle or faded) */}
              <div 
                className="w-8 text-right pr-2 font-mono text-[8px] tracking-tighter" 
                style={{ 
                  opacity: isDecadeStart ? 0.7 : 0.25,
                  fontWeight: isDecadeStart ? 'bold' : 'normal',
                  color: isDecadeStart ? colors.text : undefined
                }}
              >
                Y{r.year}
              </div>

              {/* Data Cells */}
              {r.cells.map((cell) => (
                <Cell
                  key={cell.id}
                  id={cell.id}
                  color={cell.color}
                  dotSize={dotSize}
                  radius={radius}
                  fontSize={fontSize}
                  textColor={colors.bg}
                  isActive={cell.isActive}
                  activeText={cell.activeText}
                  fallbackText=""
                  config={config}
                  onCellClick={onCellClick}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Live progress and summary statistics */}
      {showLifeStats && (
        <div 
          className="w-full text-center font-mono border-t border-white/5 pt-3 mt-2 flex flex-col gap-1"
          style={{ fontSize: `${fontSize * 0.9}px` }}
        >
          <div className="font-semibold" style={{ color: colors.stats }}>
            {elapsedUnits.toLocaleString()} OF {totalUnits.toLocaleString()} {isWeekGranular ? 'WEEKS' : 'MONTHS'} LIVED
          </div>
          <div className="opacity-50 text-[9px]">
            {percentageLived.toFixed(2)}% of {lifeExpectancy}-year expectancy lived. {unitsRemaining.toLocaleString()} {isWeekGranular ? 'weeks' : 'months'} remaining.
          </div>
          
          {/* Progress bar visual */}
          <div className="w-full max-w-xs mx-auto bg-white/5 rounded-full h-1 mt-1 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ 
                width: `${percentageLived}%`, 
                backgroundColor: colors.fill || colors.pastDay 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
