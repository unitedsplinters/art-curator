/* ── Art Curator · Tweaks panel (vanilla) ─────────────────────────────
   Follows the host edit-mode protocol. Defaults wrapped in EDITMODE
   markers so the host can persist edits to disk.
─────────────────────────────────────────────────────────────────────── */
(function(){
  const TWEAKS = /*EDITMODE-BEGIN*/{
    "headlineFont": "Instrument Serif",
    "accent": "#E8E455",
    "cursor": true,
    "showDemo": true
  }/*EDITMODE-END*/;

  const FONTS = [
    { id: "Instrument Serif", stack: "'Instrument Serif', serif",  hint: "Aa" },
    { id: "Bodoni Moda",      stack: "'Bodoni Moda', serif",       hint: "Aa" },
    { id: "Newsreader",       stack: "'Newsreader', serif",        hint: "Aa" },
    { id: "Italiana",         stack: "'Italiana', serif",          hint: "Aa" },
    { id: "Fraunces",         stack: "'Fraunces', serif",          hint: "Aa" }
  ];
  const ACCENTS = [
    { id: "#E8E455", name: "Cytrynowy" },
    { id: "#C8873A", name: "Ochra" },
    { id: "#3A6647", name: "Mech" },
    { id: "#C04A3A", name: "Cynober" },
    { id: "#7A6BD6", name: "Fiolet" }
  ];

  function apply(){
    const f = FONTS.find(x => x.id === TWEAKS.headlineFont) || FONTS[0];
    document.documentElement.style.setProperty('--font-display', f.stack);
    document.documentElement.style.setProperty('--accent', TWEAKS.accent);
    document.body.classList.toggle('no-cursor', !TWEAKS.cursor);
    document.body.classList.toggle('hide-demo', !TWEAKS.showDemo);
  }

  function persist(patch){
    Object.assign(TWEAKS, patch);
    apply();
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
    rebuild();
  }

  // ── Panel chrome ────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'ac-tweaks';
  panel.innerHTML = `
    <div class="ac-tw-head">
      <span class="ac-tw-title">Tweaks</span>
      <button class="ac-tw-close" aria-label="Zamknij">×</button>
    </div>
    <div class="ac-tw-body"></div>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector('.ac-tw-body');

  function section(label, html){
    return `<section class="ac-tw-section">
      <div class="ac-tw-label">${label}</div>
      ${html}
    </section>`;
  }

  function rebuild(){
    body.innerHTML =
      section('Czcionka nagłówków',
        `<div class="ac-tw-grid">
          ${FONTS.map(f => `
            <button class="ac-tw-font ${TWEAKS.headlineFont === f.id ? 'on':''}"
                    data-font="${f.id}" style="font-family:${f.stack}">
              <span class="ac-tw-font-hint">${f.hint}</span>
              <span class="ac-tw-font-name">${f.id}</span>
            </button>`).join('')}
        </div>`
      ) +
      section('Akcent',
        `<div class="ac-tw-swatches">
          ${ACCENTS.map(c => `
            <button class="ac-tw-sw ${TWEAKS.accent === c.id ? 'on':''}"
                    data-accent="${c.id}" title="${c.name}">
              <span style="background:${c.id}"></span>
            </button>`).join('')}
        </div>`
      ) +
      section('Interakcje',
        `<label class="ac-tw-toggle">
          <span>Kursor</span>
          <input type="checkbox" data-toggle="cursor" ${TWEAKS.cursor?'checked':''}>
          <span class="ac-tw-track"></span>
        </label>
        <label class="ac-tw-toggle">
          <span>Demo swipe</span>
          <input type="checkbox" data-toggle="showDemo" ${TWEAKS.showDemo?'checked':''}>
          <span class="ac-tw-track"></span>
        </label>`
      );

    body.querySelectorAll('[data-font]').forEach(b => {
      b.addEventListener('click', () => persist({ headlineFont: b.dataset.font }));
    });
    body.querySelectorAll('[data-accent]').forEach(b => {
      b.addEventListener('click', () => persist({ accent: b.dataset.accent }));
    });
    body.querySelectorAll('[data-toggle]').forEach(b => {
      b.addEventListener('change', () => persist({ [b.dataset.toggle]: b.checked }));
    });
  }

  // ── Edit-mode protocol ─────────────────────────────────────────────
  function show(){ panel.classList.add('on'); }
  function hide(){
    panel.classList.remove('on');
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  }

  window.addEventListener('message', e => {
    const t = e.data && e.data.type;
    if (t === '__activate_edit_mode')   show();
    if (t === '__deactivate_edit_mode') hide();
  });

  panel.querySelector('.ac-tw-close').addEventListener('click', hide);

  apply();
  rebuild();

  // Tell host we're ready
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');
})();
