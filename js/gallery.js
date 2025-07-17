// Gallery Management System - Artigea s.r.l.

class GalleryManager {
    constructor() {
        this.currentFilter = 'all';
        this.galleryData = [];
        this.galleryGrid = document.getElementById('gallery-grid');
        this.filters = document.querySelectorAll('.gallery__filter');
        this.emptyState = document.getElementById('empty-state');
        this.loadingState = document.getElementById('loading-state');
        
        this.init();
    }

    init() {
        this.loadGalleryData();
        this.setupEventListeners();
        this.renderGallery();
    }

    // Configurazione dati galleria - FACILMENTE MODIFICABILE
    loadGalleryData() {
        this.galleryData = [
            {
                id: 1,
                title: 'Pulizia Appartamento Centro Storico',
                description: 'Intervento di pulizia profonda in appartamento storico con particolare attenzione ai dettagli architettonici.',
                category: 'civili',
                location: 'Pisa Centro',
                date: '2024-03-15',
                beforeImage: './img/logo.svg', // Sostituire con immagine reale
                afterImage: './img/logo.svg',  // Sostituire con immagine reale
                featured: true
            },
            {
                id: 2,
                title: 'Sanificazione Uffici Aziendali',
                description: 'Sanificazione completa di uffici aziendali con protocolli COVID-19 certificati.',
                category: 'sanificazione',
                location: 'Pontedera',
                date: '2024-03-10',
                beforeImage: './img/logo.svg',
                afterImage: './img/logo.svg',
                featured: false
            },
            {
                id: 3,
                title: 'Pulizia Industriale Capannone',
                description: 'Pulizia industriale di capannone produttivo con macchinari specializzati.',
                category: 'industriali',
                location: 'Cascina',
                date: '2024-03-08',
                beforeImage: './img/logo.svg',
                afterImage: './img/logo.svg',
                featured: true
            },
            {
                id: 4,
                title: 'Pulizia Vetrate Palazzo Uffici',
                description: 'Pulizia professionale di vetrate esterne ed interne di palazzo uffici.',
                category: 'vetri',
                location: 'Pisa',
                date: '2024-03-05',
                beforeImage: './img/logo.svg',
                afterImage: './img/logo.svg',
                featured: false
            },
            {
                id: 5,
                title: 'Pulizia Post-Ristrutturazione',
                description: 'Pulizia specializzata post-ristrutturazione con rimozione polveri e detriti.',
                category: 'civili',
                location: 'Vicopisano',
                date: '2024-03-01',
                beforeImage: './img/logo.svg',
                afterImage: './img/logo.svg',
                featured: false
            },
            {
                id: 6,
                title: 'Sanificazione Scuola Elementare',
                description: 'Sanificazione completa di scuola elementare con prodotti certificati per bambini.',
                category: 'sanificazione',
                location: 'Bientina',
                date: '2024-02-28',
                beforeImage: './img/logo.svg',
                afterImage: './img/logo.svg',
                featured: true
            }
        ];
    }

