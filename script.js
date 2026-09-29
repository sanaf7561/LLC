document.addEventListener('DOMContentLoaded', () => {
	if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
		gsap.registerPlugin(ScrollToPlugin);
	}

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Add shared scroll reveals only when AOS is available and motion is allowed.
	if (typeof AOS !== 'undefined' && !prefersReducedMotion) {
		// Keep the shared navigation static; animate the page content below it.
		document.querySelectorAll('main > section').forEach((section) => {
			if (section.matches('.hero, .about-hero-section')) {
				// Animate hero copy only so portraits and section backgrounds stay still.
				section.querySelectorAll('.hero-copy, .about-hero-heading, .about-hero-copy').forEach((text, index) => {
					text.dataset.aos = 'fade-up';
					text.dataset.aosDuration = '900';
					text.dataset.aosDelay = String(index * 120);
				});
				return;
			}

			section.dataset.aos = section.classList.contains('contact-cta') ? 'zoom-in' : 'fade-up';
			section.dataset.aosDuration = '900';
		});

		document.querySelectorAll('.site-footer').forEach((element) => {
			element.dataset.aos = 'fade-up';
			element.dataset.aosDuration = '800';
		});

		// Stagger repeated cards, timeline steps, and statistics for a cascading reveal.
		const staggerGroups = [
			'.services-grid',
			'.service-feature-list',
			'.education-strip-inner',
			'.leadership-stats',
			'.leadership-table-list',
			'.path-timeline'
		];

		staggerGroups.forEach((selector) => {
			document.querySelectorAll(selector).forEach((group) => {
				Array.from(group.children).forEach((item, index) => {
					item.dataset.aos = group.classList.contains('leadership-stats') ? 'zoom-in' : 'fade-up';
					item.dataset.aosDuration = '750';
					item.dataset.aosDelay = String(Math.min(index * 100, 350));
				});
			});
		});

		AOS.init({
			once: true,
			startEvent: 'load',
			duration: 900,
			easing: 'ease-out-cubic',
			offset: 90,
			mirror: false
		});
	}

	const counters = document.querySelectorAll('[data-count]');

	// Count each statistic once when it scrolls into view; static values remain if motion is reduced.
	if (!prefersReducedMotion && 'IntersectionObserver' in window) {
		const counterObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					return;
				}

				const counter = entry.target;
				const target = Number(counter.dataset.count);
				const prefix = counter.dataset.prefix || '';
				const suffix = counter.dataset.suffix || '';
				const duration = 1600;
				let startTime;

				observer.unobserve(counter);
				counter.textContent = `${prefix}0${suffix}`;

				const animateCount = (timestamp) => {
					startTime ??= timestamp;
					const progress = Math.min((timestamp - startTime) / duration, 1);
					const easedProgress = 1 - Math.pow(1 - progress, 3);
					const currentValue = Math.round(target * easedProgress).toLocaleString();

					counter.textContent = `${prefix}${currentValue}${suffix}`;

					if (progress < 1) {
						requestAnimationFrame(animateCount);
					}
				};

				requestAnimationFrame(animateCount);
			});
		}, { threshold: 0.4 });

		counters.forEach((counter) => counterObserver.observe(counter));
	}

	const menuToggle = document.querySelector('.menu-toggle');
	const mainNav = document.querySelector('#main-navigation');

	if (menuToggle && mainNav) {
		const header = menuToggle.closest('.site-header');
		const mobileNav = window.matchMedia('(max-width: 767px)');

		const setMenuOpen = (isOpen, restoreFocus = false) => {
			document.body.classList.toggle('nav-open', isOpen);
			menuToggle.setAttribute('aria-expanded', String(isOpen));
			menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
			mainNav.setAttribute('aria-hidden', String(mobileNav.matches && !isOpen));
			mainNav.inert = mobileNav.matches && !isOpen;

			if (isOpen) {
				mainNav.querySelector('a')?.focus();
			} else if (restoreFocus) {
				menuToggle.focus();
			}
		};

		const syncNavigation = () => {
			const isMobile = mobileNav.matches;

			document.body.classList.remove('nav-open');
			menuToggle.setAttribute('aria-expanded', 'false');
			menuToggle.setAttribute('aria-label', 'Open navigation');
			mainNav.setAttribute('aria-hidden', String(isMobile));
			mainNav.inert = isMobile;
		};

		syncNavigation();
		mobileNav.addEventListener('change', syncNavigation);

		menuToggle.addEventListener('click', () => {
			setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true', true);
		});

		mainNav.querySelectorAll('a').forEach((link) => {
			link.addEventListener('click', () => {
				if (mobileNav.matches) {
					setMenuOpen(false);
				}
			});
		});

		document.addEventListener('click', (event) => {
			if (mobileNav.matches && document.body.classList.contains('nav-open') && !header.contains(event.target)) {
				setMenuOpen(false, true);
			}
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
				setMenuOpen(false, true);
			}
		});
	}

	const samePageLinks = document.querySelectorAll('a[href^="#"]');

	samePageLinks.forEach((link) => {
		link.addEventListener('click', (event) => {
			const target = document.querySelector(link.getAttribute('href'));

			if (!target) {
				return;
			}

			event.preventDefault();

			if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollToPlugin === 'undefined') {
				target.scrollIntoView({ behavior: 'auto', block: 'start' });
				history.pushState(null, '', link.getAttribute('href'));
				return;
			}

			gsap.to(window, {
				duration: 1.1,
				ease: 'power2.out',
				scrollTo: { y: target, autoKill: true }
			});

			history.pushState(null, '', link.getAttribute('href'));
		});
	});
});
