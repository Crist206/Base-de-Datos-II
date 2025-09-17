document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const loginFormContainer = document.getElementById('login-form-container');
    const showLoginBtn = document.getElementById('show-login-btn');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const userSession = document.getElementById('user-session');
    const loggedInUser = document.getElementById('logged-in-user');
    const logoutBtn = document.getElementById('logout-btn');
    
    const sidebar = document.getElementById('sidebar');
    const pageContent = document.getElementById('page-content');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    
    const themeToggle = document.getElementById('theme-toggle');

    // --- Credenciales (solo para demostración) ---
    const CORRECT_USERNAME = 'admin';
    const CORRECT_PASSWORD = '123';

    // --- LÓGICA DE SESIÓN ---
    showLoginBtn.addEventListener('click', () => {
        loginFormContainer.classList.toggle('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            loginFormContainer.classList.add('hidden');
            showLoginBtn.classList.add('hidden');
            userSession.classList.remove('hidden');
            loggedInUser.textContent = username;
            errorMessage.textContent = '';
            e.target.reset();
        } else {
            errorMessage.textContent = 'Credenciales incorrectas.';
        }
    });

    logoutBtn.addEventListener('click', () => {
        userSession.classList.add('hidden');
        showLoginBtn.classList.remove('hidden');
    });

    // --- LÓGICA DE BARRA LATERAL PLEGABLE ---
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
        pageContent.classList.toggle('sidebar-open');
    });

    // --- LÓGICA DE CAMBIO DE TEMA ---
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Revisa el tema guardado al cargar la página
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'light') {
            themeToggle.checked = true;
        }
    }
});