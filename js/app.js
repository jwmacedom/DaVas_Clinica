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
