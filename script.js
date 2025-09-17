document.addEventListener('DOMContentLoaded', () => {
    // Apunta al contenedor principal del login, no solo a la sección
    const loginContainer = document.getElementById('login-container'); 
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // --- Define aquí tu usuario y contraseña ---
    const CORRECT_USERNAME = 'admin';
    const CORRECT_PASSWORD = '123';
    // -----------------------------------------

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const username = event.target.username.value;
        const password = event.target.password.value;

        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            // Oculta toda la página de login
            loginContainer.classList.add('hidden');
            // Muestra el contenido principal
            mainContent.classList.remove('hidden');
            // Agrega la clase al body para ajustar estilos si es necesario
            document.body.classList.add('logged-in');

        } else {
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
            event.target.password.value = "";
        }
    });
});