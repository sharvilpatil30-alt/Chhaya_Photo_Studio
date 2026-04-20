/**
 * Parallax Background Frames Animation
 * Handles generating and animating decorative frames based on scroll and mouse movement.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Create Container if it doesn't exist
    let container = document.getElementById('parallax-bg-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'parallax-bg-container';
        container.setAttribute('aria-hidden', 'true');
        document.body.prepend(container);
    }

    // Check for mobile to reduce frame count for performance
    const isMobile = window.innerWidth < 768;
    const numFrames = isMobile ? 8 : 22; // Increased count for richer background

    const frames = [];
    
    // 2. Generate Frames & Elements
    for (let i = 0; i < numFrames; i++) {
        const frame = document.createElement('div');
        
        // Depth determines how much they move (0.1 to 2.2)
        // Smaller depth = moves less, feels further away (blurry)
        const depth = Math.random() * 2.1 + 0.1; 
        
        // Randomly decide type: 85% frames, 15% solid dots/accents
        const isDot = Math.random() > 0.85;
        
        if (isDot) {
            frame.classList.add('parallax-dot');
            const size = Math.random() * 20 + 5; // 5px to 25px
            frame.style.width = `${size}px`;
            frame.style.height = `${size}px`;
            frame.style.opacity = (depth * 0.2 + 0.2).toFixed(2); // 0.2 to 0.6
        } else {
            frame.classList.add('parallax-frame');
            
            // Much larger size variation: 50px to 700px
            const width = Math.random() * 650 + 50;
            // Shapes: squares, tall rectangles, wide rectangles
            const aspectRatioRatio = Math.random();
            let height;
            if (aspectRatioRatio > 0.7) height = width; // square
            else if (aspectRatioRatio > 0.35) height = width * (Math.random() * 1.5 + 1.2); // tall
            else height = width * (Math.random() * 0.6 + 0.3); // wide
            
            frame.style.width = `${width}px`;
            frame.style.height = `${height}px`;
            
            // Visual variations
            if (Math.random() > 0.8) {
                frame.style.borderRadius = '50%'; // Circles
            } else {
                // Sharp or rounded corners
                frame.style.borderRadius = Math.random() > 0.5 ? '0px' : `${Math.random() * 15 + 2}px`;
            }
            
            // Vary border thickness (thin to slightly thicker)
            frame.style.borderWidth = `${Math.random() > 0.7 ? 2 : 1}px`;
            
            // Enhanced Visibility: Opacity 0.25 to 0.55 based on depth (closer = more opaque)
            frame.style.opacity = (depth * 0.2 + 0.35).toFixed(2);
            
            // Depth effect (blur for distant objects)
            if (depth < 0.6) {
                frame.style.filter = `blur(${Math.random() * 4 + 1}px)`;
            }
        }
        
        // Random positions across the screen
        const left = Math.random() * 100; // vw
        const top = Math.random() * 100; // vh
        frame.style.left = `${left}vw`;
        frame.style.top = `${top}vh`;
        
        // Initial Rotation
        const rotate = Math.random() * 90 - 45; // -45deg to 45deg
        
        container.appendChild(frame);
        
        frames.push({
            el: frame,
            depth: depth,
            rotate: rotate,
            targetX: 0,
            targetY: 0,
            currentX: 0,
            currentY: 0
        });
        
        // Initial transform
        frame.style.transform = `translate3d(0px, 0px, 0px) rotate(${rotate}deg)`;
    }

    // 3. Animation Logic
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = window.scrollY;

    // Track Mouse
    window.addEventListener('mousemove', (e) => {
        // Normalize mouse pos from -1 to 1
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    // Track Scroll
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    }, { passive: true });

    // Render loop
    function animate() {
        frames.forEach(frame => {
            // Mouse parallax: increased range (120) for more noticeable effect
            const mouseOffsetX = mouseX * 120 * frame.depth;
            const mouseOffsetY = mouseY * 120 * frame.depth;
            
            // Scroll parallax: increased multiplier (0.8) for noticeable vertical shift
            const scrollOffset = scrollY * frame.depth * 0.8;
            
            // Target positions
            frame.targetX = -mouseOffsetX;
            frame.targetY = -scrollOffset - mouseOffsetY;

            // Easing: Lerp with lower factor (0.04) for smoother, premium floaty motion
            frame.currentX += (frame.targetX - frame.currentX) * 0.04;
            frame.currentY += (frame.targetY - frame.currentY) * 0.04;

            // Apply translation and preserve initial rotation
            // We use translate3d to ensure hardware acceleration
            frame.el.style.transform = `translate3d(${frame.currentX}px, ${frame.currentY}px, 0) rotate(${frame.rotate}deg)`;
        });

        requestAnimationFrame(animate);
    }

    // Start animation loop
    animate();
});
