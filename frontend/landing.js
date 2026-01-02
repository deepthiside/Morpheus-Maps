// Landing Page JavaScript for Morpheus Maps

// API Configuration for hybrid deployment
function getApiBaseUrl() {
    // Check for Netlify environment variable
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // Check if we're on Netlify (you'll need to update this with your actual Netlify subdomain)
    if (window.location.hostname.includes('netlify.app')) {
        // TODO: Replace with your actual backend URL when deployed
        // Example: 'https://your-backend.onrender.com' or 'https://your-backend.herokuapp.com'
        console.warn('Netlify deployment detected. Please update the API URL in the code or environment variables.');
        return 'https://your-backend-url.com'; // <-- UPDATE THIS WITH YOUR ACTUAL BACKEND URL
    }
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Production/Cloud environment (HTTPS or custom domain)
    if (protocol === 'https:' || hostname !== 'localhost') {
        return `${protocol}//${hostname}${port && port !== '443' && port !== '80' ? ':' + port : ''}`;
    }
    
    // Docker environment (port 8080 for frontend)
    if (port === '8080') {
        return `${protocol}//${hostname}:5000`;
    }
    
    // Local development (port 8000 for frontend)
    return `${protocol}//${hostname}:5000`;
}

const API_BASE_URL = getApiBaseUrl();

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the landing page
    initializeLandingPage();
});

function initializeLandingPage() {
    // Handle logo fallback
    handleLogoFallback();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize authentication modal
    initAuthModal();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize animations
    initAnimations();
}

// Handle logo fallback (show icon if image fails to load)
function handleLogoFallback() {
    const logos = [
        { img: 'nav-logo', icon: 'nav-logo-icon' },
        { img: 'footer-logo', icon: 'footer-logo-icon' },
        { img: 'developer-photo', placeholder: 'photo-placeholder' }
    ];
    
    logos.forEach(logo => {
        const imgElement = document.getElementById(logo.img);
        const iconElement = document.getElementById(logo.icon);
        const placeholderElement = document.getElementById(logo.placeholder);
        
        if (imgElement) {
            imgElement.onerror = function() {
                this.style.display = 'none';
                if (iconElement) {
                    iconElement.style.display = 'inline-block';
                }
                if (placeholderElement) {
                    placeholderElement.style.display = 'flex';
                }
            };
        }
    });
}

