/* -------------------------------------------------
   script.js – Lógica de la malla interactiva
   - Marca / desmarca ramos como aprobados al clic
   - Desbloquea cursos dependientes cuando se cumplen
     todos sus prerrequisitos
   - Al recargar la página, mantiene estado usando
     localStorage
   ------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const courses = Array.from(document.querySelectorAll('.course'));
  const STORAGE_KEY = 'mallaPUCV.aprobados';

  // Recupera estado guardado
  const approvedSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

  /** Actualiza bloqueos y estilos según aprobados actuales */
  function updateLocks() {
    courses.forEach(course => {
      const id = course.dataset.id;
      const prereqs = (course.dataset.prereqs || '').split(',').filter(Boolean);

      const allMet = prereqs.every(pr => approvedSet.has(pr));
      if (allMet) {
        course.classList.remove('is-locked');
      } else {
        course.classList.add('is-locked');
        // Si un ramo se bloquea, también se des‑aprueba visualmente
        if (approvedSet.has(id)) {
          approvedSet.delete(id);
          course.classList.remove('is-approved');
        }
      }
    });
  }

  /** Pinta clases de aprobado según Set */
  function renderApproved() {
    courses.forEach(course => {
      const id = course.dataset.id;
      course.classList.toggle('is-approved', approvedSet.has(id));
    });
  }

  /** Guarda el Set en localStorage */
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(approvedSet)));
  }

  // Primer render
  updateLocks();
  renderApproved();

  // ********** EVENTOS **********
  courses.forEach(course => {
    course.addEventListener('click', () => {
      if (course.classList.contains('is-locked')) return; // bloqueado

      const id = course.dataset.id;
      const isApproved = approvedSet.has(id);

      if (isApproved) {
        approvedSet.delete(id);
      } else {
        approvedSet.add(id);
      }

      renderApproved();
      updateLocks();
      persist();
    });

    // Accesibilidad: toggle con Enter / Space
    course.tabIndex = 0;
    course.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        course.click();
      }
    });
  });
});

