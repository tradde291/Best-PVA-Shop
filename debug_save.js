
const fs = require('fs');

// Mock DOM
const document = {
    getElementById: (id) => ({ value: 'test' }),
    querySelectorAll: () => [],
    body: { insertAdjacentHTML: () => {} }
};

// Load site_data.js content to get variables
const siteDataContent = fs.readFileSync('site_data.js', 'utf8');
eval(siteDataContent);

// Mock admin.html variables
let cmsConfig = JSON.parse(JSON.stringify(siteConfig));
let cmsProducts = JSON.parse(JSON.stringify(products));
let cmsReviews = JSON.parse(JSON.stringify(reviewsData));
// let cmsLandingData = {}; // Removed

function saveGeneralToMemory() {
    // Mock
}

function saveCurrentProduct(silent) {
    // Mock
}

function saveCurrentReview(silent) {
    // Mock
}

// Mimic saveToDisk content generation
try {
    saveGeneralToMemory();
    // saveLandingToMemory(); // Removed
    
    saveCurrentProduct(true);
    saveCurrentReview(true);

    let content = `// site_data.js\n\n`;
    content += `// --- Site Configuration (CMS Data) ---\n`;
    content += `const siteConfig = ${JSON.stringify(cmsConfig, null, 4)};\n\n`;
    content += `// Categories (Header)\n`;
    content += `const categories = ${JSON.stringify(categories, null, 4)};\n\n`;
    content += `// Sample Reviews Data\n`;
    content += `const reviewsData = ${JSON.stringify(cmsReviews, null, 4)};\n\n`;
    // content += `// --- Landing Page Data (Canva Pro) ---\n`;
    // content += `const landingPageData = ${JSON.stringify(cmsLandingData, null, 4)};\n\n`;
    content += `// All 41 Products Data\n`;
    content += `const products = ${JSON.stringify(cmsProducts, null, 4)};\n\n`;
    
    // Add the rest of the content (hardcoded functions)
    content += `
// --- MODIFIED: Always return 5 Stars ---
function renderStars(rating) {
    let starsHtml = '';
    // We ignore the actual rating and force 5 stars (fill-yellow-400)
    for (let i = 0; i < 5; i++) {
        starsHtml += \`<i data-lucide="star" class="w-3 h-3 fill-yellow-400 text-yellow-400"></i>\`;
    }
    return starsHtml;
}

// Helper: Gradients Map
const gradients = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    cyan: 'from-cyan-500 to-cyan-600',
    indigo: 'from-indigo-500 to-indigo-600',
    gray: 'from-gray-600 to-gray-700'
};

// Common Header Logic
function initHeader() {
    // Apply Site Config to DOM if elements exist
    if (typeof siteConfig !== 'undefined') {
        // Page Title & Meta
        document.title = siteConfig.siteTitle;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', siteConfig.metaDescription);

        // Logo Text
        const logoEls = document.querySelectorAll('.logo-text');
        logoEls.forEach(el => {
            el.innerHTML = siteConfig.logoText;
        });
        const logoBadgeEls = document.querySelectorAll('.logo-badge');
        logoBadgeEls.forEach(el => {
            el.innerHTML = siteConfig.logoBadge;
        });

        // Hero Section (if exists on page)
        const heroTitleEl = document.getElementById('hero-title');
        if (heroTitleEl) heroTitleEl.innerHTML = siteConfig.heroTitle;

        const heroSubtitleEl = document.getElementById('hero-subtitle');
        if (heroSubtitleEl) heroSubtitleEl.innerHTML = siteConfig.heroSubtitle;
    }

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if(mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Mobile Menu Items Injection
    const mobileNavItems = document.getElementById('mobile-nav-items');
    if (mobileNavItems && categories) {
        mobileNavItems.innerHTML = ''; 
        categories.forEach(cat => {
            const catDiv = document.createElement('div');
            catDiv.className = 'py-2 border-b border-gray-50';
            const itemsLinks = cat.items.map(itemTitle => {
                const product = products.find(p => p.title === itemTitle);
                const linkId = product ? (product.slug || product.id) : '#';
                const url = product ? \`/product/\${product.slug}/\` : '#';
                return \`<a href="\${url}" class="block pl-4 py-1 text-sm text-gray-500 hover:text-blue-600">\${itemTitle}</a>\`;
            }).join('');
            catDiv.innerHTML = \`<div class="font-medium text-gray-900 px-2 mb-1">\${cat.name}</div><div class="space-y-1">\${itemsLinks}</div>\`;
            mobileNavItems.appendChild(catDiv);
        });
    }
    // --- Contact Popup Logic ---
    const popupHTML = \`
    <div id="contact-popup" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4 transition-opacity duration-300 opacity-0">
        <div class="bg-[#1e293b] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl transform transition-all scale-95 duration-300" id="contact-popup-content">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-xl font-bold text-white">\${siteConfig.popupTitle || 'Contact Us'}</h3>
                    <p class="text-xs text-slate-400 mt-1">\${siteConfig.popupMessage || ''}</p>
                </div>
                <button id="close-contact-popup" class="text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            <div class="space-y-4">
                <a href="https://wa.me/\${siteConfig.whatsapp ? siteConfig.whatsapp.replace(/[^0-9]/g, '') : ''}" target="_blank" class="flex items-center gap-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 p-4 rounded-xl transition-all group">
                    <div class="bg-[#25D366] text-white p-2 rounded-full">
                        <i data-lucide="phone" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <div class="text-sm text-slate-400">WhatsApp</div>
                        <div class="text-white font-medium group-hover:text-[#25D366] transition-colors">\${siteConfig.whatsapp || 'Not Set'}</div>
                    </div>
                </a>
                <a href="https://t.me/\${siteConfig.telegram ? siteConfig.telegram.replace('@', '') : ''}" target="_blank" class="flex items-center gap-4 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 p-4 rounded-xl transition-all group">
                    <div class="bg-[#0088cc] text-white p-2 rounded-full">
                        <i data-lucide="send" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <div class="text-sm text-slate-400">Telegram</div>
                        <div class="text-white font-medium group-hover:text-[#0088cc] transition-colors">\${siteConfig.telegram || 'Not Set'}</div>
                    </div>
                </a>
                <a href="mailto:\${siteConfig.supportEmail}" class="flex items-center gap-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 p-4 rounded-xl transition-all group">
                    <div class="bg-orange-500 text-white p-2 rounded-full">
                        <i data-lucide="mail" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <div class="text-sm text-slate-400">Email Support</div>
                        <div class="text-white font-medium group-hover:text-orange-500 transition-colors">\${siteConfig.supportEmail}</div>
                    </div>
                </a>
            </div>
        </div>
    </div>
    \`;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    const popup = document.getElementById('contact-popup');
    const content = document.getElementById('contact-popup-content');
    const closeBtn = document.getElementById('close-contact-popup');

    function openPopup() {
        popup.classList.remove('hidden');
        setTimeout(() => {
            popup.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    }

    function closePopup() {
        popup.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }

    if(closeBtn) closeBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', (e) => {
        if(e.target === popup) closePopup();
    });

    // Attach to all "Contact us" buttons and "Support" links
    // Use event delegation for better reliability
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a');
        if (!target) return;
        
        const text = target.textContent.trim().toLowerCase();
        
        // Check for specific keywords
        if(text.includes('contact us') || text.includes('contact support') || text === 'support') {
            // Exclude links inside the popup itself
            if (target.closest('#contact-popup')) return;
            
            e.preventDefault();
            openPopup();
        }
    });

    if(typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
`;
    
    console.log("Content generation successful. Length:", content.length);
} catch (e) {
    console.error("Content generation failed:", e);
}
