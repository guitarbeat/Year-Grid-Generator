import { AppConfig } from '../types';

export const oklchToHex = (lVal: number, cVal: number, hVal: number): string => {
  // Ensure inputs are bounded
  const L = Math.max(0, Math.min(1, lVal));
  const C = Math.max(0, Math.min(0.4, cVal));
  const hDeg = hVal % 360;
  const hRad = (hDeg * Math.PI) / 180;

  // Convert to OKLab
  const a = C * Math.cos(hRad);
  const b_lab = C * Math.sin(hRad);

  // Convert OKLab to LMS
  const l_lms = L + 0.3963377774 * a + 0.2158037573 * b_lab;
  const m_lms = L - 0.1055613458 * a - 0.0638541728 * b_lab;
  const s_lms = L - 0.0894841775 * a - 1.2914855480 * b_lab;

  // Cube LMS response
  const l3 = l_lms * l_lms * l_lms;
  const m3 = m_lms * m_lms * m_lms;
  const s3 = s_lms * s_lms * s_lms;

  // Convert LMS^3 to linear sRGB
  let r_lin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076219004 * s3;

  // Gamma correction to sRGB
  const convertToSRGB = (v: number): number => {
    return v <= 0.0031308
      ? 12.92 * v
      : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;
  };

  const r = Math.max(0, Math.min(255, Math.round(convertToSRGB(r_lin) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(convertToSRGB(g_lin) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(convertToSRGB(b_lin) * 255)));

  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}`;
};

/**
 * Standard Hex to RGB parsed array
 */
const hexToRgb = (hex: string): [number, number, number] | null => {
  const match = hex.replace(/^#/, '').match(/.{1,2}/g);
  if (!match || match.length < 3) return null;
  return [
    parseInt(match[0], 16),
    parseInt(match[1], 16),
    parseInt(match[2], 16),
  ];
};

/**
 * Converts sRGB back to OKLCH (approximate, for editing existing colors in OKLCH mode)
 */
export const hexToOklch = (hex: string): { l: number; c: number; h: number } => {
  const rgb = hexToRgb(hex);
  if (!rgb) return { l: 0.6, c: 0.15, h: 0 };
  
  const r_s = rgb[0] / 255;
  const g_s = rgb[1] / 255;
  const b_s = rgb[2] / 255;

  // Inverse gamma correction
  const toLinear = (v: number) => {
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(r_s);
  const g = toLinear(g_s);
  const b = toLinear(b_s);

  // Linear sRGB to LMS^3
  const l3 = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m3 = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s3 = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_lms = Math.cbrt(l3);
  const m_lms = Math.cbrt(m3);
  const s_lms = Math.cbrt(s3);

  // LMS to OKLab
  const L = 0.2104542553 * l_lms + 0.7936177850 * m_lms - 0.0040720468 * s_lms;
  const a = 1.9779984951 * l_lms - 2.4285922050 * m_lms + 0.4505937099 * s_lms;
  const b_lab = 0.0259040371 * l_lms + 0.7827717662 * m_lms - 0.8086757660 * s_lms;

  // OKLab to OKLCH
  const C = Math.sqrt(a * a + b_lab * b_lab);
  let hDeg = (Math.atan2(b_lab, a) * 180) / Math.PI;
  if (hDeg < 0) hDeg += 360;

  return {
    l: parseFloat(L.toFixed(3)),
    c: parseFloat(C.toFixed(3)),
    h: Math.round(hDeg),
  };
};

export const getDimmedColor = (color: string, dimPastDaysStrength: number, dimPastDays: boolean) => {
  if (!dimPastDays) return color;
  const opacity = Math.round((dimPastDaysStrength || 50) * 2.55).toString(16).padStart(2, '0');
  return `${color}${opacity}`;
};

export const getDayColor = (
  year: number, 
  month: number, 
  day: number, 
  config: AppConfig, 
  currentDate: Date
) => {
  const { colors, highlightWeekends, dimPastDays, dimPastDaysStrength, overrides, anchorTodayToRealTime } = config;
  
  const anchorDate = anchorTodayToRealTime ? new Date() : currentDate;
  const currentYear = anchorDate.getFullYear();
  const currentMonth = anchorDate.getMonth();
  const currentDay = anchorDate.getDate();

  const id = `day-${year}-${month}-${day}`;
  if (overrides[id]) {
    return colors[overrides[id] as keyof typeof colors] || overrides[id];
  }

  const absCurrent = currentYear * 10000 + currentMonth * 100 + currentDay;
  const absTarget = year * 10000 + month * 100 + day;

  const isPast = absTarget < absCurrent;
  const isToday = absTarget === absCurrent;

  if (isToday) return colors.today;

  // Weekend check
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay();
  if (highlightWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return isPast ? getDimmedColor(colors.weekend, dimPastDaysStrength, dimPastDays) : colors.weekend;
  }

  if (isPast) {
    return getDimmedColor(colors.pastDay, dimPastDaysStrength, dimPastDays);
  }
  return colors.futureDay;
};
