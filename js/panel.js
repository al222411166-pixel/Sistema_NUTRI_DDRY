


// Claves de LocalStorage
const STORAGE_KEYS = {
  CURRENT_USER: 'nutrix_current_user',
  PATIENTS: 'nutrix_patients',
  CONSULTATIONS: 'nutrix_consultations'
};

// Verificar sesión activa
function checkAuth() {
  const sessionStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!sessionStr) {
    window.location.href = 'index.html';
    return null;
  }
  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    window.location.href = 'index.html';
    return null;
  }
}

// Inicializar datos de ejemplo si está vacío
function initDemoDataIfEmpty() {
  let patients = getPatients();
  if (patients.length === 0) {
    const demoPatients = [
      {
        id: 'p_1',
        name: 'ROLANDO YHAIR',
        age: 22,
        gender: 'Masculino',
        weight: 68,
        height: 1.72,
        imc: 22.99,
        status: 'Normal',
        statusKey: 'normal',
        registeredAt: '2026-09-12'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(demoPatients));

    // Consulta de ejemplo
    const demoConsultations = [
      {
        id: 'c_1',
        patientId: 'p_1',
        patientName: 'ROLANDO YHAIR',
        date: '2026-09-12',
        time: '10:00',
        imc: 22.99,
        status: 'Normal',
        evolution: 'Paciente acude a valoración nutricional. Hábitos saludables y adecuado nivel de actividad física.',
        plan: 'Plan de alimentación balanceado normocalórico con aporte adecuado de proteínas e hidratación continua.',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(demoConsultations));
  }
}

// Obtener lista de pacientes
function getPatients() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS)) || [];
  } catch (e) {
    return [];
  }
}

// Guardar lista de pacientes
function savePatients(patients) {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
}
// Obtener lista de consultas
function getConsultations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONSULTATIONS)) || [];
  } catch (e) {
    return [];
  }
}



// Guardar lista de consultas
function saveConsultations(consultations) {
  localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
}

// Cálculo y clasificación del IMC
function computeIMC(weightKg, heightMeters) {
  if (!weightKg || !heightMeters || heightMeters <= 0 || weightKg <= 0) {
    return null;
  }
  const imc = weightKg / (heightMeters * heightMeters);
  const roundedIMC = parseFloat(imc.toFixed(2));

  let status = 'Normal';
  let statusKey = 'normal';

  if (imc < 18.5) {
    status = 'Bajo Peso';
    statusKey = 'bajo';
  } else if (imc < 25.0) {
    status = 'Normal';
    statusKey = 'normal';
  } else if (imc < 30.0) {
    status = 'Sobrepeso';
    statusKey = 'sobrepeso';
  } else {
    status = 'Obesidad';
    statusKey = 'obesidad';
  }

  return {
    imc: roundedIMC,
    status: status,
    statusKey: statusKey
  };
}



