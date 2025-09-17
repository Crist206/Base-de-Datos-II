document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // --- Define aquí tu usuario y contraseña ---
    const CORRECT_USERNAME = 'admin';
    const CORRECT_PASSWORD = '123';
    // -----------------------------------------

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita que la página se recargue

        const username = event.target.username.value;
        const password = event.target.password.value;

        // Comprueba si el usuario y la contraseña son correctos
        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            // Si son correctos, oculta el login y muestra el contenido
            loginSection.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Cambia el estilo del body para que el contenido principal se vea bien
            document.body.classList.add('logged-in');

        } else {
            // Si son incorrectos, muestra un mensaje de error
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
            // Limpia el campo de contraseña
            event.target.password.value = "";
        }
    });
});