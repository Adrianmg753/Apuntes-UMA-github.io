/**
 * Lógica del Explorador de Carrera (1º a 4º/5º Curso)
 * ETSI Informática - Universidad de Málaga (UMA)
 * Desarrollado y coordinado por Adrián Morales con el respaldo de la comunidad UMA.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Parámetros de URL
  const urlParams = new URLSearchParams(window.location.search);
  const degreeId = urlParams.get('carrera') || 'software';
  const initialCourse = urlParams.get('curso') || 'all';

  // Buscar datos de la carrera
  const degree = (typeof ETSI_DEGREES !== 'undefined')
    ? (ETSI_DEGREES.find(d => d.id === degreeId) || ETSI_DEGREES[0])
    : null;

  if (!degree) {
    console.error("No se encontró la carrera:", degreeId);
    return;
  }

  // Estado global de filtros
  const state = {
    degreeId: degree.id,
    selectedCourse: initialCourse,
    selectedSemester: 'all',
    selectedCategory: 'all',
    searchQuery: '',
    completedTopics: JSON.parse(localStorage.getItem(`uma_${degree.id}_completed_topics`) || '{}')
  };

  // Referencias al DOM
  const degreeHeroTitle = document.getElementById('degreeHeroTitle');
  const degreeHeroSubtitle = document.getElementById('degreeHeroSubtitle');
  const degreePlanBadge = document.getElementById('degreePlanBadge');
  const degreeAcronymBadge = document.getElementById('degreeAcronymBadge');
  const degreeStatsRow = document.getElementById('degreeStatsRow');
  const courseTabsWrap = document.getElementById('courseTabsWrap');
  const subjectsGrid = document.getElementById('subjectsGrid');
  const resultsCountEl = document.getElementById('resultsCount');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const semesterFilterBtns = document.querySelectorAll('[data-filter-type="semester"]');
  const categoryFilterBtns = document.querySelectorAll('[data-filter-type="category"]');

  // Modales
  const subjectModal = document.getElementById('subjectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalHeaderContent = document.getElementById('modalHeaderContent');
  const modalBodyContent = document.getElementById('modalBodyContent');

  const pdfViewerModal = document.getElementById('pdfViewerModal');
  const pdfModalCloseBtn = document.getElementById('pdfModalCloseBtn');
  const pdfModalTitle = document.getElementById('pdfModalTitle');
  const pdfModalSubtitle = document.getElementById('pdfModalSubtitle');
  const pdfModalBody = document.getElementById('pdfModalBody');
  const btnPdfModalOpenTab = document.getElementById('btnPdfModalOpenTab');
  const btnPdfModalDownload = document.getElementById('btnPdfModalDownload');
  const btnPdfModalPrint = document.getElementById('btnPdfModalPrint');

  const liveScannerModal = document.getElementById('liveScannerModal');
  const liveScannerModalCloseBtn = document.getElementById('liveScannerModalCloseBtn');
  const liveScannerModalTitle = document.getElementById('liveScannerModalTitle');
  const liveScannerModalBody = document.getElementById('liveScannerModalBody');

  // Inicialización
  function init() {
    renderDegreeHero();
    renderCourseTabs();
    renderCards();
    setupEventListeners();
  }

  // Renderizar Hero de la carrera seleccionada
  function renderDegreeHero() {
    document.title = `${degree.name} (1º a ${degree.courses}º Curso) | ETSI Informática UMA`;

    if (degreeHeroTitle) {
      degreeHeroTitle.innerHTML = `${degree.name} <span class="text-gradient">(${degree.acronym})</span>`;
    }
    if (degreeHeroSubtitle) {
      degreeHeroSubtitle.textContent = degree.summary;
    }
    if (degreePlanBadge) {
      degreePlanBadge.textContent = degree.badge;
    }
    if (degreeAcronymBadge) {
      degreeAcronymBadge.textContent = `${degree.courses} Cursos • ${degree.ects} ECTS`;
    }
    if (degreeStatsRow) {
      const allSubs = (DEGREE_SUBJECTS && DEGREE_SUBJECTS[degree.id]) || [];
      degreeStatsRow.innerHTML = `
        <div class="stat-card">
          <div class="stat-number">${allSubs.length}</div>
          <div class="stat-label">Asignaturas Totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${degree.courses}</div>
          <div class="stat-label">Cursos Completos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${degree.ects} <span>ECTS</span></div>
          <div class="stat-label">Carga Académica</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: #10b981;">100%</div>
          <div class="stat-label">Gratuito en Wuolah</div>
        </div>
      `;
    }
  }

  // Renderizar pestañas de curso dinámicamente
  function renderCourseTabs() {
    if (!courseTabsWrap) return;
    const allSubs = (DEGREE_SUBJECTS && DEGREE_SUBJECTS[degree.id]) || [];

    let tabsHtml = `
      <button type="button" class="course-tab-btn ${state.selectedCourse === 'all' ? 'active' : ''}" data-course="all">
        <span>Todos los Cursos</span>
        <span class="course-tab-badge">${allSubs.length}</span>
      </button>
    `;

    for (let c = 1; c <= degree.courses; c++) {
      const count = allSubs.filter(s => s.course === c).length;
      tabsHtml += `
        <button type="button" class="course-tab-btn ${state.selectedCourse == c ? 'active' : ''}" data-course="${c}">
          <span>${c}º Curso</span>
          <span class="course-tab-badge">${count}</span>
        </button>
      `;
    }

    courseTabsWrap.innerHTML = tabsHtml;

    courseTabsWrap.querySelectorAll('.course-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        courseTabsWrap.querySelectorAll('.course-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedCourse = btn.dataset.course;
        renderCards();
      });
    });
  }

  // Filtrado de asignaturas
  function getFilteredSubjects() {
    const allSubs = (DEGREE_SUBJECTS && DEGREE_SUBJECTS[degree.id]) || [];
    return allSubs.filter(sub => {
      // Filtro Curso
      if (state.selectedCourse !== 'all' && sub.course.toString() !== state.selectedCourse) {
        return false;
      }
      // Filtro Semestre
      if (state.selectedSemester !== 'all' && sub.semester.toString() !== state.selectedSemester) {
        return false;
      }
      // Filtro Categoría
      if (state.selectedCategory !== 'all' && sub.category !== state.selectedCategory) {
        return false;
      }
      // Filtro Búsqueda
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase().trim();
        const matchName = sub.name.toLowerCase().includes(q);
        const matchCode = sub.code.toLowerCase().includes(q);
        const matchAcronym = sub.acronym.toLowerCase().includes(q);
        const matchSummary = sub.summary.toLowerCase().includes(q);
        const matchTopics = sub.topics.some(t => t.toLowerCase().includes(q));
        return matchName || matchCode || matchAcronym || matchSummary || matchTopics;
      }
      return true;
    });
  }

  function getDifficultyBadgeClass(diff) {
    switch ((diff || '').toLowerCase()) {
      case 'baja': return 'diff-baja';
      case 'media': return 'diff-media';
      case 'alta': return 'diff-alta';
      case 'muy alta': return 'diff-muy-alta';
      default: return 'diff-media';
    }
  }

  // Renderizar tarjetas de asignaturas
  function renderCards() {
    if (!subjectsGrid) return;
    const subjects = getFilteredSubjects();

    if (resultsCountEl) {
      const allSubs = (DEGREE_SUBJECTS && DEGREE_SUBJECTS[degree.id]) || [];
      resultsCountEl.textContent = `Mostrando ${subjects.length} de ${allSubs.length} asignaturas`;
    }

    if (subjects.length === 0) {
      subjectsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: rgba(17, 26, 49, 0.5); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" style="margin-bottom: 16px;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h4 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 8px;">No se encontraron asignaturas</h4>
          <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 18px auto;">
            Prueba a seleccionar otro curso, semestre o término de búsqueda.
          </p>
          <button id="btnResetFilters" class="filter-btn active" style="margin: 0 auto;">Restablecer filtros</button>
        </div>
      `;
      const btnReset = document.getElementById('btnResetFilters');
      if (btnReset) btnReset.addEventListener('click', resetFilters);
      return;
    }

    subjectsGrid.innerHTML = subjects.map(sub => {
      const diffClass = getDifficultyBadgeClass(sub.difficulty);
      const notesHtml = sub.bestWuolahNotes.map(note => `
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
            <div class="note-rating-box" title="Valoración media">
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
              <button type="button" class="btn-pdf-download" onclick="window.openPdfViewer('${sub.id}', '${note.id}')" title="Ver ficha técnica y consejos de examen">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Ficha y Consejos
              </button>
            </div>
          </div>
        </div>
      `).join('');

      return `
        <article class="subject-card" style="--card-accent-color: ${sub.color || degree.color};">
          <!-- Top Meta -->
          <div class="card-top-meta">
            <div class="card-badges-left">
              <span class="badge-course-pill">${sub.course}º Curso</span>
              <span class="badge-code">CÓD. ${sub.code}</span>
              <span class="badge-semester">${sub.semester}º Sem</span>
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

          <!-- Stats Row -->
          <div class="card-stats-row">
            <div class="metric-item" title="Créditos ECTS">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <strong>${sub.ects} ECTS</strong>
            </div>
            <div class="metric-item" title="Carácter de la materia">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>${sub.type}</span>
            </div>
            <div class="metric-item" title="Tasa de aprobados estimada UMA">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>Aprobados: <strong>${sub.passRate}</strong></span>
            </div>
          </div>

          <!-- Wuolah Curated Section -->
          <div class="wuolah-section-header">
            <div class="wuolah-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Ver Temario y Apuntes
            </button>
            <a href="${sub.wuolahDirectUrl}" target="_blank" rel="noopener noreferrer" class="btn-action-icon" title="Ver todos los apuntes de ${sub.name} en Wuolah">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </a>
            <a href="metabuscador.html?subject=${encodeURIComponent(sub.id)}" class="btn-action-icon" title="Rastrear en Metabuscador Multi-Fuente">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </a>
            <button class="btn-action-icon" onclick="window.copySubjectShareLink('${sub.id}')" title="Copiar enlace y nombre de asignatura">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  // MODAL DE DETALLE DE ASIGNATURA
  // ==========================================
  window.openSubjectModal = function(subjectId) {
    const allSubs = (DEGREE_SUBJECTS && DEGREE_SUBJECTS[degree.id]) || [];
    const subject = allSubs.find(s => s.id === subjectId);
    if (!subject) return;

    const diffClass = getDifficultyBadgeClass(subject.difficulty);

    modalHeaderContent.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span class="badge-course-pill">${subject.course}º Curso</span>
        <span class="badge-code">CÓD. ${subject.code}</span>
        <span class="badge-semester">${subject.semester}º Semestre</span>
        <span class="badge-difficulty ${diffClass}">Dificultad: ${subject.difficulty}</span>
      </div>
      <h3 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; color: var(--text-main);">
        ${subject.name} <span style="color: var(--text-dim); font-size: 1rem;">(${subject.acronym})</span>
      </h3>
    `;

    const topicsHtml = subject.topics.map((t, idx) => {
      const itemKey = `${subject.id}_topic_${idx}`;
      const isChecked = !!state.completedTopics[itemKey];
      return `
        <li class="topic-item ${isChecked ? 'completed' : ''}">
          <label class="topic-checkbox-label">
            <input 
              type="checkbox" 
              class="topic-checkbox" 
              data-item-key="${itemKey}" 
              ${isChecked ? 'checked' : ''}
              onchange="window.toggleTopicCheck(this, '${itemKey}')"
            >
            <span class="topic-text">${t}</span>
          </label>
        </li>
      `;
    }).join('');

    const bestNotesHtml = subject.bestWuolahNotes.map(n => `
      <div class="wuolah-note-item" style="background: rgba(15, 23, 42, 0.7);">
        <div class="note-header">
          <div class="note-title-wrap">
            <h5 class="note-title">${n.title}</h5>
            <div class="note-badges-row">
              <span class="note-tag note-tag-highlight">${n.type}</span>
              <span class="note-tag">${n.pages} páginas</span>
              <span class="note-tag note-tag-free">100% Gratuito</span>
            </div>
          </div>
          <div class="note-rating-box">★ ${n.rating}</div>
        </div>
        <p class="note-description">${n.description}</p>
        <div class="note-footer">
          <div class="note-meta">
            <span>Por <strong>@${n.uploader}</strong></span>
            <span>•</span>
            <span>${n.downloads} descargas</span>
          </div>
          <div class="note-action-btns">
            <a href="${n.wuolahUrl}" target="_blank" rel="noopener noreferrer" class="btn-pdf-view" onclick="window.trackWuolahOpen('${n.title}')" title="Abrir y descargar este PDF en Wuolah">
              Abrir en Wuolah
            </a>
          </div>
        </div>
      </div>
    `).join('');

    modalBodyContent.innerHTML = `
      <div class="modal-section">
        <h4 class="modal-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          Temario Oficial (${degree.name} • ${subject.course}º Curso)
        </h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">Marca los temas según avances en tu estudio para guardar tu progreso local:</p>
        <ul class="topics-list">${topicsHtml}</ul>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title" style="color: #f59e0b;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          Consejos Clave de Aprobado en la ETSI UMA
        </h4>
        <div class="exam-tips-box">
          <p>${subject.examTips}</p>
        </div>
      </div>

      <div class="modal-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <h4 class="modal-section-title" style="margin-bottom: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Mejores Apuntes y Exámenes en Wuolah
          </h4>
          <button type="button" class="btn-scan-live" onclick="window.scanSubjectLive('${subject.id}')" style="font-size: 0.8rem; padding: 4px 12px;">
            <span class="live-pulse-dot" style="width: 6px; height: 6px;"></span>
            <span>⚡ Escanear en Vivo</span>
          </button>
        </div>
        <div class="wuolah-notes-list">${bestNotesHtml}</div>
      </div>

      <div class="modal-footer-actions">
        <a href="${subject.wuolahDirectUrl}" target="_blank" rel="noopener noreferrer" class="btn-modal-action btn-modal-wuolah">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>Ver todos los documentos de ${subject.acronym} en Wuolah</span>
        </a>
      </div>
    `;

    if (subjectModal) {
      subjectModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeSubjectModal = function() {
    if (subjectModal) {
      subjectModal.classList.remove('active');
    }
    if (!pdfViewerModal || !pdfViewerModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };

  window.toggleTopicCheck = function(checkbox, itemKey) {
    state.completedTopics[itemKey] = checkbox.checked;
    localStorage.setItem(`uma_${degree.id}_completed_topics`, JSON.stringify(state.completedTopics));
    const parentLi = checkbox.closest('.topic-item');
    if (parentLi) parentLi.classList.toggle('completed', checkbox.checked);
    showToast(checkbox.checked ? "Tema marcado como completado ✅" : "Tema desmarcado");
  };

  // ==========================================
  // MODAL FICHA TÉCNICA Y PDF VIEWER
  // ==========================================
  window.openPdfViewer = function(subjectId, noteId) {
    const allSubs = (DEGREE_SUBJECTS && DEGREE_SUBJECTS[degree.id]) || [];
    const subject = allSubs.find(s => s.id === subjectId);
    if (!subject) return;

    const note = subject.bestWuolahNotes.find(n => n.id === noteId) || subject.bestWuolahNotes[0];
    if (!note) return;

    if (pdfModalTitle) pdfModalTitle.textContent = note.title;
    if (pdfModalSubtitle) {
      pdfModalSubtitle.textContent = `${degree.name} • ${subject.name} (${subject.acronym}) • Subido por @${note.uploader}`;
    }

    if (btnPdfModalOpenTab) {
      btnPdfModalOpenTab.href = note.wuolahUrl;
      btnPdfModalOpenTab.onclick = () => window.trackWuolahOpen(note.title);
    }
    if (btnPdfModalDownload) {
      btnPdfModalDownload.href = note.wuolahUrl;
      btnPdfModalDownload.onclick = () => showToast(`📥 Abriendo enlace de descarga oficial en Wuolah para "${note.title}"...`);
    }

    if (pdfModalBody) {
      pdfModalBody.innerHTML = `
        <div class="pdf-viewer-paper">
          <div class="paper-header">
            <span class="paper-badge">FICHA TÉCNICA Y RESUMEN OFICIAL</span>
            <h3 class="paper-title">${note.title}</h3>
            <div class="paper-meta-row">
              <span><strong>Materia:</strong> ${subject.name} (${subject.course}º Curso)</span>
              <span><strong>Autor:</strong> @${note.uploader}</span>
              <span><strong>Valoración:</strong> ★ ${note.rating}</span>
              <span><strong>Extensión:</strong> ${note.pages} páginas</span>
              <span><strong>Acceso:</strong> 100% Gratuito en Wuolah</span>
            </div>
          </div>

          <div class="paper-content">
            <div class="paper-section">
              <h4 class="paper-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Descripción y Utilidad para el Examen
              </h4>
              <p class="paper-desc">${note.description}</p>
            </div>

            <div class="paper-section paper-tips-box">
              <h4 class="paper-section-title" style="color: #f59e0b;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Consejos de Aprobado en la ETSI UMA
              </h4>
              <p>${subject.examTips}</p>
            </div>

            <div class="paper-section" style="text-align: center; padding: 20px; background: rgba(99, 102, 241, 0.08); border-radius: var(--radius-md); border: 1px dashed rgba(99, 102, 241, 0.3);">
              <h4 style="font-size: 1.05rem; color: #fff; margin-bottom: 8px;">Acceso Completo al Documento Original</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 520px; margin: 0 auto 16px auto;">
                Accede directamente en Wuolah al visor de alta resolución para visualizar el PDF página por página o descargarlo al instante.
              </p>
              <a href="${note.wuolahUrl}" target="_blank" rel="noopener noreferrer" class="btn-explore-degree" style="display: inline-flex; width: auto; padding: 12px 28px;" onclick="window.trackWuolahOpen('${note.title}')">
                <span>Abrir en Wuolah</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
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
  // MODAL ESCÁNER EN TIEMPO REAL
  // ==========================================
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
    const allSubs = (DEGREE_SUBJECTS && DEGREE_SUBJECTS[degree.id]) || [];
    const subject = allSubs.find(s => s.id === subjectId);
    if (!subject) return;

    const slug = subject.wuolahSlug || 'matematica-discreta';
    const course = subject.course || 1;
    const communityId = degree.communityId || 13891;

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
    const githubUrl = `https://github.com/search?q=${encodeURIComponent('uma "' + degree.shortName + '" "' + subject.name + '"')}`;
    const univOcwUrl = `https://www.google.com/search?q=${encodeURIComponent('(site:upm.es OR site:upv.es OR site:uc3m.es) filetype:pdf "' + subject.name + '"')}`;

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
                <div class="note-rating-box">★ ${item.rating}</div>
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
    const googleExamsUrl = `https://www.google.com/search?q=${encodeURIComponent('filetype:pdf "malaga" "' + subject.name + '" examen OR parcial')}`;
    const githubUrl = `https://github.com/search?q=${encodeURIComponent('uma "software" "' + subject.name + '"')}`;

    liveScannerModalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-md); padding: 14px 18px;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 6px;">Puente de Rastreo en Vivo: ${subject.name}</h4>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">
            Lanza la búsqueda en tiempo real. Abre directamente en Wuolah con consultas optimizadas y sin necesidad de precarga estática.
          </p>
        </div>

        <div class="live-results-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div class="live-bridge-card">
            <div class="bridge-card-top">
              <span class="bridge-source-badge badge-wuolah-live">⚡ Wuolah Comunidad UMA</span>
              <span class="bridge-format-tag">En Directo</span>
            </div>
            <h4 class="bridge-card-title">Muro en Tiempo Real de ${subject.acronym}</h4>
            <p class="bridge-card-desc">Acceso directo al canal de la asignatura con los últimos archivos subidos.</p>
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

  // ==========================================
  // EVENT LISTENERS & HELPERS
  // ==========================================
  function setupEventListeners() {
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (searchClearBtn) searchClearBtn.style.display = state.searchQuery ? 'flex' : 'none';
        renderCards();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        state.searchQuery = '';
        searchClearBtn.style.display = 'none';
        renderCards();
      });
    }

    semesterFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        semesterFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedSemester = btn.dataset.value;
        renderCards();
      });
    });

    categoryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedCategory = btn.dataset.value;
        renderCards();
      });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSubjectModal);
    if (subjectModal) {
      subjectModal.addEventListener('click', (e) => {
        if (e.target === subjectModal) closeSubjectModal();
      });
    }

    if (pdfModalCloseBtn) pdfModalCloseBtn.addEventListener('click', window.closePdfViewer);
    if (pdfViewerModal) {
      pdfViewerModal.addEventListener('click', (e) => {
        if (e.target === pdfViewerModal) window.closePdfViewer();
      });
    }
    if (btnPdfModalPrint) {
      btnPdfModalPrint.addEventListener('click', () => window.print());
    }

    if (liveScannerModalCloseBtn) liveScannerModalCloseBtn.addEventListener('click', window.closeLiveScannerModal);
    if (liveScannerModal) {
      liveScannerModal.addEventListener('click', (e) => {
        if (e.target === liveScannerModal) window.closeLiveScannerModal();
      });
    }

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
    state.selectedCourse = 'all';
    state.selectedSemester = 'all';
    state.selectedCategory = 'all';
    state.searchQuery = '';

    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';

    if (courseTabsWrap) {
      courseTabsWrap.querySelectorAll('.course-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.course === 'all');
      });
    }
    semesterFilterBtns.forEach(b => b.classList.toggle('active', b.dataset.value === 'all'));
    categoryFilterBtns.forEach(b => b.classList.toggle('active', b.dataset.value === 'all'));

    renderCards();
  }

  window.trackWuolahOpen = function(title) {
    showToast(`🚀 Abriendo en Wuolah: "${title}"`);
  };

  window.copySubjectShareLink = function(subjectId) {
    const allSubs = (DEGREE_SUBJECTS && DEGREE_SUBJECTS[degree.id]) || [];
    const sub = allSubs.find(s => s.id === subjectId);
    if (!sub) return;
    const url = `${window.location.origin}${window.location.pathname}?carrera=${degree.id}&curso=${sub.course}#${sub.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast(`📋 Enlace copiado: ${sub.name} (${sub.acronym})`);
      });
    } else {
      showToast(`Asignatura: ${sub.name} (${sub.code})`);
    }
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

  // Iniciar
  init();
});
