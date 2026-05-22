import React, { useMemo } from 'react';
import { AppConfig, AppColors } from '../../types';
import { SidebarSection, ControlGroup, Toggle, Input, Select } from '../ui/Controls';
import { oklchToHex, hexToOklch } from '../../utils/colorUtils';

export const THEMES: { name: string; colors: AppColors }[] = [
  {
    name: "Classic",
    colors: {
      bg: "#0a0a0a", text: "#525252", empty: "#1f1f1f", fill: "#3b82f6",
      pastDay: "#ffffff", futureDay: "#2c2c2e", today: "#ff3b30",
      significant: "#FFD60A", weekend: "#515155", stats: "#3b82f6",
    },
  },
  {
    name: "Ember",
    colors: {
      bg: "#0a0a0a", text: "#525252", empty: "#1f1f1f", fill: "#ea580c",
      pastDay: "#ffffff", futureDay: "#2c2c2e", today: "#ff3b30",
      significant: "#FFD60A", weekend: "#515155", stats: "#ff9f0a",
    },
  },
  {
    name: "GitHub",
    colors: {
      bg: "#0d1117", text: "#8b949e", empty: "#161b22", fill: "#39d353",
      pastDay: "#ffffff", futureDay: "#161b22", today: "#f85149",
      significant: "#d29922", weekend: "#30363d", stats: "#39d353",
    },
  },
  {
    name: "Ocean",
    colors: {
      bg: "#0f172a", text: "#94a3b8", empty: "#1e293b", fill: "#38bdf8",
      pastDay: "#ffffff", futureDay: "#1e293b", today: "#f43f5e",
      significant: "#fbbf24", weekend: "#334155", stats: "#38bdf8",
    },
  },
  {
    name: "Aurora (OKLCH)",
    colors: {
      bg: "#080c09", text: "#8da995", empty: "#121b14", fill: "#03c988",
      pastDay: "#eafef4", futureDay: "#17231a", today: "#f43f5e",
      significant: "#10b981", weekend: "#283b2d", stats: "#03c988",
    }
  },
  {
    name: "Aura Frost",
    colors: {
      bg: "#060b0e", text: "#8fa3b0", empty: "#10181e", fill: "#0ea5e9",
      pastDay: "#f0f9ff", futureDay: "#16222a", today: "#f43f5e",
      significant: "#ffbf00", weekend: "#2c3e4c", stats: "#0ea5e9",
    }
  },
  {
    name: "Cyber Lav",
    colors: {
      bg: "#0a080d", text: "#aea3bf", empty: "#17121f", fill: "#a855f7",
      pastDay: "#faf5ff", futureDay: "#211a2d", today: "#ff3366",
      significant: "#ffcc00", weekend: "#382c4c", stats: "#a855f7",
    }
  },
  {
    name: "Champagne",
    colors: {
      bg: "#0d0c0a", text: "#cca780", empty: "#1e1b15", fill: "#d4af37",
      pastDay: "#fffdf9", futureDay: "#2a251e", today: "#f53f3f",
      significant: "#ffdf00", weekend: "#4b4132", stats: "#d4af37",
    }
  },
];

interface Props {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  searchQuery?: string;
}

