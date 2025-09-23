document.addEventListener('DOMContentLoaded', function() {
    const cursorInfluence = document.querySelector('.cursor-influence');
    const animatedBg = document.querySelector('.animated-background');

    document.addEventListener('mousemove', function(e) {
        const x = e.clientX;
        const y = e.clientY;
        
        // Update cursor influence position
        cursorInfluence.style.left = x + 'px';
        cursorInfluence.style.top = y + 'px';
        
        // Influence the animated background
        const xPercent = (x / window.innerWidth) * 100;
        const yPercent = (y / window.innerHeight) * 100;
        
        animatedBg.style.background = `
            radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(138, 43, 226, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 107, 157, 0.7) 0%, transparent 50%),
            linear-gradient(135deg, #0a0015 0%, #1a0033 25%, #2d1b69 50%, #8b5a9f 75%, #ff6b9d 100%)
        `;
    });

    // Enhanced hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .service-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            cursorInfluence.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorInfluence.style.opacity = '0.8';
        });

        element.addEventListener('mouseleave', function() {
            cursorInfluence.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorInfluence.style.opacity = '1';
        });
    });
});
