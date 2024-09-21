// Seleccionar el contenedor donde se insertará el header
const headerPlaceholder = document.getElementById('header-placeholder');

// Cargar el contenido del archivo header.html
fetch('./layouts/header.html')
    .then(response => response.text())
    .then(data => {
    // Insertar el contenido del header en el div
    headerPlaceholder.innerHTML = data;
})
    .catch(error => console.error('Error cargando el header:', error));