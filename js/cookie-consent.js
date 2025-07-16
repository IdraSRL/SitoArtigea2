// Enhanced Cookie Consent Management for Artigea Website - GDPR Compliant

class CookieConsent {
    constructor() {
        this.cookieName = 'artigea-cookie-consent';
        this.cookieValue = 'accepted';
        this.necessaryValue = 'necessary-only';
        this.expiryDays = 365;
        this.consentTypes = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
        
        this.init();
    }

    init() {
        // Check existing consent
        const existingConsent = this.getConsentStatus();
        
        if (!existingConsent) {
            this.showBanner();
        } else {
            this.applyConsent(existingConsent);
        }
        
        this.setupEventListeners();
    }

    getConsentStatus() {
        const consent = this.getCookie(this.cookieName);
        if (!consent) return null;
        
        try {
            return JSON.parse(consent);
        } catch (e) {
            // Handle legacy cookie format
            if (consent === this.cookieValue) {
                return {
                    necessary: true,
                    analytics: true,
                    marketing: false,
                    preferences: false,
                    timestamp: Date.now()
                };
            }
            return null;
        }
    }

    showBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            // Small delay to ensure page is loaded
            setTimeout(() => {
                banner.classList.add('show');
                banner.setAttribute('aria-hidden', 'false');
            }, 1000);
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('show');
            banner.setAttribute('aria-hidden', 'true');
            // Remove from DOM after animation
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        }
    }

    acceptAllCookies() {
        const consent = {
            necessary: true,
            analytics: true,
            marketing: false, // Still false as we don't have marketing cookies
            preferences: true,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
        
        // Dispatch custom event
        this.dispatchConsentEvent('all-accepted', consent);
    }

    acceptNecessaryOnly() {
        const consent = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
        
        // Dispatch custom event
        this.dispatchConsentEvent('necessary-only', consent);
    }

    saveConsent(consent) {
        const consentString = JSON.stringify(consent);
        this.setCookie(this.cookieName, consentString, this.expiryDays);
        
        // Also save timestamp for audit purposes
        this.setCookie(this.cookieName + '_timestamp', Date.now().toString(), this.expiryDays);
    }

    applyConsent(consent) {
        this.consentTypes = consent;
        
        // Apply Google Analytics consent
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': consent.analytics ? 'granted' : 'denied',
                'ad_storage': consent.marketing ? 'granted' : 'denied',
                'functionality_storage': consent.preferences ? 'granted' : 'denied',
                'personalization_storage': consent.preferences ? 'granted' : 'denied',
                'security_storage': 'granted' // Always granted for security
            });
        }

        // Enable/disable other tracking based on consent
        if (consent.analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }

        if (consent.preferences) {
            this.enablePreferences();
        }
    }

    enableAnalytics() {
        // Load Google Analytics if not already loaded
        if (!window.gtag && this.consentTypes.analytics) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            document.head.appendChild(script);
        }

        // Enable custom analytics
        this.enableCustomAnalytics();
    }

    disableAnalytics() {
        // Disable Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }

        // Clear analytics cookies
        this.clearAnalyticsCookies();
    }

    enablePreferences() {
        // Enable preference-based features
        this.trackUserPreferences();
    }

    clearAnalyticsCookies() {
        // Clear Google Analytics cookies
        const gaCookies = ['_ga', '_ga_', '_gid', '_gat'];
        gaCookies.forEach(cookieName => {
            this.deleteCookie(cookieName);
            this.deleteCookie(cookieName, '.' + window.location.hostname);
        });
    }

    enableCustomAnalytics() {
        // Track page view
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            consent_version: '1.0'
        });
    }

    trackEvent(eventName, parameters = {}) {
        // Only track if user has consented to analytics
        if (!this.consentTypes.analytics) {
            return;
        }

        // Add consent metadata
        parameters.consent_analytics = this.consentTypes.analytics;
        parameters.consent_timestamp = this.consentTypes.timestamp;

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }

        // Custom tracking logic
        console.log('Event tracked:', eventName, parameters);
    }

    trackUserPreferences() {
        // Track user preferences if consent given
        if (this.consentTypes.preferences) {
            const preferences = {
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                screen_resolution: `${screen.width}x${screen.height}`,
                color_scheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            };
            
            this.trackEvent('user_preferences', preferences);
        }
    }

    setupEventListeners() {
        // Accept all cookies button
        const acceptAllBtn = document.getElementById('accept-all-cookies');
        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', () => {
                this.acceptAllCookies();
            });
        }

        // Accept necessary only button
        const acceptNecessaryBtn = document.getElementById('accept-necessary-cookies');
        if (acceptNecessaryBtn) {
            acceptNecessaryBtn.addEventListener('click', () => {
                this.acceptNecessaryOnly();
            });
        }

        // Legacy accept cookies button (for backward compatibility)
        const acceptBtn = document.getElementById('accept-cookies');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.acceptAllCookies();
            });
        }

        // Setup tracking if consent already given
        if (this.consentTypes.analytics) {
            this.setupFormTracking();
            this.setupScrollTracking();
            this.setupClickTracking();
        }

        // Listen for consent events
        window.addEventListener('cookieConsentChanged', (event) => {
            if (event.detail.analytics) {
                this.setupFormTracking();
                this.setupScrollTracking();
                this.setupClickTracking();
            }
        });
    }

    setupFormTracking() {
        if (!this.consentTypes.analytics) return;

        // Track contact form submissions
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', () => {
                this.trackEvent('form_submit', {
                    form_name: 'contact_form',
                    form_type: 'lead_generation'
                });
            });
        }

        // Track careers form submissions
        const careersForm = document.getElementById('careers-form');
        if (careersForm) {
            careersForm.addEventListener('submit', () => {
                this.trackEvent('form_submit', {
                    form_name: 'careers_form',
                    form_type: 'job_application'
                });
            });
        }

        // Track phone number clicks
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('phone_click', {
                    phone_number: link.href.replace('tel:', ''),
                    source: 'website'
                });
            });
        });

        // Track email clicks
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('email_click', {
                    email: link.href.replace('mailto:', ''),
                    source: 'website'
                });
            });
        });
    }

    setupScrollTracking() {
        if (!this.consentTypes.analytics) return;

        let scrollDepth = 0;
        const thresholds = [25, 50, 75, 90];
        const trackedThresholds = new Set();

        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentScrollDepth = Math.round((scrollTop / documentHeight) * 100);

            if (currentScrollDepth > scrollDepth) {
                scrollDepth = currentScrollDepth;

                thresholds.forEach(threshold => {
                    if (scrollDepth >= threshold && !trackedThresholds.has(threshold)) {
                        trackedThresholds.add(threshold);
                        this.trackEvent('scroll_depth', {
                            depth_percentage: threshold,
                            page_title: document.title
                        });
                    }
                });
            }
        };

        // Throttle scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(trackScrollDepth, 100);
        });
    }

    setupClickTracking() {
        if (!this.consentTypes.analytics) return;

        // Track service card clicks
        document.querySelectorAll('.service-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.service-card__title')?.textContent || `Service ${index + 1}`;
                this.trackEvent('service_card_click', {
                    service_name: title,
                    card_position: index + 1
                });
            });
        });

        // Track blog card clicks
        document.querySelectorAll('.blog-card a').forEach(link => {
            link.addEventListener('click', () => {
                const title = link.textContent || 'Blog Article';
                this.trackEvent('blog_click', {
                    article_title: title,
                    article_url: link.href
                });
            });
        });

        // Track navigation clicks
        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('navigation_click', {
                    link_text: link.textContent.trim(),
                    link_url: link.href,
                    navigation_type: 'main_menu'
                });
            });
        });

        // Track CTA button clicks
        document.querySelectorAll('.btn--primary').forEach(button => {
            button.addEventListener('click', () => {
                this.trackEvent('cta_click', {
                    button_text: button.textContent.trim(),
                    button_location: this.getElementLocation(button)
                });
            });
        });
    }

    getElementLocation(element) {
        // Determine the section where the element is located
        const sections = ['hero', 'about', 'services', 'contact', 'careers'];
        for (const section of sections) {
            const sectionElement = document.getElementById(section);
            if (sectionElement && sectionElement.contains(element)) {
                return section;
            }
        }
        return 'unknown';
    }

    dispatchConsentEvent(type, consent) {
        window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
            detail: { type, consent }
        }));
    }

    // Cookie utility methods
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        const expiresString = expires.toUTCString();
        
        document.cookie = `${name}=${value};expires=${expiresString};path=/;SameSite=Lax;Secure`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length, cookie.length);
            }
        }
        return null;
    }

    deleteCookie(name, domain = '') {
        const domainPart = domain ? `;domain=${domain}` : '';
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainPart}`;
    }

    // GDPR compliance methods
    exportUserData() {
        const consent = this.getConsentStatus();
        const userData = {
            consent_status: consent,
            consent_date: new Date(consent?.timestamp || Date.now()).toISOString(),
            user_agent: navigator.userAgent,
            language: navigator.language,
            cookies_present: this.getArtigeaCookies()
        };
        
        return userData;
    }

    getArtigeaCookies() {
        const cookies = document.cookie.split(';');
        const artigeaCookies = {};
        
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name.startsWith('artigea-') || name.startsWith('_ga')) {
                artigeaCookies[name] = value;
            }
        });
        
        return artigeaCookies;
    }

    deleteAllUserData() {
        // Delete consent cookies
        this.deleteCookie(this.cookieName);
        this.deleteCookie(this.cookieName + '_timestamp');
        
        // Clear analytics cookies
        this.clearAnalyticsCookies();
        
        // Clear any other Artigea cookies
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const name = cookie.trim().split('=')[0];
            if (name.startsWith('artigea-')) {
                this.deleteCookie(name);
            }
        });
        
        // Disable all tracking
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied'
            });
        }
        
        // Reset consent status
        this.consentTypes = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
    }

    // Method to update consent (for preference center)
    updateConsent(newConsent) {
        const updatedConsent = {
            ...newConsent,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        this.saveConsent(updatedConsent);
        this.applyConsent(updatedConsent);
        this.dispatchConsentEvent('updated', updatedConsent);
    }

    // Check if specific consent type is granted
    hasConsent(type = 'analytics') {
        return this.consentTypes[type] === true;
    }

    // Get consent status for external scripts
    getConsent() {
        return { ...this.consentTypes };
    }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
});

// Utility functions for external scripts
window.hasCookieConsent = function(type = 'analytics') {
    return window.cookieConsent ? window.cookieConsent.hasConsent(type) : false;
};

window.getCookieConsent = function() {
    return window.cookieConsent ? window.cookieConsent.getConsent() : null;
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsent;
}