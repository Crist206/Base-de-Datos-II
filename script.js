document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DEL PRELOADER (CORREGIDA) ---
    const preloader = document.getElementById('preloader');
    const siteContent = document.getElementById('site-content');

    if (preloader && siteContent) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            siteContent.style.visibility = 'visible';
            preloader.addEventListener('transitionend', () => {
                preloader.style.display = 'none';
            }, { once: true });
        }, 200);
    } else if (siteContent) {
        siteContent.style.visibility = 'visible';
    }

    // --- CONEXIÓN A SUPABASE (CORREGIDA) ---
    const SUPABASE_URL = 'https://thjdrtcszyxccxvdapkd.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoamRydGNzenl4Y2N4dmRhcGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTEwOTUsImV4cCI6MjA3NDkyNzA5NX0.o7ZjTB_xBNR-9UKiBBe1fQR1xK4H_k1lL48_p2sQAhg';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- LÓGICA COMÚN (Barra lateral, Tema, etc.) ---
    const sidebar = document.getElementById('sidebar');
    const pageContent = document.getElementById('page-content');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn && sidebar && pageContent) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            pageContent.classList.toggle('sidebar-open');
        });
    }
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) { document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('theme', 'light'); } 
            else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); }
        });
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'light') themeToggle.checked = true;
        }
    }

    // --- LÓGICA DE SESIÓN CON SUPABASE ---
    const loginFormContainer = document.getElementById('login-form-container');
    const showLoginBtn = document.getElementById('show-login-btn');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const userSessionInfo = document.getElementById('user-session');
    const loggedInUser = document.getElementById('logged-in-user');
    const logoutBtn = document.getElementById('logout-btn');

    if(showLoginBtn) { showLoginBtn.addEventListener('click', () => { loginFormContainer.classList.toggle('hidden'); }); }

    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.username.value;
            const password = e.target.password.value;
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) { errorMessage.textContent = 'Email o contraseña incorrectos.'; }
            else { window.location.reload(); }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.reload();
        });
    }

    async function checkAdminStatus() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const isAdmin = !!session;

        if(loginFormContainer) loginFormContainer.classList.toggle('hidden', isAdmin);
        if(showLoginBtn) showLoginBtn.classList.toggle('hidden', isAdmin);
        if(userSessionInfo) userSessionInfo.classList.toggle('hidden', !isAdmin);
        if(loggedInUser && session) loggedInUser.textContent = session.user.email.split('@')[0];
        
        const addFileContainer = document.getElementById('add-file-container');
        if (addFileContainer) addFileContainer.classList.toggle('hidden', !isAdmin);
        
        document.querySelectorAll('.file-actions').forEach(el => {
            el.style.display = isAdmin ? 'flex' : 'none';
        });

        const sessionStatus = document.getElementById('session-status');
        if(sessionStatus) sessionStatus.textContent = isAdmin ? 'Modo: Administrador' : 'Modo: Visitante';
    }
    checkAdminStatus();
});