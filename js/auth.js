

// Inicializar almacenamiento si no existen datos
function initAuthStorage() {
  const existingUsers = localStorage.getItem('nutrix_users');
  if (!existingUsers) {
    localStorage.setItem('nutrix_users', JSON.stringify([]));
  }
}
// Obtener usuarios guardados
function getUsers() {
  initAuthStorage();
  try {
    return JSON.parse(localStorage.getItem('nutrix_users')) || [];
  } catch (e) {
    return [];
  }
}


// Guardar usuarios
function saveUsers(users) {
  localStorage.setItem('nutrix_users', JSON.stringify(users));
}

// Mostrar alerta visual en el formulario
function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alertBox');
  if (!alertBox) return;

  alertBox.className = `alert-box ${type}`;
  alertBox.textContent = message;
  alertBox.style.display = 'block';


  // Desvanecer después de unos segundos
  clearTimeout(window.alertTimeout);
  window.alertTimeout = setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
}




// Inicialización de la pantalla de LOGIN
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  initAuthStorage();

  const storedSession = localStorage.getItem('nutrix_current_user') || sessionStorage.getItem('nutrix_current_user');
  if (storedSession) {
    showAlert('Ya hay una sesión activa. Redirigiendo al panel...', 'success');
    setTimeout(() => {
      window.location.href = 'panel.html';
    }, 700);
    return;
  }
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value.trim();

    if (!userInput || !passInput) {
      showAlert('Por favor ingrese usuario y contraseña.', 'error');
      return;
    }

    const users = getUsers();
    const matchedUser = users.find(
      (u) => u.username.toLowerCase() === userInput.toLowerCase() && u.password === passInput
    );

    if (matchedUser) {
      showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');

      // Guardar sesión activa
      const sessionData = {
        username: matchedUser.username,
        name: matchedUser.name || matchedUser.username,
        loginAt: new Date().toISOString()
      };

      localStorage.setItem('nutrix_current_user', JSON.stringify(sessionData));
      sessionStorage.setItem('nutrix_current_user', JSON.stringify(sessionData));

      setTimeout(() => {
        window.location.href = 'panel.html';
      }, 700);
    } else {
      showAlert('Usuario o contraseña incorrectos.', 'error');
    }
  });
}

// Inicialización de la pantalla de REGISTRO
function initRegisterPage() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  initAuthStorage();

  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameInput = document.getElementById('fullName').value.trim();
    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value.trim();
    const confirmInput = document.getElementById('confirmPassword').value.trim();

    if (!nameInput || !userInput || !passInput || !confirmInput) {
      showAlert('Todos los campos son obligatorios.', 'error');
      return;
    }

    if (passInput !== confirmInput) {
      showAlert('Las contraseñas no coinciden.', 'error');
      return;
    }

    if (passInput.length < 4) {
      showAlert('La contraseña debe tener al menos 4 caracteres.', 'error');
      return;
    }

    const users = getUsers();
    const userExists = users.some(
      (u) => u.username.toLowerCase() === userInput.toLowerCase()
    );

    if (userExists) {
      showAlert('El nombre de usuario ya está registrado.', 'error');
      return;
    }

    // Registrar nuevo usuario
    users.push({
      username: userInput,
      name: nameInput,
      password: passInput
    });

    saveUsers(users);

    showAlert('¡Registro completado! Redirigiendo al inicio de sesión...', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });
}

// Ejecutar la cargar
document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initRegisterPage();
});
