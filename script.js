(() => {
  const PIXEL_ID = '2262084207888344';
  const CONSENT_KEY = 'rotina-segura-meta-consent';

  const scrollMilestones = [50, 75, 90];
  const sentScrollMilestones = new Set();

  let trackingStarted = false;

  function trackCustom(eventName, parameters = {}) {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, parameters);
    }
  }

  function loadMetaPixel() {
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;

        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
        };

        if (!f._fbq) f._fbq = n;

        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];

        t = b.createElement(e);
        t.async = true;
        t.src = v;

        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    }

    window.fbq('init', PIXEL_ID);
  }

  function startTracking() {
    if (trackingStarted) return;

    trackingStarted = true;

    loadMetaPixel();

    window.fbq('track', 'PageView');

    window.fbq('track', 'ViewContent', {
      content_name: 'Rotina Segura para Body Piercers',
      content_category: 'Produto digital',
      content_type: 'product',
      content_ids: ['rotina-segura-body-piercers'],
      value: 67,
      currency: 'BRL'
    });

    setupCheckoutTracking();
    setupScrollTracking();
    setupSectionTracking();
  }

  function setupCheckoutTracking() {
    const hotmartLinks = document.querySelectorAll(
      'a[href*="pay.hotmart.com"]'
    );

    hotmartLinks.forEach((link) => {
      link.addEventListener('click', () => {
        let location = 'other';

        if (link.classList.contains('btn')) {
          location = 'hero';
        }

        if (link.classList.contains('buy-button')) {
          location = 'price';
        }

        if (link.classList.contains('final-cta-button')) {
          location = 'final_cta';
        }

        trackCustom('ClickCheckout', {
          cta_location: location,
          cta_text: link.textContent.replace(/\s+/g, ' ').trim()
        });
      });
    });
  }

  function setupScrollTracking() {
    function checkScroll() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) return;

      const percentage = Math.round(
        (window.scrollY / scrollableHeight) * 100
      );

      scrollMilestones.forEach((milestone) => {
        if (
          percentage >= milestone &&
          !sentScrollMilestones.has(milestone)
        ) {
          sentScrollMilestones.add(milestone);

          trackCustom('ScrollDepth', {
            percentage: milestone
          });
        }
      });
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  function setupSectionTracking() {
    if (!('IntersectionObserver' in window)) return;

    const sections = [
      { selector: '.offer-section', eventName: 'ViewOffer' },
      { selector: '.price-section', eventName: 'ViewPrice' },
      { selector: '.faq-section', eventName: 'ViewFAQ' }
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackCustom(entry.target.dataset.metaEvent);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20% 0px'
      }
    );

    sections.forEach(({ selector, eventName }) => {
      const section = document.querySelector(selector);

      if (section) {
        section.dataset.metaEvent = eventName;
        observer.observe(section);
      }
    });
  }

  function showConsentBanner() {
    const banner = document.createElement('section');

    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Preferências de cookies');

    banner.innerHTML = `
      <p>
        Usamos cookies de medição e anúncios para entender o desempenho desta
        página. Você pode aceitar ou recusar o rastreamento.
      </p>

      <div class="cookie-consent-actions">
        <button type="button" class="cookie-decline">Recusar</button>
        <button type="button" class="cookie-accept">Aceitar</button>
      </div>
    `;

    document.body.append(banner);

    banner.querySelector('.cookie-accept').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.remove();
      startTracking();
    });

    banner.querySelector('.cookie-decline').addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'denied');
      banner.remove();
    });
  }

  function setupCookieSettings() {
    document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
      button.addEventListener('click', () => {
        localStorage.removeItem(CONSENT_KEY);
        window.location.reload();
      });
    });
  }

  function init() {
    setupCookieSettings();

    const consent = localStorage.getItem(CONSENT_KEY);

    if (consent === 'accepted') {
      startTracking();
    }

    if (!consent) {
      showConsentBanner();
    }
  }

  init();
})();