import fs from 'fs';
import path from 'path';

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx') && filePath.includes('page.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const targetDirs = [
  path.join(__dirname, 'app', 'owner'),
  path.join(__dirname, 'app', 'tenant')
];

let allFiles = [];
for (const dir of targetDirs) {
  allFiles = allFiles.concat(findFiles(dir));
}

let modifiedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add import if not present
  if (!content.includes('ProfileMenu')) {
    // find import NotificationBell
    const notifyRegex = /(import \{ NotificationBell \}.*)/g;
    if (content.match(notifyRegex)) {
      content = content.replace(notifyRegex, "$1\nimport { ProfileMenu } from \"@/components/custom/ProfileMenu\";");
      changed = true;
    }
  }

  // Replace Owner Profile wrapper
  const ownerProfileRegex = /<div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary\/20 cursor-pointer">[\s\S]*?<img[\s\S]*?src="([^"]+)"[\s\S]*?\/>[\s\S]*?<\/div>/g;
  if (content.match(ownerProfileRegex)) {
    content = content.replace(ownerProfileRegex, `<ProfileMenu role="owner" avatarUrl="$1" />`);
    changed = true;
  }

  // Replace Tenant Profile wrapper
  const tenantProfileRegex = /<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">[\s\S]*?JD[\s\S]*?<\/div>/g;
  if (content.match(tenantProfileRegex)) {
    content = content.replace(tenantProfileRegex, `<ProfileMenu role="tenant" initials="JD" />`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    modifiedCount++;
  }
}

console.log('Total files modified:', modifiedCount);
