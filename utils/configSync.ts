import { AppConfig, AppColors } from '../types';

export const STORAGE_KEY = 'year-grid-config-v1';

export const DEFAULT_CONFIG: AppConfig = {
  date: new Date().toISOString().split('T')[0],
  mode: 'grid',
  granularity: 'day',
  itemsPerRow: 12,
  isMondayFirst: false,
  showYearLabel: true,
  dotSize: 14,
  gap: 4,
  radius: 2,
  fontSize: 10,
  linkFontDotSize: true,
  fontFamily: "'Inter', sans-serif",
  colors: {
    bg: '#0a0a0a',
    text: '#525252',
    empty: '#1f1f1f',
    fill: '#ea580c',
    pastDay: '#ffffff',
    futureDay: '#2c2c2e',
    today: '#ff3b30',
    significant: '#FFD60A',
    weekend: '#515155',
    stats: '#ff9f0a'
  },
  transparentBg: false,
  monthsToShow: 12,
  monthsPerRow: 3,
  showDayNumbers: false,
  keepCellShapeWithNumbers: false,
  showSideDayAxis: false,
  showWeekNumbers: true,
  showMonthNumbers: false,
  showMonthLabels: true,
  showMonthAxis: true,
  showWeekdayAxis: true,
  highlightWeekends: true,
  dimPastDays: true,
  dimPastDaysStrength: 50,
  showStats: true,
  showActiveLabel: false,
  activeLabelFormat: 'date',
  startFromJan: false,
  anchorTodayToRealTime: true,
  blockAlignment: 'top',
  density: 'normal',
  isLifeMode: false,
  birthDate: '2000-01-01',
  lifeExpectancy: 80,
  lifeGranularity: 'week',
  showLifeStats: true,
  showHeaderPlugin: false,
  labelRotation: 0,
  customTitle: '',
  assetFormat: 'auto',
  resolutionScale: 2,
  overrides: {}
};

export const KEY_MAP: Record<string, string> = {
  date: 'a', mode: 'b', granularity: 'c', itemsPerRow: 'd', isMondayFirst: 'e',
  showYearLabel: 'f', dotSize: 'g', gap: 'h', radius: 'i', fontSize: 'j',
  linkFontDotSize: 'k', fontFamily: 'l', colors: 'm', transparentBg: 'n',
  monthsToShow: 'o', monthsPerRow: 'p', monthOffset: 'q', showDayNumbers: 'r',
  keepCellShapeWithNumbers: 's', showSideDayAxis: 't', showWeekNumbers: 'u',
  showMonthNumbers: 'v', showMonthLabels: 'w', showMonthAxis: 'x', showWeekdayAxis: 'y',
  highlightWeekends: 'z', dimPastDays: 'A', dimPastDaysStrength: 'B', showStats: 'C',
  showActiveLabel: 'D', activeLabelFormat: 'E', startFromJan: 'F',
  anchorTodayToRealTime: 'J', blockAlignment: 'K',
  isLifeMode: 'L', birthDate: 'M', lifeExpectancy: 'N', lifeGranularity: 'O',
  showLifeStats: 'P', showHeaderPlugin: 'U', labelRotation: 'V', customTitle: 'W',
  assetFormat: 'X', density: 'Y', resolutionScale: 'Z', overrides: '_'
};

export const COLOR_MAP: Record<string, string> = {
  bg: 'bg', text: 'tx', empty: 'em', fill: 'fi', pastDay: 'pd',
  futureDay: 'fd', today: 'to', significant: 'sg', weekend: 'wk', stats: 'st'
};

const REV_KEY_MAP: Record<string, keyof AppConfig> = {};
for (const [k, v] of Object.entries(KEY_MAP)) REV_KEY_MAP[v] = k as keyof AppConfig;

const REV_COLOR_MAP: Record<string, keyof AppColors> = {};
for (const [k, v] of Object.entries(COLOR_MAP)) REV_COLOR_MAP[v] = k as keyof AppColors;

export const serializeDiff = (diff: Partial<AppConfig>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const k of Object.keys(diff) as Array<keyof AppConfig>) {
    const shortKey = KEY_MAP[k] || k;
    if (k === 'colors' && diff.colors) {
      const colorObj: Record<string, string> = {};
      const colorsRef = diff.colors as unknown as Record<string, string>;
      for (const ck of Object.keys(colorsRef)) {
        const shortColKey = COLOR_MAP[ck] || ck;
        let val = colorsRef[ck];
        if (typeof val === 'string' && val.startsWith('#')) val = val.substring(1);
        colorObj[shortColKey] = val;
      }
      result[shortKey] = colorObj;
    } else if (k === 'overrides' && diff.overrides) {
      const keys = Object.keys(diff.overrides);
      result[shortKey] = keys.map(id => id.startsWith('day-') ? id.slice(4) : id);
    } else {
      result[shortKey] = diff[k];
    }
  }
  return result;
};

