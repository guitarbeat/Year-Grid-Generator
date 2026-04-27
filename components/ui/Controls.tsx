import React from 'react';

/**
 * Common UI Components for Year Grid Generator
 * Consolidates patterns found in Sidebar and Modals
 */

export const SidebarSection: React.FC<{ 
  label: string; 
  children: React.ReactNode; 
  className?: string;
}> = ({ label, children, className = '' }) => (
  <section className={`sidebar-section px-1 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-3 bg-accent/30" />
      <span className="sidebar-label !mb-0">{label}</span>
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
      <label className="text-[10px] text-gray-500 uppercase font-mono font-bold tracking-tight group-hover:text-gray-400 transition-colors">{label}</label>
      {value !== undefined && (
        <span className="text-[10px] font-mono text-accent bg-accent/5 px-1.5 py-0.5 border border-accent/20">{value}</span>
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
  <div className="flex items-center justify-between group py-1">
    <label htmlFor={id} className="text-[11px] text-gray-500 font-mono cursor-pointer group-hover:text-gray-300 transition-colors">{label}</label>
    <label className="toggle-checkbox relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="toggle-track peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:outline-none peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#111]">
        <div className={`toggle-thumb ${checked ? 'translate-x-3 bg-accent' : 'translate-x-0 bg-[#333]'}`}></div>
      </div>
    </label>
  </div>
);

export const SegmentedControl: React.FC<{
  options: { id: string; label: string; icon?: string }[];
  activeId: string;
  onChange: (id: string) => void;
  cols?: number;
}> = ({ options, activeId, onChange, cols = 3 }) => (
  <div className={`grid grid-cols-${cols} gap-[1px] bg-[#1a1a1a] border border-[#1a1a1a]`}>
    {options.map((opt) => (
      <button
        key={opt.id}
        onClick={() => onChange(opt.id)}
        className={`
          flex flex-col items-center justify-center gap-1.5 py-3 transition-all font-mono relative overflow-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none z-10
          ${activeId === opt.id 
            ? 'bg-[#0a0a0a] text-accent font-bold' 
            : 'bg-[#050505] text-gray-600 hover:text-gray-400 hover:bg-[#080808]'}
        `}
      >
        {activeId === opt.id && (
          <div className="absolute top-0 left-0 w-full h-[1px] bg-accent/50 shadow-[0_0_8px_rgba(234,88,12,0.8)]" />
        )}
        {opt.icon && (
          <span className={`material-symbols-outlined !text-[18px] ${activeId === opt.id ? 'opacity-100' : 'opacity-40'}`} aria-hidden="true">{opt.icon}</span>
        )}
        <span className="text-[9px] uppercase tracking-tighter">{opt.label}</span>
      </button>
    ))}
  </div>
);

export const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] text-gray-600 uppercase font-mono font-bold tracking-widest">{label}</label>
    <div className="flex items-center gap-0 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm overflow-hidden focus-within:border-accent/40 transition-colors">
      <div className="p-1 px-1.5 bg-[#111] border-r border-[#1a1a1a]">
        <input 
          type="color" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-4 h-4 rounded-none border-0 bg-transparent cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none rounded-sm"
        />
      </div>
      <span className="flex-1 text-[10px] font-mono text-gray-500 select-all px-2 py-1.5">
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
    <div className="bg-[#111] border border-[#222] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#161616]">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-8 h-8 ${iconColor} rounded-lg flex items-center justify-center shadow-lg`}>
              <span className="material-symbols-outlined text-white text-xl">{icon}</span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            {subtitle && <p className="text-[10px] text-gray-500 uppercase font-medium">{subtitle}</p>}
          </div>
        </div>
        <button onClick={onClose} aria-label="Close modal" className="text-gray-500 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none rounded-sm">
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>

      {footer && (
        <div className="p-4 border-t border-[#222] bg-[#161616]">
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
  'aria-label'?: string;
  title?: string;
}> = ({ onClick, variant = 'primary', icon, label, className = '', disabled, 'aria-label': ariaLabel, title }) => {
  const baseClasses = "flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none";
  const variants = {
    primary: "btn-primary",
    secondary: "bg-[#0a0a0a] text-gray-500 hover:text-white border border-[#1a1a1a] hover:border-[#222] rounded-sm p-3 md:p-2 text-[10px] active:translate-y-[1px]",
    ghost: "text-gray-500 hover:text-white text-[10px] font-mono",
    action: "w-10 h-10 bg-[#0a0a0a] rounded-sm hover:bg-[#111] text-accent border border-[#1a1a1a] active:translate-y-[1px] shadow-[0_2px_0_#000]",
  };

  return (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} title={title} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {icon && <span className="material-symbols-outlined !text-[18px]" aria-hidden="true">{icon}</span>}
      {label && <span className="truncate">{label}</span>}
    </button>
  );
};

export const IconButton: React.FC<{
  onClick: () => void;
  icon: string;
  className?: string;
  title?: string;
  'aria-label'?: string;
}> = ({ onClick, icon, className = '', title, 'aria-label': ariaLabel }) => (
  <button 
    onClick={onClick}
    title={title}
    aria-label={ariaLabel}
    className={`w-10 h-10 flex items-center justify-center transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${className}`}
  >
    <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`input-text ${props.className || ''}`} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`input-text ${props.className || ''} py-1.5`} />
);
