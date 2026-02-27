const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../../frontend');
const dest = path.resolve(__dirname, '../public');

function copyDir(from, to) {
  if (!fs.existsSync(from)) return false;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
  return true;
}

try {
  const ok = copyDir(src, dest);
  if (ok) {
    console.log('Copied frontend → backend/public');
    process.exit(0);
  } else {
    console.log('No frontend directory to copy, skipping.');
    process.exit(0);
  }
} catch (e) {
  console.error('copy-frontend error:', e.message);
  process.exit(0); // do not fail build
}
