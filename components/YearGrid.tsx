import React, { useMemo, memo } from 'react';
import { AppConfig, DayData } from '../types';
import DayCell from './DayCell';

interface YearGridProps {
  config: AppConfig;
  className?: string;
  domRef?: React.RefObject<HTMLDivElement>;
}

// Wrapper for content to ensure Z-Index works against watermark
const ContentWrapper: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <div className="relative z-10">{children}</div>
);

const YearGrid: React.FC<YearGridProps> = ({ config, className, domRef }) => {
  const {
    date,
    mode,
    granularity,
    itemsPerRow,
    isMondayFirst,
    showMonths,
    showDays,
    showYearLabel,
    showActiveLabel,
    activeLabelFormat,
    dotSize,
    gap,
    radius,
    fontFamily,
    fontSize = 10, // Default for safety
    colors,
    transparentBg
  } = config;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const dayLabels = isMondayFirst 
    ? ['Mon', '', 'Wed', '', 'Fri', '', ''] 
    : ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  
  const vDayLabels = isMondayFirst 
    ? ['M','T','W','T','F','S','S'] 
    : ['S','M','T','W','T','F','S'];

  // Dynamic Dimensions based on font size
  const DAY_LABEL_WIDTH = Math.ceil(fontSize * 2.5); // Approx width for "Mon"
  const DAY_LABEL_HEIGHT = Math.ceil(fontSize * 1.5);
  const MONTH_LABEL_HEIGHT = Math.ceil(fontSize * 1.5);
  const MONTH_LABEL_WIDTH = Math.ceil(fontSize * 3);

  // --- Data Logic ---

  // 1. Grid Data (Independent of layout params like gap, dotSize)
  const { dataItems, startDayOffset, year } = useMemo(() => {
    try {
      const currentDate = new Date(date);
      // Validate date
      if (isNaN(currentDate.getTime())) {
        return { dataItems: [], startDayOffset: 0, year: new Date().getFullYear() };
      }

      const year = currentDate.getFullYear();
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      const totalDays = isLeap ? 366 : 365;
      const startOfYear = new Date(year, 0, 1);
      
      // Normalize date to start of day for comparison
      const currentDayOfYear = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

      if (granularity === 'day') {
        const daysArr: DayData[] = [];
        
        // Calculate start offset to determine visual week index
        const firstDayOfWeek = new Date(year, 0, 1).getDay(); // 0=Sun, 1=Mon...
        let initialOffset = firstDayOfWeek;
        if (isMondayFirst) {
          initialOffset = initialOffset === 0 ? 6 : initialOffset - 1;
        }

        for (let i = 0; i < totalDays; i++) {
          const d = new Date(year, 0, i + 1);
          
          // Visual week index based on grid position
          const gridIndex = i + initialOffset;
          const visualWeekIndex = Math.floor(gridIndex / 7) + 1;

          daysArr.push({
            date: d,
            dayOfWeek: d.getDay(),
            month: d.getMonth(),
            weekIndex: visualWeekIndex,
            filled: i <= currentDayOfYear,
            active: i === currentDayOfYear,
            label: d.toDateString() + ` (Week ${visualWeekIndex})`
          });
        }
        return { dataItems: daysArr, startDayOffset: initialOffset, year };
      } 
      
      if (granularity === 'week') {
        const weeksArr: DayData[] = [];
        const totalWeeks = 53;
        const currentWeekIdx = Math.floor(currentDayOfYear / 7);

        for(let i=0; i < totalWeeks; i++) {
          weeksArr.push({
            filled: i <= currentWeekIdx,
            active: i === currentWeekIdx,
            label: `Week ${i + 1}`,
          });
        }
        return { dataItems: weeksArr, startDayOffset: 0, year };
      }

      if (granularity === 'month') {
        const monthsArr: DayData[] = [];
        const currentMonthIdx = currentDate.getMonth();
        
        for(let i=0; i < 12; i++) {
          monthsArr.push({
            filled: i <= currentMonthIdx,
            active: i === currentMonthIdx,
            label: monthNames[i],
          });
        }
        return { dataItems: monthsArr, startDayOffset: 0, year };
      }
    } catch (e) {
      console.error("Error generating grid data", e);
    }
    return { dataItems: [], startDayOffset: 0, year: new Date().getFullYear() };
  }, [date, granularity, isMondayFirst]);

  // 2. Month Positions (Dependent on layout params)
  const monthPositions = useMemo(() => {
    if (granularity !== 'day') return [];

    const positions: number[] = new Array(12).fill(0);
    const foundMonths = new Set<number>();

    // We need to re-calculate grid indices based on the same logic
    dataItems.forEach((d, i) => {
        if (d.month !== undefined && !foundMonths.has(d.month)) {
            foundMonths.add(d.month);
            const gridIndex = i + startDayOffset;
            if (mode === 'horizontal') {
                const col = Math.floor(gridIndex / 7);
                positions[d.month] = col * (dotSize + gap);
            } else {
                const row = Math.floor(gridIndex / 7);
                positions[d.month] = row * (dotSize + gap);
            }
        }
    });
    return positions;
  }, [dataItems, startDayOffset, mode, dotSize, gap, granularity]);

  // --- Styles ---
  const containerStyle: React.CSSProperties = {
    backgroundColor: transparentBg ? 'transparent' : colors.bg,
    color: colors.text,
    fontFamily: fontFamily,
    position: 'relative',
    overflow: 'hidden'
  };

  const watermarkStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: `${Math.max(100, dataItems.length > 20 ? dotSize * 10 : dotSize * 4)}px`,
    fontWeight: 700,
    color: colors.text,
    opacity: 0.05,
    zIndex: 0,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  };

  // Helper to determine content
  const renderCellContent = (item: DayData, index: number) => {
    // 1. If Active Label is ON and this cell is active, it takes priority
    if (item.active && showActiveLabel) {
       // Safely check for date existence before accessing methods
       if (granularity === 'day' && item.date && item.date instanceof Date && !isNaN(item.date.getTime())) {
         try {
           switch (activeLabelFormat) {
             case 'day': return dayNamesShort[item.date.getDay()].substring(0, 1);
             case 'week': return item.weekIndex;
             case 'month': return monthNames[item.date.getMonth()];
             case 'month-date': 
               return dotSize < 30 ? `${item.date.getMonth() + 1}/${item.date.getDate()}` : `${monthNames[item.date.getMonth()]} ${item.date.getDate()}`;
             case 'full':
               if (dotSize < 30) return item.date.getDate(); 
               return (
                 <>
                   <div style={{ fontSize: '0.7em', opacity: 0.8 }}>{dayNamesShort[item.date.getDay()]}</div>
                   <div>{item.date.getDate()}</div>
                   <div style={{ fontSize: '0.6em', opacity: 0.7 }}>W{item.weekIndex}</div>
                 </>
               );
             case 'date':
             default: return item.date.getDate();
           }
         } catch (e) {
           return '?';
         }
       }
       if (granularity === 'week') return index + 1;
       if (granularity === 'month') return index + 1;
    }
    
    // 2. Otherwise, check standard labels
    if (granularity !== 'day' && showMonths) {
        if (granularity === 'month') return item.label.substring(0, 1);
        if (granularity === 'week' && dotSize > 20) return index + 1;
    }

    return null;
  };

  // --- Render ---
  
  // 1. DAY VIEW
  if (granularity === 'day') {
    return (
      <div 
        ref={domRef}
        className={`p-12 box-border shadow-2xl inline-block ${className}`}
        style={containerStyle}
      >
        {showYearLabel && <div style={watermarkStyle}>{year}</div>}
        
        <ContentWrapper>
          <div className={`flex ${mode === 'horizontal' ? 'flex-col' : 'flex-row'}`} style={{ gap: `${gap * 2}px` }}>
            
            {mode === 'horizontal' && (
              <>
                {showMonths && (
                  <div 
                    className="relative w-full" 
                    style={{ 
                      height: `${MONTH_LABEL_HEIGHT}px`,
                      marginBottom: `${gap}px`,
                      marginLeft: showDays ? `${DAY_LABEL_WIDTH + (gap * 2)}px` : '0px'
                    }}
                  >
                    {monthNames.map((m, i) => (
                      <div
                        key={m}
                        className="absolute"
                        style={{ left: `${monthPositions[i]}px`, fontSize: `${fontSize}px` }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex" style={{ gap: `${gap * 2}px` }}>
                  {showDays && (
                    <div 
                      className="grid"
                      style={{ 
                        width: `${DAY_LABEL_WIDTH}px`,
                        gap: `${gap}px`,
                        gridTemplateRows: `repeat(7, ${dotSize}px)` 
                      }}
                    >
                      {dayLabels.map((d, i) => (
                        <div key={i} className="text-right flex items-center justify-end" style={{ height: `${dotSize}px`, fontSize: `${fontSize}px` }}>{d}</div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'grid',
                    gap: `${gap}px`,
                    gridTemplateColumns: `repeat(53, ${dotSize}px)`,
                    gridTemplateRows: `repeat(7, ${dotSize}px)`,
                    gridAutoFlow: 'column',
                  }}>
                    {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                    {dataItems.map((day, i) => (
                      <DayCell
                        key={i}
                        active={day.active}
                        label={day.label}
                        backgroundColor={day.filled ? colors.fill : colors.empty}
                        textColor={day.filled ? colors.bg : colors.text}
                        dotSize={dotSize}
                        radius={radius}
                      >
                        {renderCellContent(day, i)}
                      </DayCell>
                    ))}
                  </div>
                </div>
              </>
            )}

            {mode === 'vertical' && (
              <>
                {showMonths && (
                  <div 
                    className="relative" 
                    style={{ 
                        width: `${MONTH_LABEL_WIDTH}px`,
                        marginTop: showDays ? `${DAY_LABEL_HEIGHT + gap}px` : '0px'
                    }}
                  >
                    {monthNames.map((m, i) => (
                      <div
                        key={m}
                        className="absolute w-full text-right"
                        style={{ top: `${monthPositions[i]}px`, fontSize: `${fontSize}px` }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}
                
                <div>
                  {showDays && (
                    <div 
                      className="grid"
                      style={{ 
                        gap: `${gap}px`,
                        marginBottom: `${gap}px`,
                        gridTemplateColumns: `repeat(7, ${dotSize}px)`
                      }}
                    >
                      {vDayLabels.map((d, i) => (
                        <div key={i} className="text-center flex items-end justify-center" style={{ height: `${DAY_LABEL_HEIGHT}px`, fontSize: `${fontSize}px` }}>{d}</div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'grid',
                    gap: `${gap}px`,
                    gridTemplateColumns: `repeat(7, ${dotSize}px)`,
                    gridTemplateRows: `repeat(53, ${dotSize}px)`,
                    gridAutoFlow: 'row',
                  }}>
                     {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                     {dataItems.map((day, i) => (
                      <DayCell
                        key={i}
                        active={day.active}
                        label={day.label}
                        backgroundColor={day.filled ? colors.fill : colors.empty}
                        textColor={day.filled ? colors.bg : colors.text}
                        dotSize={dotSize}
                        radius={radius}
                      >
                        {renderCellContent(day, i)}
                      </DayCell>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        </ContentWrapper>
      </div>
    );
  }

  // 2. GENERIC GRID VIEW (Week / Month)
  const isHorizontal = mode === 'horizontal';
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: `${gap}px`,
    gridTemplateColumns: isHorizontal ? `repeat(${itemsPerRow}, ${dotSize}px)` : `auto`,
    gridTemplateRows: isHorizontal ? `auto` : `repeat(${itemsPerRow}, ${dotSize}px)`,
    gridAutoFlow: isHorizontal ? 'row' : 'column',
  };

  return (
    <div 
      ref={domRef}
      className={`p-12 box-border shadow-2xl inline-block ${className}`}
      style={containerStyle}
    >
      {showYearLabel && <div style={watermarkStyle}>{year}</div>}
      
      <ContentWrapper>
        <div style={gridStyle}>
          {dataItems.map((item, i) => (
            <DayCell
              key={i}
              active={item.active}
              label={item.label}
              backgroundColor={item.filled ? colors.fill : colors.empty}
              textColor={item.filled ? colors.bg : colors.text}
              dotSize={dotSize}
              radius={radius}
            >
              {renderCellContent(item, i)}
            </DayCell>
          ))}
        </div>
      </ContentWrapper>
    </div>
  );
};

// Memoize YearGrid to prevent unnecessary re-renders when parent (PreviewArea) updates state (e.g. zoom/pan)
export default memo(YearGrid);