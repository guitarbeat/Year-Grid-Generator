import React from 'react';
import { motion } from 'motion/react';

/**
 * Common UI Components for Year Grid Generator
 * Consolidates patterns found in Sidebar and Modals
 */

export const SidebarSection: React.FC<{ 
  label: string; 
  children: React.ReactNode; 
  className?: string;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}> = ({ label, children, className = '', isCollapsible = true, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const elementId = `sec-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section className={`sidebar-section px-1 ${className}`}>
      <div 
        id={elementId}
        data-toc
        data-toc-depth="3"
        data-toc-title={label}
        className={`flex items-center justify-between mb-4 ${isCollapsible ? 'cursor-pointer select-none group' : ''}`}
        onClick={() => isCollapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-3 bg-accent/30" />
          <span className={`sidebar-label !mb-0 transition-colors ${isCollapsible ? 'group-hover:text-white' : ''}`}>{label}</span>
        </div>
        {isCollapsible && (
          <span className={`material-symbols-outlined text-zinc-500 group-hover:text-white transition-transform duration-300 text-[16px] ${isOpen ? 'rotate-180 text-zinc-300' : ''}`}>
            expand_more
          </span>
        )}
      </div>
      {isOpen && children}
    </section>
  );
};

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
        <span className="tabular-nums text-[9px] font-mono text-accent bg-accent/5 px-2 py-0.5 border border-accent/15 rounded-md font-bold tracking-wider">{value}</span>
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
}> = ({ id, label, checked, onChange }) => (
  <div className="flex items-center justify-between group py-1.5 px-0.5">
    <label htmlFor={id} className="text-[11px] text-zinc-400 font-mono cursor-pointer group-hover:text-zinc-200 transition-colors select-none">{label}</label>
    <label className="toggle-checkbox relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className="toggle-track relative w-8 h-4.5 bg-[#121214] rounded-full transition-[background-color,border-color] duration-200 border border-zinc-800/80">
        <div className={`toggle-thumb absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full transition-[transform,background-color,box-shadow] duration-200 ease-out ${checked ? 'translate-x-[11px] bg-accent shadow-[0_0_10px_rgba(234,88,12,0.4)]' : 'bg-zinc-600'}`}></div>
      </div>
    </label>
  </div>
);

export const SegmentedControl: React.FC<{
  options: { id: string; label: string; icon?: string }[];
  activeId: string;
  onChange: (id: string) => void;
  cols?: number;
}> = ({ options, activeId, onChange, cols = 3 }) => {
  const transitionLayoutId = React.useId();

  return (
    <div 
      className="flex p-0.5 bg-[#09090b] border border-white/[0.04] rounded-xl select-none w-full relative h-[42px]"
      style={{ display: 'flex' }}
    >
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`
              flex-1 relative flex flex-col items-center justify-center gap-0.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-[color,scale] duration-200 active:scale-[0.96] z-10 font-bold min-h-[40px] cursor-pointer rounded-lg
              ${isActive ? 'text-accent' : 'text-zinc-500 hover:text-zinc-200'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId={transitionLayoutId}
                className="absolute inset-0 bg-[#141416]/90 border border-zinc-800 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                transition={{ type: "spring" as const, stiffness: 380, damping: 28 }}
              />
            )}
            {opt.icon && (
              <span className={`material-symbols-outlined !text-[14px] leading-none ${isActive ? 'opacity-100 text-accent' : 'opacity-40'} transition-opacity`}>
                {opt.icon}
              </span>
            )}
            <span className="text-[8px] uppercase tracking-wider whitespace-nowrap leading-none mt-0.5 font-bold">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] text-zinc-500 uppercase font-mono font-bold tracking-widest">{label}</label>
    <div className="flex items-center gap-0 bg-[#070709] border border-zinc-800 rounded-lg overflow-hidden focus-within:border-accent/40 transition-colors shadow-inner">
      <div className="p-1 px-2 bg-zinc-900/60 border-r border-zinc-800">
        <input 
          type="color" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded-md border-0 bg-transparent cursor-pointer hover:scale-105 transition-transform"
        />
      </div>
      <span className="flex-1 text-[10px] font-mono text-zinc-400 select-all px-3 py-1.5">
        {value.slice(1).toUpperCase()}
      </span>
    </div>
  </div>
);

export const Modal: React.FC<{
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, subtitle, icon, iconColor = 'bg-accent', onClose, children, footer }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-[#0b0b0d] border border-zinc-800/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/60 flex justify-between items-center bg-[#101014]/60">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-8 h-8 ${iconColor} rounded-lg flex items-center justify-center shadow-lg`}>
              <span className="material-symbols-outlined text-white text-xl">{icon}</span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            {subtitle && <p className="text-[10px] text-zinc-500 uppercase font-medium">{subtitle}</p>}
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>

      {footer && (
        <div className="p-4 border-t border-zinc-800/60 bg-[#101014]/60">
          {footer}
        </div>
      )}
    </div>
  </div>
);

export const Button: React.FC<{
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'action';
  icon?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}> = ({ onClick, variant = 'primary', icon, label, className = '', disabled, title }) => {
  const baseClasses = "flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider transition-[border-color,background-color,color,scale,opacity] disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const variants = {
    primary: "btn-primary !rounded-lg active:scale-[0.96] " + (icon && label ? "pl-4 pr-3.5" : "px-4"),
    secondary: "bg-[#0b0b0d] hover:bg-zinc-900 text-zinc-300 hover:text-white shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] rounded-lg p-3 md:p-2 text-[10px] active:scale-[0.96] duration-150 transition-[box-shadow,background-color,color,scale]",
    ghost: "text-zinc-400 hover:text-white text-[10px] font-mono hover:bg-zinc-900/40 p-2 rounded-lg duration-150 active:scale-[0.96] transition-[background-color,color,scale]",
    action: "w-10 h-10 bg-[#09090b]/80 backdrop-blur-md rounded-lg hover:bg-zinc-900 text-accent shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96] duration-150 transition-[box-shadow,background-color,scale,opacity]",
  };

  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {icon && <span className="material-symbols-outlined !text-[18px]">{icon}</span>}
      {label && <span className="truncate">{label}</span>}
    </button>
  );
};

export const IconButton: React.FC<{
  onClick: () => void;
  icon: string;
  className?: string;
  title?: string;
}> = ({ onClick, icon, className = '', title }) => (
  <button 
    onClick={onClick}
    title={title}
    className={`w-10 h-10 flex items-center justify-center transition-[transform,opacity,background-color,color,border-color] active:scale-[0.96] ${className}`}
  >
    <span className="material-symbols-outlined">{icon}</span>
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`input-text ${props.className || ''}`} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`input-text ${props.className || ''} py-1.5`} />
);