function updateLiveIMC() {
  const weightInput = document.getElementById('patientWeight');
  const heightInput = document.getElementById('patientHeight');
  const imcNumberElem = document.getElementById('calculatedIMCNumber');
  const imcBadgeElem = document.getElementById('calculatedIMCBadge');

  if (!weightInput || !heightInput || !imcNumberElem || !imcBadgeElem) return;

  const weight = parseFloat(weightInput.value);
  const height = parseFloat(heightInput.value);

  const result = computeIMC(weight, height);

  if (result) {
    imcNumberElem.textContent = result.imc.toFixed(2);
    imcBadgeElem.textContent = result.status.toUpperCase();
    imcBadgeElem.className = `imc-badge-status ${result.statusKey}`;
  } else {
    imcNumberElem.textContent = '--';
    imcBadgeElem.textContent = 'SIN CALCULAR';
    imcBadgeElem.className = 'imc-badge-status sin-calcular';
  }
}
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function populatePatientSelect(selectedId = null) {
  const selectElem = document.getElementById('consultationPatientSelect');
  const filterSelect = document.getElementById('historyFilterSelect');
  if (!selectElem) return;

  const patients = getPatients();

  // Limpiar selector principal
  selectElem.innerHTML = '<option value="">-- Selecciona un paciente --</option>';

  patients.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.status})`;
    if (selectedId && p.id === selectedId) {
      opt.selected = true;
    }
    selectElem.appendChild(opt);
  });

  // Selector de filtro de historial
  if (filterSelect) {
    const currentFilter = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">Todos los pacientes</option>';
    patients.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (currentFilter === p.id) {
        opt.selected = true;
      }
      filterSelect.appendChild(opt);
    });
  }

  // Actualizar resumen del paciente seleccionado
  updatePatientSummary();
}

// Actualizar badges de información del paciente seleccionado
function updatePatientSummary() {
  const selectElem = document.getElementById('consultationPatientSelect');
  const summaryContainer = document.getElementById('selectedPatientSummary');
  if (!selectElem || !summaryContainer) return;

  const patientId = selectElem.value;
  if (!patientId) {
    summaryContainer.innerHTML = '<span style="font-size:0.85rem; color:#94a3b8; font-style:italic;">Selecciona un paciente para ver sus datos clínicos</span>';
    return;
  }

  const patients = getPatients();
  const patient = patients.find((p) => p.id === patientId);

  if (patient) {
    summaryContainer.innerHTML = `
      <div class="info-pill">${patient.age} años • ${patient.gender || 'No especificado'}</div>
      <div class="info-pill">${patient.weight} kg / ${patient.height} m</div>
      <div class="info-pill imc-pill">IMC: ${patient.imc}</div>
      <div class="info-pill" style="background-color: ${patient.statusKey === 'obesidad' ? '#fee2e2' : patient.statusKey === 'sobrepeso' ? '#fef3c7' : '#dcfce7'}; color: ${patient.statusKey === 'obesidad' ? '#b91c1c' : patient.statusKey === 'sobrepeso' ? '#b45309' : '#15803d'}; font-weight:700;">
        ${patient.status}
      </div>
    `;
  }
}

// Renderizar Historial de Consultas
function renderConsultationHistory() {
  const historyList = document.getElementById('consultationHistoryList');
  const historyCount = document.getElementById('historyCount');
  const filterSelect = document.getElementById('historyFilterSelect');
  if (!historyList) return;

  const consultations = getConsultations();
  const filterVal = filterSelect ? filterSelect.value : 'all';

  const filtered = filterVal === 'all'
    ? consultations
    : consultations.filter((c) => c.patientId === filterVal);

  if (historyCount) {
    historyCount.textContent = `Total: ${filtered.length} registro(s)`;
  }

  if (filtered.length === 0) {
    historyList.innerHTML = `
      <div class="history-empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p>No se encontraron consultas registradas.</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = '';
  // Regla de Oro 3: Mostrar las notas médicas más recientes hasta arriba
  const sorted = [...filtered].sort((a, b) => {
    const timeA = new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}`).getTime() || 0;
    const timeB = new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}`).getTime() || 0;
    return timeB - timeA;
  });

  sorted.forEach((c) => {
    const item = document.createElement('div');
    item.className = 'history-item-card';

    // Formato de fecha legible
    let dateFormatted = c.date;
    try {
      const parts = c.date.split('-');
      if (parts.length === 3) {
        dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (e) { }

    item.innerHTML = `
      <button class="btn-delete-item" title="Eliminar consulta" onclick="deleteConsultation('${c.id}')">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
      <div class="history-item-top">
        <div class="history-patient-name">
          ${c.patientName}
        </div>
        <div class="history-datetime">
          ${dateFormatted} &nbsp;•&nbsp; ${c.time || 'N/A'}
        </div>
      </div>
      <div class="history-details-grid">
        <div class="history-detail-block">
          <div class="history-detail-title">Evolución del Paciente</div>
          <div class="history-detail-text">${c.evolution || 'Sin notas de evolución.'}</div>
        </div>
        <div class="history-detail-block">
          <div class="history-detail-title">Plan de Alimentación</div>
          <div class="history-detail-text">${c.plan || 'Sin plan especificado.'}</div>
        </div>
      </div>
    `;
    historyList.appendChild(item);
  });
}

// Eliminar consulta individual
window.deleteConsultation = function (consultationId) {
  if (confirm('¿Desea eliminar este registro de consulta?')) {
    let consultations = getConsultations();
    consultations = consultations.filter((c) => c.id !== consultationId);
    saveConsultations(consultations);
    renderConsultationHistory();
    showToast('Consulta eliminada exitosamente.', 'warning');
  }
};

// Configurar fecha y hora actuales en el formulario de consulta
function setDefaultConsultationDateTime() {
  const dateInput = document.getElementById('consultationDate');
  const timeInput = document.getElementById('consultationTime');

  const now = new Date();
  if (dateInput && !dateInput.value) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }

  if (timeInput && !timeInput.value) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeInput.value = `${hours}:${minutes}`;
  }
}

