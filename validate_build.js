
const fs = require('fs');
const path = require('path');

console.log("Running Validation Tests...");

const errors = [];

// 1. Check Key Files
const files = ['index.html', 'sitemap.xml', 'robots.txt', 'output.css'];
files.forEach(f => {
    if (!fs.existsSync(f)) {
        errors.push(`Missing file: ${f}`);
    } else {
        const stats = fs.statSync(f);
        if (stats.size === 0) errors.push(`Empty file: ${f}`);
    }
});

// 2. Check Product Pages
if (fs.existsSync('product')) {
    const products = fs.readdirSync('product');
    if (products.length === 0) errors.push("No products generated in product/ directory");
    
    // Check one random product
    const randomProduct = products[0];
    const pPath = path.join('product', randomProduct, 'index.html');
    if (!fs.existsSync(pPath)) {
        errors.push(`Missing index.html for product: ${randomProduct}`);
    } else {
        const content = fs.readFileSync(pPath, 'utf8');
        if (!content.includes('BestPVAShop')) errors.push(`Product page ${randomProduct} content seems invalid`);
    }
} else {
    errors.push("Missing 'product' directory");
}

// 3. Check Blog Pages
if (fs.existsSync('blog')) {
    const blogs = fs.readdirSync('blog').filter(f => fs.statSync(path.join('blog', f)).isDirectory());
    if (blogs.length === 0) errors.push("No blogs generated");
}

if (errors.length > 0) {
    console.error("❌ Validation Failed:");
    errors.forEach(e => console.error(`- ${e}`));
    process.exit(1);
} else {
    console.log("✅ All Validation Tests Passed!");
}
