$(document).ready(function(){
    // --- NAVIGATION LOGIC ---
    // Hamburger menu toggle for mobile navigation
    $('.fa-hamburger').click(function(){
        $('nav').toggleClass('nav-toggle');
    });

    // Close navigation on link click (for mobile UX)
    $('nav ul li a').click(function(){
        $('nav').removeClass('nav-toggle');
    });

    // --- MAGNIFIER LOGIC FOR MULTIPLE AREAS ---
    /**
     * Sets up a magnifier effect for a given magnifier area.
     * @param {jQuery} $magArea - The magnifier area container.
     */
    function setupMagnifier($magArea) {
        const $glass = $magArea.find('.magnifier-glass');
        const $clear = $magArea.find('.mag-clear');
        const glassW = $glass.width();
        const glassH = $glass.height();
        const zoom = 1.15; // Subtle zoom for effect

        // Handles moving the magnifier glass and revealing the clear image
        function moveMagnifier(e) {
            let rect = $magArea[0].getBoundingClientRect();
            let x, y;
            if(e.type.startsWith('touch')) {
                x = e.originalEvent.touches[0].clientX - rect.left;
                y = e.originalEvent.touches[0].clientY - rect.top;
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            // Clamp glass position within area
            x = Math.max(glassW/2, Math.min(rect.width - glassW/2, x));
            y = Math.max(glassH/2, Math.min(rect.height - glassH/2, y));
            // Move glass and reveal clear image
            $glass.css({left: x-glassW/2, top: y-glassH/2, display:'block'}).addClass('active');
            $clear.css({
                'clip-path': `circle(${glassW/2}px at ${x}px ${y}px)`,
                'transform': `scale(${zoom}) translate(${-x*(zoom-1)}px, ${-y*(zoom-1)}px)`
            });
        }

        // Event handlers for mouse/touch interaction
        $magArea.on('mousemove touchmove', function(e){
            moveMagnifier(e);
            e.preventDefault();
        });
        $magArea.on('mouseleave touchend', function(){
            $glass.hide().removeClass('active');
            $clear.css({'clip-path': 'circle(0px at 50% 50%)', 'transform': 'scale(1)'});
        });
        $magArea.on('mouseenter touchstart', function(e){
            $glass.show().addClass('active');
        });
    }

    // Initialize magnifier for all relevant areas
    $('.magnifier-area').each(function(){
        setupMagnifier($(this));
    });

    // --- MAGNIFIER SLIDER LOGIC (Horizontal) ---
    let currentSlideH = 0;
    const $slidesH = $('.magnifier-area-wrapper-horizontal');

    /**
     * Shows the horizontal magnifier slide at the given index.
     * @param {number} idx - Index of the slide to show.
     */
    function showSlideH(idx) {
        $slidesH.each(function(i){
            $(this).toggleClass('d-none', i !== idx);
        });
    }
    showSlideH(currentSlideH);

    // Arrow navigation for magnifier slider
    $('.mag-slider-left').click(function(){
        currentSlideH = (currentSlideH - 1 + $slidesH.length) % $slidesH.length;
        showSlideH(currentSlideH);
    });
    $('.mag-slider-right').click(function(){
        currentSlideH = (currentSlideH + 1) % $slidesH.length;
        showSlideH(currentSlideH);
    });

    // --- HERO VIDEO SLIDER LOGIC ---
    const $videos = $('.video-container .vid');
    const $dots = $('.controls .dots');
    let currentVid = 0;

    /**
     * Shows the video at the given index and updates dot indicators.
     * @param {number} idx - Index of the video to show.
     */
    function showVideo(idx) {
        $videos.each(function(i){
            if(i === idx) {
                this.currentTime = 0;
                this.muted = false;
                this.play();
                $(this).show();
            } else {
                this.pause();
                this.muted = true;
                $(this).hide();
            }
        });
        $dots.removeClass('active');
        $dots.eq(idx).addClass('active');
        currentVid = idx;
    }

    // Dot click navigation for hero video slider
    $dots.each(function(i){
        $(this).off('click').on('click', function(){
            showVideo(i);
        });
    });

    // Automatically advance to next video when current ends
    $videos.each(function(i){
        this.onended = function(){
            let next = (i+1)%$videos.length;
            showVideo(next);
        };
    });

    // Add style for active dot (for clarity)
    $('<style>\n.controls .dots.active{box-shadow:0 0 0 3px #fff,0 0 0 6px var(--accent);border:2px solid #fff;}\n</style>').appendTo('head');

    // On page load, show first video and force play muted (for autoplay compatibility)
    showVideo(0);
    $videos[0].muted = true;
    $videos[0].play().catch(()=>{});
    setTimeout(function(){
        $videos[0].muted = true;
        $videos[0].play().catch(()=>{});
    }, 200);

    // Unmute and play only the first video on first user interaction (for browsers that block autoplay with sound)
    let unmuted = false;
    $(document).one('click keydown touchstart wheel', function() {
        $videos[0].muted = false;
        $videos[0].play().catch(()=>{});
        unmuted = true;
    });

    // --- HERO VIDEO AUTOPAUSE LOGIC ---
    /**
     * Checks if the #home section is in the viewport.
     * @returns {boolean} True if #home is visible.
     */
    function isHomeInView() {
        const home = document.getElementById('home');
        if (!home) return false;
        const rect = home.getBoundingClientRect();
        return (
            rect.bottom > 0 &&
            rect.top < (window.innerHeight || document.documentElement.clientHeight)
        );
    }

    /**
     * Pauses hero videos when #home is not visible, resumes current video if visible.
     */
    function checkHeroVideoPause() {
        if (!isHomeInView()) {
            $videos.each(function(i){ this.pause(); });
        } else {
            // Resume only the current video if in view
            $videos.each(function(i){
                if(i === currentVid) this.play();
            });
        }
    }
    $(window).on('scroll', checkHeroVideoPause);
});