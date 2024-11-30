// Selección de elementos
const menuButton = document.getElementById('menuButton');
const navMenu = document.getElementById('navMenu');

// Evento para abrir/cerrar el menú
menuButton.addEventListener('click', () => {
  menuButton.classList.toggle('active'); // Anima el ícono
  navMenu.classList.toggle('show'); // Muestra/oculta el menú
});

