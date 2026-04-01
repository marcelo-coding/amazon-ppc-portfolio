// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu button
    const header = document.querySelector('.nav-container');
    const navMenu = document.querySelector('.nav-menu');

    if (header && navMenu) {
        const menuToggle = document.createElement('button');
        menuToggle.classList.add('menu-toggle');
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        header.appendChild(menuToggle);

        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav-open');
            menuToggle.innerHTML = navMenu.classList.contains('nav-open') ? '✕' : '☰';
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('nav-open');
                menuToggle.innerHTML = '☰';
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Sticky header shadow on scroll
    var headerEl = document.querySelector('.header');
    if (headerEl) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                headerEl.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
            } else {
                headerEl.style.boxShadow = 'none';
            }
        });
    }

    // Animate elements on scroll (fade in)
    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe service cards, blog cards, and other animated elements
    var animatedElements = document.querySelectorAll('.service-card, .blog-card, .pillar, .stat-item');
    animatedElements.forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Case studies filter buttons
    var filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterButtons.forEach(function(b) {
                b.style.background = 'white';
                b.style.color = '#666';
            });
            this.style.background = '#00d4aa';
            this.style.color = 'white';
        });
    });
});
