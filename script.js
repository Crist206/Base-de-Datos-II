document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA COMÚN PARA TODAS LAS PÁGINAS ---
    // (Esta parte no cambia: maneja la barra lateral, el tema y la sesión)
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

    // --- LÓGICA ESPECÍFICA PARA LAS PÁGINAS DE SEMANA ---
    if (document.body.classList.contains('content-page')) {
        
        // --- CONEXIÓN A SUPABASE ---
        const SUPABASE_URL = 'https://thjdrtcszyxccxvdapkd.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoamRydGNzenl4Y2N4dmRhcGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTEwOTUsImV4cCI6MjA3NDkyNzA5NX0.o7ZjTB_xBNR-9UKiBBe1fQR1xK4H_k1lL48_p2sQAhg';
        const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // --- FIN DE LA CONEXIÓN ---

        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part && part.toLowerCase().startsWith('semana'));
        const semanaFolder = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';
        
        const semanaId = parseInt(semanaFolder.replace('Semana-', ''));

        const tituloSemana = document.getElementById('titulo-semana');
        if (tituloSemana && semanaFolder) {
            tituloSemana.textContent = `Contenido de la ${semanaFolder.replace(/-/g, ' ')}`;
        }
        document.title = `${semanaFolder.replace(/-/g, ' ')} - Repositorio`;

        const fileList = document.getElementById('lista-archivos');

        async function cargarArchivos() {
            if (!fileList || !semanaId) {
                console.error("No se pudo determinar la semana o la lista de archivos.");
                return;
            }

            const { data: archivos, error } = await supabase
                .from('archivos')
                .select('*')
                .eq('semana_id', semanaId);

            if (error) {
                console.error('Error al cargar archivos desde Supabase:', error);
                fileList.innerHTML = '<li class="file-item-empty">Error al cargar la lista de archivos.</li>';
                return;
            }

            if (!archivos || archivos.length === 0) {
                fileList.innerHTML = '<li class="file-item-empty">Aún no hay archivos para esta semana.</li>';
                return;
            }
            
            let html = '';
            const isAdmin = sessionStorage.getItem('userIsAdmin') === 'true';

            for (const file of archivos) {
                let fileContentHtml = '';
                const cleanFileName = file.nombre;

                if (file.tipo === 'imagen') {
                    fileContentHtml = `<a href="${file.url_recurso}" target="_blank" title="Ver imagen completa"><div class="file-info"><span class="file-icon">🖼️</span><span class="file-name">${cleanFileName}</span></div><img src="${file.url_recurso}" alt="${cleanFileName}" class="file-preview-image"></a>`;
                } else if (file.tipo === 'pdf') {
                    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url_recurso)}&embedded=true`;
                    fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">📄</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper aspect-ratio-portrait"><iframe src="${googleViewerUrl}" frameborder="0"></iframe></div></div>`;
                } else if (file.tipo === 'docx') {
                    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url_recurso)}`;
                    fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">📄</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper aspect-ratio-portrait"><iframe src="${officeViewerUrl}" frameborder="0"></iframe></div></div>`;
                } else if (file.tipo === 'canva') {
                    const embedUrl = file.url_recurso.replace('/view', '/embed');
                    fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">🎨</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper aspect-ratio-landscape"><iframe loading="lazy" src="${embedUrl}"></iframe></div></div>`;
                } else { // 'enlace' o cualquier otro
                    fileContentHtml = `<a href="${file.url_recurso}" target="_blank" class="file-link-button"><div class="file-info"><div class="file-info-main"><span class="file-icon">🔗</span><span class="file-name">${cleanFileName}</span></div><span class="open-link-text">Abrir Enlace →</span></div></a>`;
                }
                
                let itemHtml = `<li class="file-item">${fileContentHtml}`;
                if (isAdmin) {
                    itemHtml += `<div class="file-actions">
                                  <button class="action-btn btn-edit" data-id="${file.id}">🖊️ Editar</button>
                                  <button class="action-btn btn-delete" data-id="${file.id}">🗑️ Eliminar</button>
                               </div>`;
                }
                itemHtml += `</li>`;
                html += itemHtml;
            }
            fileList.innerHTML = html;
        }

        cargarArchivos();
    }
});