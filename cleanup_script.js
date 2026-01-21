
const fs = require('fs');
const path = require('path');

// 1. Remove landingPageData from site_data.js
const siteDataPath = path.join(__dirname, 'site_data.js');
if (fs.existsSync(siteDataPath)) {
    let content = fs.readFileSync(siteDataPath, 'utf8');
    // Regex to match landingPageData block
    const regex = /\/\/ --- Landing Page Data \(Canva Pro\) ---[\s\S]*?const landingPageData = \{[\s\S]*?\};/g;
    if (regex.test(content)) {
        content = content.replace(regex, '');
        fs.writeFileSync(siteDataPath, content);
        console.log('Removed landingPageData from site_data.js');
    } else {
        console.log('landingPageData not found in site_data.js');
    }
} else {
    console.log('site_data.js not found');
}

// 2. Remove commented out code from build_site.js
const buildSitePath = path.join(__dirname, 'build_site.js');
if (fs.existsSync(buildSitePath)) {
    let content = fs.readFileSync(buildSitePath, 'utf8');
    // Exact string match for the block we want to remove
    const toRemove = `// const logoHtml = siteConfig.logoUrl ? \`<img src="\${siteConfig.logoUrl}" ...>\` : siteConfig.logoText;
// indexHtml = indexHtml.replace(/BestPVAShop/g, logoHtml); // DISABLED: Too aggressive.`;
    
    // Normalize newlines just in case
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedToRemove = toRemove.replace(/\r\n/g, '\n');
    
    if (normalizedContent.includes(normalizedToRemove)) {
        content = normalizedContent.replace(normalizedToRemove, '');
        fs.writeFileSync(buildSitePath, content);
        console.log('Removed commented out code from build_site.js');
    } else {
        console.log('Commented out code not found in build_site.js');
        // Try loose matching if exact match fails
        if (content.includes('// DISABLED: Too aggressive.')) {
             console.log('Found partial match, attempting regex removal...');
             const regex = /\/\/ const logoHtml =.*?\/\/ DISABLED: Too aggressive\./s;
             content = content.replace(regex, '');
             fs.writeFileSync(buildSitePath, content);
             console.log('Removed using regex');
        }
    }
} else {
    console.log('build_site.js not found');
}
