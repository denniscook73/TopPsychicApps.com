document.addEventListener('DOMContentLoaded', function () {
    /* ---- Mobile menu toggle ---- */
    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open);
            toggle.querySelector('.menu-toggle__open').style.display = open ? 'none' : 'block';
            toggle.querySelector('.menu-toggle__close').style.display = open ? 'block' : 'none';
        });
    }

    /* ---- Sticky header shadow on scroll ---- */
    var header = document.getElementById('site-header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 10);
        }, { passive: true });
    }

    /* ---- FAQ accordion (height handled by CSS grid-rows transition) ---- */
    document.querySelectorAll('.faq-item__q').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.closest('.faq-item');
            var wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(function (el) {
                el.classList.remove('open');
                el.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
            });
            if (!wasOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---- Smooth scroll for anchor links ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                var offset = 80;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
                if (nav && nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.querySelector('.menu-toggle__open').style.display = 'block';
                    toggle.querySelector('.menu-toggle__close').style.display = 'none';
                }
            }
        });
    });

    /* =========================================================
       MOTION SYSTEM
       Reduced-motion visitors never get `.js-motion`, so every
       CSS rule gated on `html.js-motion` simply never applies and
       content stays at its final, fully-opaque state (see
       components.css). Everything below is additive polish only.
       ========================================================= */
    var prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('js-motion');

        var REVEAL_SELECTOR = [
            '.reveal', '.review-card', '.psychic-card', '.browse-card',
            '.trust-item', '.process-step', '.faq-item', '.quote-card',
            '.callout', '.scorebar', '.step-timeline__item',
            '.profile-sidebar__box', '.detail-item', '.badge-row',
            '.compare-wrap'
        ].join(',');

        var revealTargets = Array.prototype.slice.call(document.querySelectorAll(REVEAL_SELECTOR));

        /* Stagger: index among sibling matches under the same parent,
           capped so a long grid doesn't produce a multi-second queue. */
        var siblingCounts = new Map();
        revealTargets.forEach(function (el) {
            if (el.style.getPropertyValue('--stagger')) return;
            var parent = el.parentElement;
            var n = siblingCounts.get(parent) || 0;
            el.style.setProperty('--stagger', n);
            siblingCounts.set(parent, n + 1);
        });

        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                runCountUp(entry.target);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(function (el) { revealObserver.observe(el); });

        /* Elements outside the reveal list (e.g. a lone hero stat not
           wrapped in a reveal-tracked ancestor) still get counted up
           once visible, via their own lightweight observer. */
        var standaloneCountTargets = Array.prototype.slice.call(
            document.querySelectorAll('.hero__app-stat strong, [data-countup]')
        ).filter(function (el) { return !el.closest(REVEAL_SELECTOR); });

        if (standaloneCountTargets.length) {
            var countObserver = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    animateCountUp(entry.target);
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.4 });
            standaloneCountTargets.forEach(function (el) { countObserver.observe(el); });
        }
    }

    /* Runs count-up on any numeric target nested inside a just-revealed section */
    function runCountUp(scope) {
        var targets = scope.querySelectorAll('.hero__app-stat strong, [data-countup]');
        if (scope.matches && scope.matches('.hero__app-stat strong, [data-countup]')) {
            animateCountUp(scope);
        }
        targets.forEach(function (el) { animateCountUp(el); });
    }

    var countedUp = new WeakSet();
    function animateCountUp(el) {
        if (countedUp.has(el)) return;
        countedUp.add(el);

        var raw = el.textContent.trim();
        var match = raw.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
        if (!match) return; /* no numeric portion — leave text exactly as rendered */

        var prefix = match[1], numStr = match[2], suffix = match[3];
        var decimals = (numStr.split('.')[1] || '').length;
        var target = parseFloat(numStr.replace(/,/g, ''));
        if (isNaN(target)) return;

        var duration = 900;
        var start = null;

        function frame(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
            var current = target * eased;
            el.textContent = prefix + current.toFixed(decimals) + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(frame);
            } else {
                el.textContent = raw; /* guarantee exact final formatting */
            }
        }
        window.requestAnimationFrame(frame);
    }
});
