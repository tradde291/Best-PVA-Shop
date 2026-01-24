const fs = require('fs');
const path = require('path');
const vm = require('vm');

// --- 1. Load Data ---
console.log("Reading site_data.js...");
const dataJsContent = fs.readFileSync('site_data.js', 'utf8');

// Append assignment to ensure we capture const/let variables which are not automatically attached to sandbox
const scriptContent = dataJsContent + `
;
this.siteConfig = siteConfig;
this.categories = categories;
this.reviewsData = reviewsData;
this.products = products;
this.blogs = blogs || [];
try { this.gradients = gradients; } catch(e) {}
`;

// Use VM to execute the data file safely to extract variables
const sandbox = { 
    console: console, // Allow logging if any
    document: {}, // Mock document if needed to prevent reference errors during parsing
    window: {},
    alert: () => {},
    confirm: () => false
};
vm.createContext(sandbox);

try {
    vm.runInContext(scriptContent, sandbox);
} catch (e) {
    console.error("Error parsing site_data.js:", e);
    process.exit(1);
}

const siteConfig = sandbox.siteConfig;
const categories = sandbox.categories;
const reviewsData = sandbox.reviewsData;
const products = sandbox.products;
const blogs = sandbox.blogs || [];
const gradients = sandbox.gradients || {}; // gradients might be missing or defined elsewhere

if (!products || !siteConfig) {
    console.error("Failed to load data from site_data.js");
    process.exit(1);
}

console.log(`Loaded ${products.length} products and ${blogs.length} blog posts.`);

// --- Load Templates ---
const headerHtml = fs.readFileSync('header_partial.html', 'utf8');
const uiJsContent = fs.readFileSync('ui.js', 'utf8');

// --- 2. Helper Functions ---

function generateFooter(products, siteConfig) {
    // Group products by category
    const categories = {};
    products.forEach(p => {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
    });

    // Link to real category pages
    const categoryLinks = Object.keys(categories).slice(0, 5).map(cat => {
        const slug = cat.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        return `<li><a href="/category/${slug}/" class="text-slate-400 hover:text-cyan-400 transition-colors text-sm">${cat}</a></li>`;
    }).join('');

    const popularProducts = products.filter(p => p.is_sale).slice(0, 5).map(p => 
        `<li><a href="/product/${p.slug}/" class="text-slate-400 hover:text-cyan-400 transition-colors text-sm">${p.title}</a></li>`
    ).join('');

    const logoContent = siteConfig.logoUrl 
        ? `<img src="${siteConfig.logoUrl}" alt="${siteConfig.logoText || 'Logo'}" class="h-8 w-auto">`
        : `<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-extrabold text-2xl tracking-tight">${siteConfig.logoText || 'BestPVAShop'}</span>`;

    return `
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div class="col-span-1 md:col-span-1">
                    <div class="flex items-center gap-2 mb-4">
                        ${logoContent}
                    </div>
                    <p class="text-slate-500 text-sm leading-relaxed mb-4">
                        Your trusted source for verified accounts and authentic reviews. Secure, fast, and reliable services to boost your digital presence.
                    </p>
                    <div class="flex gap-3">
                        <a href="https://facebook.com/BestPVAShop" target="_blank" rel="nofollow" class="text-slate-400 hover:text-white transition-colors" aria-label="Facebook"><i data-lucide="facebook" class="w-5 h-5"></i></a>
                        <a href="https://x.com/BestPVAShop" target="_blank" rel="nofollow" class="text-slate-400 hover:text-white transition-colors" aria-label="X (Twitter)"><i data-lucide="twitter" class="w-5 h-5"></i></a>
                        <a href="https://instagram.com/BestPVAShop" target="_blank" rel="nofollow" class="text-slate-400 hover:text-white transition-colors" aria-label="Instagram"><i data-lucide="instagram" class="w-5 h-5"></i></a>
                        <a href="https://youtube.com/@BestPVAShop" target="_blank" rel="nofollow" class="text-slate-400 hover:text-white transition-colors" aria-label="YouTube"><i data-lucide="youtube" class="w-5 h-5"></i></a>
                        <a href="https://linkedin.com/company/BestPVAShop" target="_blank" rel="nofollow" class="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn"><i data-lucide="linkedin" class="w-5 h-5"></i></a>
                    </div>
                </div>
                
                <div>
                    <h4 class="text-white font-bold mb-4">Categories</h4>
                    <ul class="space-y-2">
                        ${categoryLinks}
                    </ul>
                </div>

                <div>
                    <h4 class="text-white font-bold mb-4">Popular Products</h4>
                    <ul class="space-y-2">
                        ${popularProducts}
                    </ul>
                </div>

                <div>
                    <h4 class="text-white font-bold mb-4">Contact Us</h4>
                    <ul class="space-y-2 text-sm text-slate-400">
                        <li class="flex items-center gap-2">
                            <i data-lucide="mail" class="w-4 h-4 text-cyan-500"></i> 
                            <a href="mailto:${siteConfig.supportEmail}" class="hover:text-white transition-colors">${siteConfig.supportEmail}</a>
                        </li>
                        <li class="flex items-center gap-2">
                            <i data-lucide="phone" class="w-4 h-4 text-green-500"></i> 
                            <a href="https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" rel="nofollow" class="hover:text-white transition-colors">${siteConfig.whatsapp}</a>
                        </li>
                        <li class="flex items-center gap-2">
                            <i data-lucide="send" class="w-4 h-4 text-blue-500"></i> 
                            <a href="https://t.me/${siteConfig.telegram}" target="_blank" rel="nofollow" class="hover:text-white transition-colors">@${siteConfig.telegram}</a>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p class="text-slate-500 text-sm">Copyright © ${new Date().getFullYear()} BestPVAShop.com. All rights reserved.</p>
                <div class="flex gap-4 text-sm text-slate-500">
                    <a href="/blog/" class="hover:text-white transition-colors">Blog</a>
                    <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    `;
}

