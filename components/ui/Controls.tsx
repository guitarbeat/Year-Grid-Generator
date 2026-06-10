import React, { useRef, useState, useEffect } from 'react';
import { AppColors } from "../../types";
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, Check, X, GripVertical, Loader2 } from "lucide-react";

export const SectionGroup: React.FC<{ 
  label: string; 
  children: React.ReactNode; 
  className?: string;
}> = ({ label, children, className = '' }) => (
  <section className={`py-5 px-2 ${className}`}>
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1.5 h-4 bg-accent/40 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.4)]" />
      <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono font-extrabold block transition-colors">{label}</span>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-white/5 to-transparent ml-2" />
    </div>
    {children}
  </section>
);

export const ControlGroup: React.FC<{ 
  label: string; 
  value?: string | number; 
  watchValue?: any;
  children: React.ReactNode;
  className?: string;
}> = ({ label, value, watchValue, children, className = '' }) => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  
  // Track changes to either the numeric view value or an explicit watch value
  const triggerValue = watchValue !== undefined ? watchValue : value;
  const prevValueRef = useRef(triggerValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip initial mount or if no values are provided to monitor
    if (triggerValue === undefined) return;
    if (prevValueRef.current === undefined) {
      prevValueRef.current = triggerValue;
      return;
    }

    if (JSON.stringify(triggerValue) !== JSON.stringify(prevValueRef.current)) {
      prevValueRef.current = triggerValue;

      // Set to saving state instantly
      setStatus('saving');
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // Debounce and settle after 350ms of inactivity
      timeoutRef.current = setTimeout(() => {
        setStatus('success');
        
        // Success state remains for 900ms before returning to idle
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
        }, 900);
      }, 350);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [triggerValue]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-center group min-h-[22px]">
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-sans font-medium text-zinc-400 group-hover:text-zinc-250 transition-colors tracking-wide">
            {label}
          </label>
          
          <AnimatePresence mode="popLayout" initial={false}>
            {status === 'saving' && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                className="flex items-center gap-1 text-[8px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-md font-bold tracking-wider"
              >
                <Loader2 className="h-2 w-2 animate-spin text-accent" />
                <span>SAVING</span>
              </motion.span>
            )}
            {status === 'success' && (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-bold tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.1)]"
              >
                <Check className="h-2.5 w-2.5 text-emerald-450" />
                <span>SAVED</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {value !== undefined && (
          <motion.span 
            key={value}
            initial={{ opacity: 0, scale: 0.8, y: 5, filter: "blur(4px)" }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              filter: "blur(0px)",
            }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            className={`tabular-nums text-[10px] font-mono px-2.5 py-0.5 border rounded-md font-semibold tracking-wide transition-all duration-300 ${
              status === 'success' 
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.15)] scale-102' 
                : 'text-zinc-300 border-white/5 bg-white/[0.04] shadow-sm hover:border-white/10'
            }`}
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
};

export interface ComboboxOption {
  value: string;
  label: string;
}

export const Combobox: React.FC<{
  options: ComboboxOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ options, value, onChange, placeholder = "Select...", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  
  const filtered = query === "" ? options : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative select-none w-full ${className}`}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900/50 border border-zinc-800 shadow-inner rounded-xl px-4 py-3 text-left transition-colors hover:bg-zinc-900 hover:border-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent"
      >
        <span className="text-xs font-sans font-medium text-zinc-200 truncate tracking-wide">
          {selected ? selected.label : <span className="text-zinc-600">{placeholder}</span>}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", damping: 20, bounce: 0 }}>
          <ChevronDown className="h-4 w-4 text-zinc-500 hover:text-white transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 4, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, scale: 0.98, filter: "blur(2px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="absolute top-full left-0 right-0 z-50 bg-[#0f0f12] border border-white/5 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-black/20">
              <Search className="h-4 w-4 text-zinc-500 mr-2" />
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-xs font-sans text-zinc-200 w-full placeholder:text-zinc-600"
              />
            </div>
            <motion.div 
              variants={{
                visible: { transition: { staggerChildren: 0.03 } }
              }}
              initial="hidden" animate="visible"
              className="max-h-56 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-0.5"
            >
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs font-sans text-zinc-600">No results found.</div>
              ) : (
                filtered.map(opt => (
                  <motion.button
                    variants={{
                      hidden: { opacity: 0, x: -8, filter: "blur(2px)" },
                      visible: { opacity: 1, x: 0, filter: "blur(0px)" }
                    }}
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setIsOpen(false); setQuery(""); }}
                    className="flex justify-between items-center w-full px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors outline-none focus-visible:bg-white/10"
                  >
                    <span className={`text-[11px] tracking-wide font-sans ${opt.value === value ? 'text-accent font-bold drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]' : 'text-zinc-400 font-medium'}`}>
                      {opt.label}
                    </span>
                    {opt.value === value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                      >
                        <Check className="h-4 w-4 text-accent" />
                      </motion.div>
                    )}
                  </motion.button>
                ))
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MultiTagSelect: React.FC<{
  options: ComboboxOption[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  className?: string;
}> = ({ options, value, onChange, placeholder = "Add tag...", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  
  const availableOptions = options.filter(o => !value.includes(o.value));
  const filtered = query === "" ? availableOptions : availableOptions.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const removeTag = (valToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== valToRemove));
  };

  return (
    <div ref={containerRef} className={`relative select-none w-full flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap gap-2.5 items-center bg-zinc-900/30 p-2 border border-zinc-800/50 rounded-xl min-h-[44px]">
        <AnimatePresence mode="popLayout">
          {value.map(val => {
            const opt = options.find(o => o.value === val);
            if (!opt) return null;
            return (
              <motion.div
                key={val}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, y: 10, filter: "blur(4px)" }}
                transition={{ type: "spring", stiffness: 500, damping: 25, bounce: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/10 shadow-sm rounded-lg group hover:border-red-500/40 hover:bg-red-500/10 cursor-pointer transition-colors"
                onClick={(e) => removeTag(val, e as any)}
              >
                <span className="text-[10px] font-sans font-medium text-zinc-300 group-hover:text-red-300 transition-colors tracking-wide">{opt.label}</span>
                <X className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="h-7 px-3 flex items-center justify-center bg-white/[0.03] border border-dashed border-white/10 hover:border-white/30 rounded-lg text-zinc-500 hover:text-white transition-colors"
        >
          <span className="text-[10px] font-mono font-medium tracking-wider">{placeholder}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 4, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, scale: 0.98, filter: "blur(2px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-[#0f0f12] border border-white/5 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-black/20">
              <Search className="h-4 w-4 text-zinc-500 mr-2" />
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search to add..."
                className="bg-transparent border-none outline-none text-xs font-sans text-zinc-200 w-full placeholder:text-zinc-600"
              />
            </div>
            <motion.div 
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              initial="hidden" animate="visible"
              className="max-h-48 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-0.5"
            >
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs font-sans text-zinc-600">No options left.</div>
              ) : (
                filtered.map(opt => (
                  <motion.button
                    variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange([...value, opt.value]); setIsOpen(false); setQuery(""); }}
                    className="flex justify-start items-center w-full px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors outline-none focus-visible:bg-white/10"
                  >
                    <span className="text-[11px] font-sans font-medium text-zinc-300 tracking-wide">{opt.label}</span>
                  </motion.button>
                ))
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
      className="flex items-center justify-between group py-3 px-4 hover:bg-white/[0.03] active:bg-white/[0.01] rounded-xl cursor-pointer transition-colors select-none border border-transparent hover:border-white/5" 
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? onChange(!checked) : undefined}
    >
      <label htmlFor={id} className="text-[11px] text-zinc-400 font-sans font-medium cursor-pointer group-hover:text-zinc-100 transition-colors select-none pointer-events-none tracking-wide">{label}</label>
      <div className="relative inline-flex items-center cursor-pointer pointer-events-none">
        <div className={`w-12 h-7 rounded-full flex p-1 transition-colors duration-300 items-center shadow-inner ${checked ? 'bg-accent/20 border border-accent/40 justify-end' : 'bg-black/60 border border-zinc-800 justify-start'}`}>
          <motion.div 
            layout
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.05, filter: "brightness(1.15)" },
              tap: { scale: 0.90, width: 20 } 
            }}
            transition={{ type: "spring", stiffness: 700, damping: 28, bounce: 0 }}
            style={{
              backgroundColor: checked ? "#ea580c" : "#52525b",
            }}
            className="h-5 w-5 rounded-full"
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