export const deserializeDiff = (compressed: Record<string, unknown>): Partial<AppConfig> => {
  const result: Record<string, unknown> = {};
  for (const k of Object.keys(compressed)) {
    const longKey = REV_KEY_MAP[k] || k;
    if (longKey === 'colors') {
      const colorObj: Record<string, string> = {};
      const compressedColors = (compressed[k] || {}) as Record<string, string>;
      for (const ck of Object.keys(compressedColors)) {
        const longColKey = REV_COLOR_MAP[ck] || ck;
        let val = compressedColors[ck];
        if (typeof val === 'string' && /^[0-9A-Fa-f]{3,8}$/.test(val)) val = '#' + val;
        colorObj[longColKey] = val;
      }
      result[longKey] = colorObj;
    } else if (longKey === 'overrides') {
      const arr = compressed[k] as string[];
      const overridesObj: Record<string, string> = {};
      if (Array.isArray(arr)) {
        for (const rawId of arr) {
          const id = (rawId.split('-').length >= 3 && !rawId.startsWith('day-')) ? `day-${rawId}` : rawId;
          overridesObj[id] = 'significant';
        }
      }
      result[longKey] = overridesObj;
    } else {
      result[longKey] = compressed[k];
    }
  }
  return result;
};

export const getDiffConfig = (config: AppConfig): Partial<AppConfig> => {
  const diff: Record<string, unknown> = {};
  for (const key of Object.keys(config) as Array<keyof AppConfig>) {
    if (key === 'colors') {
      const colorDiff: Record<string, string> = {};
      const currentColors = config.colors || {};
      const defaultColors = DEFAULT_CONFIG.colors || {};
      for (const ck of Object.keys(currentColors) as Array<keyof typeof currentColors>) {
        if (currentColors[ck] !== defaultColors[ck]) colorDiff[ck] = currentColors[ck];
      }
      if (Object.keys(colorDiff).length > 0) diff.colors = colorDiff;
    } else if (key === 'overrides') {
      const currentOverrides = config.overrides || {};
      const defaultOverrides = DEFAULT_CONFIG.overrides || {};
      if (JSON.stringify(currentOverrides) !== JSON.stringify(defaultOverrides)) {
        diff.overrides = currentOverrides;
      }
    } else {
      if (config[key] !== DEFAULT_CONFIG[key]) diff[key] = config[key];
    }
  }
  return diff;
};

export const encodeConfig = (config: AppConfig): string => {
  try {
    const diff = getDiffConfig(config);
    const compressed = serializeDiff(diff);
    return btoa(unescape(encodeURIComponent(JSON.stringify(compressed))));
  } catch (e) {
    console.warn('Failed to encode config', e);
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(config))));
    } catch {
      return '';
    }
  }
};

export const decodeConfig = (str: string): Partial<AppConfig> | null => {
  try {
    if (!str) return null;
    const trimmed = str.trim();
    let rawParsed: Record<string, unknown> | null = null;
    if (trimmed.startsWith('%7B') || trimmed.startsWith('{')) {
      rawParsed = JSON.parse(decodeURIComponent(trimmed));
    } else {
      try {
        rawParsed = JSON.parse(decodeURIComponent(escape(atob(trimmed))));
      } catch {
        try {
          rawParsed = JSON.parse(decodeURIComponent(atob(trimmed)));
        } catch {
          rawParsed = JSON.parse(decodeURIComponent(trimmed));
        }
      }
    }
    const hasShortKeys = Object.keys(rawParsed).some(k => k.length <= 2);
    if (hasShortKeys) return deserializeDiff(rawParsed);
    return rawParsed;
  } catch (e) {
    console.warn('Failed to decode config from URL', e);
    return null;
  }
};

export const migrateConfig = (config: Partial<AppConfig>): AppConfig => {
  const migrated = { ...config };
  if ((migrated.mode as string) === 'horizontal') migrated.mode = 'grid';
  if ((migrated.mode as string) === 'vertical') migrated.mode = 'rows';
  return {
    ...DEFAULT_CONFIG,
    ...migrated,
    colors: { ...DEFAULT_CONFIG.colors, ...(migrated.colors || {}) },
    overrides: { ...(migrated.overrides || {}) }
  };
};