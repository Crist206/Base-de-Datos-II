document.addEventListener('DOMContentLoaded', () => {
    // --- NUEVO: LÓGICA DEL PRELOADER ---
    const preloader = document.getElementById('preloader');
    const siteContent = document.getElementById('site-content');

    // Oculta el preloader y muestra el contenido cuando la página está completamente cargada
    window.addEventListener('load', () => {
        if (preloader) {
            preloader.style.opacity = '0';
            // Espera a que termine la transición para quitarlo del todo
            setTimeout(() => {
                preloader.style.display = 'none';
                if (siteContent) {
                    siteContent.style.visibility = 'visible';
                }
            }, 500);
        } else if (siteContent) {
            siteContent.style.visibility = 'visible';
        }
    });

    // --- LÓGICA COMÚN (Sin cambios) ---
    const sidebar = document.getElementById('sidebar');
    const pageContent = document.getElementById('page-content');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const themeToggle = document.getElementById('theme-toggle');
    if (sidebarToggleBtn && sidebar && pageContent) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            pageContent.classList.toggle('sidebar-open');
        });
    }
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'light') {
                themeToggle.checked = true;
            }
        }
    }
    const loginFormContainer = document.getElementById('login-form-container');
    const showLoginBtn = document.getElementById('show-login-btn');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const userSession = document.getElementById('user-session');
    const loggedInUser = document.getElementById('logged-in-user');
    const logoutBtn = document.getElementById('logout-btn');
    const CORRECT_USERNAME = 'admin';
    const CORRECT_PASSWORD = '123';
    if(showLoginBtn) { showLoginBtn.addEventListener('click', () => { loginFormContainer.classList.toggle('hidden'); }); }
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (e.target.username.value === CORRECT_USERNAME && e.target.password.value === CORRECT_PASSWORD) {
                sessionStorage.setItem('userIsAdmin', 'true');
                checkAdminStatus();
            } else {
                errorMessage.textContent = 'Credenciales incorrectas.';
            }
        });
    }
    if(logoutBtn) { logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('userIsAdmin'); checkAdminStatus(); }); }
    function checkAdminStatus() {
        const isAdmin = sessionStorage.getItem('userIsAdmin') === 'true';
        if(loginFormContainer) loginFormContainer.classList.toggle('hidden', isAdmin);
        if(showLoginBtn) showLoginBtn.classList.toggle('hidden', isAdmin);
        if(userSession) userSession.classList.toggle('hidden', !isAdmin);
        if(loggedInUser) loggedInUser.textContent = CORRECT_USERNAME;
        const addFileContainer = document.getElementById('add-file-container');
        if (addFileContainer) addFileContainer.classList.toggle('hidden', !isAdmin);
        document.querySelectorAll('.file-actions').forEach(actions => {
            actions.style.display = isAdmin ? 'flex' : 'none';
        });
        const sessionStatus = document.getElementById('session-status');
        if(sessionStatus) sessionStatus.textContent = isAdmin ? 'Modo: Administrador' : 'Modo: Visitante';
    }
    checkAdminStatus();

});