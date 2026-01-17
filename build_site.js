const fs = require('fs');
const path = require('path');

// --- 1. Load Data ---
console.log("Reading site_data.js...");
const dataJsContent = fs.readFileSync('site_data.js', 'utf8');

// We need to extract variables from the file content since we can't require it directly (it's not a module)
// We'll use a safer eval approach by wrapping in a function scope or just executing it in global context for this build script
// A simple way is to eval the content and then access the variables if they were var/const in global.
// However, since they are const in the file, eval might throw if we don't handle it right.
// Let's strip the 'const' and return the objects, or just use regex to extract key parts if eval is too risky.
// Actually, for a build script, eval is acceptable if we trust the source.
// To make it work with 'const', we can wrap it.

// Hacky but effective for this specific file structure:
// We will mock the browser environment slightly if needed, but mostly we just need the data.
// Let's extract the objects using regex which is safer and robust enough for this specific file.

function extractObject(name, content) {
    const regex = new RegExp(`const ${name} = ([\\s\\S]*?);`, 'm');
    const match = content.match(regex);
    if (match) {
        // Use Function to parse object literal safely
        return eval('(' + match[1] + ')');
    }
    return null;
}

const siteConfig = extractObject('siteConfig', dataJsContent);
const categories = extractObject('categories', dataJsContent);
const reviewsData = extractObject('reviewsData', dataJsContent);
const products = extractObject('products', dataJsContent);
const gradients = extractObject('gradients', dataJsContent);

if (!products || !siteConfig) {
    console.error("Failed to load data from site_data.js");
    process.exit(1);
}

console.log(`Loaded ${products.length} products.`);

// --- 2. Helper Functions ---

