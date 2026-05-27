import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ViewProps } from './types';
import { Cell } from '../ui/Cell';
import { getDayColor, getDimmedColor } from '../../utils/colorUtils';
import { getWeekNumber, getSeasonGroupInfo } from '../../utils/dateUtils';

export const SpiralView: React.FC<ViewProps> = ({
  config,
  months,
  currentDate,
  onCellClick,
  isDownloading = false
}) => {
  const { dotSize, gap, granularity } = config;

  const cells = useMemo(() => {
    const allCells: any[] = [];
    months.forEach((m: any) => {
      if (granularity === 'day') {
        const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          allCells.push({ id: `day-${m.year}-${m.month}-${day}`, data: { day, filled: true }, monthInfo: m });
        }
      } else if (granularity === 'week') {
        m.weeksInMonth.forEach((w: any) => {
          allCells.push({ id: `week-${m.year}-${w.weekNum}`, data: w, monthInfo: m });
        });
      } else {
        allCells.push({ id: `month-${m.year}-${m.month}`, data: m, monthInfo: m });
      }
    });
    return allCells;
  }, [months, granularity]);

  const centerX = 0;
  const centerY = 0;

  const spacing = dotSize + gap;
  const a = spacing * 1.5; // initial radius offset
  const b = spacing / (2 * Math.PI); // radial growth per radian
  let currentTheta = 0;

  const renderedCells = cells.map((cell, index) => {
    let color = config.colors.empty;
    let label = '';

    const anchorDate = config.anchorTodayToRealTime ? new Date() : currentDate;
    const currentYear = anchorDate.getFullYear();
    const currentMonth = anchorDate.getMonth();
    const currentDay = anchorDate.getDate();

    if (granularity === 'day') {
      const d = cell.data.day;
      const id = `day-${cell.monthInfo.year}-${cell.monthInfo.month}-${d}`;
      color = config.overrides[id] 
        ? (config.colors[config.overrides[id] as keyof typeof config.colors] || config.overrides[id])
        : getDayColor(cell.monthInfo.year, cell.monthInfo.month, d, config, currentDate);
        
      if (config.anchorTodayToRealTime || cell.data.filled) {
        if (cell.monthInfo.year === currentYear && cell.monthInfo.month === currentMonth && d === currentDay) {
          label = config.showActiveLabel ? '★' : '';
        }
      }
    } else if (granularity === 'week') {
      const w = cell.data;
      color = w.color;
      if (cell.monthInfo.year === currentYear && w.weekNum === getWeekNumber(anchorDate)) {
        label = config.showActiveLabel ? '★' : '';
      }
    } else {
      const m = cell.data;
      const isPast = m.year < currentYear || (m.year === currentYear && m.month < currentMonth);
      const isToday = m.year === currentYear && m.month === currentMonth;
      const id = `month-${m.year}-${m.month}`;
      
      if (config.overrides[id]) {
        color = config.colors[config.overrides[id] as keyof typeof config.colors] || config.overrides[id];
      } else if (isToday) {
        color = config.colors.today;
      } else if (isPast) {
        color = getDimmedColor(config.colors.pastDay, config.dimPastDaysStrength || 50, config.dimPastDays);
      } else {
        color = config.colors.futureDay;
      }
      
      if (isToday) {
        label = config.showActiveLabel ? '★' : '';
      }
    }

    if (config.overrides[cell.id]) {
      label = config.showActiveLabel ? '★' : '';
    }

    if (!cell.data.filled && config.groupBy === 'season') {
      const { seasonColor } = getSeasonGroupInfo(cell.monthInfo.year, cell.monthInfo.month);
      if (seasonColor) {
        color = seasonColor;
      }
    }

    // Archimedean spiral logic
    // r = a + b * theta
    // We want the distance between loops to be roughly (dotSize + gap)
    
    // Approximate theta for the given arc length (index * spacing)
    // Using a simple iterative approach is more accurate for spacing
    const r = a + b * currentTheta;
    const x = r * Math.cos(currentTheta);
    const y = r * Math.sin(currentTheta);
    
    // Calculate next theta to maintain constant arc length
    // ds = sqrt(dr^2 + (r dTheta)^2) = sqrt(b^2 + r^2) dTheta
    currentTheta += spacing / Math.sqrt(b * b + r * r);

    return (
      <motion.div 
        layout={!isDownloading}
        key={cell.id}
        initial={isDownloading ? false : { opacity: 0, scale: 0.8 }}
        animate={isDownloading ? false : { opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: Math.min(index * 0.001, 0.5) }}
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          zIndex: config.overrides[cell.id] ? 10 : 1
        }}
      >
        <Cell
          id={cell.id}
          color={color}
          dotSize={dotSize}
          radius={config.radius}
          fontSize={config.fontSize}
          textColor={config.colors.text}
          isActive={!!config.overrides[cell.id]}
          activeText={label}
          fallbackText={""}
          config={config}
          onCellClick={onCellClick}
          isDownloading={isDownloading}
        />
      </motion.div>
    );
  });

  const maxR = a + b * currentTheta;
  const width = (maxR + dotSize * 2) * 2;
  const height = width;

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%' }}>
        {renderedCells}
      </div>
    </div>
  );
};
