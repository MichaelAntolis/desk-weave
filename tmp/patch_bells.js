const fs = require('fs');
const path = require('path');

const filesToPatch = [
  { path: 'app/tenant/profile/page.tsx', baseUrl: '/tenant' },
  { path: 'app/tenant/dashboard/page.tsx', baseUrl: '/tenant' },
  { path: 'app/tenant/bookings/page.tsx', baseUrl: '/tenant' },
  { path: 'app/owner/spaces/page.tsx', baseUrl: '/owner' },
  { path: 'app/owner/orders/page.tsx', baseUrl: '/owner' },
  { path: 'app/owner/overview/page.tsx', baseUrl: '/owner' },
  { path: 'app/owner/calendar/page.tsx', baseUrl: '/owner' }
];

for (const { path: relPath, baseUrl } of filesToPatch) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Add import if not exists
    if (!content.includes('NotificationBell')) {
      // Find good place to insert (after lucide-react or similar)
      content = content.replace(/(import .* from "lucide-react";?)/, `$1\nimport { NotificationBell } from "@/components/custom/NotificationBell";`);
      
      // If lucide-react not found, just put it at the very top after "use client"
      if (!content.includes('NotificationBell')) {
        content = content.replace(/"use client";\n/, `"use client";\n\nimport { NotificationBell } from "@/components/custom/NotificationBell";\n`);
      }
    }

    // Replace <Bell /> or wrapping button with <NotificationBell />
    const buttonWithBellRegex = /<button[^>]*>\s*<Bell[^>]*\/>\s*<\/button>/g;
    if (buttonWithBellRegex.test(content)) {
      content = content.replace(buttonWithBellRegex, `<NotificationBell baseUrl="${baseUrl}" />`);
    } else {
      // Sometimes it's just <Bell className="..."/> inside some div, though our grep showed buttons
      const justBellRegex = /<Bell className="[^"]*" \/>/g;
      content = content.replace(justBellRegex, `<NotificationBell baseUrl="${baseUrl}" />`);
    }

    fs.writeFileSync(fullPath, content);
    console.log('Patched ' + relPath);
  }
}
