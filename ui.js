document.addEventListener('DOMContentLoaded', function() {
    // --- Navigation Logic ---

    // 1. Desktop Navigation
    const desktopNav = document.getElementById('desktop-nav');
    if (typeof categories !== 'undefined' && desktopNav) {
        categories.forEach(cat => {
            const btn = document.createElement('div');
            btn.className = 'relative group px-3 py-2';
            btn.innerHTML = `
                <button class="text-slate-300 group-hover:text-cyan-400 text-sm font-medium flex items-center gap-1 transition-colors">
                    ${cat.name} <i data-lucide="chevron-down" class="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity"></i>
                </button>
                <div class="absolute left-0 mt-2 w-56 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl py-2 hidden group-hover:block z-50 backdrop-blur-xl max-h-96 overflow-y-auto">
                    ${cat.items.map(item => {
                         let p = null;
                         if (typeof products !== 'undefined') {
                             p = products.find(prod => prod.title === item);
                         }
                         /* Use slug for clean URL, fallback to id if needed (though slug should exist) */
                         const url = p ? (p.slug ? `/product/${p.slug}/` : `/product/${p.slug}/`) : '#';
                         /* Handle relative path for static files if needed, but absolute /product/... is standard for web */
                         /* For local file support, we might need relative paths, but let's stick to standard first */
                         return `<a href="${url}" class="block px-4 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-cyan-400 transition-colors">${item}</a>`;
                    }).join('')}
                </div>
            `;
            desktopNav.insertBefore(btn, desktopNav.lastElementChild); // Insert before "Blog" or at the end if structured differently
        });
    }

    // 2. Mobile Menu Population
    const mobileNav = document.getElementById('mobile-nav-items');
    if (mobileNav && typeof categories !== 'undefined') {
        // Add Blog Link
        const blogLink = document.createElement('a');
        blogLink.href = '/blog/';
        blogLink.className = 'block px-4 py-3 text-white font-bold bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl mb-4 hover:bg-white/5 transition-all';
        blogLink.innerHTML = '<span class="flex items-center gap-2"><i data-lucide="book-open" class="w-4 h-4 text-cyan-400"></i> Blog</span>';
        mobileNav.appendChild(blogLink);

        categories.forEach(cat => {
            const catContainer = document.createElement('div');
            catContainer.className = 'mb-4';
            catContainer.innerHTML = `
                <div class="px-4 py-2 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    ${cat.name}
                    <div class="h-px bg-white/10 flex-1"></div>
                </div>
                <div class="space-y-1">
                    ${cat.items.map(item => {
                        let p = null;
                        if (typeof products !== 'undefined') {
                            p = products.find(prod => prod.title === item);
                        }
                        const url = p ? `/product/${p.slug}/` : '#';
                        return `<a href="${url}" class="block px-4 py-2 text-slate-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors text-sm">${item}</a>`
                    }).join('')}
                </div>
            `;
            mobileNav.appendChild(catContainer);
        });
    }

    // 3. Mobile Menu Toggle Logic
    const menuBtn = document.getElementById('mobile-menu-btn');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const menu = document.getElementById('mobile-menu');

    function toggleMenu() {
        if (!menu || !backdrop) return;
        const isHidden = menu.style.transform === 'translateX(100%)';
        if (isHidden) {
            menu.style.transform = 'translateX(0)';
            backdrop.classList.remove('hidden');
            setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
            document.body.style.overflow = 'hidden';
        } else {
            menu.style.transform = 'translateX(100%)';
            backdrop.classList.add('opacity-0');
            setTimeout(() => backdrop.classList.add('hidden'), 300);
            document.body.style.overflow = '';
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (backdrop) backdrop.addEventListener('click', toggleMenu);

    // Re-initialize icons if added dynamically
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// --- Global Helpers ---
function renderStars(rating = 5, sizeClass = "w-4 h-4") {
    let html = '';
    // Normalize rating
    const stars = Math.min(Math.max(rating, 0), 5);
    for (let i = 0; i < 5; i++) {
         // Full stars for now, as per simple implementation
        html += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star ${sizeClass} fill-yellow-400 text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
    return html;
}