function renderStars(rating = 5, sizeClass = "w-4 h-4") {
    let html = '';
    for (let i = 0; i < 5; i++) {
        // Force 5 stars as per requirement/current logic
        html += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star ${sizeClass} fill-yellow-400 text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
    return html;
}

function renderProductCard(product) {
    const bgGradient = gradients[product.badge_color] || gradients.blue;
    return `
    <div class="card-glow bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 group hover:-translate-y-2">
        <div class="relative bg-gradient-to-br ${bgGradient} p-6 h-52 flex flex-col items-center justify-center text-center group-hover:scale-105 transition-transform duration-500">
            <div class="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-lg">
                <span class="text-yellow-300 text-sm">Sale!</span> BestPVAShop
            </div>
            
            <h3 class="text-xl font-bold leading-tight text-white mb-4 drop-shadow-lg">${product.title}</h3>
            
            <div class="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-5 py-2 rounded-full mb-2 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all">
                ORDER NOW
            </div>
        </div>
        
        <div class="p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded uppercase tracking-wider">${product.category}</span>
                <div class="flex items-center gap-0.5">
                    ${renderStars(5, "w-3 h-3")}
                </div>
            </div>
            
            <a href="/product/${product.slug}/" class="font-bold text-slate-100 mb-3 text-sm hover:text-cyan-400 transition-colors block line-clamp-2 min-h-[40px]">
                ${product.title}
            </a>
            
            <div class="flex items-center justify-between mb-5">
                <p class="text-slate-400 text-xs">Starting from</p>
                <p class="text-white font-extrabold text-lg">
                    $${product.min_price.toFixed(2)}
                </p>
            </div>
            
            <a href="/product/${product.slug}/" class="block w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl py-3 text-center text-sm shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40">
                Order Now
            </a>
        </div>
    </div>`;
}

function generateRichDescription(product) {
    if (product.long_description) return product.long_description;
    
    const productName = product.title;
    return `
        <h2 class="text-xl md:text-2xl font-bold text-white mb-4">${productName} – Safe Online & Trusted Account</h2>
        <p class="mb-4">
            In the modern world of online business, having a reliable <strong>${productName}</strong> is crucial. 
            Whether you are an entrepreneur, a digital marketer, or a freelancer, verified accounts provide the stability and credibility you need. 
            At <strong class="text-cyan-400">BestPVAShop</strong>, we provide premium, fully verified ${productName} that are ready to use. 
            Our accounts are safe, secure, and come with a replacement guarantee.
        </p>

        <h3 class="text-lg font-bold text-white mb-3 mt-8">Why is a ${productName} Best For Online Business?</h3>
        <p class="mb-4">
            Efficiency and authenticity are key factors for online success. Using verified accounts ensures that your business operations run smoothly without interruptions. 
            A ${productName} allows you to access features that might be restricted on unverified or new accounts.
        </p>
        <ul class="list-disc pl-5 space-y-2 mb-6 text-slate-300">
            <li><strong>Instant Access:</strong> No waiting time, get started immediately.</li>
            <li><strong>High Trust Score:</strong> Verified accounts carry more authority.</li>
            <li><strong>Security:</strong> Reduced risk of suspension or bans.</li>
        </ul>

        <h3 class="text-lg font-bold text-white mb-3 mt-8">Buy Trusted ${productName} For Secure Operations</h3>
        <p class="mb-4">
            When it comes to online transactions or marketing, security is paramount. 
            Buying trusted ${productName} from us ensures that you get a clean, high-quality account. 
            We use unique IPs and real device fingerprints to create these accounts, ensuring they look natural and authentic.
        </p>

        <h3 class="text-lg font-bold text-white mb-3 mt-8">How to Buy ${productName} Safely (Practical Steps)</h3>
        <p class="mb-4">
            When choosing a provider, safety should be your top priority. Here is why we are the best choice:
        </p>
        <ol class="list-decimal pl-5 space-y-2 mb-6 text-slate-300">
            <li><strong>Select Your Package:</strong> Choose the ${productName} package that fits your needs.</li>
            <li><strong>Secure Payment:</strong> We accept various secure payment methods including Crypto.</li>
            <li><strong>Instant Delivery:</strong> Receive your account details via email shortly after purchase.</li>
            <li><strong>24/7 Support:</strong> Our team is always ready to assist you.</li>
        </ol>

        <h3 class="text-lg font-bold text-white mb-3 mt-8">Conclusion</h3>
        <p class="mb-4">
            In conclusion, buying a ${productName} from BestPVAShop is a smart investment for your digital growth. 
            Save time, avoid hassles, and focus on scaling your business while we handle the technicalities. 
            Order your ${productName} today and experience the difference!
        </p>
    `;
}

// --- 3. Build Homepage ---
console.log("Building Homepage...");
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Replace Hero Content
indexHtml = indexHtml.replace('{{HERO_TITLE}}', siteConfig.heroTitle);
indexHtml = indexHtml.replace('{{HERO_SUBTITLE}}', siteConfig.heroSubtitle);

// Generate Product Grid
const productGridHtml = products.map(p => renderProductCard(p)).join('\n');
indexHtml = indexHtml.replace('{{PRODUCT_GRID}}', productGridHtml);

// Save Homepage
fs.writeFileSync('index.html', indexHtml);
console.log("Homepage built.");

// --- 4. Build Product Pages ---
console.log("Building Product Pages...");
const productTemplate = fs.readFileSync('product_template.html', 'utf8');

let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// Add Homepage to Sitemap
sitemap += '  <url>\n';
sitemap += '    <loc>https://bestpvashop.com/</loc>\n';
sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
sitemap += '    <priority>1.0</priority>\n';
sitemap += '  </url>\n';

products.forEach(product => {
    if (!product.slug) return;

    // --- Sitemap ---
    sitemap += '  <url>\n';
    sitemap += `    <loc>https://bestpvashop.com/product/${product.slug}/</loc>\n`;
    sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';

    // --- Prepare Data ---
    const bgClass = gradients[product.badge_color] || gradients.blue;
    const featuresList = product.features.map(f => 
        `<li class="flex items-start gap-2 text-slate-300 text-sm"><i data-lucide="check-circle-2" class="w-4 h-4 text-cyan-400 mt-0.5 shrink-0"></i> ${f}</li>`
    ).join('');
    const bottomFeaturesList = product.features.map(f => 
        `<li class="flex items-start gap-2 text-slate-400 text-sm"><i data-lucide="check" class="w-4 h-4 text-cyan-500 mt-0.5 shrink-0"></i> ${f}</li>`
    ).join('');
    
    let pricingOptions = '<option selected disabled>Choose an option</option>';
    if (product.pricing) {
        pricingOptions += product.pricing.map(p => `<option value="${p}">${p}</option>`).join('');
    }

    // Related Products
    let related = [];
    if (product.related_ids && product.related_ids.length > 0) {
        related = products.filter(p => product.related_ids.includes(p.id));
    }
    if (related.length === 0) {
        related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    }
    const relatedHtml = related.map(p => {
        // We can't use renderProductCard directly because the style in product.html for related is slightly different
        // But for consistency let's use a similar HTML structure or custom one
        // Let's use the one from product.html logic which is slightly simpler
        const relBg = gradients[p.badge_color] || gradients.blue;
        return `
            <div class="card-glow bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden transition-all duration-300 group hover:-translate-y-2">
                <div class="bg-gradient-to-br ${relBg} p-4 h-44 relative flex flex-col items-center justify-center text-center text-white group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-2 left-2 bg-red-500/90 backdrop-blur-md border border-white/10 text-xs font-bold px-3 py-1 rounded flex gap-1">
                        <span class="text-yellow-300 text-sm">Sale!</span> BestPVAShop
                    </div>
                    <h3 class="font-bold text-lg leading-tight mb-2 px-2 drop-shadow-md">${p.title}</h3>
                    <div class="bg-white/10 hover:bg-white/20 text-xs font-bold px-4 py-1.5 rounded-full cursor-pointer transition-colors border border-white/20">ORDER NOW</div>
                </div>
                <div class="p-4">
                    <p class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">${p.category}</p>
                    <a href="/product/${p.slug}/" class="font-bold text-slate-100 text-sm mb-2 block hover:text-cyan-400 transition-colors truncate">${p.title}</a>
                    <div class="flex gap-0.5 mb-3">
                        ${renderStars(5, "w-3 h-3")} 
                    </div>
                    <div class="text-white text-sm mb-4 font-extrabold">$${p.min_price.toFixed(2)} - $${p.max_price.toFixed(2)}</div>
                    <a href="/product/${p.slug}/" class="block w-full bg-white/5 hover:bg-cyan-600 text-white text-center py-2.5 rounded-lg text-sm font-bold transition-all border border-white/10 hover:border-cyan-500">Order Now</a>
                </div>
            </div>`;
    }).join('');

    // Reviews
    const pReviews = reviewsData ? reviewsData.filter(r => r.productId === product.id) : [];
    let reviewsHtml = '';
    if (pReviews.length === 0) {
        reviewsHtml = '<div class="text-center py-10 bg-[#0F172A] rounded-xl border border-white/5"><p class="text-slate-400 mb-2">No reviews yet.</p><p class="text-sm text-slate-500">Be the first to write a review!</p></div>';
    } else {
        reviewsHtml = pReviews.map(r => `
            <div class="bg-[#0F172A] p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-cyan-900 to-blue-900 rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/10">
                            ${r.avatar}
                        </div>
                        <div>
                            <h4 class="font-bold text-white text-sm">${r.user}</h4>
                            <div class="flex items-center gap-2 text-xs text-slate-400">
                                <span>${r.date}</span>
                                ${r.verified ? '<span class="text-cyan-400 flex items-center gap-0.5 bg-cyan-400/10 px-1.5 py-0.5 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check w-3 h-3"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74Z"/><path d="m9 12 2 2 4-4"/></svg> Verified</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-0.5">
                        ${renderStars(r.rating, "w-3 h-3")}
                    </div>
                </div>
                <h5 class="text-white font-semibold text-sm mb-1">${r.title || 'Great Service'}</h5>
                <p class="text-slate-300 text-sm leading-relaxed opacity-90">${r.text}</p>
            </div>
        `).join('');
    }

    // JSON-LD
    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "description": product.meta_description || product.short_description,
        "sku": String(product.id),
        "brand": { "@type": "Brand", "name": "BestPVAShop" },
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": product.min_price,
            "highPrice": product.max_price,
            "offerCount": product.pricing ? product.pricing.length : 1,
            "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": pReviews.length > 0 ? pReviews.length : 1
        }
    };

    // --- Replace Placeholders ---
    let html = productTemplate;

    // SEO
    html = html.replace('{{SEO_TITLE}}', `${product.title} | BestPVA Shop`);
    html = html.replace('{{SEO_DESCRIPTION}}', product.meta_description || product.short_description || "Buy verified accounts.");
    html = html.replace('{{SEO_TAGS}}', `
        <link rel="canonical" href="https://bestpvashop.com/product/${product.slug}/" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="${product.title} | BestPVA Shop" />
        <meta property="og:description" content="${product.meta_description || product.short_description}" />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://bestpvashop.com/product/${product.slug}/" />
        <meta property="og:site_name" content="BestPVAShop" />
    `);
    html = html.replace('{{JSON_LD}}', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);

    // Content
    html = html.replace('{{BG_CLASS}}', bgClass);
    html = html.replace('{{DISPLAY_TITLE}}', product.title.replace('Buy ', ''));
    html = html.replace('{{HERO_STARS}}', renderStars(5, "w-5 h-5"));
    html = html.replace('{{CATEGORY}}', product.category);
    html = html.replace('{{PRODUCT_TITLE}}', product.title);
    html = html.replace('{{DETAIL_STARS}}', renderStars(5, "w-4 h-4"));
    html = html.replace('{{REVIEW_COUNT_TEXT}}', `(${pReviews.length} Customer Reviews)`);
    html = html.replace('{{PRICE_TEXT}}', `$${product.min_price.toFixed(2)} - $${product.max_price.toFixed(2)}`);
    html = html.replace('{{SHORT_DESC}}', product.description || product.short_description);
    html = html.replace('{{FEATURES_LIST}}', featuresList);
    html = html.replace('{{PRICING_OPTIONS}}', pricingOptions);
    html = html.replace('{{LONG_DESC}}', generateRichDescription(product));
    html = html.replace('{{BOTTOM_FEATURES_LIST}}', bottomFeaturesList);
    html = html.replace('{{SUMMARY_STARS}}', renderStars(5, "w-5 h-5"));
    html = html.replace('{{REVIEWS_LIST}}', reviewsHtml);
    html = html.replace('{{RELATED_PRODUCTS}}', relatedHtml);

    // Fix Relative Paths
    html = html.replace('href="favicon.svg"', 'href="../../favicon.svg"');
    html = html.replace('src="site_data.js"', 'src="../../site_data.js"');
    html = html.replace('href="index.html"', 'href="../../index.html"');
    html = html.replace("window.location.href='/'", "window.location.href='../../index.html'");

    // Write File
    const dir = path.join('product', product.slug);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, 'index.html'), html);
});
console.log("Product pages built.");

// --- 5. Generate Robots & Sitemap ---
sitemap += '</urlset>';
fs.writeFileSync('sitemap.xml', sitemap);
console.log("sitemap.xml created.");

const robots = `User-agent: *
Allow: /
Sitemap: https://bestpvashop.com/sitemap.xml`;
fs.writeFileSync('robots.txt', robots);
console.log("robots.txt created.");

console.log("Build Finished Successfully!");
