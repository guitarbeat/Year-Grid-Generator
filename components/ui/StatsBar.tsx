import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { AppConfig } from '../../types';

interface StatsBarProps {
  config: AppConfig;
  targetDate: Date;
  currentYear: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ config, targetDate, currentYear }) => {
  const { showStats, fontSize, colors } = config;

  if (!showStats) return null;

  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear + 1, 0, 1);
  const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
  
  let effectiveDate = targetDate;
  if (config.anchorTodayToRealTime) {
    const realYear = new Date().getFullYear();
    if (currentYear < realYear) {
      effectiveDate = new Date(currentYear, 11, 31);
    } else if (currentYear > realYear) {
      effectiveDate = new Date(currentYear, 0, 1);
    } else {
      effectiveDate = new Date();
    }
  }

  const daysPassed = Math.ceil(Math.abs(effectiveDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const percentPassed = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

  return (
    <div className="w-full space-y-4 pt-4 border-t border-white/5">
      <div className="flex justify-between items-end gap-10">
        <div className="flex flex-col items-start">
          <span style={{ fontSize: `${fontSize * 0.8}px`, opacity: 0.4, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Year Progress
          </span>
        </div>
        <span style={{ color: colors.stats, fontSize: `${fontSize * 1.5}px`, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(percentPassed)}%
        </span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentPassed}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          style={{ height: '100%', background: colors.stats }}
        />
      </div>

      {/* Aesthetic Legend Block */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-4 gap-y-2 text-[9px] uppercase tracking-wider font-mono opacity-60 pt-2 select-none text-zinc-400">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, backgroundColor: colors.pastDay, borderRadius: `${config.radius ? Math.min(2, config.radius) : 2}px` }} />
          <span>Lived</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="animate-pulse" style={{ width: 8, height: 8, backgroundColor: colors.today, borderRadius: `${config.radius ? Math.min(2, config.radius) : 2}px` }} />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, backgroundColor: colors.futureDay, borderRadius: `${config.radius ? Math.min(2, config.radius) : 2}px` }} />
          <span>Future</span>
        </div>
        {config.highlightWeekends && (
          <div className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, backgroundColor: colors.weekend, borderRadius: `${config.radius ? Math.min(2, config.radius) : 2}px` }} />
            <span>Weekend</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, backgroundColor: colors.significant, borderRadius: `${config.radius ? Math.min(2, config.radius) : 2}px` }} />
          <span>Milestone</span>
        </div>
      </div>
    </div>
  );
};
