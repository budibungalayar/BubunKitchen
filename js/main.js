// ==========================================
// BUBUN KITCHEN - MAIN SCRIPT
// Initialization & interactions untuk index.html
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// Define the updateCartBadge function
function updateCartBadge() {
    // Add your logic to update the cart badge here
    console.log("updateCartBadge called"); // Placeholder log
}

// Initialize all page functionality
function initializePage() {
    // Update cart badge
    updateCartBadge();
    
    // Render products
    renderProducts();
    
    // Setup navbar scroll effect
    setupNavbar();
    
    // Setup smooth scrolling
    setupSmoothScroll();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup animations on scroll
    setupScrollAnimations();
    
    // Setup secret admin link
    setupAdminAccess();
    
    // Update year in footer
    updateFooterYear();
}

// Navbar scroll effect
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('navbar-solid');
        } else {
            navbar.classList.remove('navbar-solid');
        }
        
        lastScroll = currentScroll;
    });
}

// Smooth scroll for navigation links
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            const navbarHeight = 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navMenu = document.getElementById('navMenu');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Button "Lihat Produk" di hero
    const btnBeli = document.getElementById('btn-beli');
    if (btnBeli) {
        btnBeli.addEventListener('click', () => {
            smoothScrollTo('#products');
        });
    }
}

// Mobile menu toggle
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Observe cards
    const cards = document.querySelectorAll('.product-card, .feature-card, .testimonial-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// Secret admin access (klik logo 3x dalam 2 detik)
function setupAdminAccess() {
    const logo = document.getElementById('logo-secret');
    if (!logo) return;
    
    let clickCount = 0;
    let clickTimer = null;
    
    logo.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);
        }
        
        if (clickCount === 3) {
            clearTimeout(clickTimer);
            clickCount = 0;
            window.location.href = 'admin.html';
        }
    });
}

// Update footer year
function updateFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// Parallax effect for hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Animate numbers in stats
function animateNumbers() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = stat.textContent;
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.ceil(current);
                requestAnimationFrame(updateNumber);
            } else {
                stat.textContent = target;
            }
        };
        
        updateNumber();
    });
}

// Lazy load images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Add to cart animation
function addToCartAnimation(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// Testimonial slider auto-scroll (optional enhancement)
function setupTestimonialSlider() {
    const slider = document.getElementById('testimonialsSlider');
    if (!slider) return;
    
    let scrollAmount = 0;
    const scrollMax = slider.scrollWidth - slider.clientWidth;
    
    // Auto-scroll every 5 seconds
    setInterval(() => {
        if (scrollAmount >= scrollMax) {
            scrollAmount = 0;
        } else {
            scrollAmount += 320; // card width + gap
        }
        
        slider.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }, 5000);
}

// Form validation helpers
function validateContactForm(formData) {
    const { name, email, message } = formData;
    
    if (!name || name.trim().length < 2) {
        return { valid: false, message: 'Nama harus diisi minimal 2 karakter' };
    }
    
    if (!email || !isValidEmail(email)) {
        return { valid: false, message: 'Email tidak valid' };
    }
    
    if (!message || message.trim().length < 10) {
        return { valid: false, message: 'Pesan harus diisi minimal 10 karakter' };
    }
    
    return { valid: true };
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K = Focus search (if implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) searchInput.focus();
    }
    
    // Escape = Close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            hideModal(modal.id);
        });
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    if ('performance' in window && 'timing' in window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    }
});

// Service Worker registration (for PWA - optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

// Export functions for global use
window.addToCart = addToCart;
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.goToSlide = goToSlide;

