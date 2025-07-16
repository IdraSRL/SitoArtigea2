// Blog Category Filters - Artigea s.r.l.

class BlogFilters {
    constructor() {
        this.currentFilter = 'all';
        this.blogCards = document.querySelectorAll('.blog-card');
        this.categoryCards = document.querySelectorAll('.category-card');
        this.filterStatus = document.getElementById('filter-status');
        this.blogGrid = document.querySelector('.blog__grid');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCounts();
    }

    setupEventListeners() {
        // Add click listeners to category cards
        this.categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const category = card.dataset.category;
                this.filterByCategory(category);
                
                // Track filter usage if analytics available
                if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                    window.cookieConsent.trackEvent('blog_filter_used', {
                        category: category,
                        articles_shown: this.getVisibleArticlesCount()
                    });
                }
            });

            // Add keyboard support for accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const category = card.dataset.category;
                    this.filterByCategory(category);
                }
            });

            // Make cards focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Filtra articoli per categoria: ${card.querySelector('.category-card__title').textContent}`);
        });
    }

    filterByCategory(category) {
        // Don't filter if already active
        if (this.currentFilter === category) {
            return;
        }

        this.currentFilter = category;
        
        // Add loading state
        this.blogGrid.classList.add('loading');
        
        // Update active category card
        this.updateActiveCategoryCard(category);
        
        // Filter articles with animation
        setTimeout(() => {
            this.animateFilterChange(category);
        }, 150);
    }

    updateActiveCategoryCard(category) {
        this.categoryCards.forEach(card => {
            card.classList.remove('active');
            if (card.dataset.category === category) {
                card.classList.add('active');
            }
        });
    }

    animateFilterChange(category) {
        // First, fade out all cards
        this.blogCards.forEach(card => {
            card.classList.add('fade-out');
        });

        setTimeout(() => {
            // Hide/show cards based on category
            let visibleCount = 0;
            
            this.blogCards.forEach(card => {
                const cardCategory = card.dataset.category;
                const shouldShow = category === 'all' || cardCategory === category;
                
                if (shouldShow) {
                    card.classList.remove('hidden', 'fade-out');
                    card.classList.add('fade-in');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('fade-in');
                }
            });

            // Update filter status
            this.updateFilterStatus(category, visibleCount);
            
            // Remove loading state
            this.blogGrid.classList.remove('loading');
            
            // Show empty state if no articles
            this.toggleEmptyState(visibleCount === 0);
            
        }, 300);
    }

    updateFilterStatus(category, visibleCount) {
        if (category === 'all') {
            this.filterStatus.style.display = 'none';
        } else {
            this.filterStatus.style.display = 'flex';
            const categoryName = this.getCategoryDisplayName(category);
            this.filterStatus.querySelector('.filter-category').textContent = categoryName;
            
            // Update count in status
            const countText = visibleCount === 1 ? '1 articolo' : `${visibleCount} articoli`;
            this.filterStatus.querySelector('p').innerHTML = `Mostrando ${countText} per: <span class="filter-category">${categoryName}</span>`;
        }
    }

    getCategoryDisplayName(category) {
        const categoryMap = {
            'guide': 'Guide Casa',
            'business': 'Business',
            'ambiente': 'Ambiente',
            'sanificazione': 'Sanificazione',
            'salute': 'Salute'
        };
        return categoryMap[category] || category;
    }

    toggleEmptyState(show) {
        let emptyState = document.querySelector('.empty-state');
        
        if (show && !emptyState) {
            // Create empty state if it doesn't exist
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <h3>Nessun articolo trovato</h3>
                <p>Non ci sono articoli per questa categoria al momento.</p>
                <button class="btn btn--primary" onclick="clearFilter()">Mostra tutti gli articoli</button>
            `;
            this.blogGrid.parentNode.insertBefore(emptyState, this.blogGrid.nextSibling);
        }
        
        if (emptyState) {
            emptyState.classList.toggle('show', show);
        }
    }

    getVisibleArticlesCount() {
        return Array.from(this.blogCards).filter(card => !card.classList.contains('hidden')).length;
    }

    updateCounts() {
        // Update category counts based on actual articles
        const categoryCounts = {};
        let totalCount = 0;

        this.blogCards.forEach(card => {
            const category = card.dataset.category;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            totalCount++;
        });

        // Update count displays
        this.categoryCards.forEach(card => {
            const category = card.dataset.category;
            const countElement = card.querySelector('.category-card__count');
            
            if (category === 'all') {
                const countText = totalCount === 1 ? '1 articolo' : `${totalCount} articoli`;
                countElement.textContent = countText;
            } else if (categoryCounts[category]) {
                const count = categoryCounts[category];
                const countText = count === 1 ? '1 articolo' : `${count} articoli`;
                countElement.textContent = countText;
            } else {
                countElement.textContent = '0 articoli';
            }
        });
    }

    // Method to clear filter (called from global scope)
    clearFilter() {
        this.filterByCategory('all');
    }
}

// Global function for clear filter button
function clearFilter() {
    if (window.blogFilters) {
        window.blogFilters.clearFilter();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogFilters = new BlogFilters();
});

// Search functionality (bonus feature)
class BlogSearch {
    constructor() {
        this.searchInput = document.getElementById('blog-search');
        this.blogCards = document.querySelectorAll('.blog-card');
        
        if (this.searchInput) {
            this.init();
        }
    }

    init() {
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            this.filterBySearch(searchTerm);
        });
    }

    filterBySearch(searchTerm) {
        if (!searchTerm) {
            // Show all cards if search is empty
            this.blogCards.forEach(card => {
                card.style.display = '';
            });
            return;
        }

        this.blogCards.forEach(card => {
            const title = card.querySelector('.blog-card__title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-card__excerpt').textContent.toLowerCase();
            const category = card.querySelector('.blog-card__category').textContent.toLowerCase();
            
            const matches = title.includes(searchTerm) || 
                          excerpt.includes(searchTerm) || 
                          category.includes(searchTerm);
            
            card.style.display = matches ? '' : 'none';
        });
    }
}

// Initialize search if search input exists
document.addEventListener('DOMContentLoaded', () => {
    new BlogSearch();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogFilters, BlogSearch };
}