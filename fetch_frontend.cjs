const https = require('https');
https.get('https://api.github.com/repos/anthropics/skills/git/trees/main?recursive=1', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tree = JSON.parse(data).tree;
    const files = tree.filter(t => t.path.startsWith('skills/frontend-design/') && t.type === 'blob').map(t => t.path);
    console.log(JSON.stringify(files, null, 2));
  });
});
