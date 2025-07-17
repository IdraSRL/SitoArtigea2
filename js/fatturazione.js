// Fatturazione Page JavaScript - Artigea s.r.l.

class FatturazioneManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupAnimations();
        this.setupInteractions();
        this.setupAccessibility();
        this.trackPageView();
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all sections and cards
        document.querySelectorAll('section, .info-card, .contact-card, .service-card, .badge-item').forEach(el => {
            el.classList.add('animate-fade-in');
            observer.observe(el);
        });

        // Add CSS for animations
        this.addAnimationStyles();
    }

    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .animate-fade-in {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s ease-out;
            }
            
            .animate-fade-in.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .info-card.animate-fade-in {
                transition-delay: 0.1s;
            }
            
            .contact-card.animate-fade-in {
                transition-delay: 0.2s;
            }
            
            .service-card.animate-fade-in {
                transition-delay: 0.15s;
            }
            
            .badge-item.animate-fade-in {
                transition-delay: 0.1s;
            }
        `;
        document.head.appendChild(style);
    }

    setupInteractions() {
        // Add hover effects for cards
        this.setupCardHovers();
        
        // Setup click tracking for links
        this.setupLinkTracking();
        
        // Setup copy functionality for contact info
        this.setupCopyFunctionality();
    }

    setupCardHovers() {
        const cards = document.querySelectorAll('.info-card, .contact-card, .service-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupLinkTracking() {
        // Track email clicks
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('email_click', {
                    email: link.href.replace('mailto:', ''),
                    source: 'fatturazione_page'
                });
            });
        });

        // Track phone clicks
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('phone_click', {
                    phone: link.href.replace('tel:', ''),
                    source: 'fatturazione_page'
                });
            });
        });

        // Track external links
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('external_link_click', {
                    url: link.href,
                    text: link.textContent.trim(),
                    source: 'fatturazione_page'
                });
            });
        });
    }

    setupCopyFunctionality() {
        // Add copy buttons to important info
        const copyableElements = [
            { selector: 'a[href="mailto:info@artigea.it"]', type: 'email' },
            { selector: 'a[href="tel:+393462319824"]', type: 'phone' },
            { selector: 'a[href="mailto:info@pec.artigea.it"]', type: 'pec' }
        ];

        copyableElements.forEach(({ selector, type }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.addCopyButton(element, type);
            });
        });
    }

    addCopyButton(element, type) {
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.className = 'copy-btn';
        copyBtn.title = `Copia ${type}`;
        copyBtn.setAttribute('aria-label', `Copia ${type}`);
        
        // Add styles for copy button
        copyBtn.style.cssText = `
            margin-left: 8px;
            padding: 4px 8px;
            background: var(--color-primary-subtle);
            border: 1px solid var(--color-primary);
            border-radius: 4px;
            color: var(--color-primary);
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
        `;

        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = 'var(--color-primary)';
            copyBtn.style.color = 'white';
        });

        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.background = 'var(--color-primary-subtle)';
            copyBtn.style.color = 'var(--color-primary)';
        });

        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const textToCopy = type === 'email' || type === 'pec' ? 
                element.href.replace('mailto:', '') : 
                element.href.replace('tel:', '');
            
            this.copyToClipboard(textToCopy, type);
        });

        element.parentNode.insertBefore(copyBtn, element.nextSibling);
    }

    async copyToClipboard(text, type) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess(type);
            this.trackEvent('copy_action', {
                type: type,
                text: text,
                source: 'fatturazione_page'
            });
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showCopyError();
        }
    }

    showCopySuccess(type) {
        const message = `${type.toUpperCase()} copiato negli appunti!`;
        this.showNotification(message, 'success');
    }

    showCopyError() {
        this.showNotification('Errore durante la copia', 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--color-success)' : 'var(--color-error)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    setupAccessibility() {
        // Add keyboard navigation for cards
        const interactiveCards = document.querySelectorAll('.contact-card, .service-card');
        
        interactiveCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = card.querySelector('a');
                    if (link) {
                        link.click();
                    }
                }
            });
        });

        // Improve focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .contact-card:focus,
            .service-card:focus,
            .info-card:focus {
                outline: 2px solid var(--color-primary);
                outline-offset: 2px;
            }
            
            .copy-btn:focus {
                outline: 2px solid var(--color-primary);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_type: 'fatturazione'
        });
    }

    trackEvent(eventName, parameters = {}) {
        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }

        // Track with custom analytics if available
        if (window.cookieConsent && window.cookieConsent.hasConsent('analytics')) {
            window.cookieConsent.trackEvent(eventName, parameters);
        }

        // Console log for development
        console.log('Event tracked:', eventName, parameters);
    }

    // Utility method to format phone numbers
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('39')) {
            return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
        }
        return phone;
    }

    // Method to validate email addresses
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FatturazioneManager();
});

// Add smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Handle print functionality
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FatturazioneManager;
}