    setupEventListeners() {
        // Setup filter buttons
        this.filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                const category = filter.dataset.filter;
                this.filterGallery(category);
                
                // Track filter usage
                this.trackEvent('gallery_filter_used', {
                    category: category,
                    items_shown: this.getVisibleItems().length
                });
            });

            // Keyboard support
            filter.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    filter.click();
                }
            });
        });

        // Setup window resize handler for responsive adjustments
        window.addEventListener('resize', this.debounce(() => {
            this.adjustSliderHeights();
        }, 250));
    }

    renderGallery() {
        this.showLoading(true);
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            this.galleryGrid.innerHTML = '';
            
            this.galleryData.forEach(item => {
                const galleryItem = this.createGalleryItem(item);
                this.galleryGrid.appendChild(galleryItem);
            });
            
            this.setupBeforeAfterSliders();
            this.showLoading(false);
            this.updateFilterCounts();
        }, 500);
    }

    createGalleryItem(data) {
        const item = document.createElement('div');
        item.className = 'gallery__item';
        item.dataset.category = data.category;
        item.dataset.id = data.id;
        
        const formattedDate = this.formatDate(data.date);
        
        item.innerHTML = `
            <div class="before-after-container">
                <div class="before-after-slider" 
                     tabindex="0" 
                     role="slider" 
                     aria-label="Confronta prima e dopo"
                     aria-valuemin="0" 
                     aria-valuemax="100" 
                     aria-valuenow="50">
                    <div class="before-image">
                        <img src="${data.beforeImage}" 
                             alt="Prima - ${data.title}" 
                             loading="lazy">
                        <div class="image-label">Prima</div>
                    </div>
                    <div class="after-image">
                        <img src="${data.afterImage}" 
                             alt="Dopo - ${data.title}" 
                             loading="lazy">
                        <div class="image-label">Dopo</div>
                    </div>
                    <div class="slider-handle">
                        <div class="slider-button"></div>
                    </div>
                </div>
            </div>
            <div class="gallery__item-info">
                <h3>${data.title}</h3>
                <p>${data.description}</p>
                <div class="gallery__item-meta">
                    <span class="gallery__category">${this.getCategoryDisplayName(data.category)}</span>
                    <span class="gallery__location">${data.location}</span>
                    <span class="gallery__date">${formattedDate}</span>
                </div>
            </div>
        `;
        
        return item;
    }

    setupBeforeAfterSliders() {
        const sliders = document.querySelectorAll('.before-after-slider');
        
        sliders.forEach(slider => {
            this.setupBeforeAfterSlider(slider);
        });
    }

    setupBeforeAfterSlider(slider) {
        const afterImage = slider.querySelector('.after-image');
        const handle = slider.querySelector('.slider-handle');
        let isDragging = false;
        let animationFrame = null;

        const updateSlider = (x) => {
            const rect = slider.getBoundingClientRect();
            const position = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
            const percentage = position * 100;
            
            // Use clip-path to create the masking effect
            // The after image is clipped from left to the slider position
            afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            
            // Position the handle at the correct location
            handle.style.left = `${percentage}%`;
            handle.style.transform = 'translateX(-50%)';
            
            // Update ARIA value
            slider.setAttribute('aria-valuenow', Math.round(percentage));
        };

        // Initialize slider position
        const initializeSlider = () => {
            // Start with 50% visibility of after image
            afterImage.style.clipPath = 'inset(0 50% 0 0)';
            handle.style.left = '50%';
            handle.style.transform = 'translateX(-50%)';
            slider.setAttribute('aria-valuenow', '50');
        };

        // Mouse events
        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateSlider(e.clientX);
            slider.style.cursor = 'ew-resize';
            slider.classList.add('dragging');
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateSlider(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                slider.style.cursor = 'ew-resize';
                slider.classList.remove('dragging');
                
                // Track interaction
                this.trackEvent('before_after_interaction', {
                    action: 'drag',
                    final_position: Math.round(parseFloat(slider.getAttribute('aria-valuenow')))
                });
            }
        });

        // Touch events for mobile
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            updateSlider(touch.clientX);
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                updateSlider(touch.clientX);
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                slider.classList.remove('dragging');
                
                this.trackEvent('before_after_interaction', {
                    action: 'touch',
                    final_position: Math.round(parseFloat(slider.getAttribute('aria-valuenow')))
                });
            }
        });

        // Click to position
        slider.addEventListener('click', (e) => {
            if (!isDragging) {
                updateSlider(e.clientX);
                
                this.trackEvent('before_after_interaction', {
                    action: 'click',
                    position: Math.round(((e.clientX - slider.getBoundingClientRect().left) / slider.getBoundingClientRect().width) * 100)
                });
            }
        });

        // Keyboard accessibility
        slider.addEventListener('keydown', (e) => {
            const currentValue = parseInt(slider.getAttribute('aria-valuenow')) || 50;
            let newLeft = currentValue;

            switch(e.key) {
                case 'ArrowLeft':
                    newValue = Math.max(0, currentValue - 5);
                    break;
                case 'ArrowRight':
                    newValue = Math.min(100, currentValue + 5);
                    break;
                case 'Home':
                    newValue = 0;
                    break;
                case 'End':
                    newValue = 100;
                    break;
                default:
                    return;
            }

            e.preventDefault();
            
            // Apply the new clipping
            afterImage.style.clipPath = `inset(0 ${100 - newValue}% 0 0)`;
            handle.style.left = `${newValue}%`;
            handle.style.transform = 'translateX(-50%)';
            slider.setAttribute('aria-valuenow', Math.round(newValue));
        });

        // Initialize slider on load
        if (slider.complete || slider.readyState === 'complete') {
            initializeSlider();
        } else {
            slider.addEventListener('load', initializeSlider);
        }
        
        // Initialize immediately for better UX
        setTimeout(initializeSlider, 100);

        // Make slider focusable for keyboard navigation
        slider.setAttribute('tabindex', '0');
        slider.setAttribute('role', 'slider');
        slider.setAttribute('aria-valuemin', '0');
        slider.setAttribute('aria-valuemax', '100');
        slider.setAttribute('aria-valuenow', '50');

        // Handle window resize
        window.addEventListener('resize', () => {
            const currentValue = parseInt(slider.getAttribute('aria-valuenow')) || 50;
            
            // Reapply clipping after resize
            afterImage.style.clipPath = `inset(0 ${100 - currentValue}% 0 0)`;
            handle.style.left = `${currentValue}%`;
            handle.style.transform = 'translateX(-50%)';
        });
    }

    filterGallery(category) {
        if (this.currentFilter === category) return;
        
        this.currentFilter = category;
        this.updateActiveFilter(category);
        
        const items = document.querySelectorAll('.gallery__item');
        
        // Add filtering class for animation
        items.forEach(item => {
            item.classList.add('filtering');
        });

        setTimeout(() => {
            let visibleCount = 0;
            
            items.forEach(item => {
                const itemCategory = item.dataset.category;
                const shouldShow = category === 'all' || itemCategory === category;
                
                item.classList.remove('filtering');
                item.classList.toggle('hidden', !shouldShow);
                
                if (shouldShow) visibleCount++;
            });

            this.toggleEmptyState(visibleCount === 0);
        }, 150);
    }

    updateActiveFilter(category) {
        this.filters.forEach(filter => {
            filter.classList.remove('active');
            if (filter.dataset.filter === category) {
                filter.classList.add('active');
            }
        });
    }

    updateFilterCounts() {
        const categoryCounts = this.getCategoryCounts();
        
        this.filters.forEach(filter => {
            const category = filter.dataset.filter;
            const count = category === 'all' ? this.galleryData.length : (categoryCounts[category] || 0);
            
            // Update button text to include count
            const icon = filter.querySelector('i');
            const text = filter.textContent.trim();
            const baseText = text.replace(/\(\d+\)/, '').trim();
            
            filter.innerHTML = `${icon.outerHTML} ${baseText} (${count})`;
        });
    }

    getCategoryCounts() {
        const counts = {};
        this.galleryData.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return counts;
    }

    toggleEmptyState(show) {
        this.emptyState.classList.toggle('show', show);
    }

    showLoading(show) {
        this.loadingState.classList.toggle('show', show);
        this.galleryGrid.style.display = show ? 'none' : 'grid';
    }

    getVisibleItems() {
        return Array.from(document.querySelectorAll('.gallery__item:not(.hidden)'));
    }

    adjustSliderHeights() {
        const sliders = document.querySelectorAll('.before-after-slider');
        sliders.forEach(slider => {
            // Responsive height adjustment if needed
            if (window.innerWidth <= 767) {
                slider.style.height = '250px';
            } else {
                slider.style.height = '300px';
            }
        });
    }

    getCategoryDisplayName(category) {
        const categoryMap = {
            'civili': 'Pulizie Civili',
            'industriali': 'Pulizie Industriali',
            'sanificazione': 'Sanificazioni',
            'vetri': 'Pulizie Vetri'
        };
        return categoryMap[category] || category;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    trackEvent(eventName, parameters = {}) {
        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }

        // Track with cookie consent system if available
        if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
            window.cookieConsent.trackEvent(eventName, parameters);
        }

        // Console log for development
        console.log('Gallery Event:', eventName, parameters);
    }

    // Public methods for external use
    addGalleryItem(itemData) {
        this.galleryData.push({
            id: Date.now(),
            ...itemData
        });
        this.renderGallery();
    }

    removeGalleryItem(itemId) {
        this.galleryData = this.galleryData.filter(item => item.id !== itemId);
        this.renderGallery();
    }

    updateGalleryItem(itemId, newData) {
        const index = this.galleryData.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.galleryData[index] = { ...this.galleryData[index], ...newData };
            this.renderGallery();
        }
    }

    clearFilter() {
        this.filterGallery('all');
    }
}

// Global function for clear filter button
function clearGalleryFilter() {
    if (window.galleryManager) {
        window.galleryManager.clearFilter();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.galleryManager = new GalleryManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryManager;
}