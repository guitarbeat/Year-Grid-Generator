import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppConfig } from '../types';

interface YearGridProps {
  config: AppConfig;
  className?: string;
  domRef?: React.RefObject<HTMLDivElement>;
  onCellClick?: (id: string) => void;
}

const YearGrid: React.FC<YearGridProps> = ({ config, className, domRef, onCellClick }) => {
  const {
    date,
    isMondayFirst,
    showYearLabel,
    dotSize,
    gap,
    radius,
    fontFamily,
    fontSize = 10,
    colors,
    transparentBg,
    monthsToShow = 12,
    monthsPerRow = 3,
    monthOffset = 0,
    showDayNumbers = false,
    showWeekNumbers = true,
    showMonthLabels = true,
    showMonthNumbers = false,
    showMonthAxis = true,
    showWeekdayAxis = true,
    highlightWeekends = true,
    dimPastDays = true,
    dimPastDaysStrength = 50,
    showStats = true,
    mode = 'grid',
    startFromJan = false,
    granularity = 'day',
    groupBy = 'none',
    showSeasonLabels = true,
    showActiveLabel = false,
    activeLabelFormat = 'date'
  } = config;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const vDayLabels = isMondayFirst 
    ? ['M','T','W','T','F','S','S'] 
    : ['S','M','T','W','T','F','S'];

  const dayHeaderLabels = isMondayFirst 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Dynamic Dimensions based on font size to prevent clipping
  const DAY_LABEL_WIDTH = Math.ceil(fontSize * 4.5); 
  const DAY_LABEL_HEIGHT = Math.ceil(fontSize * 1.8);
  const MONTH_LABEL_WIDTH = Math.ceil(fontSize * 5.5);

  const targetDate = useMemo(() => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date();
    // Force interpretation as local date YYYY-MM-DD
    const [y, m, day] = date.split('-').map(Number);
    return new Date(y, m - 1, day);
  }, [date]);

  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth();
  const currentDay = targetDate.getDate();

  // ⚡ Bolt: Cache dimmed opacity hex string
  // Impact: Prevents 365+ string allocations per render
  const dimmedOpacityHex = useMemo(() => {
    return Math.round((config.dimPastDaysStrength || 50) * 2.55).toString(16).padStart(2, '0');
  }, [config.dimPastDaysStrength]);

  // ⚡ Bolt: Cache first day of month to avoid creating ~365 Date objects per render
  // Impact: Reduces GC pauses during high-frequency renders (e.g. dragging sliders)
  const firstDayCache = React.useRef<Record<string, number>>({});
  const getFirstDayOfMonth = (year: number, month: number) => {
    const key = `${year}-${month}`;
    if (firstDayCache.current[key] === undefined) {
      firstDayCache.current[key] = new Date(year, month, 1).getDay();
    }
    return firstDayCache.current[key];
  };

  const getWeekNumber = (d: Date) => {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
  };

  const currentWeekNumber = getWeekNumber(targetDate);

  const getDimmedColor = (color: string) => {
    if (!dimPastDays) return color;
    return `${color}${dimmedOpacityHex}`;
  };

  // ⚡ Bolt: Precalculate absolute current dates (no useMemo overhead for trivial math)
  // Impact: Eliminates redundant arithmetic 365+ times per render
  const absCurrent = currentYear * 10000 + currentMonth * 100 + currentDay;
  const absCurrentParams = currentYear * 12 + currentMonth;

  // Helper to get day color based on Scriptable logic
  const getDayColor = (year: number, month: number, day: number) => {
    const id = `day-${year}-${month}-${day}`;
    if (config.overrides[id]) {
      return colors[config.overrides[id] as keyof typeof colors] || config.overrides[id];
    }

    const absTarget = year * 10000 + month * 100 + day;

    const isPast = absTarget < absCurrent;
    const isToday = absTarget === absCurrent;

    if (isToday) return colors.today;

    // Weekend check
    // ⚡ Bolt: Use mathematical day of week calculation instead of new Date()
    // Impact: Eliminates ~365 Date object allocations per render
    if (highlightWeekends) {
      const firstDay = getFirstDayOfMonth(year, month);
      const dayOfWeek = (firstDay + day - 1) % 7;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return isPast ? getDimmedColor(colors.weekend) : colors.weekend;
      }
    }

    if (isPast) {
      return getDimmedColor(colors.pastDay);
    }
    return colors.futureDay;
  };

  const getActiveCellText = (year: number, month: number, day?: number, weekNum?: number) => {
    let text = '';
    const d = day ? new Date(year, month, day) : new Date(year, month, 1);

    const dayNameShort = d.toLocaleDateString('default', { weekday: 'short' });
    const monthNameShort = d.toLocaleDateString('default', { month: 'short' });
    const monthNameLong = d.toLocaleDateString('default', { month: 'long' });
    const dateNum = d.getDate();
    const weekOfMonth = Math.ceil(dateNum / 7);
    const weekOfYear = getWeekNumber(d);

    if (granularity === 'month') {
      if (activeLabelFormat === 'date') text = `${dateNum}`;
      else if (activeLabelFormat === 'weekNum') text = `M${month + 1}`;
      else if (activeLabelFormat === 'dayName') text = monthNameLong;
      else if (activeLabelFormat === 'monthName') text = monthNameLong;
      else if (activeLabelFormat === 'monthDate') text = `${monthNameShort} ${year}`;
      else if (activeLabelFormat === 'full') text = `${monthNameLong} ${year}`;
    } else if (granularity === 'week' && weekNum) {
      if (activeLabelFormat === 'date') text = `W${weekNum}`;
      else if (activeLabelFormat === 'weekNum') text = `W${weekNum}`;
      else if (activeLabelFormat === 'dayName') text = `Week ${weekNum}`;
      else if (activeLabelFormat === 'monthName') text = `${monthNameShort}`;
      else if (activeLabelFormat === 'monthDate') text = `${monthNameShort} W${weekNum}`;
      else if (activeLabelFormat === 'full') text = `Week ${weekNum}, ${year}`;
    } else { 
      if (activeLabelFormat === 'date') text = `${dateNum}`;
      else if (activeLabelFormat === 'weekNum') text = `W${weekOfYear}`;
      else if (activeLabelFormat === 'dayName') text = dayNameShort;
      else if (activeLabelFormat === 'monthName') text = monthNameLong;
      else if (activeLabelFormat === 'monthDate') text = `${monthNameShort} ${dateNum}`;
      else if (activeLabelFormat === 'full') text = `${dayNameShort} Wk${weekOfMonth} ${dateNum}`;
    }

    return text;
  };

  const months = useMemo(() => {
    const result = [];
    const effectiveOffset = startFromJan ? -currentMonth + (monthOffset * 12) : monthOffset;
    
    for (let i = effectiveOffset; i < effectiveOffset + monthsToShow; i++) {
      let targetMonthIndex = currentMonth + i;
      const year = currentYear + Math.floor(targetMonthIndex / 12);
      const month = ((targetMonthIndex % 12) + 12) % 12;

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const startOffset = (firstDayOfMonth - (isMondayFirst ? 1 : 0) + 7) % 7;

      // Group weeks that start in this month
      const weeksInMonth: { weekNum: number; color: string }[] = [];
      const oneJan = new Date(year, 0, 1);
      
      for (let day = 1; day <= daysInMonth; day++) {
        // ⚡ Bolt: Use mathematical day of week calculation instead of new Date()
        // Impact: Eliminates Date object allocations in loop
        const firstDay = getFirstDayOfMonth(year, month);
        const dayOfWeek = (firstDay + day - 1) % 7;
        if (dayOfWeek === (isMondayFirst ? 1 : 0) || day === 1) {
          // If it's a Monday (or Sunday if isMondayFirst is false) or the first of month, check if it starts a week here
          // For simplicity, we'll just check if the date falls in this month
          const d = new Date(year, month, day);
          const weekNum = getWeekNumber(d);
          const isPast = year < currentYear || (year === currentYear && weekNum < currentWeekNumber);
          const isToday = year === currentYear && weekNum === currentWeekNumber;
          
          let color = colors.futureDay;
          const id = `week-${year}-${weekNum}`;
          if (config.overrides[id]) {
            color = colors[config.overrides[id] as keyof typeof colors] || config.overrides[id];
          } else if (isToday) {
            color = colors.today;
          } else if (isPast) {
            color = getDimmedColor(colors.pastDay);
          }

          // Only add if not already added
          if (!weeksInMonth.find(w => w.weekNum === weekNum)) {
            weeksInMonth.push({ weekNum, color });
          }
        }
      }

      result.push({
        year,
        month,
        name: monthNames[month],
        daysInMonth,
        weeksInMonth,
        startOffset,
        season: getSeason(month)
      });
    }
    return result;
  }, [currentYear, currentMonth, monthOffset, monthsToShow, isMondayFirst, startFromJan, colors, currentWeekNumber, dimPastDays, dimPastDaysStrength]);

  function getSeason(month: number) {
    if (month >= 2 && month <= 4) return 'SPRING';
    if (month >= 5 && month <= 7) return 'SUMMER';
    if (month >= 8 && month <= 10) return 'FALL';
    return 'WINTER';
  }

  const containerStyle: React.CSSProperties = {
    backgroundColor: transparentBg ? 'transparent' : colors.bg,
    color: colors.text,
    fontFamily: fontFamily,
    padding: `${Math.max(24, fontSize * 3)}px`,
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: `${Math.max(16, fontSize * 2)}px`,
    borderRadius: `${radius || 16}px`,
    position: 'relative',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  // ⚡ Bolt: Memoize allDays to avoid recreating ~365 objects per render
  // Impact: Prevents expensive GC pauses and object allocations on interactions
  const allDays = useMemo(() => {
    return months.flatMap(m =>
      Array.from({ length: m.daysInMonth }).map((_, i) => ({
        year: m.year,
        month: m.month,
        day: i + 1,
        season: m.season
      }))
    );
  }, [months]);

  const statsSection = useMemo(() => {
    if (!showStats) return null;

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);
    const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = Math.ceil(Math.abs(targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const percentPassed = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    return (
      <div className="w-full space-y-3 pt-4 border-t border-white/5">
        <div className="flex justify-between items-end gap-10">
          <div className="flex flex-col items-start">
            <span style={{ fontSize: `${fontSize * 0.8}px`, opacity: 0.4, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Year Progress</span>
          </div>
          <span style={{ color: colors.stats, fontSize: `${fontSize * 1.5}px`, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(percentPassed)}%
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentPassed}%` }}
            style={{ height: '100%', background: colors.stats, borderRadius: '2px' }} 
          />
        </div>
      </div>
    );
  }, [showStats, currentYear, targetDate, colors.stats, fontSize]);

  const renderTimeline = () => {
    if (groupBy === 'season') {
      const seasonsOrder = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 8}px`, width: '100%' }}>
          {seasonsOrder.map(s => {
            const seasonDays = allDays.filter(d => d.season === s).sort((a, b) => {
              const wA = (a.month + 1) % 12;
              const wB = (b.month + 1) % 12;
              if (wA !== wB) return wA - wB;
              return a.day - b.day;
            });
            if (seasonDays.length === 0) return null;
            return (
              <div 
                key={s} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: `${gap * 3}px`,
                  backgroundColor: `${colors.text}05`,
                  padding: `${gap * 4}px`,
                  borderRadius: `${radius * 2}px`,
                  border: `1px solid ${colors.text}08`
                }}
              >
                {showSeasonLabels && (
                  <div style={{ 
                    fontSize: `${fontSize * 1.2}px`, 
                    fontWeight: 900, 
                    opacity: 0.2, 
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                  }}>
                    {s}
                  </div>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${config.itemsPerRow || 31}, ${dotSize}px)`,
                  gap: `${gap}px`,
                }}>
                  {seasonDays.map((d, i) => (
                    <motion.div
                      layout
                      key={`${d.year}-${d.month}-${d.day}`}
                      onClick={(e) => { e.stopPropagation(); onCellClick?.(`day-${d.year}-${d.month}-${d.day}`); }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                        backgroundColor: showDayNumbers ? 'transparent' : getDayColor(d.year, d.month, d.day),
                        borderRadius: `${radius}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: `${Math.min(dotSize * 0.6, fontSize * 0.8)}px`,
                        color: showDayNumbers ? getDayColor(d.year, d.month, d.day) : colors.bg,
                        fontWeight: 700,
                        position: 'relative'
                      }}
                    >
                      {showActiveLabel ? ((d.year * 10000 + d.month * 100 + d.day) === (currentYear * 10000 + currentMonth * 100 + currentDay) ? getActiveCellText(d.year, d.month, d.day) : null) : (showDayNumbers ? d.day : null)}
                    </motion.div>
                  ))}
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
        gridTemplateColumns: `repeat(${config.itemsPerRow || 31}, ${dotSize}px)`,
        gap: `${gap}px`,
      }}>
        {allDays.map((d, i) => (
          <motion.div
            layout
            key={`${d.year}-${d.month}-${d.day}`}
            onClick={(e) => { e.stopPropagation(); onCellClick?.(`day-${d.year}-${d.month}-${d.day}`); }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              backgroundColor: showDayNumbers ? 'transparent' : getDayColor(d.year, d.month, d.day),
              borderRadius: `${radius}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${Math.min(dotSize * 0.6, fontSize * 0.8)}px`,
              color: showDayNumbers ? getDayColor(d.year, d.month, d.day) : colors.bg,
              fontWeight: 700,
              position: 'relative'
            }}
          >
            {showActiveLabel && (d.year * 10000 + d.month * 100 + d.day) === (currentYear * 10000 + currentMonth * 100 + currentDay) ? getActiveCellText(d.year, d.month, d.day) : showDayNumbers ? d.day : null}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderFlatWeeks = () => {
    const cols = mode === 'columns' ? 1 : mode === 'rows' ? 52 : (config.itemsPerRow || 13);

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
                    <div style={{ display: 'flex', gap: `${gap}px` }}>
                      {m.weeksInMonth.map(w => (
                         <motion.div
                          layout
                          key={w.weekNum}
                          onClick={(e) => { e.stopPropagation(); onCellClick?.(`week-${m.year}-${w.weekNum}`); }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            width: `${dotSize * 1.5}px`,
                            height: `${dotSize * 1.5}px`,
                            backgroundColor: w.color,
                            borderRadius: `${radius}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: `${Math.min(dotSize * 0.8, fontSize * 0.9)}px`,
                            color: colors.bg,
                            fontWeight: 900,
                            position: 'relative'
                          }}
                        >
                          {showActiveLabel ? (m.year === currentYear && w.weekNum === currentWeekNumber ? getActiveCellText(m.year, m.month, undefined, w.weekNum) : null) : (showWeekNumbers ? w.weekNum : (showMonthNumbers ? m.month + 1 : null))}
                        </motion.div>
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
          display: 'flex', 
          flexDirection: mode === 'rows' ? 'row' : 'column',
          gap: `${gap * 4}px`,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {months.map(m => (
            <div key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, alignItems: 'center' }}>
              <span style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5 }}>{m.name}</span>
              <div style={{ display: 'flex', gap: `${gap}px` }}>
                {m.weeksInMonth.map(w => (
                  <motion.div
                    layout
                    key={w.weekNum}
                    onClick={(e) => { e.stopPropagation(); onCellClick?.(`week-${m.year}-${w.weekNum}`); }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: `${dotSize * 1.5}px`,
                      height: `${dotSize * 1.5}px`,
                      backgroundColor: w.color,
                      borderRadius: `${radius}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: `${Math.min(dotSize * 0.8, fontSize * 0.9)}px`,
                      color: colors.bg,
                      fontWeight: 900,
                      position: 'relative'
                    }}
                  >
                    {showActiveLabel && m.year === currentYear && w.weekNum === currentWeekNumber ? getActiveCellText(m.year, m.month, undefined, w.weekNum) : showWeekNumbers ? w.weekNum : null}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    const allWeeks: { weekNum: number; color: string; identifier: string }[] = [];
    const seenWeeks = new Set<string>();
    months.forEach(m => {
      m.weeksInMonth.forEach(w => {
        const identifier = `${m.year}-${w.weekNum}`;
        if (!seenWeeks.has(identifier)) {
          seenWeeks.add(identifier);
          allWeeks.push({ ...w, identifier });
        }
      });
    });

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${dotSize * 1.5}px)`,
        gap: `${gap * 2}px`,
      }}>
        {allWeeks.map(w => (
          <motion.div
            layout
            key={w.identifier}
            onClick={(e) => { e.stopPropagation(); onCellClick?.(`week-${w.identifier}`); }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: `${dotSize * 1.5}px`,
              height: `${dotSize * 1.5}px`,
              backgroundColor: w.color,
              borderRadius: `${radius}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${Math.min(dotSize * 0.8, fontSize * 0.9)}px`,
              color: colors.bg,
              fontWeight: 900,
              position: 'relative'
            }}
          >
            {showActiveLabel ? (parseInt(w.identifier.split('-')[0]) === currentYear && parseInt(w.identifier.split('-')[1]) === currentWeekNumber ? getActiveCellText(currentYear, currentMonth, undefined, currentWeekNumber) : null) : (showWeekNumbers ? w.weekNum : null)}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderFlatMonths = () => {
    const cols = mode === 'columns' ? 1 : mode === 'rows' ? 12 : (config.itemsPerRow || 4);

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
                    fontSize: `${fontSize * 1.2}px`, 
                    fontWeight: 900, 
                    opacity: 0.2, 
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                  }}>
                    {s}
                  </div>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols}, ${dotSize * 2.5}px)`,
                  gap: `${gap * 4}px`,
                }}>
                  {seasonMonths.map(m => {
                    const name = m.name;
                    const absTargetParams = m.year * 12 + m.month;
                    const isPast = absTargetParams < absCurrentParams;
                    const isToday = absTargetParams === absCurrentParams;
                    
                    let color = colors.futureDay;
                    const id = `month-${m.year}-${m.month}`;
                    if (config.overrides[id]) {
                      color = colors[config.overrides[id] as keyof typeof colors] || config.overrides[id];
                    } else if (isToday) {
                      color = colors.today;
                    } else if (isPast) {
                      color = getDimmedColor(colors.pastDay);
                    }

                    return (
                      <div key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${gap}px` }}>
                        {showMonthAxis && <span style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5 }}>{name}</span>}
                        <motion.div
                          layout
                          onClick={(e) => { e.stopPropagation(); onCellClick?.(`month-${m.year}-${m.month}`); }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            width: `${dotSize * 2.5}px`,
                            height: `${dotSize * 2.5}px`,
                            backgroundColor: color,
                            borderRadius: `${radius}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: `${Math.min(dotSize * 1.2, fontSize * 1.2)}px`,
                            color: colors.bg,
                            fontWeight: 900,
                            position: 'relative'
                          }}
                        >
                          {showActiveLabel ? (isToday ? getActiveCellText(m.year, m.month) : null) : (showMonthLabels ? name.toUpperCase().substring(0, 3) : null)}
                        </motion.div>
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
        gridTemplateColumns: `repeat(${cols}, ${dotSize * 2.5}px)`,
        gap: `${gap * 4}px`,
      }}>
        {months.map((m, i) => {
          const name = m.name;
          const absTargetParams = m.year * 12 + m.month;
          const isPast = absTargetParams < absCurrentParams;
          const isToday = absTargetParams === absCurrentParams;
          
          let color = colors.futureDay;
          const id = `month-${m.year}-${m.month}`;
          if (config.overrides[id]) {
            color = colors[config.overrides[id] as keyof typeof colors] || config.overrides[id];
          } else if (isToday) {
            color = colors.today;
          } else if (isPast) {
            color = getDimmedColor(colors.pastDay);
          }

          return (
            <div key={`${m.year}-${m.month}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${gap}px` }}>
              {showMonthAxis && <span style={{ fontSize: `${fontSize * 0.8}px`, fontWeight: 'bold', opacity: 0.5 }}>{name}</span>}
              <motion.div
                layout
                onClick={(e) => { e.stopPropagation(); onCellClick?.(`month-${m.year}-${m.month}`); }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: `${dotSize * 2.5}px`,
                  height: `${dotSize * 2.5}px`,
                  backgroundColor: color,
                  borderRadius: `${radius}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${Math.min(dotSize * 1.2, fontSize * 1.2)}px`,
                  color: colors.bg,
                  fontWeight: 900,
                  position: 'relative'
                }}
              >
                {showActiveLabel ? (isToday ? getActiveCellText(m.year, m.month) : null) : (showMonthLabels ? name.toUpperCase().substring(0, 3) : null)}
              </motion.div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthlyGrid = () => {
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 10}px`, width: '100%' }}>
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
                  letterSpacing: '0.25em', 
                  opacity: 0.3,
                  textAlign: 'center',
                  borderBottom: `1px solid ${colors.text}22`,
                  paddingBottom: `${gap * 2}px`,
                  marginBottom: `${gap * 2}px`,
                  textTransform: 'uppercase'
                }}>
                  {g.season}
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: mode === 'rows' || mode === 'columns' ? '1fr' : 
                                     `repeat(${monthsPerRow}, auto)`,
                gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
                width: '100%'
              }}>
                {g.months.map(m => renderMonthItem(m))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: mode === 'rows' || mode === 'columns' ? '1fr' : 
                             `repeat(${monthsPerRow}, auto)`,
        gap: mode === 'grid' ? `${gap * 6}px` : `${gap * 3}px`,
        width: '100%'
      }}>
        <AnimatePresence mode="popLayout">
          {months.map((m) => renderMonthItem(m))}
        </AnimatePresence>
      </div>
    );
  };

  const renderMonthItem = (m: any) => {
    return (
      <motion.div 
        layout
        key={`${m.year}-${m.month}`} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ 
          display: 'flex', 
          flexDirection: mode === 'rows' ? 'row' : 'column', 
          alignItems: mode === 'rows' ? 'center' : 'flex-start',
          gap: `${gap * 2}px` 
        }}
      >
        {showMonthAxis && (
          <div style={{ 
            fontSize: `${fontSize * 1.1}px`, 
            fontWeight: 700, 
            color: colors.text,
            minWidth: mode === 'rows' ? `${MONTH_LABEL_WIDTH}px` : 'auto',
            opacity: 0.8,
            letterSpacing: '-0.02em',
            textAlign: mode === 'columns' ? 'center' : 'left',
            width: mode === 'columns' ? '100%' : (mode === 'rows' ? `${MONTH_LABEL_WIDTH}px` : 'auto')
          }}>
            {m.name}
          </div>
        )}

        {granularity === 'day' && mode === 'grid' && showWeekdayAxis && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${dotSize}px)`,
            gap: `${gap}px`
          }}>
            {dayHeaderLabels.map((lbl, idx) => (
              <div 
                key={`header-${idx}`} 
                style={{ 
                  fontSize: `${fontSize * 0.7}px`,
                  height: `${DAY_LABEL_HEIGHT}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  fontWeight: 'bold',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                {lbl.substring(0, 1)}
              </div>
            ))}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 
            granularity === 'week' ? `repeat(${m.weeksInMonth.length}, ${dotSize * 1.5}px)` :
            mode === 'rows' ? `repeat(${m.daysInMonth}, ${dotSize}px)` : 
            `repeat(${mode === 'grid' ? 7 : 1}, ${dotSize}px)`,
          gap: `${gap}px`,
        }}>
          {/* Day Grid Specific: Empty offsets */}
          {granularity === 'day' && mode === 'grid' && Array.from({ length: m.startOffset }).map((_, i) => (
            <div key={`empty-${i}`} style={{ width: dotSize, height: dotSize }} />
          ))}

          {/* Day items */}
          {granularity === 'day' && Array.from({ length: m.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const color = getDayColor(m.year, m.month, day);
            return (
              <motion.div
                layout
                key={`day-${day}`}
                onClick={(e) => { e.stopPropagation(); onCellClick?.(`day-${m.year}-${m.month}-${day}`); }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  backgroundColor: showDayNumbers ? 'transparent' : color,
                  borderRadius: `${radius}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${Math.min(dotSize * 0.6, fontSize * 0.7)}px`,
                  color: showDayNumbers ? color : colors.bg,
                  fontWeight: 700,
                  flexShrink: 0,
                  position: 'relative'
                }}
              >
                {showActiveLabel ? ((m.year * 10000 + m.month * 100 + day) === (currentYear * 10000 + currentMonth * 100 + currentDay) ? getActiveCellText(m.year, m.month, day) : null) : (showDayNumbers ? day : null)}
              </motion.div>
            );
          })}

          {/* Week items (if granularity is week and mode is grid) */}
          {granularity === 'week' && m.weeksInMonth.map((w) => (
              <motion.div
                layout
                key={`week-${w.weekNum}`}
                onClick={(e) => { e.stopPropagation(); onCellClick?.(`week-${m.year}-${w.weekNum}`); }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: `${dotSize * 1.5}px`,
                  height: `${dotSize * 1.5}px`,
                  backgroundColor: w.color,
                  borderRadius: `${radius}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${Math.min(dotSize * 1, fontSize * 0.9)}px`,
                  color: colors.bg,
                  fontWeight: 900,
                  position: 'relative'
                }}
              >
                {showActiveLabel && m.year === currentYear && w.weekNum === currentWeekNumber ? getActiveCellText(m.year, m.month, undefined, w.weekNum) : showWeekNumbers ? w.weekNum : null}
              </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div ref={domRef} style={containerStyle} className={className}>
      {showYearLabel && (
        <div style={{ 
          fontSize: `${fontSize * 5}px`, 
          fontWeight: 900, 
          opacity: 0.05, 
          position: 'absolute', 
          top: '24px', 
          right: '48px',
          pointerEvents: 'none',
          fontFamily: "'Inter', sans-serif"
        }}>
          {currentYear}
        </div>
      )}

      {/* Main Content Picker */}
      {(() => {
        // Month view is always "flat" or linear because there's no Month-level grouping needed
        if (granularity === 'month') return renderFlatMonths();

        // Week view can be grouped by Month (Grid) or flat (everything else)
        if (granularity === 'week') {
          if (mode === 'grid') return renderMonthlyGrid();
          return renderFlatWeeks();
        }

        // Day view can be timeline (flat) or grouped monthly (grid, rows, columns)
        if (granularity === 'day') {
          return renderMonthlyGrid();
        }

        return null;
      })()}

      {statsSection}
    </div>
  );
};

// ⚡ Bolt: Wrapped YearGrid in React.memo to prevent expensive re-renders
// when the parent PreviewArea triggers high-frequency updates during panning/zooming.
// Impact: Reduces re-renders by 100% during panning interactions.
export default React.memo(YearGrid);
