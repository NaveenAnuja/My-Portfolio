/* ==========================================================================
   Naveen Anuja - Portfolio interactions
   ========================================================================== */
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(hover: none)').matches;
    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

    /* ---------------------------------------------------------------- Preloader */
    const preloader = $('#preloader');

    function hidePreloader() {
        document.body.classList.remove('is-locked');
        if (!preloader || preloader.classList.contains('is-done')) return;
        preloader.classList.add('is-done');
        setTimeout(() => preloader.remove(), 700);
    }

    window.addEventListener('load', () => setTimeout(hidePreloader, 450));
    setTimeout(hidePreloader, 4000);

    /* ------------------------------------------------------------------ Navbar */
    const navbar = $('#navbar');
    const progressBar = $('#scroll-progress');
    const backToTop = $('#back-to-top');
    const navLinks = $$('.nav-link');
    const sections = $$('main section[id]');

    function navHeight() {
        return navbar ? navbar.offsetHeight : 80;
    }

    function onScroll() {
        const y = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (navbar) navbar.classList.toggle('is-scrolled', y > 24);
        if (progressBar) progressBar.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + '%';
        if (backToTop) backToTop.classList.toggle('is-visible', y > 600);

        let currentId = sections.length ? sections[0].id : '';
        const marker = y + navHeight() + 140;
        sections.forEach(section => {
            if (section.offsetTop <= marker) currentId = section.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + currentId);
        });

        updateTimelineProgress();
    }

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(() => {
            onScroll();
            scrollTicking = false;
        });
    }, { passive: true });

    /* ------------------------------------------------------------- Mobile menu */
    const menuToggle = $('#menu-toggle');
    const mobileMenu = $('#mobile-menu');

    function setMenu(open) {
        if (!mobileMenu || !menuToggle) return;
        mobileMenu.classList.toggle('is-open', open);
        menuToggle.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        mobileMenu.setAttribute('aria-hidden', String(!open));
        document.body.classList.toggle('is-locked', open);
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') setMenu(false);
    });

    /* ------------------------------------------------------- Anchor navigation */
    function scrollToId(id) {
        const target = document.getElementById(id);
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight() + 1;
        window.scrollTo({ top: Math.max(top, 0), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    $$('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const id = link.getAttribute('href').slice(1);
            if (!id || !document.getElementById(id)) return;
            e.preventDefault();
            const wasOpen = mobileMenu && mobileMenu.classList.contains('is-open');
            setMenu(false);
            setTimeout(() => scrollToId(id), wasOpen ? 260 : 0);
            history.replaceState(null, '', '#' + id);
        });
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* ------------------------------------------------------------ Reveal on scroll */
    const revealables = $$('[data-animate]');

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const delay = parseInt(el.dataset.delay || '0', 10);
                setTimeout(() => el.classList.add('is-visible'), delay);
                observer.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealables.forEach(el => revealObserver.observe(el));
    } else {
        revealables.forEach(el => el.classList.add('is-visible'));
    }

    // Stagger grid children that share a parent
    ['.projects-grid', '.skills-cards', '.timeline'].forEach(selector => {
        const parent = $(selector);
        if (!parent) return;
        $$('[data-animate]', parent).forEach((child, index) => {
            child.dataset.delay = String(index * 90);
        });
    });

    // Mark timeline items visible so their dots light up
    if ('IntersectionObserver' in window) {
        const itemObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { threshold: 0.25 });
        $$('.timeline-item').forEach(item => itemObserver.observe(item));
    }

    /* ---------------------------------------------------------- Timeline progress */
    const timeline = $('.timeline');
    const timelineProgress = $('.timeline-progress');

    function updateTimelineProgress() {
        if (!timeline || !timelineProgress) return;
        const rect = timeline.getBoundingClientRect();
        const trigger = window.innerHeight * 0.72;
        const filled = Math.min(Math.max(trigger - rect.top, 0), rect.height);
        timelineProgress.style.height = (rect.height ? (filled / rect.height) * 100 : 0) + '%';
    }

    /* -------------------------------------------------------------- Typing line */
    const typedTarget = $('#typed-text');
    const phrases = [
        'Full-Stack Product Engineering',
        'RESTful API Design & Architecture',
        'React  Node.js  Express  Spring Boot',
        'Live Commercial SaaS Products',
        'Flutter Cross-Platform Development'
    ];

    if (typedTarget) {
        if (prefersReducedMotion) {
            typedTarget.textContent = phrases[0];
        } else {
            let phraseIndex = 0;
            let charIndex = 0;
            let deleting = false;

            (function typeLoop() {
                const phrase = phrases[phraseIndex];
                charIndex += deleting ? -1 : 1;
                typedTarget.textContent = phrase.slice(0, charIndex);

                let wait = deleting ? 35 : 65;
                if (!deleting && charIndex === phrase.length) {
                    wait = 1900;
                    deleting = true;
                } else if (deleting && charIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    wait = 320;
                }
                setTimeout(typeLoop, wait);
            })();
        }
    }

    /* ----------------------------------------------------------------- Counters */
    function animateCounter(el) {
        const target = parseFloat(el.dataset.count || '0');
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const counters = $$('.stat-value');
    if (counters.length) {
        if ('IntersectionObserver' in window) {
            const counterObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.5 });
            counters.forEach(el => counterObserver.observe(el));
        } else {
            counters.forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
        }
    }

    /* ------------------------------------------------------------- Skill bars */
    const skillBars = $$('.progress-fill');
    if (skillBars.length) {
        if ('IntersectionObserver' in window) {
            const barObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const bar = entry.target;
                    setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 120);
                    observer.unobserve(bar);
                });
            }, { threshold: 0.4 });
            skillBars.forEach(bar => barObserver.observe(bar));
        } else {
            skillBars.forEach(bar => { bar.style.width = bar.dataset.width + '%'; });
        }
    }

    /* --------------------------------------------------------- Project filters */
    const filterButtons = $$('.filter-btn');
    const projectCards = $$('#projects-grid .project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            filterButtons.forEach(b => b.classList.toggle('is-active', b === button));

            projectCards.forEach((card, index) => {
                const matches = filter === 'all' || (card.dataset.category || '').includes(filter);
                if (matches) {
                    card.classList.remove('is-hidden');
                    card.classList.add('is-visible');
                    if (!prefersReducedMotion) {
                        card.style.animation = 'none';
                        void card.offsetWidth;
                        card.style.animation = `cardIn .5s var(--ease) ${index * 60}ms backwards`;
                    }
                } else {
                    card.classList.add('is-hidden');
                }
            });
        });
    });

    /* ------------------------------------------------------------- Cursor glow */
    const cursorGlow = $('#cursor-glow');
    if (cursorGlow && !isCoarsePointer && !prefersReducedMotion) {
        let glowX = window.innerWidth / 2;
        let glowY = window.innerHeight / 2;
        let targetX = glowX;
        let targetY = glowY;

        document.addEventListener('mousemove', e => {
            targetX = e.clientX;
            targetY = e.clientY;
            cursorGlow.style.opacity = '1';
        });

        (function glowLoop() {
            glowX += (targetX - glowX) * 0.12;
            glowY += (targetY - glowY) * 0.12;
            cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
            requestAnimationFrame(glowLoop);
        })();
    }

    /* ------------------------------------------------------------- Card tilt 3D */
    if (!isCoarsePointer && !prefersReducedMotion) {
        $$('.project-card, .featured-card, .skill-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(900px) rotateX(${-py * 5}deg) rotateY(${px * 5}deg) translateY(-8px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* -------------------------------------------------------- Three.js backdrop */
    const canvas = $('#hero-canvas');

    if (canvas && typeof THREE !== 'undefined' && !prefersReducedMotion) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 1, 3000);
        camera.position.z = 700;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const particleCount = window.innerWidth < 768 ? 900 : 2400;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const palette = [
            [0.22, 0.74, 0.97], // sky
            [0.39, 0.40, 0.95], // indigo
            [0.66, 0.33, 0.97]  // purple
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 2200;
            positions[i3 + 1] = (Math.random() - 0.5) * 1600;
            positions[i3 + 2] = (Math.random() - 0.5) * 1600;

            const tone = palette[Math.floor(Math.random() * palette.length)];
            colors[i3] = tone[0];
            colors[i3 + 1] = tone[1];
            colors[i3 + 2] = tone[2];
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.9,
            sizeAttenuation: false,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let pointerX = 0;
        let pointerY = 0;

        window.addEventListener('mousemove', e => {
            pointerX = (e.clientX / window.innerWidth) * 2 - 1;
            pointerY = -(e.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });

        let running = true;
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) render();
        });

        function render() {
            if (!running) return;
            requestAnimationFrame(render);

            particles.rotation.y += 0.00042;
            particles.rotation.x += 0.00016;

            camera.position.x += (pointerX * 110 - camera.position.x) * 0.035;
            camera.position.y += (pointerY * 70 - camera.position.y) * 0.035;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        render();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }, 180);
        });
    }

    /* ------------------------------------------------------------------- Misc */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    document.body.classList.add('is-locked');
    onScroll();
    updateTimelineProgress();
})();
