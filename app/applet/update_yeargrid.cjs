const fs = require('fs');
const path = require('path');

const filePath = '/app/applet/components/YearGrid.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The replacement script
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

// Remove the text wrapping behavior by applying whiteSpace: 'nowrap'
content = content.replace(
  /fontWeight: 700,\r?\n\s*flexShrink: 0,\r?\n\s*position: 'relative'/gm,
  "fontWeight: 700,\n                  flexShrink: 0,\n                  whiteSpace: 'nowrap',\n                  position: 'relative'"
);

content = content.replace(
  /fontWeight: 700,\r?\n\s*position: 'relative'/gm,
  "fontWeight: 700,\n                        whiteSpace: 'nowrap',\n                        position: 'relative'"
);
content = content.replace(
  /fontWeight: 900,\r?\n\s*position: 'relative'/gm,
  "fontWeight: 900,\n                        whiteSpace: 'nowrap',\n                        position: 'relative'"
);

// Also need to get rid of the 'position: relative' that we added previously just to be clean... Actually I'll just leave it since it doesn't break flex.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update chunks complete.');
