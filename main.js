/* ══════════════════════════════════════════════════
   MINEGUARD — main.js
══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initGSAP();
  }
  initThemeToggle();

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.borderBottomColor = 'rgba(252,181,2,0.2)';
      navbar.style.background = 'rgba(10,10,10,0.96)';
    } else {
      navbar.style.borderBottomColor = 'rgba(255,255,255,0.07)';
      navbar.style.background = 'rgba(14,14,14,0.88)';
    }
  });

  const clockEl = document.getElementById('dash-clock');
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}:${s} UTC`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  const counters = document.querySelectorAll('.counter');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  initAlertFeed();

  const langButtons = document.querySelectorAll('[data-language]');
  const textsToChange = document.querySelectorAll('[data-section]');

  function applyLanguage(lang) {
    langButtons.forEach(b => b.classList.toggle('active', b.dataset.language === lang));
    fetch(`i18n/${lang}.json`)
      .then(res => res.json())
      .then(data => {
        textsToChange.forEach(el => {
          const section = el.dataset.section;
          const value = el.dataset.value;
          if (data[section] && data[section][value] !== undefined) {
            el.innerHTML = data[section][value];
          }
        });
      })
      .catch(() => { });
  }

  const savedLang = localStorage.getItem('mg-lang') || 'en';
  if (savedLang !== 'en') applyLanguage(savedLang);

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.language;
      localStorage.setItem('mg-lang', lang);
      applyLanguage(lang);
    });
  });

  initVideoFacades();

  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item[open]').forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

});

function initGSAP() {

  gsap.utils.toArray('.fade-up').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      }
    });
  });

}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const saved = localStorage.getItem('mg-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mg-theme', next);
  });
}

function initVideoFacades() {
  document.querySelectorAll('.video-facade').forEach(facade => {
    facade.querySelector('.vf-play-btn').addEventListener('click', () => {
      const videoId = facade.dataset.videoId;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
      iframe.title = facade.querySelector('.vf-label')?.textContent || 'Video';
      facade.replaceWith(iframe);
    });
  });
}

function initAlertFeed() {
  const feed = document.querySelector('.dash-alert-feed');
  if (!feed) return;

  const pool = [
    { type: 'critical', text: 'LV-09 proximity — Zone C7' },
    { type: 'warning', text: 'Speed limit exceeded — AT-03' },
    { type: 'info', text: 'Corridor C3 route updated' },
    { type: 'resolved', text: 'Zone A2 alert resolved' },
    { type: 'critical', text: 'LV-04 entering autonomous lane' },
    { type: 'warning', text: 'Fatigue flag — LV-11 driver' },
    { type: 'info', text: 'New IoT node registered — N08' },
    { type: 'resolved', text: 'AT-01 corridor clear' },
  ];

  let poolIndex = 4;

  setInterval(() => {
    const items = feed.querySelectorAll('.daf-item');
    if (items.length === 0) return;

    const entry = pool[poolIndex % pool.length];
    poolIndex++;

    items[items.length - 1].remove();

    const header = feed.querySelector('.daf-header');
    const newItem = document.createElement('div');
    newItem.className = `daf-item ${entry.type}`;
    newItem.innerHTML = `
      <span class="daf-badge ${entry.type}">${entry.type === 'resolved' ? 'OK' : entry.type.toUpperCase().slice(0, 4)}</span>
      <span class="daf-text">${entry.text}</span>`;
    newItem.style.opacity = '0';
    newItem.style.transform = 'translateY(-8px)';
    newItem.style.transition = 'opacity 0.4s, transform 0.4s';

    if (header && header.nextSibling) {
      feed.insertBefore(newItem, header.nextSibling);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0)';
      });
    });
  }, 3800);
}
