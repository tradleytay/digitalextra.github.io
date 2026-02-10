(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar (simplified) — keep black logo permanently
    (function () {
        var $nav = $('.navbar');
        var stickyThreshold = 45; // px

        function updateNavbar() {
            var scrollTop = $(window).scrollTop();
            if (scrollTop > stickyThreshold) {
                $nav.addClass('sticky-top shadow-sm');
            } else {
                $nav.removeClass('sticky-top shadow-sm');
            }
        }

        // Ensure the logo stays black: set it once on load if present
        $(window).on('load', function () {
            var $logo = $('#siteLogo');
            if ($logo.length) {
                // Prefer explicit blacklogo file; fall back to data-default/data-sticky if used elsewhere
                $logo.attr('src', 'logos/blacklogo.png');
                $logo.attr('data-default', 'logos/blacklogo.png');
                $logo.attr('data-sticky', 'logos/blacklogo.png');
            }
            updateNavbar();
        });

        // Run on resize and scroll for sticky class only
        $(window).on('resize scroll', updateNavbar);
    })();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Skills
    $('.skill').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            992:{
                items:2
            }
        }
    });


    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });
    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('active');
        $(this).addClass('active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });
    
    // Contact form: toggle job application fields and simple client-side handling
    try {
        var $subject = $('#contactSubject');
        var $jobFields = $('#jobApplicationFields');
        var $contactForm = $('#contactForm');

        function toggleJobFields() {
            if ($subject.length && $jobFields.length) {
                if ($subject.val() === 'Job Application') $jobFields.show();
                else $jobFields.hide();
            }
        }

        if ($subject.length) {
            $subject.on('change', toggleJobFields);
            // initialize visibility on load
            toggleJobFields();
        }

        if ($contactForm.length) {
            $contactForm.on('submit', function (e) {
                e.preventDefault();
                var name = $.trim($('#contactName').val() || '');
                var email = $.trim($('#contactEmail').val() || '');
                var message = $.trim($('#contactMessage').val() || '');
                var $success = $('#messageSuccess');
                var $error = $('#messageError');

                if (!name || !email || !message) {
                    if ($error.length) $error.show();
                    if ($success.length) $success.hide();
                    return;
                }

                // Simulate success (static site)
                if ($success.length) $success.show();
                if ($error.length) $error.hide();

                setTimeout(function () {
                    $contactForm[0].reset();
                    toggleJobFields();
                }, 1200);
            });
        }
    } catch (e) {
        console.warn('Contact form script error:', e);
    }
    
    // Auto-update elements with class `current-year` to the current year
    try {
        var _year = new Date().getFullYear();
        $('.current-year').each(function () {
            $(this).text(_year);
        });
    } catch (e) {
        // silent failure if jQuery isn't available or DOM isn't ready
        console.warn('Auto-year script failed:', e);
    }

})(jQuery);

