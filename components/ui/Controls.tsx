import React, { useRef } from 'react';
import { AppColors } from "../../types";
import { motion, AnimatePresence } from 'motion/react';

/**
 * Common UI Components for Year Grid Generator
 * Consolidates patterns found in Sidebar and Modals
 */

export const SectionGroup: React.FC<{ 
  label: string; 
  children: React.ReactNode; 
  className?: string;
}> = ({ label, children, className = '' }) => (
  <section className={`py-4 px-1 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-3 bg-accent/30" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-mono font-bold block transition-colors">{label}</span>
    </div>
    {children}
  </section>
);

export const ControlGroup: React.FC<{ 
  label: string; 
  value?: string | number; 
  children: React.ReactNode;
  className?: string;
}> = ({ label, value, children, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <div className="flex justify-between items-center group">
      <label className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-widest group-hover:text-zinc-350 transition-colors">{label}</label>
      {value !== undefined && (
        <motion.span 
          key={value}
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="tabular-nums text-[9px] font-mono text-accent bg-accent/5 px-2 py-0.5 border border-accent/15 rounded-md font-bold tracking-wider"
        >
          {value}
        </motion.span>
      )}
    </div>
    <div className="relative">
      {children}
    </div>
  </div>
);

export const Toggle: React.FC<{ 
  id: string; 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}> = ({ id, label, checked, onChange }) => {
  return (
    <motion.div 
      whileHover="hover"
      whileTap="tap"
      className="flex items-center justify-between group py-2.5 px-3 hover:bg-white/[0.03] active:bg-white/[0.01] rounded-xl cursor-pointer transition-colors select-none" 
      onClick={() => onChange(!checked)}
    >
      <label htmlFor={id} className="text-[11px] text-zinc-400 font-mono cursor-pointer group-hover:text-zinc-200 transition-colors select-none pointer-events-none">{label}</label>
      <div className="relative inline-flex items-center cursor-pointer pointer-events-none">
        <div className={`w-11 h-6.5 rounded-full flex p-[3px] transition-colors duration-300 border items-center ${checked ? 'bg-accent/20 border-accent/50 justify-end' : 'bg-[#101012] border-zinc-800/80 justify-start'}`}>
          <motion.div 
            layout
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.12, filter: "brightness(1.15)" },
              tap: { scaleX: 1.35, scaleY: 0.8 } // Organic gummy elasticity
            }}
            transition={{ type: "spring", stiffness: 700, damping: 28 }}
            style={{
              backgroundColor: checked ? "#ea580c" : "#52525b",
              boxShadow: checked ? "0 0 12px rgba(234,88,12,0.65)" : "none"
            }}
            className="w-4 h-4 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export interface SegmentOption<T> {
  value: T;
  label: string;
}

export const SegmentedControl = <T extends string | number>({
  options,
  value,
  onChange,
  layoutId,
  className = ""
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  layoutId: string;
  className?: string;
}) => {
  return (
    <div className={`flex bg-[#101012] border border-zinc-900 p-1 rounded-xl h-10 relative overflow-hidden select-none w-full ${className}`}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt.value);
            }}
            className={`flex-1 relative z-10 flex items-center justify-center font-mono text-[9px] font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-350"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`segment-active-${layoutId}`}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="absolute inset-0 bg-accent/20 border border-accent/35 rounded-lg"
              />
            )}
            <span className="relative z-20">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const TactileSlider: React.FC<{
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  className?: string;
  id?: string;
}> = ({ min, max, value, onChange, className = '', id }) => {
  const [isInteracting, setIsInteracting] = React.useState(false);
  const percent = ((value - min) / (max - min)) * 100;
  
  // Adjusted offset computation
  const thumbOffset = percent * 0.16;
  
  return (
    <div 
      className={`relative flex flex-col justify-center h-10 select-none w-full ${className}`}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setIsInteracting(false)}
    >
      {/* Playful Floating Value Tooltip Badge */}
      <AnimatePresence>
        {isInteracting && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: -26, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 6, scale: 0.8, filter: "blur(2px)" }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            style={{ left: `calc(${percent}% - ${thumbOffset}px)` }}
            className="absolute bg-accent text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md shadow-[0_4px_12px_rgba(234,88,12,0.4)] pointer-events-none z-30 transform -translate-x-1/2 select-none border border-accent/50 whitespace-nowrap"
          >
            {value}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="relative flex items-center h-8 w-full cursor-pointer"
      >
        {/* Background Slider Track with Active Glow Fill */}
        <div className="absolute left-0 right-0 h-2 bg-[#101012] border border-zinc-850 rounded-full overflow-hidden shadow-inner pointer-events-none">
          <motion.div 
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            variants={{
              hover: { filter: "brightness(1.15)" },
              initial: { filter: "brightness(1)" }
            }}
            className="h-full bg-gradient-to-r from-accent/80 to-accent"
          />
        </div>
        
        {/* Transparent native range input stacked on top */}
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || min)}
          onFocus={() => setIsInteracting(true)}
          onBlur={() => setIsInteracting(false)}
          className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
        />
        
        {/* Physical Squishy Slider Thumb Cap */}
        <motion.div
          initial={false}
          animate={{ 
            left: `calc(${percent}% - ${thumbOffset}px)`,
            boxShadow: isInteracting 
              ? "0 0 16px rgba(234,88,12,0.8)" 
              : "0 0 6px rgba(0,0,0,0.5)"
          }}
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.25, border: "1.5px solid #ffffff" },
            tap: { scaleX: 1.3, scaleY: 0.8, rotate: 4 } // organic gummy-feeling twist
          }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          className="absolute w-4 h-4 bg-white border border-accent/80 rounded-full pointer-events-none z-20"
        />
      </motion.div>
    </div>
  );
};

export const ThemeSelector: React.FC<{
  themes: { name: string; colors: AppColors }[];
  activeColors: AppColors;
  onSelect: (colors: AppColors) => void;
}> = ({ themes, activeColors, onSelect }) => (
  <div className="grid grid-cols-4 gap-2">
    {themes.map((t) => {
      const isActive = JSON.stringify(activeColors) === JSON.stringify(t.colors);
      return (
        <motion.button
          key={t.name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(t.colors)}
          className={`
            aspect-square rounded-[14px] border-2 transition-colors relative overflow-hidden flex items-center justify-center cursor-pointer shadow-sm
            ${isActive ? "border-accent" : "border-white/5 hover:border-white/20"}
          `}
          style={{ backgroundColor: t.colors.bg }}
          title={t.name}
        >
          <div className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center" style={{ backgroundColor: t.colors.fill }}>
            {isActive && (
              <motion.div 
                layoutId="active-theme-dot"
                className="w-1.5 h-1.5 rounded-full bg-white shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
              />
            )}
          </div>
        </motion.button>
      );
    })}
  </div>
);

export const Button: React.FC<{
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'action';
  icon?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}> = ({ onClick, variant = 'primary', icon, label, className = '', disabled, title }) => {
  const baseClasses = "flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none overflow-hidden origin-center";
  const variants = {
    primary: "btn-primary !rounded-lg " + (icon && label ? "pl-4 pr-3.5" : "px-4"),
    secondary: "bg-[#0b0b0d] hover:bg-zinc-900 text-zinc-300 hover:text-white shadow-[var(--shadow-border)] rounded-lg p-3 md:p-2 text-[10px]",
    ghost: "text-zinc-400 hover:text-white text-[10px] font-mono hover:bg-zinc-900/40 p-2 rounded-lg",
    action: "w-10 h-10 bg-[#09090b]/80 backdrop-blur-md rounded-lg hover:bg-zinc-900 text-accent shadow-[var(--shadow-border)]",
  };

  return (
    <motion.button 
      whileTap={!disabled ? { scale: 0.96 } : {}}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      onClick={onClick} 
      disabled={disabled} 
      title={title} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined !text-[18px] z-10">{icon}</span>}
      {label && <span className="truncate z-10">{label}</span>}
    </motion.button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const isRange = props.type === 'range';
  if (isRange) {
    return <input {...props} className={`range-input py-3 ${props.className || ''}`} />;
  }
  return (
    <motion.div
      whileFocus={{ scale: 1.01 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="relative w-full origin-center"
    >
      <input 
        {...props} 
        className={`input-text ${props.className || ''}`} 
      />
    </motion.div>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <motion.div 
    whileHover={{ scale: 1.01 }}
    whileFocus={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 500, damping: 28 }}
    className="relative group origin-center"
  >
    <select {...props} className={`input-text appearance-none pr-8 py-2 block w-full focus:ring-1 focus:ring-accent/50 ${props.className || ''}`} />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 border-l border-white/10 pl-2 group-hover:text-zinc-300 transition-colors">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </div>
  </motion.div>
);
