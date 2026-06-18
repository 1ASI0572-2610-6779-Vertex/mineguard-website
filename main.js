/* ══════════════════════════════════════════════════
   MINEGUARD — main.js
══════════════════════════════════════════════════ */

/* ── REGISTRATION MODAL ────────────────────────── */

const API_BASE_URL = 'http://localhost:8080';

let _currentLangData = {};

/* PLAN DEFINITIONS — calculator source of truth */
const PLANS = [
  {
    key: 'starter',
    nameKey: 'register.rec-starter-name',
    price: '$250',
    threshold: 49,
  },
  {
    key: 'standard',
    nameKey: 'register.rec-standard-name',
    price: '$499',
    threshold: 200,
  },
  {
    key: 'enterprise',
    nameKey: 'register.rec-enterprise-name',
    price: '$899',
    threshold: Infinity,
  },
];

/* ── i18n helper ────────────────────────────────── */
function t(key) {
  const dot = key.indexOf('.');
  const section = key.slice(0, dot);
  const value = key.slice(dot + 1);
  return (_currentLangData[section] && _currentLangData[section][value]) || '';
}

/* ── API — FIREWALL: ONLY 3 FIELDS SENT ─────────── */
async function registerCompany(companyName, adminFullName, adminEmail) {
  const res = await fetch(`${API_BASE_URL}/api/v1/subscriptions/company-registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName, adminFullName, adminEmail }),
  });
  if (!res.ok) {
    const err = new Error('API_ERROR');
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/* ── CALCULATOR ─────────────────────────────────── */
function calcRecommendedPlan(fleetSize) {
  return PLANS.find(p => fleetSize <= p.threshold) || PLANS[PLANS.length - 1];
}

function updatePlanCard() {
  const fleetSize = parseInt(document.getElementById('reg-fleet-size').value, 10);
  const card = document.getElementById('reg-rec-card');
  const nameEl = document.getElementById('reg-rec-name');
  const priceEl = document.getElementById('reg-rec-price');
  const fleetDisplay = document.getElementById('fleet-size-display');
  const operatorDisplay = document.getElementById('operator-count-display');

  fleetDisplay.textContent = document.getElementById('reg-fleet-size').value;
  operatorDisplay.textContent = document.getElementById('reg-operator-count').value;

  const plan = calcRecommendedPlan(fleetSize);
  const prevPlan = card.dataset.plan;

  if (prevPlan !== plan.key) {
    card.dataset.plan = plan.key;
    /* brief pop animation on plan change */
    card.classList.remove('plan-pop');
    void card.offsetWidth;
    card.classList.add('plan-pop');
  }

  nameEl.textContent = t(plan.nameKey) || plan.nameKey.split('.').pop();
  priceEl.innerHTML = `${plan.price}<small>/mo</small>`;
}

function refreshPlanCardTranslations() {
  const card = document.getElementById('reg-rec-card');
  if (!card) return;
  const fleetSize = parseInt(document.getElementById('reg-fleet-size').value, 10);
  const plan = calcRecommendedPlan(fleetSize);
  document.getElementById('reg-rec-name').textContent = t(plan.nameKey) || plan.nameKey.split('.').pop();
}

/* ── MODAL LIFECYCLE ────────────────────────────── */
function openRegistrationModal(plan) {
  resetRegModal();

  const overlay = document.getElementById('reg-modal');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  /* Pre-seed sliders to match the plan the user clicked */
  if (plan === 'starter') {
    document.getElementById('reg-fleet-size').value = 25;
  } else if (plan === 'standard') {
    document.getElementById('reg-fleet-size').value = 100;
  } else if (plan === 'enterprise') {
    document.getElementById('reg-fleet-size').value = 250;
  }

  updatePlanCard();

  setTimeout(() => document.getElementById('reg-fleet-size').focus(), 320);
}

function closeRegistrationModal() {
  const overlay = document.getElementById('reg-modal');
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function resetRegModal() {
  const form = document.getElementById('reg-form');
  const success = document.getElementById('reg-success');
  const apiErr = document.getElementById('reg-api-err');
  const submit = document.getElementById('reg-submit');
  const btnText = document.getElementById('reg-btn-text');

  form.reset();
  form.style.display = '';
  success.style.display = 'none';
  apiErr.style.display = 'none';
  apiErr.textContent = '';
  submit.disabled = false;
  submit.classList.remove('is-loading');
  btnText.textContent = t('register.submit') || 'Register Company';

  ['company-name', 'admin-name', 'admin-email'].forEach(field => {
    const input = document.getElementById('reg-' + field);
    const errSpan = document.getElementById('err-' + field);
    if (input) input.classList.remove('has-error');
    if (errSpan) errSpan.textContent = '';
  });
}

function validateRegForm() {
  const companyName = document.getElementById('reg-company-name');
  const adminName = document.getElementById('reg-admin-name');
  const adminEmail = document.getElementById('reg-admin-email');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let valid = true;

  [
    { input: companyName, errId: 'err-company-name', check: v => v.trim().length > 0 },
    { input: adminName,   errId: 'err-admin-name',   check: v => v.trim().length > 0 },
    { input: adminEmail,  errId: 'err-admin-email',  check: v => v.trim().length > 0 },
  ].forEach(({ input, errId, check }) => {
    const span = document.getElementById(errId);
    input.classList.remove('has-error');
    span.textContent = '';
    if (!check(input.value)) {
      input.classList.add('has-error');
      span.textContent = t('register.err-required');
      valid = false;
    }
  });

  if (valid && !emailRe.test(adminEmail.value.trim())) {
    adminEmail.classList.add('has-error');
    document.getElementById('err-admin-email').textContent = t('register.err-email');
    valid = false;
  }

  return valid;
}

/* ── INIT ───────────────────────────────────────── */
function initRegistrationModal() {
  const overlay  = document.getElementById('reg-modal');
  const form     = document.getElementById('reg-form');
  const fleetSlider    = document.getElementById('reg-fleet-size');
  const operatorSlider = document.getElementById('reg-operator-count');

  /* Calculator — live updates */
  fleetSlider.addEventListener('input', updatePlanCard);
  operatorSlider.addEventListener('input', updatePlanCard);

  /* Close triggers */
  document.getElementById('reg-close').addEventListener('click', closeRegistrationModal);
  document.getElementById('reg-success-close').addEventListener('click', closeRegistrationModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeRegistrationModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeRegistrationModal();
  });

  /* Submit */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateRegForm()) return;

    const submit  = document.getElementById('reg-submit');
    const btnText = document.getElementById('reg-btn-text');
    const apiErr  = document.getElementById('reg-api-err');
    const success = document.getElementById('reg-success');

    submit.disabled = true;
    submit.classList.add('is-loading');
    btnText.textContent = t('register.submitting') || 'Registering...';
    apiErr.style.display = 'none';

    /* ── TAREA 4 FIREWALL: calculator fields are intentionally omitted ── */
    const companyName  = document.getElementById('reg-company-name').value.trim();
    const adminFullName = document.getElementById('reg-admin-name').value.trim();
    const adminEmail   = document.getElementById('reg-admin-email').value.trim();

    try {
      await registerCompany(companyName, adminFullName, adminEmail);
      form.style.display = 'none';
      success.style.display = '';
    } catch (err) {
      submit.disabled = false;
      submit.classList.remove('is-loading');
      btnText.textContent = t('register.submit') || 'Register Company';
      apiErr.style.display = '';
      apiErr.textContent = err.status === 409
        ? t('register.err-conflict')
        : t('register.err-api');
    }
  });

  updatePlanCard();
  applyPlaceholders();
}

function applyPlaceholders() {
  document.querySelectorAll('[data-section-ph]').forEach(el => {
    const section = el.dataset.sectionPh;
    const value   = el.dataset.valuePh;
    if (_currentLangData[section] && _currentLangData[section][value]) {
      el.placeholder = _currentLangData[section][value];
    }
  });
}

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
        _currentLangData = data;
        textsToChange.forEach(el => {
          const section = el.dataset.section;
          const value = el.dataset.value;
          if (data[section] && data[section][value] !== undefined) {
            el.innerHTML = data[section][value];
          }
        });
        applyPlaceholders();
        refreshPlanCardTranslations();
      })
      .catch(() => { });
  }

  const savedLang = localStorage.getItem('mg-lang') || 'en';
  applyLanguage(savedLang);

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.language;
      localStorage.setItem('mg-lang', lang);
      applyLanguage(lang);
    });
  });

  initRegistrationModal();
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
