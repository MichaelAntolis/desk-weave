const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'app/tenant/profile/page.tsx',
  'app/tenant/messages/page.tsx',
  'app/tenant/dashboard/page.tsx',
  'app/tenant/bookings/page.tsx',
  'app/owner/spaces/page.tsx',
  'app/owner/overview/page.tsx',
  'app/owner/orders/page.tsx',
  'app/owner/messages/page.tsx',
  'app/owner/calendar/page.tsx',
];

for (const relPath of filesToPatch) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(/<header className="([^"]*)"/, (match, classes) => {
      // If it already has hidden md:flex, skip to avoid double addition
      if (classes.includes('hidden md:flex')) return match;
      
      // Remove standalone 'flex' so it doesn't conflict on mobile with 'hidden'
      let newClasses = classes.replace(/\bflex\b/g, '').replace(/\s+/g, ' ').trim();
      
      return `<header className="hidden md:flex flex-row ${newClasses}"`;
    });

    fs.writeFileSync(fullPath, content);
    console.log('Patched ' + relPath);
  }
}