function generateLatestArticlesHtml(blogs) {
    if (!blogs || blogs.length === 0) return '';
    const latest = blogs.slice(0, 3);
    const cards = latest.map(b => `
        <div class="group relative flex flex-col items-start bg-[#1E293B]/50 p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all">
            <div class="flex items-center gap-x-4 text-xs mb-3">
                <time datetime="${b.date}" class="text-slate-400">${b.date}</time>
                <span class="relative z-10 rounded-full bg-cyan-400/10 px-3 py-1.5 font-medium text-cyan-400">Article</span>
            </div>
            <h3 class="mt-0 text-lg font-bold leading-6 text-white group-hover:text-cyan-400 transition-colors">
                <a href="/blog/${b.slug}/">
                    <span class="absolute inset-0"></span>
                    ${b.title}
                </a>
            </h3>
            <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">${b.excerpt}</p>
            <div class="mt-4 flex items-center gap-1 text-cyan-400 text-sm font-bold">
                Read More <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </div>
        </div>
    `).join('');

    return `
    <section class="py-16 bg-[#0B1120] border-t border-white/5">
        <div class="mx-auto max-w-7xl px-4">
            <div class="flex items-center justify-between mb-10">
                <div>
                    <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Latest <span class="text-cyan-400">Articles</span></h2>
                    <p class="mt-2 text-lg leading-8 text-slate-400">Expert tips and guides for your digital growth.</p>
                </div>
                <a href="/blog/" class="hidden sm:flex items-center gap-1 text-cyan-400 font-bold hover:text-cyan-300 transition-colors">View All <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${cards}
            </div>
            <div class="mt-8 text-center sm:hidden">
                 <a href="/blog/" class="inline-flex items-center gap-1 text-cyan-400 font-bold hover:text-cyan-300 transition-colors">View All Articles <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
            </div>
        </div>
    </section>
    `;
}

function generateRelatedArticlesHtml(product, blogs) {
    if (!blogs || blogs.length === 0) return '';
    
    // 1. Priority: Explicitly related blogs (via related_ids in blog object)
    let related = blogs.filter(b => b.related_ids && b.related_ids.includes(product.id));

    // 2. Fallback: Contextual matching (Category/Title keywords)
    if (related.length < 3) {
        const productKeywords = product.category.toLowerCase().split(/[\s&]+/);
        const contextual = blogs.filter(b => {
            // Avoid duplicates
            if (related.some(rel => rel.id === b.id)) return false;
            
            const titleLower = b.title.toLowerCase();
            return productKeywords.some(k => titleLower.includes(k));
        });
        
        related = [...related, ...contextual];
    }

    const displayBlogs = related.slice(0, 3);
    
    if (displayBlogs.length === 0) return '';

    const title = 'Related Articles';

    const cards = displayBlogs.map(b => `
        <div class="group relative flex flex-col items-start bg-[#1E293B] p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all">
            <h3 class="text-lg font-bold leading-6 text-white group-hover:text-cyan-400 transition-colors">
                <a href="../../blog/${b.slug}/">
                    <span class="absolute inset-0"></span>
                    ${b.title}
                </a>
            </h3>
            <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">${b.excerpt}</p>
             <div class="mt-4 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                Read Article <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </div>
        </div>
    `).join('');

    return `
    <div class="mt-16 border-t border-white/5 pt-12">
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-white">${title}</h2>
            <a href="../../blog/" class="text-cyan-400 text-sm font-bold hover:underline">View Blog</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${cards}
        </div>
    </div>
    `;
}

