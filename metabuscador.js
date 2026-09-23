/**
 * Lógica del Metabuscador de Apuntes y PDFs en Tiempo Real
 * Grado en Ingeniería del Software (Plan 2023) - Universidad de Málaga
 */

document.addEventListener('DOMContentLoaded', () => {
  const engineSubjectSelect = document.getElementById('engineSubjectSelect');
  const engineCustomQuery = document.getElementById('engineCustomQuery');
  const btnExecuteLiveSearch = document.getElementById('btnExecuteLiveSearch');
  const engineSourceTabs = document.querySelectorAll('#engineSourceTabs .engine-source-tab');
  const presetChips = document.querySelectorAll('.preset-chip');
  const liveBridgeResultsGrid = document.getElementById('liveBridgeResultsGrid');

  // Modal Escáner en Vivo
  const liveScannerModal = document.getElementById('liveScannerModal');
  const liveScannerModalCloseBtn = document.getElementById('liveScannerModalCloseBtn');
  const liveScannerModalTitle = document.getElementById('liveScannerModalTitle');
  const liveScannerModalBody = document.getElementById('liveScannerModalBody');

  // Estado del metabuscador
  const engineState = {
    source: 'all',
    subjectId: 'all',
    query: ''
  };

  // Leer parámetros de URL si vienen de index.html (?subject=101&q=...)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('subject')) {
    engineState.subjectId = urlParams.get('subject');
  }
  if (urlParams.has('q')) {
    engineState.query = urlParams.get('q');
    if (engineCustomQuery) engineCustomQuery.value = engineState.query;
  }
  if (urlParams.has('source')) {
    engineState.source = urlParams.get('source');
  }

  // Inicialización
  function init() {
    populateSubjectSelect();
    setupTabs();
    setupInputs();
    setupModalListeners();
    renderEngineCards();
  }

  function getSubjectById(subjectId) {
    if (typeof DEGREE_SUBJECTS !== 'undefined') {
      for (const [degId, list] of Object.entries(DEGREE_SUBJECTS)) {
        const found = list.find(s => s.id === subjectId);
        if (found) {
          if (!found.communityId && typeof ETSI_DEGREES !== 'undefined') {
            const deg = ETSI_DEGREES.find(d => d.id === degId);
            if (deg) found.communityId = deg.communityId;
          }
          return found;
        }
      }
    }
    if (typeof SUBJECTS_DATA !== 'undefined') {
      const found = SUBJECTS_DATA.find(s => s.id === subjectId);
      if (found) {
        if (!found.communityId) found.communityId = 13891;
        return found;
      }
    }
    return null;
  }

  function populateSubjectSelect() {
    if (!engineSubjectSelect) return;
    let optionsHtml = '<option value="all">Todas las Asignaturas (Buscar en todo el Catálogo ETSI)</option>';

    if (typeof DEGREE_SUBJECTS !== 'undefined' && typeof ETSI_DEGREES !== 'undefined') {
      ETSI_DEGREES.forEach(deg => {
        const subs = DEGREE_SUBJECTS[deg.id] || [];
        if (subs.length > 0) {
          optionsHtml += `<optgroup label="${deg.name} (${deg.acronym}) - ${deg.courses} Cursos">`;
          subs.forEach(s => {
            optionsHtml += `<option value="${s.id}" ${s.id === engineState.subjectId ? 'selected' : ''}>[${s.code || deg.acronym}] ${s.name} (${s.acronym || 'Curso ' + s.course})</option>`;
          });
          optionsHtml += `</optgroup>`;
        }
      });
    } else if (typeof SUBJECTS_DATA !== 'undefined') {
      optionsHtml += `<optgroup label="Ingeniería del Software (1º Curso)">`;
      SUBJECTS_DATA.forEach(s => {
        optionsHtml += `<option value="${s.id}" ${s.id === engineState.subjectId ? 'selected' : ''}>[${s.code}] ${s.name} (${s.acronym})</option>`;
      });
      optionsHtml += `</optgroup>`;
    }

    engineSubjectSelect.innerHTML = optionsHtml;
  }

  function setupTabs() {
    engineSourceTabs.forEach(tab => {
      if (tab.dataset.source === engineState.source) {
        engineSourceTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      }
      tab.addEventListener('click', () => {
        engineSourceTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        engineState.source = tab.dataset.source;
        renderEngineCards();
      });
    });
  }

  function setupInputs() {
    if (engineSubjectSelect) {
      engineSubjectSelect.addEventListener('change', (e) => {
        engineState.subjectId = e.target.value;
        renderEngineCards();
      });
    }

    let debounceTimer = null;
    if (engineCustomQuery) {
      engineCustomQuery.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          engineState.query = e.target.value;
          renderEngineCards();
        }, 220);
      });
    }

    if (btnExecuteLiveSearch) {
      btnExecuteLiveSearch.addEventListener('click', () => {
        if (engineCustomQuery) {
          engineState.query = engineCustomQuery.value;
        }
        renderEngineCards();
        showToast("⚡ Rastreador multi-fuente en tiempo real actualizado.");
      });
    }

    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const preset = chip.dataset.preset;
        let queryText = '';
        switch(preset) {
          case 'examenes': queryText = 'Exámenes resueltos parciales'; break;
          case 'teoria': queryText = 'Apuntes teoría temario completo'; break;
          case 'formulario': queryText = 'Formulario chuletario fórmulas'; break;
          case 'practicas': queryText = 'Prácticas laboratorio código'; break;
          case 'recientes': queryText = 'Convocatoria 2024 2025'; break;
          default: queryText = chip.textContent.trim();
        }
        if (engineCustomQuery) {
          engineCustomQuery.value = queryText;
        }
        engineState.query = queryText;
        renderEngineCards();
        showToast(`Filtro aplicado: ${chip.textContent.trim()}`);
      });
    });
  }

  function renderEngineCards() {
    if (!liveBridgeResultsGrid) return;

    const selectedSub = getSubjectById(engineState.subjectId);
    const subName = selectedSub ? selectedSub.name : 'ETSI Informática UMA';
    const subAcronym = selectedSub ? (selectedSub.acronym || 'ETSI') : 'Todos los Grados';
    const queryTrim = engineState.query.trim();

    const cards = [];

    // 1. WUOLAH EN VIVO
    if (engineState.source === 'all' || engineState.source === 'wuolah') {
      const wuolahTargetUrl = selectedSub 
        ? selectedSub.wuolahDirectUrl 
        : 'https://wuolah.com/uma-escuela-tecnica-superior-ingenieria-informatic';
      
      cards.push({
        sourceBadge: '⚡ Wuolah en Vivo',
        sourceBadgeClass: 'badge-wuolah-live',
        formatTag: 'Comunidad UMA',
        title: selectedSub ? `Canal en Vivo: ${selectedSub.name}` : 'Muro Oficial del Grado en Wuolah',
        desc: `Accede a las últimas aportaciones, apuntes de clase y exámenes subidos recientemente en Wuolah.`,
        querySnippet: (selectedSub && selectedSub.wuolahDirectUrl && selectedSub.wuolahDirectUrl.includes('/apuntes/')) 
          ? `wuolah.com/apuntes/${selectedSub.wuolahDirectUrl.split('/apuntes/')[1].split('?')[0]}` 
          : 'Comunidad Oficial ETSI Informática UMA en Wuolah',
        actionText: 'Abrir en Wuolah',
        actionUrl: wuolahTargetUrl,
        isWuolah: true,
        actionClick: selectedSub ? `window.scanSubjectLive('${selectedSub.id}')` : ''
      });
    }

    // 2. GOOGLE DORKING - PDFs UMA
    if (engineState.source === 'all' || engineState.source === 'google') {
      const dorkQuery = selectedSub
        ? `site:uma.es filetype:pdf "${selectedSub.name}" ${queryTrim}`.trim()
        : `site:uma.es filetype:pdf "ingenieria del software" ${queryTrim}`.trim();
      const dorkUrl = `https://www.google.com/search?q=${encodeURIComponent(dorkQuery)}`;

      cards.push({
        sourceBadge: '📄 Google Dorking',
        sourceBadgeClass: 'badge-google-pdf',
        formatTag: 'PDFs en uma.es',
        title: `Rastreador de PDFs Oficiales en Servidores UMA`,
        desc: `Busca directamente guías docentes completas, relaciones de problemas y exámenes colgados en servidores oficiales de la UMA.`,
        querySnippet: dorkQuery,
        actionText: 'Ejecutar Google Dorking (PDF)',
        actionUrl: dorkUrl
      });
    }

    // 3. GOOGLE DORKING - EXÁMENES RESUELTOS & APUNTES
    if (engineState.source === 'all' || engineState.source === 'google') {
      const examQuery = selectedSub
        ? `filetype:pdf "malaga" "${selectedSub.name}" (examen OR parcial OR "ejercicios resueltos") ${queryTrim}`.trim()
        : `filetype:pdf "ingenieria del software" "malaga" (examen OR "ejercicios resueltos") ${queryTrim}`.trim();
      const examUrl = `https://www.google.com/search?q=${encodeURIComponent(examQuery)}`;

      cards.push({
        sourceBadge: '📝 Exámenes Resueltos',
        sourceBadgeClass: 'badge-google-pdf',
        formatTag: 'Exámenes & Parciales',
        title: `Exámenes y Problemas Resueltos`,
        desc: `Localiza PDFs de convocatorias pasadas, controles periódicos y soluciones elaboradas por alumnos y academias de Málaga.`,
        querySnippet: examQuery,
        actionText: 'Rastrear Exámenes en Vivo',
        actionUrl: examUrl
      });
    }

    // 4. GITHUB REPOSITORIOS UMA
    if (engineState.source === 'all' || engineState.source === 'github') {
      const githubQuery = selectedSub
        ? `uma ("ingenieria del software" OR "informatica") "${selectedSub.name}" ${queryTrim}`.trim()
        : `uma "ingenieria del software" apuntes ${queryTrim}`.trim();
      const githubUrl = `https://github.com/search?q=${encodeURIComponent(githubQuery)}`;

      cards.push({
        sourceBadge: '🐙 GitHub Repos UMA',
        sourceBadgeClass: 'badge-github-uma',
        formatTag: 'Código & LaTeX',
        title: `Repositorios de Estudiantes UMA`,
        desc: `Encuentra prácticas de laboratorio, implementaciones en C++/Java/Python, chuletarios en LaTeX y proyectos subidos por alumnos de cursos superiores.`,
        querySnippet: `github.com: ${githubQuery}`,
        actionText: 'Explorar Repositorios en GitHub',
        actionUrl: githubUrl
      });
    }

    // 5. UNIVERSIDADES ESPAÑOLAS & OCW
    if (engineState.source === 'all' || engineState.source === 'universities') {
      const univQuery = selectedSub
        ? `(site:upm.es OR site:upv.es OR site:uc3m.es OR site:ocw.mit.edu) filetype:pdf "${selectedSub.name}" ${queryTrim}`.trim()
        : `(site:upm.es OR site:upv.es OR site:uc3m.es) filetype:pdf "ingenieria del software" ${queryTrim}`.trim();
      const univUrl = `https://www.google.com/search?q=${encodeURIComponent(univQuery)}`;

      cards.push({
        sourceBadge: '🏛️ Universidades OCW',
        sourceBadgeClass: 'badge-univ-ocw',
        formatTag: 'UPM • UPV • UC3M',
        title: `Cátedras de Universidades Politécnicas`,
        desc: `Accede a transparencias, boletines y material didáctico de referencia de las mejores escuelas técnicas de ingeniería informática de España.`,
        querySnippet: univQuery,
        actionText: 'Buscar en Universidades Técnicas',
        actionUrl: univUrl
      });
    }

    // 6. DUCKDUCKGO DIRECT PDF FINDER
    if (engineState.source === 'all') {
      const duckQuery = selectedSub
        ? `filetype:pdf "${selectedSub.name}" apuntes resumen ${queryTrim}`.trim()
        : `filetype:pdf "ingenieria del software" apuntes primer curso ${queryTrim}`.trim();
      const duckUrl = `https://duckduckgo.com/?q=${encodeURIComponent(duckQuery)}`;

      cards.push({
        sourceBadge: '🦆 DuckDuckGo Finder',
        sourceBadgeClass: 'badge-duck-pdf',
        formatTag: 'PDF Libre',
        title: `Buscador Profundo de Documentos PDF`,
        desc: `Rastreo neutral e indexación directa de archivos PDF de apuntes sin rastreo publicitario ni muros de pago.`,
        querySnippet: duckQuery,
        actionText: 'Abrir Búsqueda en DuckDuckGo',
        actionUrl: duckUrl
      });
    }

    liveBridgeResultsGrid.innerHTML = cards.map(c => `
      <div class="live-bridge-card">
        <div class="bridge-card-top">
          <span class="bridge-source-badge ${c.sourceBadgeClass}">${c.sourceBadge}</span>
          <span class="bridge-format-tag">${c.formatTag}</span>
        </div>
        <h4 class="bridge-card-title">${c.title}</h4>
        <p class="bridge-card-desc">${c.desc}</p>
        <div class="bridge-card-query-snippet" title="${c.querySnippet}">${c.querySnippet}</div>
        <div style="display: flex; gap: 8px; margin-top: auto;">
          <a href="${c.actionUrl}" target="_blank" rel="noopener noreferrer" class="bridge-card-action-btn ${c.isWuolah ? 'btn-wuolah-action' : ''}">
            <span>${c.actionText}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
          ${c.actionClick ? `
            <button type="button" class="btn-pdf-download" onclick="${c.actionClick}" title="Escanear en tiempo real esta asignatura" style="padding: 8px 12px;">
              <span class="live-pulse-dot" style="width: 6px; height: 6px;"></span>
              <span>En Vivo</span>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // MODAL ESCÁNER EN VIVO
  // ==========================================
  window.closeLiveScannerModal = function() {
    if (liveScannerModal) {
      liveScannerModal.classList.remove('active');
    }
    document.body.style.overflow = '';
  };

  window.scanSubjectLive = async function(subjectId) {
    const subject = getSubjectById(subjectId);
    if (!subject) return;

    let slug = 'fundamentos-de-electronica';
    let course = subject.course || '1';
    let communityId = subject.communityId || 13891;
    try {
      if (subject.wuolahDirectUrl) {
        const match = subject.wuolahDirectUrl.match(/\/apuntes\/([^?]+)/);
        if (match) slug = match[1];
        const courseMatch = subject.wuolahDirectUrl.match(/f_course=(\d+)/);
        if (courseMatch) course = courseMatch[1];
      }
    } catch(e) {}

    if (liveScannerModalTitle) {
      liveScannerModalTitle.textContent = `Escaneo en Vivo: ${subject.name} (${subject.acronym || 'ETSI'})`;
    }

    if (liveScannerModalBody) {
      liveScannerModalBody.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div class="live-pulse-dot" style="width: 20px; height: 20px; margin: 0 auto 16px auto;"></div>
          <h4 style="font-size: 1.15rem; color: #fff; margin-bottom: 8px;">Conectando en vivo con Wuolah y Repositorios UMA...</h4>
          <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 520px; margin: 0 auto;">
            Rastreando los mejores apuntes subidos, valoraciones de la comunidad y exámenes resueltos para <strong>${subject.name}</strong> sin precarga estática.
          </p>
        </div>
      `;
    }

    if (liveScannerModal) {
      liveScannerModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    try {
      const resp = await fetch(`/api/live-wuolah?slug=${encodeURIComponent(slug)}&course=${encodeURIComponent(course)}&communityId=${encodeURIComponent(communityId)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.items && data.items.length > 0) {
          renderLiveScanResults(subject, slug, data.items);
          return;
        }
      }
    } catch (err) {
      console.warn("Puente local offline, usando pasarela directa:", err);
    }

    renderLiveScanFallback(subject, slug);
  };

  function renderLiveScanResults(subject, slug, items) {
    const topItems = items.slice(0, 10);
    const googleDorkUrl = `https://www.google.com/search?q=${encodeURIComponent('site:uma.es filetype:pdf "' + subject.name + '"')}`;
    const githubUrl = `https://github.com/search?q=${encodeURIComponent('uma "ingenieria del software" "' + subject.name + '"')}`;
    const univOcwUrl = `https://www.google.com/search?q=${encodeURIComponent('(site:upm.es OR site:upv.es OR site:uc3m.es) filetype:pdf "' + subject.name + '" apuntes')}`;

    liveScannerModalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 12px 18px; flex-wrap: wrap; gap: 10px;">
          <div>
            <span style="font-size: 0.74rem; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <span class="live-pulse-dot" style="width: 7px; height: 7px;"></span>
              Flujo en Tiempo Real Activo
            </span>
            <span style="font-size: 0.95rem; color: #fff; font-weight: 700;">${items.length} documentos detectados en la comunidad UMA</span>
          </div>
          <a href="${subject.wuolahDirectUrl}" target="_blank" rel="noopener noreferrer" class="btn-pdf-view" style="font-size: 0.8rem; padding: 6px 14px;">
            <span>Ver Todo en Wuolah (${subject.acronym})</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto; padding-right: 4px;">
          ${topItems.map(item => `
            <div class="wuolah-note-item" style="border-color: rgba(255, 255, 255, 0.12); background: rgba(15, 23, 42, 0.75);">
              <div class="note-header">
                <div class="note-title-wrap">
                  <div class="note-verified-tag">
                    <span class="live-pulse-dot" style="width: 6px; height: 6px;"></span>
                    <span>En Vivo • Wuolah UMA</span>
                  </div>
                  <h5 class="note-title" style="font-size: 0.96rem;">${item.title}</h5>
                  <div class="note-badges-row">
                    <span class="note-tag note-tag-highlight">${item.type || 'Apuntes'}</span>
                    <span class="note-tag">${item.pages} págs</span>
                    <span class="note-tag note-tag-free">100% Gratis</span>
                    ${item.bookmarks ? `<span class="note-tag">🔖 ${item.bookmarks} favs</span>` : ''}
                  </div>
                </div>
                <div class="note-rating-box" title="Valoración media">
                  ★ ${item.rating}
                </div>
              </div>

              <p class="note-description" style="font-size: 0.82rem;">${item.description || 'Documento disponible para consulta y descarga inmediata en Wuolah.'}</p>

              <div class="note-footer">
                <div class="note-meta">
                  <span>Por <strong>@${item.uploader}</strong></span>
                  <span>•</span>
                  <span>${item.downloads} descargas</span>
                  <span>•</span>
                  <span>${item.views} visitas</span>
                </div>
                <div class="note-action-btns">
                  <a href="${item.wuolahUrl}" target="_blank" rel="noopener noreferrer" class="btn-pdf-view" onclick="window.trackWuolahOpen('${item.title}')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    Abrir en Wuolah
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md); padding: 14px 18px;">
          <h5 style="font-size: 0.85rem; font-weight: 700; color: #a5b4fc; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Explorar más allá de Wuolah para ${subject.acronym} (Rastreo en vivo sin precarga):
          </h5>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="${googleDorkUrl}" target="_blank" rel="noopener noreferrer" class="preset-chip" style="color: #f87171; border-color: rgba(239, 68, 68, 0.35);">
              📄 Google Dorking (PDFs site:uma.es)
            </a>
            <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="preset-chip" style="color: #34d399; border-color: rgba(16, 185, 129, 0.35);">
              🐙 Repositorios UMA en GitHub
            </a>
            <a href="${univOcwUrl}" target="_blank" rel="noopener noreferrer" class="preset-chip" style="color: #c084fc; border-color: rgba(168, 85, 247, 0.35);">
              🏛️ Universidades OCW (UPM / UPV)
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function renderLiveScanFallback(subject, slug) {
    const googleDorkUrl = `https://www.google.com/search?q=${encodeURIComponent('site:uma.es filetype:pdf "' + subject.name + '"')}`;
    const googleExamsUrl = `https://www.google.com/search?q=${encodeURIComponent('filetype:pdf "ingenieria del software" "malaga" "' + subject.name + '" examen OR parcial')}`;
    const githubUrl = `https://github.com/search?q=${encodeURIComponent('uma "ingenieria del software" "' + subject.name + '"')}`;

    liveScannerModalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-md); padding: 14px 18px;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 6px;">Puente de Rastreo en Vivo: ${subject.name}</h4>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">
            Selecciona la fuente en la que deseas lanzar la búsqueda en tiempo real. Abre directamente en Wuolah con consultas optimizadas y sin necesidad de precarga estática.
          </p>
        </div>

        <div class="live-results-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div class="live-bridge-card">
            <div class="bridge-card-top">
              <span class="bridge-source-badge badge-wuolah-live">⚡ Wuolah Comunidad UMA</span>
              <span class="bridge-format-tag">En Directo</span>
            </div>
            <h4 class="bridge-card-title">Muro en Tiempo Real de ${subject.acronym}</h4>
            <p class="bridge-card-desc">Acceso directo al canal de la asignatura con los últimos archivos subidos por compañeros de clase.</p>
            <a href="${subject.wuolahDirectUrl}" target="_blank" rel="noopener noreferrer" class="bridge-card-action-btn btn-wuolah-action">
              <span>Abrir Canal en Wuolah</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>

          <div class="live-bridge-card">
            <div class="bridge-card-top">
              <span class="bridge-source-badge badge-google-pdf">📄 Google Dorking</span>
              <span class="bridge-format-tag">site:uma.es</span>
            </div>
            <h4 class="bridge-card-title">PDFs Oficiales en Servidores UMA</h4>
            <div class="bridge-card-query-snippet">site:uma.es filetype:pdf "${subject.name}"</div>
            <a href="${googleDorkUrl}" target="_blank" rel="noopener noreferrer" class="bridge-card-action-btn">
              <span>Lanzar Rastreador UMA</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>

          <div class="live-bridge-card">
            <div class="bridge-card-top">
              <span class="bridge-source-badge badge-google-pdf">📝 Exámenes y Parciales</span>
              <span class="bridge-format-tag">PDF</span>
            </div>
            <h4 class="bridge-card-title">Exámenes y Convocatorias Pasadas</h4>
            <div class="bridge-card-query-snippet">filetype:pdf "malaga" "${subject.name}" examen</div>
            <a href="${googleExamsUrl}" target="_blank" rel="noopener noreferrer" class="bridge-card-action-btn">
              <span>Buscar Exámenes en Vivo</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>

          <div class="live-bridge-card">
            <div class="bridge-card-top">
              <span class="bridge-source-badge badge-github-uma">🐙 GitHub UMA</span>
              <span class="bridge-format-tag">Repos & Código</span>
            </div>
            <h4 class="bridge-card-title">Repositorios de Estudiantes</h4>
            <div class="bridge-card-query-snippet">uma "software" "${subject.name}"</div>
            <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="bridge-card-action-btn">
              <span>Buscar Repos en GitHub</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function setupModalListeners() {
    if (liveScannerModalCloseBtn) {
      liveScannerModalCloseBtn.addEventListener('click', window.closeLiveScannerModal);
    }
    if (liveScannerModal) {
      liveScannerModal.addEventListener('click', (e) => {
        if (e.target === liveScannerModal) {
          window.closeLiveScannerModal();
        }
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && liveScannerModal && liveScannerModal.classList.contains('active')) {
        window.closeLiveScannerModal();
      }
    });
  }

  window.trackWuolahOpen = function(title) {
    showToast(`🚀 Abriendo en Wuolah: "${title}"`);
  };

  function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  init();
});
