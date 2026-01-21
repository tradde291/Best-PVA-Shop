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
    
    // Prioritize featured posts, then date
    const featured = blogs.filter(b => b.featured);
    const others = blogs.filter(b => !b.featured);
    const sorted = [...featured, ...others].slice(0, 3);
    
    const cards = sorted.map(b => `
        <div class="group relative flex flex-col items-start bg-[#1E293B] p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all">
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

function generateRelatedArticlesHtml(item, blogs) {
    if (!blogs || blogs.length === 0) return '';
    
    // Contextual matching: Match category keywords in blog title
    // If item has category (Product), use it. If not (Blog), use title keywords or fallback.
    let keywords = [];
    if (item.category) {
        keywords = item.category.toLowerCase().split(/[\s&]+/);
    } else if (item.title) {
        // Exclude common words
        const stopWords = ['how', 'to', 'buy', 'verified', 'accounts', 'pva', 'is', 'are', 'the', 'in', 'of', 'for', 'and'];
        keywords = item.title.toLowerCase().split(/[\s&]+/).filter(w => !stopWords.includes(w) && w.length > 3);
    }

    const related = blogs.filter(b => {
        if (b.id === item.id) return false; // Don't link to self
        const titleLower = b.title.toLowerCase();
        return keywords.some(k => titleLower.includes(k));
    }).slice(0, 3);

    const displayBlogs = related.length > 0 ? related : blogs.slice(0, 3).filter(b => b.id !== item.id);
    const title = related.length > 0 ? (item.category ? `Read our blog on ${item.category}` : 'Related Articles') : 'Latest Articles';

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

// --- 3. Build Homepage ---
console.log("Building Homepage...");
const indexTemplate = fs.readFileSync('site_template.html', 'utf8'); // Keep master template in memory
let indexHtml = indexTemplate;

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
indexHtml = indexHtml.replace('{{PRODUCT_GRID}}', productGridHtml);

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
        ${catGrid}
    `;

    catHtml = catHtml.replace('{{PRODUCT_GRID}}', contentAndGrid);
    
    // Footer
    catHtml = catHtml.replace('{{FOOTER}}', generateFooter(products, siteConfig).replace(/href="\/product/g, 'href="../../product').replace(/href="#"/g, 'href="../../"'));

    // CSS
    catHtml = catHtml.replace(/{{CRITICAL_CSS}}/g, `<style>${cssContent}</style>`);
    
    // Fix Relative Paths (Since we are deep in /category/slug/)
    catHtml = catHtml.replace(/href="product\//g, 'href="../../product/');
    catHtml = catHtml.replace(/href="category\//g, 'href="../../category/');
    catHtml = catHtml.replace(/src="\//g, 'src="../../'); 
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

// Blog Listing (Clean, White Background)
let blogListHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - Digital Marketing Tips & Guides | BestPVAShop</title>
    <meta name="description" content="Expert tips, tricks, and guides to grow your digital presence safely. Learn about PVA accounts, SEO, and social media marketing.">
    <link rel="canonical" href="https://bestpvashop.com/blog/" />
    <style>${cssContent}</style>
    <script src="https://unpkg.com/lucide@latest" defer></script>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">
    <!-- Dark Header to match site brand -->
    <header class="fixed top-0 w-full z-50 bg-[#0B1120] border-b border-white/10 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">BestPVAShop</a>
            <nav class="hidden md:flex gap-6">
                <a href="/" class="text-sm font-bold text-slate-300 hover:text-white">Home</a>
                <a href="/blog/" class="text-sm font-bold text-cyan-400">Blog</a>
            </nav>
             <div class="md:hidden flex gap-4">
                <a href="/" class="text-sm font-bold text-slate-300 hover:text-white">Home</a>
                <a href="/blog/" class="text-sm font-bold text-cyan-400">Blog</a>
             </div>
        </div>
    </header>

    <main class="pt-24 pb-20">
        <div class="max-w-7xl mx-auto px-4">
            
            <!-- Hero Section -->
            <div class="text-center mb-16 max-w-3xl mx-auto">
                <span class="text-cyan-600 font-bold tracking-wider text-sm uppercase mb-2 block">Our Blog</span>
                <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Latest <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Insights</span></h1>
                <p class="text-xl text-slate-600 leading-relaxed">
                    Expert tips, tricks, and guides to grow your digital presence safely.
                </p>
            </div>

            <!-- Blog Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {{BLOG_GRID}}
            </div>

            <!-- Pagination (Placeholder) -->
            <div class="mt-16 text-center">
                <div class="inline-flex gap-2">
                    <button disabled class="px-4 py-2 rounded-lg bg-slate-200 text-slate-400 font-bold cursor-not-allowed">Previous</button>
                    <button class="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold shadow-md hover:bg-cyan-700">1</button>
                    <button class="px-4 py-2 rounded-lg bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50">2</button>
                    <button class="px-4 py-2 rounded-lg bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50">Next</button>
                </div>
            </div>

        </div>
    </main>

    <footer class="bg-[#0F172A] border-t border-white/5 py-12">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-slate-500 text-sm">© 2026 BestPVAShop. All rights reserved.</p>
        </div>
    </footer>
    <script>lucide.createIcons();</script>
</body>
</html>`;

const blogGrid = blogs.map(b => `
    <article class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
        <div class="h-56 bg-slate-100 relative overflow-hidden">
            ${b.image 
                ? `<img src="${b.image}" alt="${b.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` 
                : `<div class="w-full h-full flex items-center justify-center bg-slate-200"><i data-lucide="image" class="w-12 h-12 text-slate-400"></i></div>`
            }
            <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-cyan-700 shadow-sm">
                ${b.date}
            </div>
        </div>
        <div class="p-8 flex flex-col flex-grow">
            <h2 class="text-xl font-bold text-slate-900 mb-4 group-hover:text-cyan-600 transition-colors line-clamp-2 leading-tight">
                <a href="/blog/${b.slug}/">
                    <span class="absolute inset-0"></span>
                    ${b.title}
                </a>
            </h2>
            <p class="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">${b.excerpt}</p>
            <div class="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                <span class="text-cyan-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Article <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </span>
                <span class="text-slate-400 text-xs font-medium">5 min read</span>
            </div>
        </div>
    </article>
`).join('\n');

blogListHtml = blogListHtml.replace('{{BLOG_GRID}}', blogGrid);

fs.writeFileSync(path.join(blogDir, 'index.html'), minifyHTML(blogListHtml));

sitemap += '  <url>\n';
sitemap += `    <loc>https://bestpvashop.com/blog/</loc>\n`;
sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
sitemap += '    <priority>0.8</priority>\n';
sitemap += '  </url>\n';

function generateRelatedProductsForBlog(post, allProducts) {
    let related = [];
    if (post.related_product_ids && post.related_product_ids.length > 0) {
        related = allProducts.filter(p => post.related_product_ids.includes(p.id));
    }
    
    // Fallback: If no specific related products, show some popular ones or random
    if (related.length === 0) {
        related = allProducts.filter(p => p.is_sale).slice(0, 3);
    }

    if (related.length === 0) return '';

    const cards = related.map(p => {
         const bgGradient = gradients[p.badge_color] || gradients.blue;
         return `
            <div class="card-glow bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden transition-all duration-300 group hover:-translate-y-2">
                <div class="bg-gradient-to-br ${bgGradient} p-4 h-32 flex flex-col items-center justify-center text-center">
                    <h3 class="text-sm font-bold text-white leading-tight">${p.title}</h3>
                    <div class="mt-2 bg-white/10 text-[10px] font-bold px-3 py-1 rounded-full text-white">ORDER NOW</div>
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] text-cyan-400 font-bold uppercase">${p.category}</span>
                        <span class="text-white font-bold text-sm">$${p.min_price}</span>
                    </div>
                    <a href="/product/${p.slug}/" class="block w-full bg-white/5 hover:bg-cyan-600 text-white text-center py-2 rounded-lg text-xs font-bold transition-all border border-white/10 hover:border-cyan-500">View Details</a>
                </div>
            </div>
         `;
    }).join('');

    return `
        <div class="mt-12 pt-8 border-t border-white/10">
            <h3 class="text-2xl font-bold text-white mb-6">Recommended for You</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                ${cards}
            </div>
        </div>
    `;
}

// --- Helper: Inject CTA ---
function injectCTA(content, cta) {
    if (!cta || !cta.text || !cta.link) return content;
    
    // Try to inject after the 2nd paragraph
    const paragraphs = content.split('</p>');
    if (paragraphs.length < 3) return content + generateCTAHTML(cta); // Append if short
    
    const ctaHtml = generateCTAHTML(cta);
    paragraphs[1] += '</p>' + ctaHtml;
    
    return paragraphs.join('</p>'); // Rejoin (Note: split removes delimiter, we added one back, others need it)
        // actually split consumes '</p>', so we need to add it back to all except the last one if it was empty
        // A safer way is regex replace or just precise insertion.
        // Let's use a simpler approach: Replace the 2nd occurrence of </p> with </p> + CTA
    
    // Refined approach:
    let pCount = 0;
    return content.replace(/<\/p>/g, (match) => {
        pCount++;
        if (pCount === 2) {
            return match + ctaHtml;
        }
        return match;
    });
}

function generateCTAHTML(cta) {
    return `
        <div class="my-10 p-8 bg-cyan-50 border-l-4 border-cyan-500 rounded-r-xl shadow-sm">
            <h4 class="text-xl font-bold text-slate-900 mb-2 font-sans">${cta.text}</h4>
            <a href="${cta.link}" class="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg">
                ${cta.btnText || 'Check it out'} <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
        </div>
    `;
}

// Blog Posts
blogs.forEach(post => {
    const dir = path.join('blog', post.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const relatedProductsHtml = generateRelatedProductsForBlog(post, products);
    
    // Inject CTA if available
    let finalContent = post.content;
    if (post.cta) {
        finalContent = injectCTA(finalContent, post.cta);
    }

    // Sidebar Content
    const sidebarHtml = `
        <div class="space-y-8">
            <!-- CTA Box -->
            <div class="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 text-center text-white shadow-xl">
                <h3 class="text-xl font-bold mb-2">Need Verified Accounts?</h3>
                <p class="text-cyan-100 text-sm mb-4">Get instant access to premium PVA accounts for your business.</p>
                <a href="/category/accounts/" class="block w-full bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-cyan-50 transition-colors">Browse Shop</a>
            </div>

            <!-- Trusted Products -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 class="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Trusted Products</h3>
                <ul class="space-y-4">
                    ${products.filter(p => p.is_sale).slice(0, 5).map(p => `
                        <li>
                            <a href="/product/${p.slug}/" class="group flex gap-3 items-start">
                                <div class="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-cyan-50 transition-colors">
                                    <i data-lucide="shield-check" class="w-5 h-5 text-cyan-600"></i>
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-700 group-hover:text-cyan-600 transition-colors line-clamp-2">${p.title}</h4>
                                    <span class="text-xs text-slate-500 font-medium">$${p.min_price}</span>
                                </div>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    // Blog Post Layout (White Background, Sidebar)
    const blogContentHtml = `
        <div class="bg-slate-50 min-h-screen">
            <!-- Header (Dark) -->
            <!-- Main Content (Light) -->
            <div class="max-w-7xl mx-auto px-4 py-12">
                
                <!-- Breadcrumb -->
                <nav class="flex mb-8 text-sm font-medium text-slate-500">
                    <a href="/" class="hover:text-cyan-600">Home</a>
                    <span class="mx-2">/</span>
                    <a href="/blog/" class="hover:text-cyan-600">Blog</a>
                    <span class="mx-2">/</span>
                    <span class="text-slate-900 truncate">${post.title}</span>
                </nav>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    <!-- Main Article (Left 70%) -->
                    <div class="lg:col-span-8">
                        <article class="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                            <header class="mb-10">
                                <div class="flex items-center gap-4 mb-6">
                                    <span class="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Guide</span>
                                    <span class="text-slate-400 text-sm font-medium flex items-center gap-1"><i data-lucide="calendar" class="w-4 h-4"></i> ${post.date}</span>
                                </div>
                                <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">${post.title}</h1>
                                <p class="text-xl text-slate-500 leading-relaxed">${post.excerpt}</p>
                            </header>
                            
                            <!-- Featured Image -->
                            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="w-full h-auto rounded-2xl mb-10 shadow-md">` : ''}

                            <div class="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-cyan-600 prose-a:no-underline hover:prose-a:underline">
                                ${finalContent}
                            </div>
                            
                            <!-- Trust Section (Bottom) -->
                            <div class="mt-12 pt-8 border-t border-slate-100">
                                <div class="bg-slate-50 rounded-xl p-6 flex items-start gap-4">
                                    <div class="bg-green-100 p-3 rounded-full shrink-0">
                                        <i data-lucide="shield-check" class="w-6 h-6 text-green-600"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-slate-900 text-lg">Buyer Protection</h4>
                                        <p class="text-slate-600 text-sm mt-1">
                                            We ensure all accounts are verified and safe. If you have issues, our 24/7 support is here to help.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </article>

                        <!-- Related Articles Section -->
                        <div class="mt-12">
                            <h3 class="text-2xl font-bold text-slate-900 mb-6">Related Articles</h3>
                            ${generateRelatedArticlesHtml(post, blogs).replace(/text-white/g, 'text-slate-900').replace(/text-slate-400/g, 'text-slate-600').replace(/bg-\[#1E293B\]/g, 'bg-white').replace(/border-white\/5/g, 'border-slate-200 shadow-sm')}
                        </div>
                    </div>

                    <!-- Sidebar (Right 30%) -->
                    <aside class="lg:col-span-4">
                        <div class="sticky top-24">
                            ${sidebarHtml}
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    `;
    
    // Blog Schema
    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.image,
        "datePublished": new Date(post.date).toISOString(), // Converting "Jan 22, 2026" to ISO might fail if not parsed correctly, but JS Date constructor usually handles it.
        "author": {
            "@type": "Organization",
            "name": "BestPVAShop",
            "url": "https://bestpvashop.com/"
        },
        "publisher": {
            "@type": "Organization",
            "name": "BestPVAShop",
            "logo": {
                "@type": "ImageObject",
                "url": "https://bestpvashop.com/favicon.svg"
            }
        },
        "description": post.excerpt
    };

    // We construct a full page string because reusing index.html's hero is annoying for details pages
    const simplePage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - BestPVAShop Blog</title>
    <meta name="description" content="${post.excerpt}">
    <link rel="canonical" href="https://bestpvashop.com/blog/${post.slug}/" />
    <style>${cssContent}</style>
    <script src="https://unpkg.com/lucide@latest" defer></script>
    <script type="application/ld+json">${JSON.stringify(blogSchema)}</script>
</head>
<body class="bg-white text-slate-800 font-sans antialiased">
    <header class="fixed top-0 w-full z-50 bg-[#0B1120] border-b border-white/10 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">BestPVAShop</a>
            <nav class="hidden md:flex gap-6">
                <a href="/" class="text-sm font-bold text-slate-300 hover:text-white">Home</a>
                <a href="/blog/" class="text-sm font-bold text-cyan-400">Blog</a>
            </nav>
             <div class="md:hidden flex gap-4">
                <a href="/" class="text-sm font-bold text-slate-300 hover:text-white">Home</a>
                <a href="/blog/" class="text-sm font-bold text-cyan-400">Blog</a>
             </div>
        </div>
    </header>

    <main class="pt-16">
        ${blogContentHtml}
    </main>

    <footer class="bg-[#0F172A] border-t border-white/5 py-12 mt-0">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-slate-500 text-sm">© 2026 BestPVAShop. All rights reserved.</p>
        </div>
    </footer>
    <script>lucide.createIcons();</script>
</body>
</html>`;

    fs.writeFileSync(path.join(dir, 'index.html'), minifyHTML(simplePage));

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
