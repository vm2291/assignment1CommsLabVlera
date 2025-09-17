$(document).ready(function(){
    $('.fa-hamburger').click(function(){
        $('nav').toggleClass('nav-toggle');
    });

    $('nav ul li a').click(function(){
        $('nav').removeClass('nav-toggle');
    });

    $('.dot1').click(function(){
        $('.vid3').css('display','none');
    });

    $('.dot2').click(function(){
        $('.vid3').css('display','none');
    });

    $('.dot3').click(function(){
        $('.vid2').css('display','none');
    });

    $(window).on('scroll load',function(){
        // ...existing code...
    });

    // --- Magnifier logic for multiple areas ---
    function setupMagnifier($magArea) {
        const $glass = $magArea.find('.magnifier-glass');
        const $clear = $magArea.find('.mag-clear');
        const glassW = $glass.width();
        const glassH = $glass.height();
        const zoom = 1.15; // subtle zoom
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
            // Clamp
            x = Math.max(glassW/2, Math.min(rect.width - glassW/2, x));
            y = Math.max(glassH/2, Math.min(rect.height - glassH/2, y));
            // Move glass
            $glass.css({left: x-glassW/2, top: y-glassH/2, display:'block'}).addClass('active');
            // Reveal clear image with clip-path and subtle zoom
            $clear.css({
                'clip-path': `circle(${glassW/2}px at ${x}px ${y}px)`,
                'transform': `scale(${zoom}) translate(${-x*(zoom-1)}px, ${-y*(zoom-1)}px)`
            });
        }
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
    $('.magnifier-area').each(function(){
        setupMagnifier($(this));
    });

    // --- Horizontal slider logic for magnifier slides ---
    let currentSlideH = 0;
    const $slidesH = $('.magnifier-area-wrapper-horizontal');
    function showSlideH(idx) {
        $slidesH.each(function(i){
            $(this).toggleClass('d-none', i !== idx);
        });
    }
    showSlideH(currentSlideH);
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

    // On dot click
    $dots.each(function(i){
        $(this).off('click').on('click', function(){
            showVideo(i);
        });
    });

    // On video end, go to next
    $videos.each(function(i){
        this.onended = function(){
            let next = (i+1)%$videos.length;
            showVideo(next);
        };
    });

    // Style for active dot
    $('<style>\n.controls .dots.active{box-shadow:0 0 0 3px #fff,0 0 0 6px var(--accent);border:2px solid #fff;}\n</style>').appendTo('head');

    // On page load, show first video and force play muted (for autoplay)
    showVideo(0);
    $videos[0].muted = true;
    $videos[0].play().catch(()=>{});
    // Try to force play in case browser blocks autoplay
    setTimeout(function(){
        $videos[0].muted = true;
        $videos[0].play().catch(()=>{});
    }, 200);

    // Unmute and play only the first video on first user interaction
    let unmuted = false;
    $(document).one('click keydown touchstart wheel', function() {
        $videos[0].muted = false;
        $videos[0].play().catch(()=>{});
        unmuted = true;
    });

    // Pause hero video when #home is not in viewport
    function isHomeInView() {
        const home = document.getElementById('home');
        if (!home) return false;
        const rect = home.getBoundingClientRect();
        return (
            rect.bottom > 0 &&
            rect.top < (window.innerHeight || document.documentElement.clientHeight)
        );
    }
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