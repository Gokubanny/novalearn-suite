const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixImports(fullPath);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Fix middleware and utils (1 level deep from src)
      if (content.includes("from '../../..'")) {
        content = content.split("from '../../..'").join("from '../types'");
        changed = true;
      }

      // Fix modules/* (2 levels deep from src)
      if (content.includes("from '../../../..'")) {
        content = content.split("from '../../../..'").join("from '../../types'");
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('✅ Fixed: ' + fullPath);
      }
    }
  });
}

fixImports(path.join(__dirname, 'src'));
console.log('Done!');