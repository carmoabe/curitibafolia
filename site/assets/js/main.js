/* =========================================================
   CURITIBA FOLIA — LP FORMÔ
   Ajuste aqui os dados comerciais da campanha.
   ========================================================= */
const CONFIG = {
  // URL do checkout / plataforma de venda. Enquanto estiver vazio,
  // os botões apenas rolam até a seção de oferta.
  CHECKOUT_URL: '',
  // Data do evento (contagem regressiva). Mês começa em 0 → 11 = dezembro.
  EVENT_DATE: new Date(2026, 11, 12, 14, 0, 0),
  // Texto do selo de lote no card de oferta.
  LOTE_LABEL: 'Lote promocional',
  // Ingressos atravessando a tela: 1ª passagem e intervalo entre elas (ms).
  TICKETS_FLY: { firstDelay: 12000, interval: 25000 }
};

/* ---------- Modo QA: ?qa=1 desliga animações e a altura de tela do hero,
     para conseguir capturar/imprimir a página inteira ---------- */
const QA = new URLSearchParams(location.search).get('qa') === '1';
if (QA) document.documentElement.classList.add('qa');

/* ---------- CTAs ---------- */
document.querySelectorAll('.js-cta').forEach(function (el) {
  if (CONFIG.CHECKOUT_URL) {
    el.setAttribute('href', CONFIG.CHECKOUT_URL);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  } else if (el.id === 'btnCheckout') {
    el.setAttribute('href', '#ingresso');
  }
  el.addEventListener('click', function () {
    // Gancho para pixel / GA4 / GTM:
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'cta_click', cta: el.dataset.cta || 'n/a' });
    }
  });
});

const loteTag = document.getElementById('loteTag');
if (loteTag) loteTag.textContent = CONFIG.LOTE_LABEL;

/* ---------- Vídeo do hero: fonte por tamanho de tela, mudo e em loop ---------- */
(function heroVideo() {
  const v = document.getElementById('heroVideo');
  if (!v) return;

  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Em "economia de dados" ou "reduzir movimento", fica só o poster.
  if (saveData || reduce) return;

  v.src = mobile ? v.dataset.mobile : v.dataset.desktop;
  v.muted = true;            // exigido para autoplay
  v.setAttribute('muted', '');
  v.load();

  const play = () => v.play().catch(() => {});
  play();
  // alguns navegadores só liberam o autoplay depois de uma interação
  ['touchstart', 'click', 'scroll'].forEach(ev =>
    window.addEventListener(ev, play, { once: true, passive: true })
  );

  // pausa quando o hero sai da tela (economiza bateria/CPU)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      es.forEach(e => (e.isIntersecting ? play() : v.pause()));
    }, { threshold: 0.01 }).observe(v);
  }
})();

/* ---------- Contagem regressiva ---------- */
(function countdown() {
  const box = document.getElementById('countdown');
  if (!box) return;
  const out = {
    d: box.querySelector('[data-cd="d"]'),
    h: box.querySelector('[data-cd="h"]'),
    m: box.querySelector('[data-cd="m"]'),
    s: box.querySelector('[data-cd="s"]')
  };
  const pad = n => String(n).padStart(2, '0');

  function tick() {
    let diff = CONFIG.EVENT_DATE - new Date();
    if (diff <= 0) {
      box.querySelector('.countdown__lb').textContent = 'É hoje! A folia começou';
      Object.values(out).forEach(el => (el.textContent = '00'));
      return;
    }
    const s = Math.floor(diff / 1000);
    out.d.textContent = pad(Math.floor(s / 86400));
    out.h.textContent = pad(Math.floor((s % 86400) / 3600));
    out.m.textContent = pad(Math.floor((s % 3600) / 60));
    out.s.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Topbar + CTA fixo ---------- */
(function stickies() {
  const bar = document.getElementById('topbar');
  const sticky = document.getElementById('stickybar');
  const oferta = document.getElementById('ingresso');
  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;
    bar.classList.toggle('is-on', y > 620);

    // esconde o CTA fixo quando a própria seção de oferta está visível
    let inOffer = false;
    if (oferta) {
      const r = oferta.getBoundingClientRect();
      inOffer = r.top < window.innerHeight * 0.75 && r.bottom > 0;
    }
    sticky.classList.toggle('is-on', y > 900 && !inOffer);
    lastY = y;
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------- Reveal on scroll ---------- */
(function reveal() {
  if (QA) return;
  const targets = document.querySelectorAll(
    '.s .wrap > *, .card, .benefit, .glass, .ticket, .facts div, .lineup__art'
  );
  targets.forEach(t => t.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('is-in'), Math.min(i * 60, 240));
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  targets.forEach(t => io.observe(t));
})();

/* ---------- Ingressos atravessando a tela ---------- */
(function ticketsFly() {
  const fly = document.getElementById('fly');
  if (!fly || QA) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const go = fly.querySelector('.fly__go');
  const rand = (a, b) => a + Math.random() * (b - a);

  function pass() {
    if (document.hidden || fly.classList.contains('is-flying')) return;

    // cada passagem entra numa altura, num tamanho e num giro diferentes
    const sentido = Math.random() < 0.5 ? -1 : 1;
    const giro = rand(190, 280) * sentido;          // giro lento: menos de uma volta
    const inicio = rand(-25, 25);
    fly.style.setProperty('--fly-top', rand(12, 62) + '%');
    const largura = Math.max(
      Math.min(300, window.innerWidth * 0.8),          // piso, sem estourar telas pequenas
      Math.min(780, window.innerWidth * rand(0.45, 0.66))
    );
    fly.style.setProperty('--fly-w', Math.round(largura) + 'px');
    fly.style.setProperty('--fly-dur', rand(2.9, 3.6).toFixed(2) + 's');
    fly.style.setProperty('--fly-r0', inicio.toFixed(1) + 'deg');
    fly.style.setProperty('--fly-r1', (inicio + giro).toFixed(1) + 'deg');

    fly.classList.add('is-flying');
    go.addEventListener('animationend', () => fly.classList.remove('is-flying'), { once: true });
  }

  setTimeout(() => {
    pass();
    setInterval(pass, CONFIG.TICKETS_FLY.interval);
  }, CONFIG.TICKETS_FLY.firstDelay);
})();

/* ---------- Trio elétrico: só roda quando a seção está na tela ---------- */
(function trio() {
  const sec = document.getElementById('experiencia');
  if (!sec || !('IntersectionObserver' in window)) {
    if (sec) sec.classList.add('is-rolling');
    return;
  }
  new IntersectionObserver(entries => {
    entries.forEach(e => sec.classList.toggle('is-rolling', e.isIntersecting));
  }, { threshold: 0.08 }).observe(sec);
})();

/* ---------- FAQ: abre um por vez ---------- */
document.querySelectorAll('.faq details').forEach(function (d) {
  d.addEventListener('toggle', function () {
    if (d.open) {
      document.querySelectorAll('.faq details').forEach(function (o) {
        if (o !== d) o.open = false;
      });
    }
  });
});