export const AestheticsTab: React.FC<Props> = ({ config, setConfig, searchQuery = "" }) => {
  const updateConfig = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const applyTheme = (colors: AppColors) => {
    setConfig((prev) => ({ ...prev, colors }));
  };

  // Live conversion of the current primary fill to OKLCH
  const currentOklch = useMemo(() => {
    return hexToOklch(config.colors.fill);
  }, [config.colors.fill]);

  // Handle live OKLCH slider changes
  const handleOklchChange = (field: 'l' | 'c' | 'h', val: number) => {
    const nextOklch = { ...currentOklch, [field]: val };
    const exactHexFill = oklchToHex(nextOklch.l, nextOklch.c, nextOklch.h);

    setConfig((prev) => {
      const updatedColors = { ...prev.colors, fill: exactHexFill, stats: exactHexFill };

      // Optional smart harmonization toggle: update remaining colors using mathematically perfect perceptual steps
      // This produces extremely high-fidelity variations matching the selected hue
      const C_clamped = Math.max(0.02, nextOklch.c);
      
      updatedColors.bg = oklchToHex(0.06, Math.min(C_clamped * 0.2, 0.025), nextOklch.h);
      updatedColors.empty = oklchToHex(0.12, Math.min(C_clamped * 0.28, 0.04), nextOklch.h);
      updatedColors.futureDay = oklchToHex(0.16, Math.min(C_clamped * 0.25, 0.035), nextOklch.h);
      updatedColors.pastDay = oklchToHex(0.96, Math.min(C_clamped * 0.08, 0.015), nextOklch.h);
      updatedColors.today = oklchToHex(0.62, 0.28, (nextOklch.h + 125) % 360); // Complementary Peak
      updatedColors.significant = oklchToHex(0.85, 0.22, (nextOklch.h + 60) % 360); // Soft gold variation
      updatedColors.weekend = oklchToHex(0.38, Math.min(C_clamped * 0.45, 0.07), nextOklch.h);
      updatedColors.text = oklchToHex(0.62, Math.min(C_clamped * 0.22, 0.03), nextOklch.h);

      return {
        ...prev,
        colors: updatedColors,
      };
    });
  };

  const matches = (label: string, keywords: string[] = []) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      label.toLowerCase().includes(q) ||
      keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  };

  const hasThemeMatch = matches("Color & Theme", ["palette", "classic", "ember", "github", "ocean", "forest", "berry", "theme", "colors", "transparent", "background", "oklch"]);
  const hasSizingMatch = matches("Canvas Sizing", ["cell", "dot size", "canvas", "sizing", "gap", "radius", "corner"]);
  const hasTypographyMatch = matches("Typography", ["font size", "link", "family", "inter", "terminal", "serif", "typography"]);

  return (
    <div className="animate-fade-in space-y-2">
      {hasThemeMatch && (
        <SidebarSection 
          key={searchQuery ? "open-theme" : "closed-theme"}
          label="Color & Theme" 
          defaultOpen={true} 
          className="pt-4"
        >
          <div className="space-y-6">
            <div>
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-tight mb-3 block border-b border-border/40 pb-1">
                Color Palette Presets
              </label>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((t) => {
                  const isActive = JSON.stringify(config.colors) === JSON.stringify(t.colors);
                  return (
                    <button
                      key={t.name}
                      onClick={() => applyTheme(t.colors)}
                      className={`
                        aspect-square rounded-full border-2 transition-all relative overflow-hidden active:scale-95 shadow-md flex items-center justify-center
                        ${isActive ? "border-accent scale-105" : "border-white/5 opacity-80 hover:opacity-100"}
                      `}
                      style={{ backgroundColor: t.colors.bg }}
                      title={t.name}
                    >
                      <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: t.colors.fill }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OKLCH Color Harmonizer */}
            <div className="bg-[#09090b] p-3 rounded-lg border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                <span className="text-[10px] text-white font-mono uppercase tracking-wider font-bold">
                  OKLCH Harmonizer
                </span>
                <span className="text-[8px] px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded font-mono text-accent select-none tabular-nums">
                  L {currentOklch.l.toFixed(2)} C {currentOklch.c.toFixed(2)} H {currentOklch.h}°
                </span>
              </div>

              {/* Lightness (L) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>Perceptual Lightness (L)</span>
                  <span className="tabular-nums text-accent">{Math.round(currentOklch.l * 100)}%</span>
                </div>
                <Input 
                  type="range" 
                  min="0.10" 
                  max="0.95" 
                  step="0.01" 
                  value={currentOklch.l} 
                  onChange={(e) => handleOklchChange('l', parseFloat(e.target.value))} 
                  className="w-full" 
                />
              </div>

              {/* Chroma (C) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>Chroma Saturation (C)</span>
                  <span className="tabular-nums text-accent">{currentOklch.c.toFixed(2)}</span>
                </div>
                <Input 
                  type="range" 
                  min="0.00" 
                  max="0.40" 
                  step="0.01" 
                  value={currentOklch.c} 
                  onChange={(e) => handleOklchChange('c', parseFloat(e.target.value))} 
                  className="w-full" 
                />
              </div>

              {/* Hue (H) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>Hue Rotation (H)</span>
                  <span className="tabular-nums text-accent">{currentOklch.h}°</span>
                </div>
                <Input 
                  type="range" 
                  min="0" 
                  max="360" 
                  step="1" 
                  value={currentOklch.h} 
                  onChange={(e) => handleOklchChange('h', parseInt(e.target.value))} 
                  className="w-full animate-pulse-slight" 
                />
              </div>

              {/* Color previews */}
              <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-white/5">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded border border-white/10" style={{ backgroundColor: config.colors.fill }} />
                  <span className="text-[7.5px] font-mono text-gray-500 uppercase">Fill</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded border border-white/10" style={{ backgroundColor: config.colors.today }} />
                  <span className="text-[7.5px] font-mono text-gray-500 uppercase">Today</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded border border-white/10" style={{ backgroundColor: config.colors.bg }} />
                  <span className="text-[7.5px] font-mono text-gray-500 uppercase">Bg</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded border border-white/10" style={{ backgroundColor: config.colors.empty }} />
                  <span className="text-[7.5px] font-mono text-gray-500 uppercase">Empty</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded border border-white/10" style={{ backgroundColor: config.colors.text }} />
                  <span className="text-[7.5px] font-mono text-gray-500 uppercase">Text</span>
                </div>
              </div>
            </div>

            <ControlGroup label="Background Overlay">
              <Toggle id="chk-trans" label="Output Transparent Background" checked={config.transparentBg} onChange={(v) => updateConfig("transparentBg", v)} />
            </ControlGroup>
          </div>
        </SidebarSection>
      )}

      {hasSizingMatch && (
        <SidebarSection 
          key={searchQuery ? "open-sizing" : "closed-sizing"}
          label="Canvas Sizing" 
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                <span>Cell Dot Size</span>
                <span className="text-accent text-[12px]">{config.dotSize}px</span>
              </label>
              <Input type="range" min="2" max="64" step="1" value={config.dotSize} onChange={(e) => updateConfig("dotSize", parseInt(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                <span>Global Gap</span>
                <span className="text-accent text-[12px]">{config.gap}px</span>
              </label>
              <Input type="range" min="0" max="32" step="1" value={config.gap} onChange={(e) => updateConfig("gap", parseInt(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                <span>Corner Radius</span>
                <span className="text-accent text-[12px]">{config.radius}px</span>
              </label>
              <Input type="range" min="0" max="32" step="1" value={config.radius} onChange={(e) => updateConfig("radius", parseInt(e.target.value))} className="w-full" />
            </div>
          </div>
        </SidebarSection>
      )}

      {hasTypographyMatch && (
        <SidebarSection 
          key={searchQuery ? "open-typography" : "closed-typography"}
          label="Typography" 
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono uppercase tracking-tight flex justify-between items-center">
                <span>Font Size</span>
                <span className="text-accent text-[12px]">{config.fontSize}px</span>
              </label>
              <Input
                type="range" min="6" max="32" step="1"
                value={config.fontSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  setConfig((prev) => {
                    const next = { ...prev, fontSize: newSize };
                    if (prev.linkFontDotSize) next.dotSize = Math.max(2, Math.round(newSize * 1.5));
                    return next;
                  });
                }}
                className="w-full"
              />
            </div>
            <div className="bg-[#141414] p-2 rounded border border-border/40">
              <Toggle id="chk-link" label="Auto-Link Cell Size to Font" checked={config.linkFontDotSize} onChange={(v) => updateConfig("linkFontDotSize", v)} />
            </div>
            <Select value={config.fontFamily} onChange={(e) => updateConfig("fontFamily", e.target.value)}>
              <option value="'Inter', sans-serif">Inter Sans (Clean)</option>
              <option value="'JetBrains Mono', monospace">Terminal (Code)</option>
              <option value="serif">Modern Serif (Editorial)</option>
            </Select>
          </div>
        </SidebarSection>
      )}
    </div>
  );
};