export const SegmentedControl = <T extends string | number | boolean>({
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
    <div 
      className={`flex bg-zinc-950 border border-white/5 p-1 rounded-xl h-[40px] relative overflow-hidden select-none w-full shadow-inner ${className}`}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt.value);
            }}
            className={`flex-1 relative z-10 flex items-center justify-center font-sans text-[11px] font-semibold tracking-wide transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-accent/50 rounded-lg active:scale-[0.96] ${
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`segment-active-${layoutId}`}
                transition={{ type: "spring", stiffness: 380, damping: 28, bounce: 0 }}
                className="absolute inset-0 bg-accent border-[0.5px] border-white/20 rounded-lg shadow-md"
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
  const [isHovered, setIsHovered] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const updateValue = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const val = Math.round(min + (pct / 100) * (max - min));
    onChange(val);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    updateValue(e);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch { /* capture fallback */ }
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.buttons) return;
    updateValue(e);
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { /* release fallback */ }
  };

  return (
    <div 
      className={`relative flex flex-col justify-center h-14 w-full select-none touch-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex items-center h-8 w-full cursor-pointer touch-none group"
      >
        {/* Track Background */}
        <div className="absolute left-0 right-0 h-2 bg-black/60 border border-white/5 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] pointer-events-none transition-colors group-hover:border-white/10">
          {/* Animated Liquid Trace with rounded full and orange glow */}
          <motion.div 
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 600, damping: 40, bounce: 0 }}
            className="absolute h-full bg-gradient-to-r from-accent/80 to-accent rounded-full"
          />
        </div>

        {/* Micro-scale Grid lines underneath standard slider track for luxurious feel */}
        <div className="absolute w-full top-6 left-0 right-0 flex justify-between px-1 pointer-events-none opacity-30 select-none">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="w-[1px] h-1.5 bg-zinc-600 rounded-full" />
          ))}
        </div>

        {/* Tactile Thumb */}
        <motion.div
           animate={{ 
            left: `calc(${percent}% - 12px)`,
            scale: isHovered ? 1.15 : 1,
            boxShadow: isHovered 
              ? "0 0 0 5px rgba(234,88,12,0.18), 0 8px 16px rgba(0,0,0,0.6)" 
              : "0 4px 10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)"
          }}
          transition={{ type: "spring", stiffness: 700, damping: 30, bounce: 0 }}
          className="absolute w-6 h-6 bg-white border-2 border-accent rounded-full z-20 pointer-events-none flex items-center justify-center shadow-lg origin-center backdrop-blur-md"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-accent/80" />
          
          {/* Floating Contextual Tooltip */}
          <AnimatePresence mode="popLayout">
            {isHovered && (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, y: 8, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: -34, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 4, scale: 0.8, filter: "blur(2px)" }}
                transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                className="absolute left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-lg border border-accent/20 whitespace-nowrap"
              >
                {value}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export const DualMonthRangeSlider: React.FC<{
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  className?: string;
}> = ({ min, max, value, onChange, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<0 | 1 | "track" | null>(null);
  const [hoverState, setHoverState] = useState<0 | 1 | "track" | null>(null);
  
  const [startX, setStartX] = useState(0);
  const [startRange, setStartRange] = useState<[number, number]>([...value]);

  const range = max - min;
  const leftPct = Math.max(0, Math.min(100, ((value[0] - min) / range) * 100));
  const widthPct = Math.max(0, Math.min(100, ((value[1] - value[0]) / range) * 100));

  const handlePointerDown = (e: React.PointerEvent, type: 0 | 1 | "track") => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveThumb(type);
    setStartX(e.clientX);
    setStartRange([...value]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeThumb === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pxPerUnit = rect.width / range;
    const deltaX = e.clientX - startX;
    const deltaUnits = Math.round(deltaX / pxPerUnit);

    if (activeThumb === "track") {
      const shift = deltaUnits;
      const span = startRange[1] - startRange[0];
      let newStart = startRange[0] + shift;
      let newEnd = startRange[1] + shift;
      if (newStart < min) { newStart = min; newEnd = min + span; }
      if (newEnd > max) { newEnd = max; newStart = max - span; }
      onChange([newStart, newEnd]);
    } else if (activeThumb === 0) {
      const newStart = Math.max(min, Math.min(startRange[0] + deltaUnits, value[1] - 1));
      onChange([newStart, value[1]]);
    } else if (activeThumb === 1) {
      const newEnd = Math.min(max, Math.max(startRange[1] + deltaUnits, value[0] + 1));
      onChange([value[0], newEnd]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setActiveThumb(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { /* Suppress fast release errors */ }
  };

  const handleTrackDirectClick = (e: React.PointerEvent) => {
    if (activeThumb !== null) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const val = Math.round(min + (pct / 100) * range);

    if (val < value[0]) {
      onChange([val, value[1]]);
    } else if (val > value[1]) {
      onChange([value[0], val]);
    }
  };

  return (
    <div 
      className={`relative flex items-center h-14 w-full select-none touch-none ${className}`}
      ref={containerRef}
      onPointerDown={handleTrackDirectClick}
    >
      <div className="absolute inset-0 top-3 bottom-3 bg-black/40 border border-white/5 rounded-xl flex items-center px-1 overflow-hidden pointer-events-none">
        {Array.from({ length: 61 }).map((_, i) => {
          const isYear = i % 12 === 0;
          const isQuart = i % 3 === 0;
          return (
            <div 
              key={i} 
              className={`flex-1 h-full border-r ${
                isYear 
                  ? "border-white/20 h-3.5 mt-0.5" 
                  : isQuart 
                    ? "border-white/10 h-2 mt-1.5" 
                    : "border-white/[0.03] h-1 mt-2"
              }`} 
            />
          );
        })}
      </div>

      <motion.div
        animate={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        transition={{ type: "spring", stiffness: 500, damping: 40, bounce: 0 }}
        className={`absolute h-10 top-2 z-10 rounded-xl flex items-center justify-between border shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_12px_rgba(234,88,12,0.15)] backdrop-blur-md overflow-hidden transition-colors duration-300 ${
          activeThumb === "track" ? "bg-accent/25 border-accent shadow-[0_0_24px_rgba(234,88,12,0.3)] cursor-grabbing" : 
          hoverState === "track" ? "bg-accent/20 border-accent/80 cursor-grab" : 
          "bg-accent/10 border-accent/40 cursor-grab"
        }`}
        onPointerDown={(e) => handlePointerDown(e, "track")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setHoverState("track")}
        onMouseLeave={() => setHoverState(null)}
      >
        {/* Fill Highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/15 via-accent/5 to-transparent pointer-events-none" />

        {/* Left Anchor Grip */}
        <div 
          className="relative w-6 h-full flex flex-col items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors z-20 cursor-ew-resize"
          onPointerDown={(e) => handlePointerDown(e, 0)}
          onMouseEnter={() => setHoverState(0)}
          onMouseLeave={() => setHoverState(null)}
        >
          <GripVertical className="h-3.5 w-3.5 text-white/50" />
        </div>

        {/* Center Readout */}
        <div className="flex-1 px-1 flex justify-center items-center pointer-events-none z-20 tabular-nums">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white drop-shadow-md">
            {value[1] - value[0]}<span className="text-white/50 ml-0.5">MO</span>
          </span>
        </div>

        {/* Right Anchor Grip */}
        <div 
          className="relative w-6 h-full flex flex-col items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors z-20 cursor-ew-resize"
          onPointerDown={(e) => handlePointerDown(e, 1)}
          onMouseEnter={() => setHoverState(1)}
          onMouseLeave={() => setHoverState(null)}
        >
          <GripVertical className="h-3.5 w-3.5 text-white/50" />
        </div>
      </motion.div>
    </div>
  );
};

export const ThemeSelector: React.FC<{
  themes: { name: string; colors: AppColors }[];
  activeColors: AppColors;
  onSelect: (colors: AppColors) => void;
}> = ({ themes, activeColors, onSelect }) => (
  <div className="grid grid-cols-4 gap-3">
    {themes.map((t) => {
      const isActive = JSON.stringify(activeColors) === JSON.stringify(t.colors);
      return (
        <motion.button
          key={t.name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(t.colors)}
          className={`
            aspect-square rounded-[16px] border-2 transition-[border-color,box-shadow] duration-300 relative overflow-hidden flex items-center justify-center cursor-pointer
            ${isActive ? "border-accent shadow-[0_0_16px_rgba(234,88,12,0.4)]" : "border-white/5 shadow-md hover:border-white/20 hover:shadow-lg"}
          `}
          style={{ backgroundColor: t.colors.bg }}
          title={t.name}
        >
          <div className="w-6 h-6 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-center" style={{ backgroundColor: t.colors.fill }}>
            {isActive && (
              <motion.div 
                layoutId="active-theme-dot"
                className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
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
  const baseClasses = "flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none overflow-hidden origin-center active:scale-[0.96] duration-150 ease-out";
  const variants = {
    primary: "btn-primary !rounded-xl " + (icon && label ? "pl-5 pr-4 py-3 text-[11px]" : "px-5 py-3 text-[11px]"),
    secondary: "bg-[#0b0b0d] hover:bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white shadow-md hover:shadow-lg rounded-xl p-3 md:p-2.5 text-[10px]",
    ghost: "text-zinc-400 hover:text-white text-[10px] font-mono hover:bg-zinc-900/60 p-2.5 rounded-xl",
    action: "w-11 h-11 bg-black/40 backdrop-blur-md rounded-xl hover:bg-zinc-900 text-accent border border-white/5 hover:border-accent/30 hover:shadow-[0_0_12px_rgba(234,88,12,0.2)]",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      title={title} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined !text-[18px] z-10">{icon}</span>}
      {label && <span className="truncate z-10">{label}</span>}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const isRange = props.type === 'range';
  if (isRange) {
    return <input {...props} className={`range-input py-3 ${props.className || ''}`} />;
  }
  return (
    <div className="relative w-full group">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/40 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 rounded-xl blur-md transition-opacity duration-500 pointer-events-none" />
      <input 
        {...props} 
        className={`relative w-full bg-black/50 border border-zinc-800 px-4 py-3 rounded-xl text-xs font-sans text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-[border-color,box-shadow] duration-300 placeholder:text-zinc-600 shadow-inner ${props.className || ''}`} 
      />
    </div>
  );
};

