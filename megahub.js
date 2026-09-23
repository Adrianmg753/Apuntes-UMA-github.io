/**
 * MegaHub de la ETSI Informática (UMA)
 * Selector de Carreras (1º a 4º/5º Curso)
 * 
 * Desarrollado y coordinado por Adrián Morales con la UMA.
 */

document.addEventListener('DOMContentLoaded', () => {
  const degreesGrid = document.getElementById('degreesGrid');
  const degreeSearchInput = document.getElementById('degreeSearchInput');
  const totalSubjectsCountEl = document.getElementById('totalSubjectsCount');

  // Calcular número total de asignaturas en el hub
  let totalHubSubjects = 0;
  if (typeof DEGREE_SUBJECTS !== 'undefined') {
    Object.values(DEGREE_SUBJECTS).forEach(list => {
      totalHubSubjects += (list || []).length;
    });
  }

  if (totalSubjectsCountEl && totalHubSubjects > 0) {
    totalSubjectsCountEl.textContent = `${totalHubSubjects}+`;
  }

  // Mapa de iconos SVG para cada carrera
  function getDegreeIconSvg(iconName, color) {
    switch (iconName) {
      case 'code':
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>`;
      case 'terminal':
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>`;
      case 'cpu':
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line>
          <line x1="15" y1="1" x2="15" y2="4"></line>
          <line x1="9" y1="20" x2="9" y2="23"></line>
          <line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line>
          <line x1="20" y1="14" x2="23" y2="14"></line>
          <line x1="1" y1="9" x2="4" y2="9"></line>
          <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>`;
      case 'shield':
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <circle cx="12" cy="11" r="3"></circle>
        </svg>`;
      case 'activity':
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>`;
      case 'layers':
      default:
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>`;
    }
  }

  // Renderizar las tarjetas de grados
  function renderDegrees(filterQuery = '') {
    if (!degreesGrid || typeof ETSI_DEGREES === 'undefined') return;

    const query = filterQuery.toLowerCase().trim();
    const filtered = ETSI_DEGREES.filter(deg => {
      if (!query) return true;
      return deg.name.toLowerCase().includes(query) ||
             deg.acronym.toLowerCase().includes(query) ||
             deg.summary.toLowerCase().includes(query) ||
             (deg.professions && deg.professions.some(p => p.toLowerCase().includes(query)));
    });

    if (filtered.length === 0) {
      degreesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(255,255,255,0.02); border-radius: var(--radius-lg); border: 1px dashed rgba(255,255,255,0.1);">
          <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 8px;">No se encontraron carreras que coincidan con "<strong>${filterQuery}</strong>".</p>
          <button class="filter-btn active" onclick="document.getElementById('degreeSearchInput').value=''; window.renderDegrees('');" style="margin-top: 10px;">
            Ver todas las carreras
          </button>
        </div>
      `;
      return;
    }

    degreesGrid.innerHTML = filtered.map(deg => {
      const subs = (typeof DEGREE_SUBJECTS !== 'undefined' && DEGREE_SUBJECTS[deg.id]) || [];
      const subCount = subs.length;
      const professionsHtml = (deg.professions || []).slice(0, 3).map(p => 
        `<span class="degree-profession-tag">${p}</span>`
      ).join('');

      return `
        <article class="degree-card" style="--degree-color: ${deg.color};">
          <div class="degree-card-header">
            <div class="degree-card-icon" style="background: ${deg.color}15; border-color: ${deg.color}40;">
              ${getDegreeIconSvg(deg.icon, deg.color)}
            </div>
            <div>
              <div class="degree-meta-top">
                <span class="degree-badge-acronym" style="background: ${deg.color}20; border-color: ${deg.color}50; color: #fff;">${deg.acronym}</span>
                <span class="degree-badge-plan">${deg.badge}</span>
              </div>
              <h3 class="degree-card-title">${deg.name}</h3>
            </div>
          </div>

          <p class="degree-card-desc">
            ${deg.summary}
          </p>

          <div class="degree-stats-row">
            <div class="degree-stat-col">
              <div class="degree-stat-label">Cursos</div>
              <div class="degree-stat-value">1º a ${deg.courses}º</div>
            </div>
            <div class="degree-stat-col">
              <div class="degree-stat-label">Créditos</div>
              <div class="degree-stat-value">${deg.ects} ECTS</div>
            </div>
            <div class="degree-stat-col">
              <div class="degree-stat-label">Asignaturas</div>
              <div class="degree-stat-value">${subCount > 0 ? subCount : 'Ver catálogo'}</div>
            </div>
          </div>

          <div class="degree-professions-tags">
            ${professionsHtml}
          </div>

          <div class="degree-card-actions">
            <a href="carrera.html?carrera=${deg.id}" class="btn-explore-degree" style="background: linear-gradient(135deg, ${deg.color} 0%, rgba(99, 102, 241, 0.9) 100%);">
              <span>Explorar Carrera (1º a ${deg.courses}º)</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a href="${deg.wuolahUrl}" target="_blank" rel="noopener noreferrer" class="btn-degree-wuolah-hub" title="Abrir comunidad oficial de ${deg.shortName} en Wuolah">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Wuolah</span>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  window.renderDegrees = renderDegrees;

  // Event listener para el buscador de grados
  if (degreeSearchInput) {
    degreeSearchInput.addEventListener('input', (e) => {
      renderDegrees(e.target.value);
    });
  }

  // Render inicial
  renderDegrees();
});
