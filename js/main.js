// Main JavaScript functionality for Artigea website

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
    }

    setupServiceTracking() {
        // Track service card interactions
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

        // Track area item clicks
        document.querySelectorAll('.area-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                    window.cookieConsent.trackEvent('service_area_click', {
                        area_name: item.textContent.trim()
                    });
                }
            });
        });
    }

    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals if analytics consent given
        if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
            // Largest Contentful Paint
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        window.cookieConsent.trackEvent('web_vital_lcp', {
                            value: Math.round(entry.startTime),
                            rating: entry.startTime < 2500 ? 'good' : entry.startTime < 4000 ? 'needs_improvement' : 'poor'
                        });
                    }
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (entry.entryType === 'first-input') {
                        window.cookieConsent.trackEvent('web_vital_fid', {
                            value: Math.round(entry.processingStart - entry.startTime),
                            rating: entry.processingStart - entry.startTime < 100 ? 'good' : 
                                   entry.processingStart - entry.startTime < 300 ? 'needs_improvement' : 'poor'
                        });
                    }
                }
            }).observe({ entryTypes: ['first-input'] });
        }
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links
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
                    
                    // Track navigation usage
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
        // Intersection Observer for animations
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

        // Observe elements for animation
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });

        // Add animation classes to elements
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
        // Setup validation for both contact and careers forms
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
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Form submission with Formspree
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormspreeSubmit(form);
        });
        
        // Track form interactions
        if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
            const formType = form.id === 'careers-form' ? 'careers' : 'contact';
            
            // Track form start (first field interaction)
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
            
            // Track form abandonment
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
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message') || this.createErrorMessage(formGroup);
        
        let isValid = true;
        let message = '';

        // Remove existing error state
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

        // Privacy checkbox validation
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
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    createErrorMessage(formGroup) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
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
        
        // Validate all fields
        const inputs = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;
        
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
            // Submit to Formspree
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
                
                // Track form submission if analytics available
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
            // Reset button state
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
        const message = isCareerForm 
            ? '<strong>Candidatura inviata con successo!</strong><br>Ti contatteremo entro 48 ore per valutare la tua candidatura.'
            : '<strong>Messaggio inviato con successo!</strong><br>Ti contatteremo entro 24 ore per fornirti il preventivo richiesto.';
        
        successMessage.innerHTML = message;
        successMessage.classList.add('show');
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide after 8 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 8000);
    }

    showMessage(message, type = 'info') {
        // Create or update notification
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
            
            // Prevent body scroll when menu is open
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
        // Create scroll indicator
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
        // Setup FAQ accordion functionality
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
                    
                    // Track FAQ interaction if analytics enabled
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
        // Create back to top button
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '↑';
        backToTop.setAttribute('aria-label', 'Torna in cima');
        document.body.appendChild(backToTop);

        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // Scroll to top functionality
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Track back to top usage
            if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
                window.cookieConsent.trackEvent('back_to_top_click', {
                    scroll_position: window.pageYOffset
                });
            }
        });
    }

    setupLazyLoading() {
        // Add lazy loading for images without loading="lazy" attribute
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
}

// Initialize the website functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArtigeaWebsite();
});

// Phone number formatting
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('39')) {
        value = '+' + value;
    } else if (value.startsWith('3') && value.length >= 10) {
        value = '+39 ' + value;
    }
    
    // Format Italian mobile numbers
    if (value.startsWith('+39')) {
        const number = value.slice(3);
        if (number.length === 10) {
            value = '+39 ' + number.slice(0, 3) + ' ' + number.slice(3, 6) + ' ' + number.slice(6);
        }
    }
    
    input.value = value;
}

// Add phone formatting to phone inputs
document.addEventListener('DOMContentLoaded', () => {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => formatPhoneNumber(input));
    });
});

// Utility functions
const utils = {
    // Debounce function for performance
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

    // Throttle function for scroll events
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

    // Animate number counters
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