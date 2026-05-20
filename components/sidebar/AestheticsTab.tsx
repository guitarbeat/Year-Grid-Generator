import React from 'react';
import { AppConfig, AppColors } from '../../types';
import { SidebarSection, ControlGroup, Toggle, Input, Select } from '../ui/Controls';

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
    name: "Forest",
    colors: {
      bg: "#1a2e05", text: "#ecfccb", empty: "#2f4d0d", fill: "#a3e635",
      pastDay: "#ffffff", futureDay: "#2f4d0d", today: "#ef4444",
      significant: "#facc15", weekend: "#3f6212", stats: "#a3e635",
    },
  },
  {
    name: "Berry",
    colors: {
      bg: "#2e020f", text: "#fbcfe8", empty: "#500724", fill: "#ec4899",
      pastDay: "#ffffff", futureDay: "#500724", today: "#f43f5e",
      significant: "#fbbf24", weekend: "#831843", stats: "#ec4899",
    },
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

  const matches = (label: string, keywords: string[] = []) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      label.toLowerCase().includes(q) ||
      keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  };

  const hasThemeMatch = matches("Color & Theme", ["palette", "classic", "ember", "github", "ocean", "forest", "berry", "theme", "colors", "transparent", "background"]);
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
                Color Palette
              </label>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => applyTheme(t.colors)}
                    className={`
                    w-full aspect-square rounded-full border-2 transition-all relative overflow-hidden active:scale-95 shadow-lg
                    ${JSON.stringify(config.colors) === JSON.stringify(t.colors) ? "border-accent" : "border-transparent"}
                  `}
                    title={t.name}
                  >
                    <div className="absolute inset-0" style={{ backgroundColor: t.colors.fill }}></div>
                  </button>
                ))}
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
