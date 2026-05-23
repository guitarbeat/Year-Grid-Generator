const fs = require('fs');

async function download() {
  const fileUrl = 'https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md';
  const res = await fetch(fileUrl);
  const text = await res.text();
  
  const skillDir = './skills/frontend-design';
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(`${skillDir}/SKILL.md`, text);
  
  let existing = '';
  if (fs.existsSync('./AGENTS.md')) {
    existing = fs.readFileSync('./AGENTS.md', 'utf-8') + '\n\n';
  }
  
  let appendContent = `## frontend-design\n\n${text}\n\n`;
  fs.writeFileSync('./AGENTS.md', existing + appendContent);
  fs.unlinkSync('./fetch_frontend.cjs');
  fs.unlinkSync('./download_frontend.cjs');
}
download().catch(console.error);
