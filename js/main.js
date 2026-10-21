/* Music & Mind — main.js. Vanilla, zero dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ------------------------------------------------------------------
   * CONFIG — Phase 2: paste the published Google Sheet CSV URL below
   * (File > Share > Publish to web > CSV). Leave '' to use the embedded
   * SERVICES_CSV. Sheet columns must match the header row of SERVICES_CSV.
   * ---------------------------------------------------------------- */
  const SERVICES_SHEET_URL = '';
  const CACHE_MINUTES = 10;

  const SERVICES_CSV = `order,slug,title,icon,summary,points,cta_label,cta_href,active
1,performance-anxiety,Performance anxiety,mic,"Performance anxiety can affect musicians at every stage of their career, from emerging artists to established performers. We offer specialist psychological support to help you understand and manage anxiety, confidence difficulties and the pressures of performing.","Understanding what happens in mind and body before you perform|Working with perfectionism and fear of judgement|Building confidence for solo, band and DJ performance|Support around auditions, showcases and big occasions",Book a consultation,contact.html?topic=performance-anxiety,TRUE
2,burnout,Burnout,battery,"Burnout can develop when the demands of music, work and life become overwhelming. We offer psychological support to help musicians and music industry professionals understand the causes of burnout, manage stress and develop healthier ways of working and living.","Recognising the early signs of exhaustion and overload|Setting boundaries in an always-on, project-driven industry|Rebuilding rest, routine and a sustainable creative rhythm|Reconnecting with why you make music",Book a consultation,contact.html?topic=burnout,TRUE
3,neurodivergence,Neurodivergence,sparkle,"Neurodivergence can shape how people experience work, relationships, creativity and the demands of the music industry. We offer support for musicians and music industry professionals who want to better understand themselves and develop ways of managing the challenges they experience.","Making sense of how your mind works in creative environments|Managing sensory, time and energy demands|Strengths-based support for work and relationships|Coaching alongside psychotherapy where helpful",Book a consultation,contact.html?topic=neurodivergence,TRUE
4,addiction,Addiction,lifebuoy,"Addiction and problematic substance use can be closely connected with the pressures, lifestyle and culture of working in music. We provide psychological support to help you understand your relationship with substances or addictive behaviours and explore healthier ways of coping.","Exploring the role substances or behaviours play in your life|Understanding the culture and pressures around music and use|A non-judgemental space to talk openly|Developing healthier ways of coping",Book a consultation,contact.html?topic=addiction,TRUE
5,fame-and-celebrity,Fame and celebrity,star,"Fame and public visibility can bring particular psychological pressures, including changes in identity, privacy, relationships and expectations. We offer a confidential space to make sense of life in the public eye.","Navigating identity and the gap between public and private self|Managing scrutiny, social media and online abuse|Protecting relationships and personal boundaries|Coping with sudden success or the loss of it",Book a consultation,contact.html?topic=fame-and-celebrity,TRUE
6,occupational-relationships,Occupational relationships,users,"Working relationships in music are often intense, with bandmates, managers, labels and collaborators sharing both personal and professional lives. We help you navigate conflict and communication where those roles overlap.","Untangling friendship from business within bands and teams|Communicating clearly under pressure|Working through conflict, resentment and loss of trust|Support with difficult industry dynamics",Book a consultation,contact.html?topic=occupational-relationships,TRUE
7,self-esteem,Self-esteem,heart,"Confidence and self-worth can be tested by constant comparison, criticism and uncertainty. We offer support with self-esteem, imposter syndrome and the effects of criticism on creative identity.","Working with the inner critic and imposter syndrome|Handling reviews, rejection and comparison|Separating your worth from your last gig or release|Building a steadier sense of self",Book a consultation,contact.html?topic=self-esteem,TRUE
8,touring,Touring,pin,"Touring brings its own mental health demands, including disrupted routines, poor sleep, isolation and time away from home. We help musicians and crew prepare for and recover from life on the road.",Preparing for tour: routines\\, sleep and support|Coping with isolation and being away from loved ones|Managing the highs and lows of life on the road|Returning home and readjusting after tour,Book a consultation,contact.html?topic=touring,TRUE
9,consultancy-psychoeducation-cpd,"Consultancy, psychoeducation & CPD",deck,"For organisations, educators and professionals working in music and the creative industries: mental health education, psychological consultation, research and content development, delivered by clinicians who know the sector.",Workshops\\, talks and CPD for teams and institutions|Psychological consultation for music organisations|Research\\, content and resource development|Mental health awareness for educators and managers,Enquire about consultancy,contact.html?topic=consultancy,TRUE
`;

  const ICONS = {
    mic: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/>',
    battery: '<rect x="2" y="8" width="17" height="9" rx="2"/><path d="M22 11v3M6 12.5h3"/>',
    sparkle: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.8 0 5 2 5 5"/>',
    heart: '<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
    pin: '<path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
    deck: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8M7 11l3-3 3 2 4-4"/>'
  };

  /* ---------- Minimal RFC-4180 CSV parser (quotes, escaped quotes, newlines) ---------- */
  function parseCSV(text) {
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cur); cur = ''; rows.push(row); row = [];
      } else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    const head = rows.shift().map(h => h.trim().toLowerCase());
    return rows.filter(r => r.some(v => v.trim())).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
  }

  async function loadCSV(url) {
    const key = 'mm:csv:' + url;
    try {
      const hit = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (hit && Date.now() - hit.t < CACHE_MINUTES * 6e4) return hit.v;
    } catch (_) {}
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
    try {
      const res = await fetch(url, { signal: ctl.signal });
      if (!res.ok) throw new Error(res.status);
      const v = await res.text();
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch (_) {}
      return v;
    } finally { clearTimeout(t); }
  }

  const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const splitPoints = s => s.split(/(?<!\\)\|/).map(p => p.replace(/\\,/g, ',').trim()).filter(Boolean);

  function serviceCard(s, i, compact) {
    const pts = compact ? '' : `<ul>${splitPoints(s.points || '').map(p => `<li>${esc(p)}</li>`).join('')}</ul>`;
    const cta = compact
      ? `<a class="link-arrow" href="services.html#${esc(s.slug)}">Learn more</a>`
      : `<a class="btn ghost sm" href="${esc(s.cta_href || 'contact.html')}">${esc(s.cta_label || 'Enquire')}</a>`;
    return `<article class="card svc-card reveal"${compact ? '' : ` id="${esc(s.slug)}"`} style="--i:${i % 2}">
      <div class="icon" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[s.icon] || ICONS.sparkle}</svg></div>
      <h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p>${pts}${cta}</article>`;
  }

  async function initServices() {
    const hosts = $$('[data-services]');
    if (!hosts.length) return;
    let rows;
    try {
      const text = SERVICES_SHEET_URL ? await loadCSV(SERVICES_SHEET_URL) : SERVICES_CSV;
      rows = parseCSV(text);
    } catch (e) { console.warn('Sheet load failed, using embedded data', e); rows = parseCSV(SERVICES_CSV); }
    rows = rows.filter(r => !/^(false|no|0)$/i.test(r.active || 'true')).sort((a, b) => (+a.order || 99) - (+b.order || 99));
    hosts.forEach(h => {
      const limit = +h.dataset.limit || rows.length, compact = h.hasAttribute('data-compact');
      h.innerHTML = rows.slice(0, limit).map((s, i) => serviceCard(s, i, compact)).join('');
      h.removeAttribute('aria-busy');
      observeReveals(h);
      if (location.hash) { const t = document.getElementById(location.hash.slice(1)); t && t.scrollIntoView(); }
    });
    document.dispatchEvent(new CustomEvent('services:ready'));
  }

  /* ---------- Header: menu, measured height ---------- */
  function initHeader() {
    const header = $('.site-header'), btn = $('.menu-btn'), nav = $('#nav');
    if (header) {
      const set = () => document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
      set(); new ResizeObserver(set).observe(header);
    }
    if (!btn || !nav) return;
    const toggle = open => { nav.dataset.open = open; btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', () => toggle(nav.dataset.open !== 'true'));
    nav.addEventListener('click', e => e.target.closest('a') && toggle(false));
    document.addEventListener('keydown', e => e.key === 'Escape' && toggle(false));
    document.addEventListener('click', e => !e.target.closest('.mainbar') && toggle(false));
  }

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  let revealIO;
  function observeReveals(root = document) {
    if (!('IntersectionObserver' in window)) { $$('.reveal', root).forEach(el => el.classList.add('in')); return; }
    revealIO ||= new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal:not(.in)', root).forEach(el => revealIO.observe(el));
  }

  /* ---------- Scrollspy for the in-page sub navigation ---------- */
  function initScrollspy() {
    const links = $$('.subnav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = new Map(links.map(a => [a.hash.slice(1), a]));
    const targets = [...map.keys()].map(id => document.getElementById(id)).filter(Boolean);
    const visible = new Set();
    const mark = id => links.forEach(a => {
      const on = a.hash.slice(1) === id; a.classList.toggle('active', on);
      on ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current');
      if (on) { const bar = a.parentElement; bar.scrollTo({ left: a.offsetLeft - bar.clientWidth / 3, behavior: 'smooth' }); }
    });
    const io = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id));
      const first = targets.find(t => visible.has(t.id)); if (first) mark(first.id);
    }, { rootMargin: `-${(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 100) + 8}px 0px -55% 0px` });
    targets.forEach(t => io.observe(t));
  }

  /* ---------- <dialog> lightbox (images + video) ---------- */
  function initLightbox() {
    const dlg = $('#lightbox'); if (!dlg) return;
    const body = $('.lb-body', dlg), cap = $('.lb-cap', dlg);
    const items = $$('[data-lightbox]'); let idx = 0;
    const show = i => {
      idx = (i + items.length) % items.length; const it = items[idx];
      if (it.dataset.video) {
        body.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(it.dataset.video)}?autoplay=1&rel=0" title="${esc(it.dataset.caption || 'Video')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      } else body.innerHTML = `<img src="${esc(it.dataset.src)}" alt="${esc(it.dataset.caption || '')}">`;
      cap.textContent = it.dataset.caption || '';
    };
    items.forEach((it, i) => it.addEventListener('click', () => { show(i); dlg.showModal(); document.documentElement.style.overflow = 'hidden'; }));
    dlg.addEventListener('close', () => { body.innerHTML = ''; document.documentElement.style.overflow = ''; });
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.matches('.lb-close')) dlg.close(); });
    $('.lb-prev', dlg).addEventListener('click', () => show(idx - 1));
    $('.lb-next', dlg).addEventListener('click', () => show(idx + 1));
    dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  }

  /* ---------- Press filter ---------- */
  function initFilter() {
    const bar = $('.filter'); if (!bar) return;
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', bar).forEach(x => x.setAttribute('aria-pressed', x === b));
      $$('.press li').forEach(li => li.hidden = b.dataset.cat !== 'all' && li.dataset.cat !== b.dataset.cat);
    });
  }

  /* ---------- Contact form (Formspree, progressive enhancement) ---------- */
  function initForm() {
    const form = $('#contact-form'); if (!form) return;
    const status = $('.status', form), btn = $('button[type=submit]', form);
    const topic = new URLSearchParams(location.search).get('topic');
    if (topic) { const sel = $('[name=topic]', form); const opt = sel && $(`option[value="${CSS.escape(topic)}"]`, sel); if (opt) sel.value = topic; }
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      btn.disabled = true; const label = btn.textContent; btn.textContent = 'Sending…';
      status.className = 'status'; status.textContent = '';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.status);
        form.reset(); status.className = 'status ok'; status.textContent = 'Thanks! Message sent. We will get back to you soon.';
      } catch (err) {
        status.className = 'status err'; status.textContent = 'Sorry, that did not send. Please try again, or email us directly.';
      } finally { btn.disabled = false; btn.textContent = label; }
    });
  }

  function init() {
    initHeader(); initServices(); observeReveals(); initScrollspy(); initLightbox(); initFilter(); initForm();
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
