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
// Configuración de Supabase
const SUPABASE_URL = "https://tu-proyecto.supabase.co"; // Cambia esto por tu URL
const SUPABASE_ANON_KEY = "suprabase_jwmacedom";        // Cambia esto por tu clave Anon

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para girar la tarjeta de presentación
function voltearTarjeta() {
  document.getElementById('card').classList.toggle('flipped');
}
