document.getElementById('formRegistro').addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const fecha = document.getElementById('fecha').value;

  const paciente = document.createElement('p');
  paciente.textContent = `Paciente: ${nombre}, Email: ${email}, Fecha de cita: ${fecha}`;

  document.getElementById('listaPacientes').appendChild(paciente);

  this.reset();
});
// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE (Del Paso 3)
// ==========================================
// (Asegúrate de cambiar estos textos por tus datos reales de Supabase)
const SUPABASE_URL = "https://tu-proyecto.supabase.co"; 
const SUPABASE_ANON_KEY = "suprabase_jwmacedom";        

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. EFECTO DE LA TARJETA DE PRESENTACIÓN
// ==========================================
function voltearTarjeta() {
  const card = document.getElementById('card');
  if (card) {
    card.classList.toggle('flipped');
  }
}

// ==========================================
// 3. PASO 4: LÓGICA DEL LOGIN Y REDIRECCIÓN
// ==========================================
// Esperamos a que la página cargue por completo para buscar el formulario
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  
  // Si estamos en la página de login, activamos el escuchador del formulario
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Evita que la página se recargue sola
      
      // Capturamos el correo y contraseña que escribió el usuario
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Intentamos iniciar sesión en el sistema de autenticación de Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // Si hay un error (datos incorrectos, usuario no existe, etc.)
      if (error) {
        alert("Error al iniciar sesión: " + error.message);
        return;
      }

      // Si el login es exitoso, obtenemos el ID del usuario conectado
      const user = data.user;

      // Buscamos en tu tabla 'perfiles' qué rol tiene asignado este ID
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (perfilError || !perfil) {
        alert("Error al obtener el perfil del usuario o no tienes un rol asignado.");
        return;
      }

      // Redireccionamos a la página correspondiente según el rol en la base de datos
      if (perfil.rol === 'admin') {
        window.location.href = 'admin.html';    // Redirige al panel de administración
      } else {
        window.location.href = 'paciente.html'; // Redirige al portal del paciente
      }
    });
  }
});
// ==========================================
// 4. LÓGICA PARA EL PORTAL DEL PACIENTE
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Verificamos si estamos en la página del paciente buscando su formulario de citas
  const formCita = document.getElementById('form-cita');
  if (formCita) {
    // 1. Obtener el usuario actualmente logueado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = 'login.html'; // Si no está logueado, lo mandamos a loguearse
      return;
    }

    // 2. Cargar las citas que ya tiene agendadas este paciente específico
    cargarCitasPaciente(user.id);

    // 3. Escuchar cuando el paciente envíe el formulario para pedir una nueva cita
    formCita.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const fecha = document.getElementById('fecha-cita').value;
      const hora = document.getElementById('hora-cita').value;
      const servicio = document.getElementById('servicio-cita').value;

      // Insertamos la nueva cita en la tabla 'citas' de Supabase
      const { error } = await supabase.from('citas').insert([{
        id_paciente: user.id,
        fecha: fecha,
        hora: hora,
        servicio: servicio,
        estado: 'pendiente'
      }]);

      if (error) {
        alert("Error al agendar cita: " + error.message);
      } else {
        alert("¡Cita solicitada con éxito!");
        formCita.reset(); // Limpia el formulario
        cargarCitasPaciente(user.id); // Recarga la lista de citas
      }
    });
  }

  // ==========================================
  // 5. LÓGICA PARA EL PANEL DE ADMINISTRACIÓN
  // ==========================================
  const tablaAdmin = document.getElementById('tabla-admin-citas');
  if (tablaAdmin) {
    // Cargar TODAS las citas de la base de datos sin filtros
    const { data: citas, error } = await supabase
      .from('citas')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      tablaAdmin.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Error al cargar citas: ${error.message}</td></tr>`;
      return;
    }

    if (citas.length === 0) {
      tablaAdmin.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay citas registradas en el sistema.</td></tr>`;
      return;
    }

    // Dibujamos las filas de la tabla con la información de Supabase
    tablaAdmin.innerHTML = '';
    citas.forEach(cita => {
      tablaAdmin.innerHTML += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 12px;">${cita.id_paciente.substring(0, 8)}...</td>
          <td style="padding: 12px;">${cita.fecha}</td>
          <td style="padding: 12px;">${cita.hora}</td>
          <td style="padding: 12px;">${cita.servicio}</td>
          <td style="padding: 12px;"><span style="background:#ffeeba; padding:4px 8px; border-radius:4px;">${cita.estado}</span></td>
        </tr>
      `;
    });
  }
});

// Función auxiliar para que el paciente vea sus propias citas
async function cargarCitasPaciente(userId) {
  const listaCitas = document.getElementById('lista-citas');
  if (!listaCitas) return;

  const { data: citas, error } = await supabase
    .from('citas')
    .select('*')
    .eq('id_paciente', userId);

  if (error) {
    listaCitas.innerHTML = "Error al cargar tus citas.";
    return;
  }

  if (citas.length === 0) {
    listaCitas.innerHTML = "<p>Aún no tienes citas agendadas.</p>";
    return;
  }

  listaCitas.innerHTML = '';
  citas.forEach(cita => {
    listaCitas.innerHTML += `
      <div style="background: white; padding: 15px; margin: 10px 0; border-left: 5px solid #28a745; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        <strong>📍 ${cita.servicio}</strong> - 📅 ${cita.fecha} a las ⏰ ${cita.hora} <br>
        <small>Estado: <b>${cita.estado}</b></small>
      </div>
    `;
  });
}

// ==========================================
// 6. FUNCIÓN DE CERRAR SESIÓN (Para ambas páginas)
// ==========================================
async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Error al cerrar sesión: " + error.message);
  } else {
    window.location.href = 'login.html'; // Nos manda de vuelta al Login interactivo
  }
}