function generateSocialShare(product) {
    const url = `https://bestpvashop.com/product/${product.slug}/`;
    const title = encodeURIComponent(product.title);
    
    return `
        <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" class="p-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-lg transition-colors" aria-label="Share on Facebook">
            <i data-lucide="facebook" class="w-5 h-5"></i>
        </a>
        <a href="https://twitter.com/intent/tweet?text=${title}&url=${url}" target="_blank" rel="noopener noreferrer" class="p-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg transition-colors" aria-label="Share on Twitter">
            <i data-lucide="twitter" class="w-5 h-5"></i>
        </a>
        <a href="https://wa.me/?text=${title}%20${url}" target="_blank" rel="noopener noreferrer" class="p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg transition-colors" aria-label="Share on WhatsApp">
            <i data-lucide="message-circle" class="w-5 h-5"></i>
        </a>
        <a href="https://t.me/share/url?url=${url}&text=${title}" target="_blank" rel="noopener noreferrer" class="p-2 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] rounded-lg transition-colors" aria-label="Share on Telegram">
            <i data-lucide="send" class="w-5 h-5"></i>
        </a>
    `;
}

function minifyHTML(html) {
    return html
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/<!--.*?-->/g, '');
}

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
    <div class="card-glow bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 group hover:-translate-y-2" style="content-visibility: auto; contain-intrinsic-size: 0 350px;">
        <div role="img" aria-label="${product.title}" class="relative bg-gradient-to-br ${bgGradient} p-6 h-52 flex flex-col items-center justify-center text-center group-hover:scale-105 transition-transform duration-500">
            <div class="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-lg">
                <span class="text-yellow-300 text-sm">Sale!</span> BestPVAShop
            </div>
            
            <h3 class="text-xl font-bold leading-tight text-white mb-4 drop-shadow-lg">${product.title}</h3>
            
            <a href="product/${product.slug}/" class="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-5 py-2 rounded-full mb-2 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all block text-center no-underline">
                ORDER NOW
            </a>
        </div>
        
        <div class="p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded uppercase tracking-wider">${product.category}</span>
                <div class="flex items-center gap-0.5">
                    ${renderStars(5, "w-3 h-3")}
                </div>
            </div>
            
            <a href="product/${product.slug}/" class="font-bold text-slate-100 mb-3 text-sm hover:text-cyan-400 transition-colors block line-clamp-2 min-h-[40px]">
                ${product.title}
            </a>
            
            <div class="flex items-center justify-between mb-5">
                <p class="text-slate-400 text-xs">Starting from</p>
                <p class="text-white font-extrabold text-lg">
                    $${product.min_price.toFixed(2)}
                </p>
            </div>
            
            <a href="product/${product.slug}/" class="block w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl py-3 text-center text-sm shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40">
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

console.log("Reading output.css for Critical CSS inlining...");
const cssContent = fs.readFileSync('output.css', 'utf8');

console.log("Reading header_partial.html...");
let headerContent = fs.readFileSync('header_partial.html', 'utf8');

// Inject Mobile Menu Links (Server-Side Rendering)
const mobileLinks = categories.map(c => {
    const slug = c.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    return `<a href="/category/${slug}/" class="block px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-cyan-400 rounded-lg transition-colors border-b border-white/5 last:border-0">${c.name}</a>`;
}).join('');
headerContent = headerContent.replace('id="mobile-nav-items">', `id="mobile-nav-items">\n${mobileLinks}`);

// --- 3. Build Homepage ---
console.log("Building Homepage...");
const indexTemplate = fs.readFileSync('site_template.html', 'utf8'); // Keep master template in memory
let indexHtml = indexTemplate;

// Inject Header
indexHtml = indexHtml.replace('{{HEADER}}', headerContent);

// Inline Critical CSS
indexHtml = indexHtml.replace(/{{CRITICAL_CSS}}/g, `<style>${cssContent}</style>`);

// Favicon Replacement
if (siteConfig.faviconUrl) {
    indexHtml = indexHtml.replace(/href="favicon.svg"/g, `href="${siteConfig.faviconUrl}"`);
    indexHtml = indexHtml.replace(/href="\.\/favicon.svg"/g, `href="${siteConfig.faviconUrl}"`);
}

// Logo Replacement (Header)
// We only replace the specific Logo Text in the header if we can find it reliably.
// Assuming the header uses the same class structure as footer or similar.
// For now, we rely on logoText updating. logoUrl is used in Footer.
// const logoHtml = siteConfig.logoUrl ? `<img src="${siteConfig.logoUrl}" ...>` : siteConfig.logoText;
// indexHtml = indexHtml.replace(/BestPVAShop/g, logoHtml); // DISABLED: Too aggressive.

// Replace Logo
indexHtml = indexHtml.replace('{{LOGO_TEXT}}', siteConfig.logoText);

// Replace Hero Content
indexHtml = indexHtml.replace('{{HERO_TITLE}}', siteConfig.heroTitle);
indexHtml = indexHtml.replace('{{HERO_SUBTITLE}}', siteConfig.heroSubtitle);

