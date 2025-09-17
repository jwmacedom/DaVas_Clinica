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
