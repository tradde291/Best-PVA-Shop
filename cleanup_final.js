const fs = require('fs');
const path = require('path');

// 1. Clean build_site.js
const buildSitePath = path.join(__dirname, 'build_site.js');
let buildSiteContent = fs.readFileSync(buildSitePath, 'utf8');

const buildSitePatterns = [
    `// const logoHtml = siteConfig.logoUrl ? \`<img src="\${siteConfig.logoUrl}" ...>\` : siteConfig.logoText;\r\n// indexHtml = indexHtml.replace(/BestPVAShop/g, logoHtml); // DISABLED: Too aggressive.`,
    `// const logoHtml = siteConfig.logoUrl ? \`<img src="\${siteConfig.logoUrl}" ...>\` : siteConfig.logoText;\n// indexHtml = indexHtml.replace(/BestPVAShop/g, logoHtml); // DISABLED: Too aggressive.`
];

let replacedBuild = false;
for (const pattern of buildSitePatterns) {
    if (buildSiteContent.includes(pattern)) {
        buildSiteContent = buildSiteContent.replace(pattern, '');
        replacedBuild = true;
        break;
    }
}

// Fallback regex if exact string match fails due to line endings
if (!replacedBuild) {
    const regex = /\/\/ const logoHtml = siteConfig\.logoUrl \? `<img src="\${siteConfig\.logoUrl}" \.\.\.>` : siteConfig\.logoText;\s*\/\/ indexHtml = indexHtml\.replace\(\/BestPVAShop\/g, logoHtml\); \/\/ DISABLED: Too aggressive\./;
    if (regex.test(buildSiteContent)) {
        buildSiteContent = buildSiteContent.replace(regex, '');
        replacedBuild = true;
    }
}

if (replacedBuild) {
    fs.writeFileSync(buildSitePath, buildSiteContent);
    console.log('Cleaned build_site.js');
} else {
    console.log('Pattern not found in build_site.js');
}

// 2. Clean site_data.js
const siteDataPath = path.join(__dirname, 'site_data.js');
let siteDataContent = fs.readFileSync(siteDataPath, 'utf8');

const siteDataPatterns = [
    '// Removed unused landingPageData',
    '// Removed unused renderStars'
];

let replacedData = false;
for (const pattern of siteDataPatterns) {
    if (siteDataContent.includes(pattern)) {
        siteDataContent = siteDataContent.replace(pattern, '');
        replacedData = true;
    }
}

if (replacedData) {
    fs.writeFileSync(siteDataPath, siteDataContent);
    console.log('Cleaned site_data.js');
} else {
    console.log('No patterns found in site_data.js');
}