// Generate Product Grid
const productGridHtml = products.map(p => renderProductCard(p)).join('\n');
indexHtml = indexHtml.replace('{{PRODUCT_GRID}}', `
    <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${productGridHtml}
    </div>
`);

// Generate Footer
indexHtml = indexHtml.replace('{{FOOTER}}', generateFooter(products, siteConfig));

// Generate Latest Articles
indexHtml = indexHtml.replace('{{LATEST_ARTICLES}}', generateLatestArticlesHtml(blogs));

// Save Homepage
fs.writeFileSync('index.html', indexHtml);
console.log("Homepage built.");

// --- 3.1 Build Category Pages ---
console.log("Building Category Pages...");
const uniqueCategories = [...new Set(products.map(p => p.category))];
let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// Add Homepage to Sitemap
sitemap += '  <url>\n';
sitemap += '    <loc>https://bestpvashop.com/</loc>\n';
sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
sitemap += '    <priority>1.0</priority>\n';
sitemap += '  </url>\n';

uniqueCategories.forEach(cat => {
    const slug = cat.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const dir = path.join('category', slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Find category data from site_data (now we have rich content there)
    const categoryData = categories.find(c => c.name === cat) || {};
    const richContent = categoryData.content || '';
    const catDescription = categoryData.description || `Buy verified ${cat} accounts and reviews. Secure, fast, and trusted services for ${cat} marketing.`;

    let catHtml = indexTemplate;
    // Inject Header for Category Pages
    catHtml = catHtml.replace('{{HEADER}}', headerContent);
    
    // SEO & Hero
    const catTitle = `${cat} Accounts & Reviews | BestPVAShop`;
    
    // Replace Logo
    catHtml = catHtml.replace('{{LOGO_TEXT}}', siteConfig.logoText);

    // Replace Hero with Category Title
    catHtml = catHtml.replace('{{HERO_TITLE}}', `<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">${cat}</span> Services`);
    catHtml = catHtml.replace('{{HERO_SUBTITLE}}', catDescription);
    catHtml = catHtml.replace(/Best PVA Shop – Buy Verified Accounts & Reviews Instantly/g, catTitle);
    catHtml = catHtml.replace(/Buy high-quality verified accounts and authentic reviews instantly at BestPVAShop./g, catDescription);
    
    // SEO URL Fixes
    const catUrl = `https://bestpvashop.com/category/${slug}/`;
    catHtml = catHtml.replace('href="https://bestpvashop.com/"', `href="${catUrl}"`); // Canonical
    catHtml = catHtml.replace('content="https://bestpvashop.com/"', `content="${catUrl}"`); // OG URL

    // Inject Rich Content BEFORE Product Grid
    // We'll use a placeholder replacement trick.
    // The indexTemplate has {{PRODUCT_GRID}}. We will prepend the rich content to it.
    
    // Filter Products
    const catProducts = products.filter(p => p.category === cat);
    const catGrid = catProducts.map(p => renderProductCard(p)).join('\n');
    
    const contentAndGrid = `
        <div class="max-w-7xl mx-auto px-4 mb-16 prose prose-invert lg:prose-xl">
            ${richContent}
        </div>
        <div class="max-w-7xl mx-auto px-4 mb-8">
            <h3 class="text-2xl font-bold text-white border-l-4 border-cyan-500 pl-4">Available Packages</h3>
        </div>
        <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${catGrid}
        </div>
    `;

    catHtml = catHtml.replace('{{PRODUCT_GRID}}', contentAndGrid);
    
    // Latest Articles
    catHtml = catHtml.replace('{{LATEST_ARTICLES}}', generateLatestArticlesHtml(blogs));
    
    // Footer
    catHtml = catHtml.replace('{{FOOTER}}', generateFooter(products, siteConfig).replace(/href="\/product/g, 'href="../../product').replace(/href="#"/g, 'href="../../"'));

    // CSS
    catHtml = catHtml.replace(/{{CRITICAL_CSS}}/g, `<style>${cssContent}</style>`);
    
    // Fix Relative Paths (Since we are deep in /category/slug/)
    catHtml = catHtml.replace(/href="product\//g, 'href="../../product/');
    catHtml = catHtml.replace(/href="category\//g, 'href="../../category/');
    catHtml = catHtml.replace(/src="\//g, 'src="../../'); 
    catHtml = catHtml.replace('src="site_data.js"', 'src="../../site_data.js"');
    catHtml = catHtml.replace(/href="\//g, 'href="../../');
    catHtml = catHtml.replace('href="../../"', 'href="/"'); // Fix Home link

    fs.writeFileSync(path.join(dir, 'index.html'), minifyHTML(catHtml));

    // Sitemap
    sitemap += '  <url>\n';
    sitemap += `    <loc>https://bestpvashop.com/category/${slug}/</loc>\n`;
    sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
    sitemap += '    <priority>0.9</priority>\n';
    sitemap += '  </url>\n';
});

// --- 3.2 Build Blog Listing & Posts ---
console.log("Building Blog Pages...");
const blogDir = 'blog';
if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir);

// Pagination Settings
const postsPerPage = 6;
const totalPages = Math.ceil(blogs.length / postsPerPage);

// Helper: Generate Sidebar
function generateSidebar(products, blogs) {
    const popularBlogs = blogs.slice(0, 3).map(b => `
        <li class="flex gap-3 items-start">
             <div class="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden shrink-0">
                <img src="${b.image}" alt="${b.title}" class="w-full h-full object-cover opacity-80 hover:opacity-100 transition">
             </div>
             <div>
                 <a href="/blog/${b.slug}/" class="text-sm font-bold text-slate-200 hover:text-cyan-400 leading-tight block mb-1">${b.title}</a>
                 <span class="text-xs text-slate-500">${b.date}</span>
             </div>
        </li>
    `).join('');

    const bestSellers = products.filter(p => p.is_sale).slice(0, 3).map(p => `
        <li class="flex items-center gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
             <div class="w-10 h-10 bg-gradient-to-br ${gradients[p.badge_color] || gradients.blue} rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                ${p.category.substring(0,2).toUpperCase()}
             </div>
             <div>
                 <a href="/product/${p.slug}/" class="text-sm font-bold text-slate-200 hover:text-cyan-400 block">${p.title}</a>
                 <span class="text-xs font-bold text-cyan-500">$${p.min_price}</span>
             </div>
        </li>
    `).join('');

    return `
        <!-- Popular Guides -->
        <div class="bg-[#1E293B] p-6 rounded-xl border border-white/5">
            <h3 class="font-bold text-white mb-4 border-b border-white/10 pb-2">Popular Guides</h3>
            <ul class="space-y-4">
               ${popularBlogs}
            </ul>
        </div>

        <!-- Trusted Products -->
        <div class="bg-[#1E293B] p-6 rounded-xl border border-white/5">
             <h3 class="font-bold text-white mb-4 border-b border-white/10 pb-2">Best Sellers</h3>
             <ul class="space-y-3">
                 ${bestSellers}
             </ul>
        </div>

        <!-- CTA Box -->
        <div class="bg-gradient-to-br from-cyan-600 to-blue-700 p-6 rounded-xl text-center shadow-lg shadow-cyan-500/20">
            <h3 class="font-bold text-white mb-2 text-lg">Need Verified Accounts?</h3>
            <p class="text-white/90 text-sm mb-6">Get premium, phone-verified accounts for Google, Facebook, and more instantly.</p>
            <a href="/" class="block bg-white text-blue-700 font-bold py-3 rounded-lg hover:bg-slate-100 transition-colors shadow-md">
                View All Products
            </a>
        </div>
    `;
}

// Helper: Inject CTA (Replaces [[CTA1]] and [[CTA2]])
function injectCTA(content, post) {
    const generateHTML = (text, link) => `
        <div class="my-10 bg-gradient-to-r from-slate-800 to-slate-900 border-l-4 border-cyan-500 p-6 rounded-r-xl shadow-lg">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-center sm:text-left">
                    <h4 class="text-lg font-bold text-white mb-1">Looking for verified accounts?</h4>
                    <p class="text-slate-400 text-sm">${text || "Get Verified PVA Accounts Now"}</p>
                </div>
                <a href="${link || "/"}" class="shrink-0 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap">
                    Check Availability &rarr;
                </a>
            </div>
        </div>
    `;

    let newContent = content;
    let hasReplacement = false;

    if (newContent.includes('[[CTA1]]')) {
        newContent = newContent.replace('[[CTA1]]', generateHTML(post.cta_1_text, post.cta_1_link));
        hasReplacement = true;
    }

    if (newContent.includes('[[CTA2]]')) {
        newContent = newContent.replace('[[CTA2]]', generateHTML(post.cta_2_text, post.cta_2_link));
        hasReplacement = true;
    }

    // Fallback for older posts without placeholders: Insert after 2nd paragraph
    if (!hasReplacement && !newContent.includes('[[CTA')) {
         const parts = newContent.split('</p>');
         if (parts.length > 2) {
             const ctaHtml = generateHTML("Get Verified PVA Accounts Now", "/category/accounts/");
             const firstPart = parts.slice(0, 2).join('</p>') + '</p>';
             const restPart = parts.slice(2).join('</p>');
             return firstPart + ctaHtml + restPart;
         }
    }

    return newContent;
}

// Build Pagination Pages
for (let i = 1; i <= totalPages; i++) {
    const start = (i - 1) * postsPerPage;
    const end = start + postsPerPage;
    const pageBlogs = blogs.slice(start, end);
    
    // Create Page Directory: /blog/page/2/ etc.
    let pageDir = blogDir;
    let pageRelPath = '../'; // Default for /blog/index.html
    
    if (i > 1) {
        pageDir = path.join(blogDir, 'page', i.toString());
        if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
        pageRelPath = '../../../'; // For /blog/page/2/index.html
    }

    let blogListHtml = indexTemplate;
    blogListHtml = blogListHtml.replace('{{HEADER}}', headerContent);
    blogListHtml = blogListHtml.replace('{{LOGO_TEXT}}', siteConfig.logoText);
    
    const pageTitleSuffix = i > 1 ? ` - Page ${i}` : '';
    
    // Enhanced Hero for Blog
    blogListHtml = blogListHtml.replace('{{HERO_TITLE}}', `
        <span class="block text-cyan-400 text-lg font-bold tracking-widest uppercase mb-4">Our Blog</span>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 drop-shadow-sm">Latest Insights & Guides</span>${pageTitleSuffix}
    `);
    blogListHtml = blogListHtml.replace('{{HERO_SUBTITLE}}', 'Unlock the secrets of digital marketing. Expert strategies, safety tips, and growth hacks for your business.');
    blogListHtml = blogListHtml.replace(/Best PVA Shop – Buy Verified Accounts & Reviews Instantly/g, `BestPVAShop Blog – Digital Marketing Tips${pageTitleSuffix}`);

    // SEO URL Fixes
    const canonicalUrl = i === 1 ? 'https://bestpvashop.com/blog/' : `https://bestpvashop.com/blog/page/${i}/`;
    blogListHtml = blogListHtml.replace('href="https://bestpvashop.com/"', `href="${canonicalUrl}"`);
    blogListHtml = blogListHtml.replace('content="https://bestpvashop.com/"', `content="${canonicalUrl}"`);

    // Redesigned Eye-Catching Grid Layout
    const blogGrid = pageBlogs.map(b => `
        <article class="group relative flex flex-col bg-[#0F172A] rounded-3xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_50px_-12px_rgba(6,182,212,0.25)] hover:-translate-y-2 h-full">
            <a href="/blog/${b.slug}/" class="h-64 overflow-hidden relative block">
                <img src="${b.image || 'https://via.placeholder.com/600x400?text=No+Image'}" alt="${b.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80"></div>
                
                <!-- Floating Date Badge -->
                <div class="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2">
                    <i data-lucide="calendar" class="w-3 h-3 text-cyan-400"></i> ${b.date}
                </div>
            </a>
            
            <div class="p-8 flex-1 flex flex-col relative">
                <!-- Decorative Glow -->
                <div class="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>

                <div class="mb-4">
                    <span class="text-xs font-bold text-cyan-400 tracking-widest uppercase border border-cyan-500/20 px-2 py-1 rounded">Article</span>
                </div>

                <h3 class="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 transition-all">
                    <a href="/blog/${b.slug}/">
                        <span class="absolute inset-0"></span>
                        ${b.title}
                    </a>
                </h3>
                
                <p class="text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed flex-1 group-hover:text-slate-300 transition-colors">${b.excerpt}</p>
                
                <div class="flex items-center justify-between mt-auto pt-6 border-t border-white/5 group-hover:border-cyan-500/20 transition-colors">
                    <span class="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Read Article</span>
                    <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                        <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </div>
                </div>
            </div>
        </article>
    `).join('\n');

    // Pagination Controls
    let paginationHtml = '<div class="flex justify-center items-center gap-2 mt-12">';
    if (i > 1) {
        const prevLink = i === 2 ? '/blog/' : `/blog/page/${i-1}/`;
        paginationHtml += `<a href="${prevLink}" class="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-cyan-600 transition font-bold text-sm">Previous</a>`;
    }
    for (let p = 1; p <= totalPages; p++) {
        const activeClass = p === i ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700';
        const link = p === 1 ? '/blog/' : `/blog/page/${p}/`;
        paginationHtml += `<a href="${link}" class="w-10 h-10 flex items-center justify-center rounded-lg ${activeClass} font-bold text-sm transition">${p}</a>`;
    }
    if (i < totalPages) {
        paginationHtml += `<a href="/blog/page/${i+1}/" class="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-cyan-600 transition font-bold text-sm">Next</a>`;
    }
    paginationHtml += '</div>';

    blogListHtml = blogListHtml.replace('{{PRODUCT_GRID}}', `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${blogGrid}
        </div>
        ${paginationHtml}
    `);
    blogListHtml = blogListHtml.replace('{{LATEST_ARTICLES}}', ''); 

    // Footer & Links
    blogListHtml = blogListHtml.replace('{{FOOTER}}', generateFooter(products, siteConfig));
    blogListHtml = blogListHtml.replace(/{{CRITICAL_CSS}}/g, `<style>${cssContent}</style>`);
    
    // Path Fixes
    blogListHtml = blogListHtml.replace(/href="product\//g, `href="${pageRelPath}product/`);
    blogListHtml = blogListHtml.replace(/href="category\//g, `href="${pageRelPath}category/`);
    blogListHtml = blogListHtml.replace(/src="\//g, `src="${pageRelPath}`); 
    blogListHtml = blogListHtml.replace('src="site_data.js"', `src="${pageRelPath}site_data.js"`);
    blogListHtml = blogListHtml.replace(/href="\//g, `href="${pageRelPath}`);
    // Fix Homepage Link specifically
    if(i > 1) {
         blogListHtml = blogListHtml.replace(`href="${pageRelPath}"`, 'href="/"');
    } else {
         blogListHtml = blogListHtml.replace('href="../"', 'href="/"');
    }
    
    // Clean up double slashes if any
    blogListHtml = blogListHtml.replace(/href="\/\/"/g, 'href="/"');

    fs.writeFileSync(path.join(pageDir, 'index.html'), minifyHTML(blogListHtml));
}

// Sitemap Entry for Blog
sitemap += '  <url>\n';
sitemap += `    <loc>https://bestpvashop.com/blog/</loc>\n`;
sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
sitemap += '    <priority>0.8</priority>\n';
sitemap += '  </url>\n';

// Single Blog Posts
blogs.forEach(post => {
    const dir = path.join('blog', post.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const sidebarHtml = generateSidebar(products, blogs);
    // Modified to pass full post object for double CTA replacement
    const contentWithCta = injectCTA(post.content, post);
    
    // Related Articles (Trust Section)
    const relatedHtml = generateRelatedArticlesHtml({ id: -1, category: 'General' }, blogs.filter(b => b.id !== post.id)); // Fallback related

    const blogPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - BestPVAShop</title>
    <meta name="description" content="${post.excerpt}">
    <link rel="canonical" href="https://bestpvashop.com/blog/${post.slug}/" />
    <meta name="robots" content="index, follow" />
    <style>${cssContent}</style>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest" defer></script>
</head>
<body class="bg-[#0B1120] text-slate-200 font-sans antialiased">
    ${headerHtml.replace(/{{LOGO_TEXT}}/g, siteConfig.logoText)}

    <!-- Header Spacing -->
    <div class="h-24"></div>

    <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- Breadcrumb -->
        <nav class="flex text-sm text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
            <a href="/" class="hover:text-white">Home</a>
            <span class="mx-2">/</span>
            <a href="/blog/" class="hover:text-white">Blog</a>
            <span class="mx-2">/</span>
            <span class="text-cyan-400 truncate">${post.title}</span>
        </nav>

        <div class="flex flex-col lg:flex-row gap-12">
            <!-- Main Content (70%) -->
            <article class="lg:w-[70%]">
                <header class="mb-8">
                    <span class="text-cyan-400 font-bold tracking-wider text-sm uppercase mb-3 block">${post.date}</span>
                    <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">${post.title}</h1>
                    <p class="text-xl text-slate-300 leading-relaxed border-l-4 border-cyan-500 pl-4 italic">
                        ${post.excerpt}
                    </p>
                </header>

                ${post.image ? `<img src="${post.image}" alt="${post.title}" class="w-full rounded-2xl mb-10 shadow-2xl border border-white/5">` : ''}

                <div class="prose prose-invert lg:prose-xl max-w-none prose-headings:text-white prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white">
                    ${contentWithCta}
                </div>

                <!-- Trust Section / Related -->
                ${relatedHtml}

                <div class="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                    <a href="/blog/" class="font-bold text-slate-400 hover:text-white flex items-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Blog
                    </a>
                </div>
            </article>

            <!-- Sidebar (30%) -->
            <aside class="lg:w-[30%] space-y-8">
                ${sidebarHtml}
            </aside>
        </div>
    </main>

    <footer class="bg-[#0F172A] border-t border-white/5 py-12 mt-20">
        ${generateFooter(products, siteConfig).replace(/href="\/product/g, 'href="../../product').replace(/href="#"/g, 'href="../../"')}
    </footer>

    <script>document.write('<script src="../../site_data.js?v=' + Date.now() + '"><\/script>');</script>
    <script>${uiJsContent}</script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(dir, 'index.html'), minifyHTML(blogPageHtml));

    sitemap += '  <url>\n';
    sitemap += `    <loc>https://bestpvashop.com/blog/${post.slug}/</loc>\n`;
    sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
    sitemap += '    <priority>0.7</priority>\n';
    sitemap += '  </url>\n';
});

console.log("Building Product Pages...");
const productTemplate = fs.readFileSync('product_template.html', 'utf8');

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
            <div class="card-glow bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden transition-all duration-300 group hover:-translate-y-2" style="content-visibility: auto; contain-intrinsic-size: 0 350px;">
                <div role="img" aria-label="${p.title}" class="bg-gradient-to-br ${relBg} p-4 h-44 relative flex flex-col items-center justify-center text-center text-white group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-2 left-2 bg-red-500/90 backdrop-blur-md border border-white/10 text-xs font-bold px-3 py-1 rounded flex gap-1">
                        <span class="text-yellow-300 text-sm">Sale!</span> BestPVAShop
                    </div>
                    <h3 class="font-bold text-lg leading-tight mb-2 px-2 drop-shadow-md">${p.title}</h3>
                    <div class="bg-white/10 hover:bg-white/20 text-xs font-bold px-4 py-1.5 rounded-full cursor-pointer transition-colors border border-white/20">ORDER NOW</div>
                </div>
                <div class="p-4">
                    <p class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">${p.category}</p>
                    <a href="../${p.slug}/" class="font-bold text-slate-100 text-sm mb-2 block hover:text-cyan-400 transition-colors truncate">${p.title}</a>
                    <div class="flex gap-0.5 mb-3">
                        ${renderStars(5, "w-3 h-3")} 
                    </div>
                    <div class="text-white text-sm mb-4 font-extrabold">$${p.min_price.toFixed(2)} - $${p.max_price.toFixed(2)}</div>
                    <a href="../${p.slug}/" class="block w-full bg-white/5 hover:bg-cyan-600 text-white text-center py-3.5 rounded-lg text-sm font-bold transition-all border border-white/10 hover:border-cyan-500">Order Now</a>
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
    // Inject Header for Product Pages
    html = html.replace('{{HEADER}}', headerContent);

    // Inline Critical CSS
    html = html.replace(/{{CRITICAL_CSS}}/g, `<style>${cssContent}</style>`);

    // SEO
    // SEO Logic
    const seoTitle = `${product.title} – Verified & Fast | BestPVAShop`;
    let seoDesc = product.meta_description || product.short_description || `Buy ${product.title} instantly.`;
    
    // Ensure Description Length (120-160 chars)
    if (seoDesc.length < 120) {
        seoDesc += " Get high-quality verified accounts instantly at BestPVAShop. Secure, fast, and reliable service with 24/7 support.";
    }
    if (seoDesc.length > 160) {
        seoDesc = seoDesc.substring(0, 157) + "...";
    }

    html = html.replace('{{SEO_TITLE}}', seoTitle);
    html = html.replace('{{SEO_DESCRIPTION}}', seoDesc);
    html = html.replace('{{SEO_TAGS}}', `
        <link rel="canonical" href="https://bestpvashop.com/product/${product.slug}/" />
        <meta name="robots" content="index, follow" />
        
        <!-- Open Graph -->
        <meta property="og:title" content="${seoTitle}" />
        <meta property="og:description" content="${seoDesc}" />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://bestpvashop.com/product/${product.slug}/" />
        <meta property="og:site_name" content="BestPVAShop" />
        <meta property="og:image" content="https://bestpvashop.com/favicon.svg" />
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${seoTitle}" />
        <meta name="twitter:description" content="${seoDesc}" />
        <meta name="twitter:image" content="https://bestpvashop.com/favicon.svg" />
    `);
    html = html.replace('{{JSON_LD}}', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);

    // Content
    html = html.replace('{{BG_CLASS}}', bgClass);
    html = html.replace('{{DISPLAY_TITLE}}', product.title.replace('Buy ', ''));
    html = html.replace('{{HERO_STARS}}', renderStars(5, "w-5 h-5"));
    html = html.replace('{{LOGO_TEXT}}', siteConfig.logoText);
    
    // Category & Slug
    const catSlug = product.category.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    html = html.replace(/{{CATEGORY}}/g, product.category);
    html = html.replace(/{{CATEGORY_SLUG}}/g, catSlug);
    
    html = html.replace(/{{PRODUCT_TITLE}}/g, product.title);
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
    html = html.replace('{{RELATED_ARTICLES}}', generateRelatedArticlesHtml(product, blogs));
    html = html.replace('{{SOCIAL_SHARE}}', generateSocialShare(product));
    html = html.replace('{{WHATSAPP}}', siteConfig.whatsapp);
    html = html.replace('{{TELEGRAM}}', siteConfig.telegram);
    html = html.replace('{{WHATSAPP_LINK}}', `https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`);
    html = html.replace('{{TELEGRAM_LINK}}', `https://t.me/${siteConfig.telegram.replace('@', '')}`);
    html = html.replace('{{FOOTER}}', generateFooter(products, siteConfig).replace(/href="\/product/g, 'href="../product').replace(/href="#"/g, 'href="../"')); // Fix relative links in footer for subpages

    html = html.replace('<script src="../../site_data.js" defer></script>', '<script src="../../site_data.js" defer></script>');
    html = html.replace('<script src="site_data.js" defer></script>', '<script src="../../site_data.js" defer></script>');

    // Use root path '/' for homepage to avoid index.html in URL (Clean URL)
    html = html.replace('href="index.html"', 'href="/"');
    html = html.replace("window.location.href='/'", "window.location.href='/'");

    // Write File
    const dir = path.join('product', product.slug);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, 'index.html'), minifyHTML(html));
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