// Initialize smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const footerLinks = document.querySelectorAll('.footer-section a[href^="#"]');
    
    [...navLinks, ...footerLinks].forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Learn more button smooth scroll
    const learnMoreBtn = document.getElementById('learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = aboutSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Initialize authentication modal
function initAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const signinBtn = document.getElementById('signin-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    const closeBtn = document.querySelector('.close');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    // Open modal
    function openAuthModal(tab = 'signin') {
        authModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        switchAuthTab(tab);
    }
    
    // Close modal
    function closeAuthModal() {
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Switch between signin and signup tabs
    function switchAuthTab(tabName) {
        // Hide any existing notifications when switching tabs
        hideAuthNotification('signin');
        hideAuthNotification('signup');
        
        authTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tabName}-form`) {
                form.classList.add('active');
            }
        });
    }
    
    // Event listeners
    if (signinBtn) {
        signinBtn.addEventListener('click', () => openAuthModal('signin'));
    }
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => openAuthModal('signup'));
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAuthModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
    
    // Auth tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchAuthTab(this.dataset.tab);
        });
    });
    
    // Handle form submissions
    const signinForm = document.getElementById('signin-form-element');
    const signupForm = document.getElementById('signup-form-element');
    
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Show notification in auth forms
function showAuthNotification(message, type = 'error', formType = 'signin') {
    const notificationId = `${formType}-notification`;
    const textId = `${formType}-notification-text`;
    
    const notification = document.getElementById(notificationId);
    const notificationText = document.getElementById(textId);
    
    if (!notification || !notificationText) return;
    
    // Set message and type
    notificationText.textContent = message;
    notification.className = `auth-notification ${type}`;
    
    // Show notification
    notification.style.display = 'flex';
    
    // Auto hide after 8 seconds for error messages, 3 seconds for others
    const hideTime = type === 'error' ? 8000 : 3000;
    setTimeout(() => {
        notification.style.display = 'none';
    }, hideTime);
}

// Hide auth notification
function hideAuthNotification(formType = 'signin') {
    const notificationId = `${formType}-notification`;
    const notification = document.getElementById(notificationId);
    
    if (notification) {
        notification.style.display = 'none';
    }
}

// Handle signin
async function handleSignin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Hide any existing notifications
    hideAuthNotification('signin');
    
    // Validate credentials against test accounts
    const validCredentials = [
        { email: 'infinity282005@gmail.com', password: 'xyz01' },
        { email: 'anil.bhargava@anandice.ac.in', password: 'xyz01' }
    ];
    
    const isValidCredential = validCredentials.some(cred => 
        cred.email === email && cred.password === password
    );
    
    if (!isValidCredential) {
        // Check if email exists but password is wrong
        const emailExists = validCredentials.some(cred => cred.email === email);
        
        if (emailExists) {
            showAuthNotification('Invalid password. Please try again.', 'error', 'signin');
        } else {
            showAuthNotification('Invalid email. Please sign up first or use a valid test account: infinity282005@gmail.com or anil.bhargava@anandice.ac.in', 'error', 'signin');
        }
        return;
    }
    
    try {
        showAuthNotification('Signing in...', 'info', 'signin');
        
        // Simulate successful authentication
        setTimeout(() => {
            showNotification('Redirecting to dashboard...', 'success');
            
            // Close modal and redirect to main application
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            setTimeout(() => {
                window.location.href = '/app.html';
            }, 1500);
        }, 1000);
        
    } catch (error) {
        showAuthNotification('An error occurred during sign in. Please try again.', 'error', 'signin');
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');
    
    // Hide any existing notifications
    hideAuthNotification('signup');
    
    // Validation
    if (password !== confirmPassword) {
        showAuthNotification('Passwords do not match!', 'error', 'signup');
        return;
    }
    
    if (password.length < 6) {
        showAuthNotification('Password must be at least 6 characters long!', 'error', 'signup');
        return;
    }
    
    try {
        // For testing purposes, signup is disabled - redirect to signin
        showAuthNotification('Sign up is currently disabled for testing. Please use the Sign In form with test credentials: infinity282005@gmail.com or anil.bhargava@anandice.ac.in (password: xyz01)', 'error', 'signup');
        
        // Switch to signin tab after a short delay
        setTimeout(() => {
            const signinTab = document.querySelector('[data-tab="signin"]');
            if (signinTab) {
                signinTab.click();
            }
        }, 5000);
        return;
    } catch (error) {
        showAuthNotification('An error occurred. Please use the Sign In form with test credentials.', 'error', 'signup');
    }
}

// Initialize mobile menu
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }
}

// Initialize contact form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Don't prevent default - let Formspree handle the submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Show notification that form is being sent
            showNotification('Sending your message...', 'info');
            
            // Set a timeout to show success message and reset form
            setTimeout(() => {
                showNotification('Thank you! Your message has been sent to infinity282005@gmail.com', 'success');
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Reset form after a short delay
                setTimeout(() => {
                    contactForm.reset();
                }, 1000);
            }, 2000);
        });
    }
}

// Initialize scroll effects
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    // Header background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = 'white';
            header.style.backdropFilter = 'none';
        }
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    const animatableElements = document.querySelectorAll('.goal-card, .feature-card, .user-card, .mission-card, .team-card');
    animatableElements.forEach(el => observer.observe(el));
}

// Initialize animations
function initAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .goal-card, .feature-card, .user-card, .mission-card, .team-card {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .goal-card.animate-in, .feature-card.animate-in, .user-card.animate-in, 
        .mission-card.animate-in, .team-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .floating-card {
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .hero-stats .stat {
            animation: countUp 2s ease-out forwards;
        }
        
        @keyframes countUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Mobile menu styles */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
                position: fixed;
                top: 70px;
                right: -100%;
                width: 100%;
                height: calc(100vh - 70px);
                background: white;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                padding-top: 2rem;
                transition: right 0.3s ease;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 999;
            }
            
            .nav-links.active {
                display: flex;
                right: 0;
            }
            
            .nav-links a {
                padding: 1rem;
                width: 100%;
                text-align: center;
                border-bottom: 1px solid #eee;
                font-size: 1.1rem;
            }
            
            .nav-links .btn {
                margin: 1rem;
                width: calc(100% - 2rem);
                max-width: 300px;
            }
            
            .mobile-menu-toggle {
                color: var(--primary-color);
                font-size: 1.5rem;
                z-index: 1000;
                position: relative;
            }
        }
        
        @media (max-width: 480px) {
            .nav-links {
                top: 60px;
                height: calc(100vh - 60px);
                padding-top: 1.5rem;
            }
            
            .nav-links a {
                padding: 0.8rem;
                font-size: 1rem;
            }
            
            .nav-links .btn {
                margin: 0.8rem;
                padding: 0.8rem 1.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const closeNotification = document.getElementById('close-notification');
    
    if (!notification || !notificationText) return;
    
    // Set message and type
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto hide after 5 seconds
    const autoHide = setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
    
    // Manual close
    if (closeNotification) {
        closeNotification.onclick = function() {
            notification.classList.remove('show');
            clearTimeout(autoHide);
        };
    }
}

// Add smooth scrolling to buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Check if user is already authenticated
function checkAuthentication() {
    // Removed authentication check
}

// Initialize authentication check
// checkAuthentication() - Removed