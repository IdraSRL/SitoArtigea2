// Main JavaScript functionality for Artigea website - FIXED VERSION
class ArtigeaWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupFormValidation();
        this.setupMobileMenu();
        this.setupScrollIndicator();
        this.setupBackToTop();
        this.setupLazyLoading();
        this.setupFAQ();
        this.setupServiceTracking();
        this.setupPerformanceMonitoring();
        // this.setupBeforeAfterGallery(); // Uncomment when gallery is enabled
    }

    setupServiceTracking() {
        document.querySelectorAll('.service-card').forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                    const serviceName = card.querySelector('.service-card__title')?.textContent || 'Unknown Service';
                    window.cookieConsent.trackEvent('service_card_hover', {
                        service_name: serviceName,
                        card_position: index + 1
                    });
                }
            });
        });

        document.querySelectorAll('.area-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                    window.cookieConsent.trackEvent('service_area_click', {
                        area_name: item.textContent.trim()
                    });
                }
            });
        });

        document.querySelectorAll('.footer__social a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                    const platform = link.href.includes('instagram') ? 'Instagram' :
                                   link.href.includes('facebook') ? 'Facebook' :
                                   link.href.includes('linkedin') ? 'LinkedIn' : 'Unknown';
                    window.cookieConsent.trackEvent('social_media_click', {
                        platform: platform,
                        source: 'footer',
                        destination_url: link.href
                    });
                }
            });
        });
    }

    setupPerformanceMonitoring() {
        if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
            // Largest Contentful Paint
            if ('PerformanceObserver' in window) {
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            window.cookieConsent.trackEvent('web_vital_lcp', {
                                value: Math.round(entry.startTime),
                                rating: entry.startTime < 2500 ? 'good' : 
                                       entry.startTime < 4000 ? 'needs_improvement' : 'poor'
                            });
                        }
                    }
                }).observe({entryTypes: ['largest-contentful-paint']});

                // First Input Delay
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (entry.entryType === 'first-input') {
                            window.cookieConsent.trackEvent('web_vital_fid', {
                                value: Math.round(entry.processingStart - entry.startTime),
                                rating: (entry.processingStart - entry.startTime) < 100 ? 'good' :
                                       (entry.processingStart - entry.startTime) < 300 ? 'needs_improvement' : 'poor'
                            });
                        }
                    }
                }).observe({entryTypes: ['first-input']});
            }
        }
    }

    setupEventListeners() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                        window.cookieConsent.trackEvent('smooth_scroll_navigation', {
                            target_section: anchor.getAttribute('href').substring(1),
                            source: 'navigation_menu'
                        });
                    }
                }
            });
        });

        // Header scroll effect
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollTop = scrollTop;
        });
    }

    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });

        // Add staggered animations
        document.querySelectorAll('.service-card').forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.transitionDelay = `${index * 150}ms`;
        });

        document.querySelectorAll('.blog-card').forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.transitionDelay = `${index * 100}ms`;
        });

        document.querySelectorAll('.value').forEach((value, index) => {
            value.classList.add('fade-in');
            value.style.transitionDelay = `${index * 120}ms`;
        });
    }

    setupFormValidation() {
        const contactForm = document.getElementById('contact-form');
        const careersForm = document.getElementById('careers-form');

        if (contactForm) {
            this.setupFormHandling(contactForm);
        }
        if (careersForm) {
            this.setupFormHandling(careersForm);
        }
    }

    setupFormHandling(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormspreeSubmit(form);
        });

        // Analytics tracking
        if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
            const formType = form.id === 'careers-form' ? 'careers' : 'contact';
            let formStarted = false;

            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    if (!formStarted) {
                        formStarted = true;
                        window.cookieConsent.trackEvent('form_start', {
                            form_name: formType
                        });
                    }
                });
            });

            window.addEventListener('beforeunload', () => {
                if (formStarted && !form.dataset.submitted) {
                    window.cookieConsent.trackEvent('form_abandon', {
                        form_name: formType
                    });
                }
            });
        }
    }

    validateField(field) {
        // FIXED: Check if form-group exists, if not create a wrapper structure
        let formGroup = field.closest('.form-group');
        
        if (!formGroup) {
            // If no .form-group found, create one or use the field's parent
            formGroup = field.parentElement;
            if (!formGroup) {
                console.warn('Cannot find form group for field:', field);
                return true; // Return true to avoid breaking the form
            }
        }

        let errorMessage = formGroup.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = this.createErrorMessage(formGroup);
        }

        let isValid = true;
        let message = '';

        // Clear previous error state
        formGroup.classList.remove('error');
        errorMessage.style.display = 'none';

        // Validation rules
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'Questo campo è obbligatorio';
        } else if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            isValid = false;
            message = 'Inserisci un indirizzo email valido';
        } else if (field.type === 'tel' && field.value && !this.isValidPhone(field.value)) {
            isValid = false;
            message = 'Inserisci un numero di telefono valido';
        }

        // Special validation for privacy checkbox
        if (field.type === 'checkbox' && field.name === 'privacy' && !field.checked) {
            isValid = false;
            message = 'È necessario accettare la Privacy Policy';
        }

        if (!isValid) {
            formGroup.classList.add('error');
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }

        return isValid;
    }

    clearFieldError(field) {
        let formGroup = field.closest('.form-group');
        
        if (!formGroup) {
            formGroup = field.parentElement;
            if (!formGroup) return;
        }

        formGroup.classList.remove('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    createErrorMessage(formGroup) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.color = '#ef4444';
        errorMessage.style.fontSize = '0.875rem';
        errorMessage.style.marginTop = '0.25rem';
        errorMessage.style.display = 'none';
        formGroup.appendChild(errorMessage);
        return errorMessage;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    async handleFormspreeSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const inputs = form.querySelectorAll('input, textarea, select');
        
        let isFormValid = true;

        // Validate all fields
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage('Correggi gli errori nel modulo', 'error');
            return;
        }

        // Show loading state
        submitBtn.classList.add('btn--loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                this.showSuccessMessage(form);
                form.reset();
                form.dataset.submitted = 'true';

                if (window.cookieConsent && window.cookieConsent.hasConsent()) {
                    const formType = form.id === 'careers-form' ? 'careers' : 'contact';
                    window.cookieConsent.trackEvent('form_submit', {
                        form_name: formType,
                        form_type: 'formspree'
                    });
                }
            } else {
                const data = await response.json();
                if (data.errors) {
                    this.showMessage('Errore durante l\'invio: ' + data.errors.map(e => e.message).join(', '), 'error');
                } else {
                    this.showMessage('Errore durante l\'invio. Riprova più tardi.', 'error');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Errore di connessione. Verifica la tua connessione internet e riprova.', 'error');
        } finally {
            submitBtn.classList.remove('btn--loading');
            submitBtn.disabled = false;
        }
    }

    showSuccessMessage(form) {
        let successMessage = form.querySelector('.success-message');
        if (!successMessage) {
            successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            form.insertBefore(successMessage, form.firstChild);
        }

        const isCareerForm = form.id === 'careers-form';
        const message = isCareerForm ? 
            '<strong>Candidatura inviata con successo!</strong><br>Ti contatteremo entro 48 ore per valutare la tua candidatura.' :
            '<strong>Messaggio inviato con successo!</strong><br>Ti contatteremo entro 24 ore per fornirti il preventivo richiesto.';

        successMessage.innerHTML = message;
        successMessage.classList.add('show');
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 8000);
    }

    showMessage(message, type = 'info') {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `notification notification--${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isExpanded);

            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking on links
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    setupScrollIndicator() {
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        document.body.appendChild(scrollIndicator);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = (scrollTop / documentHeight) * 100;
            
            scrollIndicator.style.transform = `scaleX(${Math.min(scrollProgress / 100, 1)})`;
        });
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current item
                    item.classList.toggle('active', !isActive);

                    if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                        window.cookieConsent.trackEvent('faq_interaction', {
                            question: question.textContent.trim(),
                            action: isActive ? 'close' : 'open'
                        });
                    }
                });
            }
        });
    }

    setupBackToTop() {
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '↑';
        backToTop.setAttribute('aria-label', 'Torna in cima');
        document.body.appendChild(backToTop);

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                window.cookieConsent.trackEvent('back_to_top_click', {
                    scroll_position: window.pageYOffset
                });
            }
        });
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img:not([loading])');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.setAttribute('loading', 'lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Before/After Gallery functionality - COMMENTED OUT
    /*
    setupBeforeAfterGallery() {
        const filters = document.querySelectorAll('.gallery__filter');
        const galleryItems = document.querySelectorAll('.gallery__item');
        const sliders = document.querySelectorAll('.before-after-slider');

        // Setup filter functionality
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const category = filter.dataset.filter;
                this.filterGalleryItems(category, filters, galleryItems);
                
                if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                    window.cookieConsent.trackEvent('gallery_filter_used', {
                        category: category,
                        items_shown: this.getVisibleGalleryItems(galleryItems).length
                    });
                }
            });
        });

        // Setup before/after sliders
        sliders.forEach(slider => {
            this.setupBeforeAfterSlider(slider);
        });
    }

    filterGalleryItems(category, filters, items) {
        // Update active filter
        filters.forEach(filter => {
            filter.classList.remove('active');
            if (filter.dataset.filter === category) {
                filter.classList.add('active');
            }
        });

        // Add filtering class for animation
        items.forEach(item => {
            item.classList.add('filtering');
        });

        // Filter items after a short delay for smooth animation
        setTimeout(() => {
            items.forEach(item => {
                const itemCategory = item.dataset.category;
                const shouldShow = category === 'all' || itemCategory === category;
                
                item.classList.remove('filtering');
                item.classList.toggle('hidden', !shouldShow);
            });
        }, 150);
    }

    setupBeforeAfterSlider(slider) {
        const afterImage = slider.querySelector('.after-image');
        const handle = slider.querySelector('.slider-handle');
        let isDragging = false;

        const updateSlider = (x) => {
            const rect = slider.getBoundingClientRect();
            const position = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
            const percentage = position * 100;
            
            afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            handle.style.left = `${percentage}%`;
        };

        // Mouse events
        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateSlider(e.clientX);
            slider.style.cursor = 'ew-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateSlider(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            slider.style.cursor = 'ew-resize';
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
            isDragging = false;
        });

        // Click to position
        slider.addEventListener('click', (e) => {
            if (!isDragging) {
                updateSlider(e.clientX);
                
                if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                    window.cookieConsent.trackEvent('before_after_interaction', {
                        action: 'click',
                        position: Math.round(((e.clientX - slider.getBoundingClientRect().left) / slider.getBoundingClientRect().width) * 100)
                    });
                }
            }
        });

        // Keyboard accessibility
        slider.addEventListener('keydown', (e) => {
            const currentLeft = parseFloat(handle.style.left) || 50;
            let newLeft = currentLeft;

            switch(e.key) {
                case 'ArrowLeft':
                    newLeft = Math.max(0, currentLeft - 5);
                    break;
                case 'ArrowRight':
                    newLeft = Math.min(100, currentLeft + 5);
                    break;
                case 'Home':
                    newLeft = 0;
                    break;
                case 'End':
                    newLeft = 100;
                    break;
                default:
                    return;
            }

            e.preventDefault();
            afterImage.style.clipPath = `inset(0 ${100 - newLeft}% 0 0)`;
            handle.style.left = `${newLeft}%`;
        });

        // Make slider focusable for keyboard navigation
        slider.setAttribute('tabindex', '0');
        slider.setAttribute('role', 'slider');
        slider.setAttribute('aria-label', 'Confronta prima e dopo');
        slider.setAttribute('aria-valuemin', '0');
        slider.setAttribute('aria-valuemax', '100');
        slider.setAttribute('aria-valuenow', '50');
    }

    getVisibleGalleryItems(items) {
        return Array.from(items).filter(item => !item.classList.contains('hidden'));
    }
    */
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArtigeaWebsite();
});

// Phone number formatting utility
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('39')) {
        value = '+' + value;
    } else if (value.startsWith('3') && value.length >= 10) {
        value = '+39 ' + value;
    }
    
    if (value.startsWith('+39')) {
        const number = value.slice(3);
        if (number.length === 10) {
            value = '+39 ' + number.slice(0, 3) + ' ' + number.slice(3, 6) + ' ' + number.slice(6);
        }
    }
    
    input.value = value;
}

// Setup phone formatting on page load
document.addEventListener('DOMContentLoaded', () => {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => formatPhoneNumber(input));
    });
});

// Utility functions
const utils = {
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
    },

    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },

    animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ArtigeaWebsite, utils };
}