// Inicialización del Dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión
  const currentUser = checkAuth();
  if (!currentUser) return;

  // Mostrar nombre de sesión en la cabecera
  const sessionUserDisplay = document.getElementById('sessionUserName');
  if (sessionUserDisplay) {
    sessionUserDisplay.textContent = currentUser.username || currentUser.name || 'USUARIO';
  }

  // Inicializar datos demo si no existen
  initDemoDataIfEmpty();

  // Configurar fechas por defecto
  setDefaultConsultationDateTime();

  // Cargar lista de pacientes y sus selects
  populatePatientSelect();

  renderConsultationHistory();

  // Evento para cálculo dinámico de IMC mientras se escribe
  const patientWeight = document.getElementById('patientWeight');
  const patientHeight = document.getElementById('patientHeight');
  if (patientWeight) patientWeight.addEventListener('input', updateLiveIMC);
  if (patientHeight) patientHeight.addEventListener('input', updateLiveIMC);

  // Evento de selección de paciente
  const patientSelect = document.getElementById('consultationPatientSelect');
  if (patientSelect) {
    patientSelect.addEventListener('change', updatePatientSummary);
  }

  // Evento de filtro de historial
  const historyFilterSelect = document.getElementById('historyFilterSelect');
  if (historyFilterSelect) {
    historyFilterSelect.addEventListener('change', renderConsultationHistory);
  }

  // Guardar Paciente
  const formPatient = document.getElementById('formRegisterPatient');
  if (formPatient) {
    formPatient.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('patientName').value.trim();
      const age = parseInt(document.getElementById('patientAge').value);
      const gender = document.getElementById('patientGender').value;
      const weight = parseFloat(document.getElementById('patientWeight').value);
      const height = parseFloat(document.getElementById('patientHeight').value);

      if (!name || isNaN(age) || isNaN(weight) || isNaN(height)) {
        showToast('Por favor completa todos los campos del paciente.', 'error');
        return;
      }

      if (height <= 0 || weight <= 0) {
        showToast('El peso y la altura deben ser valores mayores a cero.', 'error');
        return;
      }

      const imcResult = computeIMC(weight, height);
      const newPatient = {
        id: 'p_' + Date.now(),
        name: name.toUpperCase(),
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        imc: imcResult.imc,
        status: imcResult.status,
        statusKey: imcResult.statusKey,
        registeredAt: new Date().toISOString().split('T')[0]
      };

      const patients = getPatients();
      patients.push(newPatient);
      savePatients(patients);

      // Limpiar formulario y resetear IMC
      formPatient.reset();
      updateLiveIMC();

      // Actualizar selectores y seleccionar inmediatamente al paciente recién creado
      populatePatientSelect(newPatient.id);

      showToast(`Paciente ${newPatient.name} guardado correctamente.`, 'success');
    });
  }

  // Guardar Consulta
  const formConsultation = document.getElementById('formNewConsultation');
  if (formConsultation) {
    formConsultation.addEventListener('submit', (e) => {
      e.preventDefault();

      const patientSelect = document.getElementById('consultationPatientSelect');
      const patientId = patientSelect.value;
      const date = document.getElementById('consultationDate').value;
      const time = document.getElementById('consultationTime').value;
      const evolution = document.getElementById('consultationEvolution').value.trim();
      const plan = document.getElementById('consultationPlan').value.trim();

      if (!patientId) {
        showToast('Por favor selecciona un paciente.', 'warning');
        return;
      }

      if (!date || !time) {
        showToast('Por favor especifica fecha y hora de la consulta.', 'warning');
        return;
      }

      const patients = getPatients();
      const patient = patients.find((p) => p.id === patientId);

      const newConsultation = {
        id: 'c_' + Date.now(),
        patientId: patientId,
        patientName: patient ? patient.name : 'Paciente',
        date: date,
        time: time,
        imc: patient ? patient.imc : null,
        status: patient ? patient.status : '',
        evolution: evolution,
        plan: plan,
        createdAt: new Date().toISOString()
      };

      const consultations = getConsultations();
      consultations.push(newConsultation);
      saveConsultations(consultations);

      // Limpiar notas de consulta
      document.getElementById('consultationEvolution').value = '';
      document.getElementById('consultationPlan').value = '';

      renderConsultationHistory();
      showToast('Consulta guardada correctamente en el historial.', 'success');
    });
  }

  // Cerrar Sesión
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('¿Desea cerrar la sesión actual?')) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        window.location.href = 'index.html';
      }
    });
  }


  // Borrar todos los datos
  const btnClearAll = document.getElementById('btnClearAll');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas restablecer todos los pacientes y consultas?')) {
        localStorage.removeItem(STORAGE_KEYS.PATIENTS);
        localStorage.removeItem(STORAGE_KEYS.CONSULTATIONS);
        initDemoDataIfEmpty();
        populatePatientSelect();
        renderConsultationHistory();
        showToast('Datos reiniciados al estado inicial.', 'warning');
      }
    });
  }
});
