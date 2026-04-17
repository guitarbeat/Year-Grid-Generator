const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/YearGrid.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace renderActiveMarker definition with getActiveCellText
const getActiveCellTextFn = `
  const getActiveCellText = (year: number, month: number, day?: number, weekNum?: number) => {
    let text = '';
    const d = day ? new Date(year, month, day) : new Date(year, month, 1);

    const dayNameShort = d.toLocaleDateString('default', { weekday: 'short' });
    const monthNameShort = d.toLocaleDateString('default', { month: 'short' });
    const monthNameLong = d.toLocaleDateString('default', { month: 'long' });
    const dateNum = d.getDate();
    const weekOfMonth = Math.ceil(dateNum / 7);
    const weekOfYear = getWeekNumber(d);

    if (granularity === 'month') {
      if (activeLabelFormat === 'date') text = \`\${dateNum}\`;
      else if (activeLabelFormat === 'weekNum') text = \`M\${month + 1}\`;
      else if (activeLabelFormat === 'dayName') text = monthNameLong;
      else if (activeLabelFormat === 'monthName') text = monthNameLong;
      else if (activeLabelFormat === 'monthDate') text = \`\${monthNameShort} \${year}\`;
      else if (activeLabelFormat === 'full') text = \`\${monthNameLong} \${year}\`;
    } else if (granularity === 'week' && weekNum) {
      if (activeLabelFormat === 'date') text = \`W\${weekNum}\`;
      else if (activeLabelFormat === 'weekNum') text = \`W\${weekNum}\`;
      else if (activeLabelFormat === 'dayName') text = \`Week \${weekNum}\`;
      else if (activeLabelFormat === 'monthName') text = \`\${monthNameShort}\`;
      else if (activeLabelFormat === 'monthDate') text = \`\${monthNameShort} W\${weekNum}\`;
      else if (activeLabelFormat === 'full') text = \`Week \${weekNum}, \${year}\`;
    } else { 
      if (activeLabelFormat === 'date') text = \`\${dateNum}\`;
      else if (activeLabelFormat === 'weekNum') text = \`W\${weekOfYear}\`;
      else if (activeLabelFormat === 'dayName') text = dayNameShort;
      else if (activeLabelFormat === 'monthName') text = monthNameLong;
      else if (activeLabelFormat === 'monthDate') text = \`\${monthNameShort} \${dateNum}\`;
      else if (activeLabelFormat === 'full') text = \`\${dayNameShort} Wk\${weekOfMonth} \${dateNum}\`;
    }
    return text;
  };
`;

// Remove the old renderActiveMarker. It goes from "const renderActiveMarker = " to the next block "const months = useMemo(() => {"
const activeMarkerRegex = /const renderActiveMarker = \([\s\S]*?const months = useMemo/m;
content = content.replace(activeMarkerRegex, getActiveCellTextFn.trim() + '\n\n  const months = useMemo');

// 2. Replace the JSX render blocks
// Types of blocks:
// Day: {showDayNumbers ? d.day : null} ... renderActiveMarker(true, d.year, d.month, d.day)
// Week: {showWeekNumbers ? w.weekNum : null} ... renderActiveMarker(...)
// Month: {showMonthLabels ? name.toUpperCase().substring(0, 3) : null} ... renderActiveMarker(...)

// General approach: look for something followed by the active marker, and merge them into a ternary.

// a. Day inline timeline
content = content.replace(
  /\{\s*showDayNumbers \? d\.day : null\s*\}\s*\{\s*showActiveLabel && \(d\.year \* 10000 \+ d\.month \* 100 \+ d\.day\) === \(currentYear \* 10000 \+ currentMonth \* 100 \+ currentDay\) && renderActiveMarker\(true, d\.year, d\.month, d\.day\)\s*\}/gm,
  `{(showActiveLabel && (d.year * 10000 + d.month * 100 + d.day) === (currentYear * 10000 + currentMonth * 100 + currentDay)) ? getActiveCellText(d.year, d.month, d.day) : (showDayNumbers ? d.day : null)}`
);

// b. Week block render
content = content.replace(
  /\{\s*showWeekNumbers \? w\.weekNum : null\s*\}\s*\{\s*showActiveLabel && m\.year === currentYear && w\.weekNum === currentWeekNumber && renderActiveMarker\(true, m\.year, m\.month, undefined, w\.weekNum\)\s*\}/gm,
  `{(showActiveLabel && m.year === currentYear && w.weekNum === currentWeekNumber) ? getActiveCellText(m.year, m.month, undefined, w.weekNum) : (showWeekNumbers ? w.weekNum : null)}`
);

// c. Week flat
content = content.replace(
  /\{\s*showWeekNumbers \? w\.weekNum : null\s*\}\s*\{\s*showActiveLabel && parseInt\(w\.identifier\.split\('-\'\)\[0\]\) === currentYear && parseInt\(w\.identifier\.split\('-\'\)\[1\]\) === currentWeekNumber && renderActiveMarker\(true, currentYear, currentMonth, undefined, currentWeekNumber\)\s*\}/gm,
  `{(showActiveLabel && parseInt(w.identifier.split('-')[0]) === currentYear && parseInt(w.identifier.split('-')[1]) === currentWeekNumber) ? getActiveCellText(currentYear, currentMonth, undefined, currentWeekNumber) : (showWeekNumbers ? w.weekNum : null)}`
);

// d. Month render
content = content.replace(
  /\{\s*showMonthLabels \? name\.toUpperCase\(\)\.substring\(0, 3\) : null\s*\}\s*\{\s*showActiveLabel && isToday && renderActiveMarker\(true, m\.year, m\.month\)\s*\}/gm,
  `{(showActiveLabel && isToday) ? getActiveCellText(m.year, m.month) : (showMonthLabels ? name.toUpperCase().substring(0, 3) : null)}`
);

// e. Day grid
content = content.replace(
  /\{\s*showDayNumbers \? day : null\s*\}\s*\{\s*showActiveLabel && \(m\.year \* 10000 \+ m\.month \* 100 \+ day\) === \(currentYear \* 10000 \+ currentMonth \* 100 \+ currentDay\) && renderActiveMarker\(true, m\.year, m\.month, day\)\s*\}/gm,
  `{(showActiveLabel && (m.year * 10000 + m.month * 100 + day) === (currentYear * 10000 + currentMonth * 100 + currentDay)) ? getActiveCellText(m.year, m.month, day) : (showDayNumbers ? day : null)}`
);

// 3. Add whiteSpace: 'nowrap' and maybe zIndex to make overflowing text visible and legible?
// Text should be contained or visibly overflow. Let's just add whiteSpace nowrap to the cells?
// Usually, cell content is centered. We can allow the text to flow outside if we add overflow visible?
// React/Tailwind cell style already has \`overflow\` not set, so it's visible by default. 
// Adding whiteSpace: 'nowrap'
content = content.replace(
  /fontWeight: 700,/g,
  "fontWeight: 700,\n                        whiteSpace: 'nowrap',"
);
content = content.replace(
  /fontWeight: 900,/g,
  "fontWeight: 900,\n                        whiteSpace: 'nowrap',"
);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete.');
