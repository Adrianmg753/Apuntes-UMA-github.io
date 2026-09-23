/**
 * Lógica interactiva del Portal de Asignaturas y Apuntes Wuolah
 * Grado en Ingeniería del Software (Plan 2023) - Universidad de Málaga
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global de filtros
  const state = {
    searchQuery: '',
    selectedSemester: 'all',
    selectedCategory: 'all',
    completedTopics: JSON.parse(localStorage.getItem('uma_sw_completed_topics') || '{}')
  };

  // Referencias al DOM
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const semesterFilterBtns = document.querySelectorAll('[data-filter-type="semester"]');
  const categoryFilterBtns = document.querySelectorAll('[data-filter-type="category"]');
  const resultsCountEl = document.getElementById('resultsCount');
  const subjectsGrid = document.getElementById('subjectsGrid');
  const tipsGrid = document.getElementById('tipsGrid');
  
  // Widget referencias
  const finderSubjectSelect = document.getElementById('finderSubjectSelect');
  const finderDocTypeSelect = document.getElementById('finderDocTypeSelect');
  const finderYearSelect = document.getElementById('finderYearSelect');
  const btnLaunchWuolahSearch = document.getElementById('btnLaunchWuolahSearch');

  // Modal referencias - Asignatura
  const subjectModal = document.getElementById('subjectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalHeaderContent = document.getElementById('modalHeaderContent');
  const modalBodyContent = document.getElementById('modalBodyContent');

  // Modal referencias - Visor de PDFs Directo
  const pdfViewerModal = document.getElementById('pdfViewerModal');
  const pdfModalCloseBtn = document.getElementById('pdfModalCloseBtn');
  const pdfModalTitle = document.getElementById('pdfModalTitle');
  const pdfModalSubtitle = document.getElementById('pdfModalSubtitle');
  const pdfModalBody = document.getElementById('pdfModalBody');
  const btnPdfModalDownload = document.getElementById('btnPdfModalDownload');
  const btnPdfModalOpenTab = document.getElementById('btnPdfModalOpenTab');
  const btnPdfModalPrint = document.getElementById('btnPdfModalPrint');

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  function init() {
    populateFinderSelect();
    renderSurvivalTips();
    renderCards();
    setupEventListeners();
  }

  // ==========================================
  // RENDERIZADO DE TARJETAS
  // ==========================================
  function getFilteredSubjects() {
    return SUBJECTS_DATA.filter(subject => {
      // Filtro Semestre
      if (state.selectedSemester !== 'all' && subject.semester.toString() !== state.selectedSemester) {
        return false;
      }
      // Filtro Categoría
      if (state.selectedCategory !== 'all' && subject.category !== state.selectedCategory) {
        return false;
      }
      // Filtro Búsqueda
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase().trim();
        const matchName = subject.name.toLowerCase().includes(query);
        const matchCode = subject.code.toLowerCase().includes(query);
        const matchAcronym = subject.acronym.toLowerCase().includes(query);
        const matchSummary = subject.summary.toLowerCase().includes(query);
        const matchTopics = subject.topics.some(t => t.toLowerCase().includes(query));
        const matchNotes = subject.bestWuolahNotes.some(n => 
          n.title.toLowerCase().includes(query) || 
          n.description.toLowerCase().includes(query) ||
          n.type.toLowerCase().includes(query)
        );
        return matchName || matchCode || matchAcronym || matchSummary || matchTopics || matchNotes;
      }
      return true;
    });
  }

  function getDifficultyBadgeClass(diff) {
    switch (diff.toLowerCase()) {
      case 'baja': return 'diff-baja';
      case 'media': return 'diff-media';
      case 'alta': return 'diff-alta';
      case 'muy alta': return 'diff-muy-alta';
      default: return 'diff-media';
    }
  }

  function renderCards() {
    const subjects = getFilteredSubjects();

    // Actualizar contador
    if (resultsCountEl) {
      resultsCountEl.textContent = `Mostrando ${subjects.length} de ${SUBJECTS_DATA.length} asignaturas`;
    }

    if (subjects.length === 0) {
      subjectsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: rgba(17, 26, 49, 0.5); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h4 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 8px;">No se encontraron asignaturas</h4>
          <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 18px auto;">
            Prueba a buscar con otros términos o cambia los filtros de semestre y área temática.
          </p>
          <button id="btnResetFilters" class="filter-btn active" style="margin: 0 auto;">Restablecer todos los filtros</button>
        </div>
      `;
      const btnReset = document.getElementById('btnResetFilters');
      if (btnReset) {
        btnReset.addEventListener('click', resetFilters);
      }
      return;
    }

    subjectsGrid.innerHTML = subjects.map(sub => {
      const diffClass = getDifficultyBadgeClass(sub.difficulty);
      
      // Render de los PDFs directos y verificados
      const notesHtml = sub.bestWuolahNotes.map(note => {
        return `
          <div class="wuolah-note-item">
            <div class="note-header">
              <div class="note-title-wrap">
                <div class="note-verified-tag" title="Documento oficial y verificado de Wuolah">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Wuolah Verificado (Gratis)</span>
                </div>
                <h5 class="note-title">${note.title}</h5>
                <div class="note-badges-row">
                  <span class="note-tag note-tag-highlight">${note.type}</span>
                  <span class="note-tag">${note.badge}</span>
                  <span class="note-tag">${note.pages} págs</span>
                  <span class="note-tag note-tag-free">100% Gratuito</span>
                </div>
              </div>
              <div class="note-rating-box" title="Valoración media en Wuolah">
                ★ ${note.rating}
              </div>
            </div>

            <p class="note-description">${note.description}</p>

            <div class="note-footer">
              <div class="note-meta">
                <span>Por <strong>@${note.uploader}</strong></span>
                <span>•</span>
                <span>${note.downloads} descargas</span>
              </div>
              <div class="note-action-btns">
                <a href="${note.wuolahUrl}" target="_blank" rel="noopener noreferrer" class="btn-pdf-view" onclick="window.trackWuolahOpen('${note.title}')" title="Abrir y descargar este PDF en Wuolah">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Abrir en Wuolah
                </a>
                <button type="button" class="btn-pdf-download" onclick="window.openPdfViewer('${sub.id}', '${note.id}')" title="Ver ficha técnica, consejos y enlace de descarga">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Ficha y Consejos
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <article class="subject-card" style="--card-accent-color: ${sub.color};">
          <!-- Top Meta -->
          <div class="card-top-meta">
            <div class="card-badges-left">
              <span class="badge-code">CÓD. ${sub.code}</span>
              <span class="badge-semester">${sub.semester}º Semestre</span>
            </div>
            <span class="badge-difficulty ${diffClass}">
              ● Dificultad: ${sub.difficulty}
            </span>
          </div>

          <!-- Subject Title -->
          <div class="card-title-group">
            <h3 class="subject-name">
              ${sub.name}
              <span class="subject-acronym">(${sub.acronym})</span>
            </h3>
          </div>

          <p class="subject-summary">${sub.summary}</p>

          <!-- Stats Pill Row -->
          <div class="card-stats-row">
            <div class="metric-item" title="Créditos ECTS">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <strong>${sub.ects} ECTS</strong>
            </div>
            <div class="metric-item" title="Carácter de la asignatura">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>${sub.type}</span>
            </div>
            <div class="metric-item" title="Tasa aproximada de aprobados en la UMA">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>Aprobados: <strong>${sub.passRate}</strong></span>
            </div>
          </div>

          <!-- Wuolah Curated Section -->
          <div class="wuolah-section-header">
            <div class="wuolah-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>PDFs Mejor Valorados en Wuolah</span>
            </div>
            <button type="button" class="btn-scan-live" onclick="window.scanSubjectLive('${sub.id}')" title="Escanear en tiempo real los mejores apuntes y últimas subidas de ${sub.acronym}">
              <span class="live-pulse-dot" style="width: 7px; height: 7px;"></span>
              <span>⚡ Escanear en Vivo</span>
            </button>
          </div>

          <div class="wuolah-notes-list">
            ${notesHtml}
          </div>

          <!-- Actions Footer -->
          <div class="card-actions-footer">
            <button class="btn-action-primary" onclick="window.openSubjectModal('${sub.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Ver Temario y Apuntes
            </button>
            <a href="${sub.bestWuolahNotes[0].wuolahUrl}" target="_blank" rel="noopener noreferrer" class="btn-action-icon" onclick="window.trackWuolahOpen('${sub.bestWuolahNotes[0].title}')" title="Abrir apunte top de ${sub.acronym} en Wuolah">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            <a href="${sub.wuolahDirectUrl}" target="_blank" rel="noopener noreferrer" class="btn-action-icon" title="Ver todos los apuntes de ${sub.name} en Wuolah">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </a>
            <button class="btn-action-icon" onclick="window.copySubjectShareLink('${sub.id}')" title="Copiar enlace y nombre de asignatura">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  // ==========================================
  // RENDERIZADO DE CONSEJOS DE SUPERVIVENCIA
  // ==========================================
  function renderSurvivalTips() {
    if (!tipsGrid) return;
    tipsGrid.innerHTML = WUOLAH_SURVIVAL_TIPS.map((tip, idx) => `
      <div class="tip-card">
        <span class="tip-number">CONSEJO 0${idx + 1}</span>
        <h4 class="tip-title">${tip.title}</h4>
        <p class="tip-desc">${tip.description}</p>
      </div>
    `).join('');
  }

  // ==========================================
  // WIDGET GENERADOR DE BÚSQUEDAS WUOLAH
  // ==========================================
  function populateFinderSelect() {
    if (!finderSubjectSelect) return;
    finderSubjectSelect.innerHTML = SUBJECTS_DATA.map(s => `
      <option value="${s.id}">[${s.code}] ${s.name} (${s.semester}º Sem)</option>
    `).join('');
  }

  window.trackWuolahOpen = function(title) {
    showToast(`🚀 Abriendo en Wuolah: "${title}"`);
  };

  function handleLaunchFinderSearch() {
    const selectedSubId = finderSubjectSelect.value;
    const docType = finderDocTypeSelect.value;
    const subject = SUBJECTS_DATA.find(s => s.id === selectedSubId);

    if (!subject) return;

    let matchedNote = subject.bestWuolahNotes.find(n => n.type.toLowerCase().includes(docType.toLowerCase()));
    if (!matchedNote) {
      matchedNote = subject.bestWuolahNotes[0];
    }

    if (matchedNote && matchedNote.wuolahUrl) {
      showToast(`🚀 Abriendo "${matchedNote.title}" en Wuolah...`);
      window.open(matchedNote.wuolahUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(subject.wuolahDirectUrl, '_blank', 'noopener,noreferrer');
    }
  }

  window.openWuolahCommunity = function() {
    showToast("Abriendo comunidad de Ingeniería del Software UMA en Wuolah...");
    window.open("https://wuolah.com/uma-escuela-tecnica-superior-ingenieria-informatic/grado-ingenieria-software", "_blank", "noopener,noreferrer");
  };

  // ==========================================
  // MODAL DE DETALLE DE ASIGNATURA
  // ==========================================
  window.openSubjectModal = function(subjectId) {
    const subject = SUBJECTS_DATA.find(s => s.id === subjectId);
    if (!subject) return;

    const diffClass = getDifficultyBadgeClass(subject.difficulty);

    modalHeaderContent.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span class="badge-code">CÓD. ${subject.code}</span>
        <span class="badge-semester">${subject.semester}º Semestre</span>
        <span class="badge-difficulty ${diffClass}">Dificultad: ${subject.difficulty}</span>
      </div>
      <h3 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; color: var(--text-main);">
        ${subject.name} <span style="color: var(--text-dim); font-size: 1rem;">(${subject.acronym})</span>
      </h3>
    `;

    // Lista de temario con casillas interactivas guardadas en localStorage
    const topicsHtml = subject.topics.map((t, idx) => {
      const itemKey = `${subject.id}_topic_${idx}`;
      const isChecked = !!state.completedTopics[itemKey];

      return `
        <label class="syllabus-item ${isChecked ? 'completed' : ''}" id="label_${itemKey}">
          <input 
            type="checkbox" 
            class="syllabus-checkbox" 
            data-key="${itemKey}" 
            ${isChecked ? 'checked' : ''}
            onchange="window.toggleTopicCheck('${itemKey}')"
          >
          <span><strong>Tema ${idx + 1}:</strong> ${t}</span>
        </label>
      `;
    }).join('');

    // Lista de documentos reales y verificados de Wuolah para el modal de asignatura
    const wuolahModalHtml = subject.bestWuolahNotes.map(n => {
      return `
        <div class="wuolah-note-item" style="margin-bottom: 12px;">
          <div class="note-header">
            <div class="note-title-wrap">
              <div class="note-verified-tag" title="Enlace oficial verificado en Wuolah">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Wuolah Verificado • 100% Gratuito</span>
              </div>
              <h5 class="note-title">${n.title}</h5>
              <div class="note-badges-row">
                <span class="note-tag note-tag-highlight">${n.type}</span>
                <span class="note-tag">★ ${n.rating} (${n.reviewsCount} consultas)</span>
                <span class="note-tag">${n.pages} págs</span>
                <span class="note-tag note-tag-free">${n.downloads} descargas</span>
              </div>
            </div>
            <div class="note-action-btns">
              <a href="${n.wuolahUrl}" target="_blank" rel="noopener noreferrer" class="btn-pdf-view" onclick="window.trackWuolahOpen('${n.title}')" title="Abrir y descargar este PDF en Wuolah">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Abrir en Wuolah
              </a>
              <button type="button" class="btn-pdf-download" onclick="window.openPdfViewer('${subject.id}', '${n.id}')" title="Ver detalles y consejos del documento">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Ficha y Consejos
              </button>
            </div>
          </div>
          <p class="note-description">${n.description}</p>
        </div>
      `;
    }).join('');

    modalBodyContent.innerHTML = `
      <!-- Temario Oficial Checklist -->
      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          Temario Oficial (Plan 2023) - Marca tu progreso de estudio
        </h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">
          Haz clic en cada tema para marcarlo como estudiado. Tu progreso se guarda en tu navegador.
        </p>
        <div class="syllabus-list">
          ${topicsHtml}
        </div>
      </div>

      <!-- Consejos de Examen y Docentes -->
      <div class="modal-section">
        <h4 class="modal-section-title" style="color: var(--amber);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Estrategia para Aprobar en la UMA
        </h4>
        <div class="exam-tips-box">
          ${subject.examTips}
        </div>
      </div>

      <!-- Recursos Wuolah -->
      <div class="modal-section">
        <h4 class="modal-section-title" style="color: var(--wuolah-yellow);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          Apuntes de Wuolah Recomendados
        </h4>
        ${wuolahModalHtml}
      </div>

      <!-- Enlaces oficiales -->
      <div style="display: flex; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-subtle); justify-content: flex-end; flex-wrap: wrap;">
        <a href="https://www.uma.es/etsi-informatica/" target="_blank" rel="noopener noreferrer" class="header-btn header-btn-secondary">
          Guía Docente UMA
        </a>
        <a href="${subject.wuolahDirectUrl}" target="_blank" rel="noopener noreferrer" class="header-btn header-btn-wuolah">
          Ver Todos los Apuntes de ${subject.acronym} en Wuolah
        </a>
      </div>
    `;

    subjectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeSubjectModal() {
    subjectModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.toggleTopicCheck = function(key) {
    const isChecked = !state.completedTopics[key];
    if (isChecked) {
      state.completedTopics[key] = true;
    } else {
      delete state.completedTopics[key];
    }
    localStorage.setItem('uma_sw_completed_topics', JSON.stringify(state.completedTopics));
    
    const label = document.getElementById(`label_${key}`);
    if (label) {
      if (isChecked) {
        label.classList.add('completed');
      } else {
        label.classList.remove('completed');
      }
    }
  };

  window.copySubjectShareLink = function(subjectId) {
    const subject = SUBJECTS_DATA.find(s => s.id === subjectId);
    if (!subject) return;

    const textToCopy = subject.wuolahDirectUrl;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`📋 Enlace de Wuolah copiado: "${subject.name}"`);
      }).catch(() => {
        prompt('Enlace de Wuolah para esta asignatura:', textToCopy);
      });
    } else {
      prompt('Enlace de Wuolah para esta asignatura:', textToCopy);
    }
  };

  // ==========================================
  // VISOR DE PDFS INTERACTIVO Y DIRECTO
  // ==========================================
  window.openPdfViewer = function(subjectId, noteId) {
    const subject = SUBJECTS_DATA.find(s => s.id === subjectId);
    if (!subject) return;
    const note = subject.bestWuolahNotes.find(n => n.id === noteId);
    if (!note) return;

    if (pdfModalTitle) pdfModalTitle.textContent = note.title;
    if (pdfModalSubtitle) {
      pdfModalSubtitle.textContent = `[${subject.code}] ${subject.name} (${subject.acronym}) • Subido por @${note.uploader} • ${note.pages} páginas • 100% Gratuito en Wuolah`;
    }

    if (btnPdfModalDownload) {
      btnPdfModalDownload.href = note.wuolahUrl;
      btnPdfModalDownload.target = "_blank";
      btnPdfModalDownload.rel = "noopener noreferrer";
      btnPdfModalDownload.removeAttribute('download');
      btnPdfModalDownload.onclick = () => window.trackWuolahOpen(note.title);
    }

    if (btnPdfModalOpenTab) {
      btnPdfModalOpenTab.href = note.wuolahUrl;
      btnPdfModalOpenTab.target = "_blank";
      btnPdfModalOpenTab.rel = "noopener noreferrer";
      btnPdfModalOpenTab.onclick = () => window.trackWuolahOpen(note.title);
    }

    if (pdfModalBody) {
      pdfModalBody.innerHTML = `
        <div class="pdf-viewer-content">
          <!-- Top Status Bar -->
          <div class="pdf-status-alert">
            <div class="pdf-status-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <div class="pdf-status-title">Documento Oficial de Wuolah • Enlace 100% Verificado</div>
              <div class="pdf-status-desc">
                Este enlace te redirige al documento original en Wuolah, donde podrás leerlo y descargarlo directamente sin coste ni bloqueos.
              </div>
            </div>
          </div>

          <!-- Meta Pills -->
          <div class="pdf-meta-pills">
            <span class="pdf-pill"><strong>Asignatura:</strong> ${subject.name} (${subject.acronym})</span>
            <span class="pdf-pill"><strong>Tipo:</strong> ${note.type}</span>
            <span class="pdf-pill"><strong>Wuoler:</strong> @${note.uploader}</span>
            <span class="pdf-pill"><strong>Valoración:</strong> ★ ${note.rating} / 5.0</span>
            <span class="pdf-pill"><strong>Descargas:</strong> ${note.downloads}</span>
            <span class="pdf-pill"><strong>Páginas:</strong> ${note.pages} págs</span>
            <span class="pdf-pill" style="border-color: rgba(16, 185, 129, 0.4); color: #34d399;"><strong>Estado:</strong> 100% Gratuito</span>
          </div>

          <!-- Document Preview Canvas / Information Frame -->
          <div class="pdf-document-paper">
            <div class="paper-header">
              <div class="paper-brand">
                <span class="paper-tag">UNIVERSIDAD DE MÁLAGA • ETSI INFORMÁTICA • WUOLAH</span>
                <h2 class="paper-title">${note.title}</h2>
                <div class="paper-sub">Material seleccionado para ${subject.name} • Grado en Ingeniería del Software (Plan 2023)</div>
              </div>
            </div>

            <!-- Wuolah Direct CTA Card -->
            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.12)); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px;">
              <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px;">
                <div style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div>
                  <h4 style="margin: 0 0 4px 0; color: #fff; font-size: 1.1rem; font-weight: 700;">Acceso directo al PDF en Wuolah</h4>
                  <p style="margin: 0; color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">
                    Pulsa para abrir el documento original en Wuolah. Accederás al visor oficial y al botón de descarga directa sin esperas ni coste.
                  </p>
                </div>
              </div>
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <a href="${note.wuolahUrl}" target="_blank" rel="noopener noreferrer" class="btn-pdf-action btn-pdf-primary" onclick="window.trackWuolahOpen('${note.title}')" style="font-size: 0.95rem; padding: 12px 24px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  <span>Abrir Documento en Wuolah</span>
                </a>
                <a href="${subject.wuolahDirectUrl}" target="_blank" rel="noopener noreferrer" class="btn-pdf-action btn-pdf-secondary" style="font-size: 0.88rem; padding: 12px 18px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Ver Todos los Apuntes de ${subject.acronym}</span>
                </a>
              </div>
            </div>

            <div class="paper-section">
              <h4 class="paper-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Descripción y Utilidad para el Examen
              </h4>
              <p class="paper-desc">${note.description}</p>
            </div>

            <div class="paper-section">
              <h4 class="paper-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                Temario Oficial Relacionado (${subject.name})
              </h4>
              <ul class="paper-list">
                ${subject.topics.map((t, idx) => `<li><strong>Tema ${idx + 1}:</strong> <span>${t}</span></li>`).join('')}
              </ul>
            </div>

            <div class="paper-section paper-tips-box">
              <h4 class="paper-section-title" style="color: #f59e0b;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Consejos de Aprobado en la UMA
              </h4>
              <p>${subject.examTips}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (pdfViewerModal) {
      pdfViewerModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closePdfViewer = function() {
    if (pdfViewerModal) {
      pdfViewerModal.classList.remove('active');
    }
    if (!subjectModal || !subjectModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };


  // ==========================================
  // ESCÁNER EN TIEMPO REAL Y PUENTE MULTI-FUENTE
  // ==========================================
  const liveScannerModal = document.getElementById('liveScannerModal');
  const liveScannerModalCloseBtn = document.getElementById('liveScannerModalCloseBtn');
  const liveScannerModalTitle = document.getElementById('liveScannerModalTitle');
  const liveScannerModalBody = document.getElementById('liveScannerModalBody');

  window.closeLiveScannerModal = function() {
    if (liveScannerModal) {
      liveScannerModal.classList.remove('active');
    }
    if ((!subjectModal || !subjectModal.classList.contains('active')) && 
        (!pdfViewerModal || !pdfViewerModal.classList.contains('active'))) {
      document.body.style.overflow = '';
    }
  };

  window.scanSubjectLive = async function(subjectId) {
    const subject = SUBJECTS_DATA.find(s => s.id === subjectId);
    if (!subject) return;

    let slug = 'fundamentos-de-electronica';
    let course = '1';
    try {
      const match = subject.wuolahDirectUrl.match(/\/apuntes\/([^?]+)/);
      if (match) slug = match[1];
      const courseMatch = subject.wuolahDirectUrl.match(/f_course=(\d+)/);
      if (courseMatch) course = courseMatch[1];
    } catch(e) {}

    if (liveScannerModalTitle) {
      liveScannerModalTitle.textContent = `Escaneo en Vivo: ${subject.name} (${subject.acronym})`;
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
      const resp = await fetch(`/api/live-wuolah?slug=${encodeURIComponent(slug)}&course=${encodeURIComponent(course)}`);
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
        <!-- Top Status Banner -->
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

        <!-- Live Items List -->
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

        <!-- Multi-Source Bridge Quick Links for this Subject -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md); padding: 14px 18px;">
          <h5 style="font-size: 0.85rem; font-weight: 700; color: #a5b4fc; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Explorar más allá de Wuolah para ${subject.acronym} (Rastreo en vivo sin precarga):
          </h5>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="${googleDorkUrl}" target="_blank" rel="noopener noreferrer" class="preset-chip" style="color: #f87171; border-color: rgba(239, 68, 68, 0.35);">
              📄 Google Dorking (PDFs site:uma.es)
            </a>
            <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="preset-chip" style="color: #34d399; border-color: rgba(168, 85, 247, 0.35);">
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
    const univOcwUrl = `https://www.google.com/search?q=${encodeURIComponent('(site:upm.es OR site:upv.es OR site:uc3m.es) filetype:pdf "' + subject.name + '"')}`;

    liveScannerModalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-md); padding: 14px 18px;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 6px;">Puente de Rastreo en Vivo: ${subject.name}</h4>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">
            Selecciona la fuente en la que deseas lanzar la búsqueda en tiempo real. Abre directamente en Wuolah con consultas optimizadas y sin necesidad de precarga estática.
          </p>
        </div>

        <div class="live-results-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <!-- Wuolah Direct Hub -->
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

          <!-- Google Dorking PDFs UMA -->
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

          <!-- Google Exams -->
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

          <!-- GitHub Repos -->
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



  // ==========================================
  // NOTIFICACIONES TOAST
  // ==========================================
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

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  function setupEventListeners() {
    // Búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (state.searchQuery.trim() !== '') {
        searchClearBtn.style.display = 'flex';
      } else {
        searchClearBtn.style.display = 'none';
      }
      renderCards();
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClearBtn.style.display = 'none';
      searchInput.focus();
      renderCards();
    });

    // Filtros de semestre
    semesterFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        semesterFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedSemester = btn.dataset.value;
        renderCards();
      });
    });

    // Filtros de categoría
    categoryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedCategory = btn.dataset.value;
        renderCards();
      });
    });

    // Widget Wuolah
    if (btnLaunchWuolahSearch) {
      btnLaunchWuolahSearch.addEventListener('click', handleLaunchFinderSearch);
    }

    // Modal Asignatura
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeSubjectModal);
    }

    if (subjectModal) {
      subjectModal.addEventListener('click', (e) => {
        if (e.target === subjectModal) {
          closeSubjectModal();
        }
      });
    }

    // Modal PDF Viewer
    if (pdfModalCloseBtn) {
      pdfModalCloseBtn.addEventListener('click', window.closePdfViewer);
    }

    if (pdfViewerModal) {
      pdfViewerModal.addEventListener('click', (e) => {
        if (e.target === pdfViewerModal) {
          window.closePdfViewer();
        }
      });
    }


    // Modal Escáner en Vivo
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

    if (btnPdfModalPrint) {
      btnPdfModalPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Cierre con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {

        if (liveScannerModal && liveScannerModal.classList.contains('active')) {
          window.closeLiveScannerModal();
        } else if (pdfViewerModal && pdfViewerModal.classList.contains('active')) {

          window.closePdfViewer();
        } else if (subjectModal && subjectModal.classList.contains('active')) {
          closeSubjectModal();
        }
      }
    });
  }

  function resetFilters() {
    state.searchQuery = '';
    state.selectedSemester = 'all';
    state.selectedCategory = 'all';

    searchInput.value = '';
    searchClearBtn.style.display = 'none';

    semesterFilterBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.value === 'all');
    });

    categoryFilterBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.value === 'all');
    });

    renderCards();
  }

  // Ejecutar inicialización
  init();
});
