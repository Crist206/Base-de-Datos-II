document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DEL PRELOADER ---
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
    // CORRECCIÓN: La variable se llama 'supabaseClient' para no entrar en conflicto.
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
            // Usamos la variable corregida 'supabaseClient'
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) { errorMessage.textContent = 'Email o contraseña incorrectos.'; }
            else { window.location.reload(); }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            // Usamos la variable corregida 'supabaseClient'
            await supabaseClient.auth.signOut();
            window.location.reload();
        });
    }

    async function checkAdminStatus() {
        // Usamos la variable corregida 'supabaseClient'
        const { data: { session } } = await supabaseClient.auth.getSession();
        const isAdmin = !!session;

        if(loginFormContainer) loginFormContainer.classList.toggle('hidden', isAdmin);
        if(showLoginBtn) showLoginBtn.classList.toggle('hidden', isAdmin);
        if(userSessionInfo) userSessionInfo.classList.toggle('hidden', !isAdmin);
        if(loggedInUser && session) loggedInUser.textContent = session.user.email.split('@')[0];
        
        document.querySelectorAll('.crud-actions-header, .file-actions').forEach(el => {
            el.classList.toggle('hidden', !isAdmin);
        });
        const sessionStatus = document.getElementById('session-status');
        if(sessionStatus) sessionStatus.textContent = isAdmin ? 'Modo: Administrador' : 'Modo: Visitante';
    }
    checkAdminStatus();

    // --- LÓGICA ESPECÍFICA PARA LAS PÁGINAS DE SEMANA ---
    if (document.body.classList.contains('content-page')) {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part && part.toLowerCase().startsWith('semana'));
        const semanaFolder = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';
        const semanaId = parseInt(semanaFolder.replace(/[^0-9]/g, ''));

        const tituloSemana = document.getElementById('titulo-semana');
        if (tituloSemana && semanaFolder) {
            tituloSemana.textContent = `Contenido de la ${semanaFolder.replace(/-/g, ' ')}`;
        }
        
        const fileList = document.getElementById('lista-archivos');

        async function cargarArchivos() {
            if (!fileList || !semanaId) return;

            // Usamos la variable corregida 'supabaseClient'
            const { data: archivos, error } = await supabaseClient.from('archivos').select('*').eq('semana_id', semanaId);

            if (error) {
                console.error('Error al cargar archivos:', error);
                fileList.innerHTML = `<li class="file-item-empty">Error al cargar datos. Revisa las Políticas RLS.</li>`;
                return;
            }
            if (!archivos || archivos.length === 0) {
                fileList.innerHTML = '<li class="file-item-empty">Aún no hay archivos para esta semana.</li>';
                return;
            }
            
            let html = '';
            const { data: { session } } = await supabaseClient.auth.getSession();
            const isAdmin = !!session;

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
                    fileContentHtml = `<a href="${file.url_recurso}" target="_blank" class="file-link-button"><div class="file-info"><div class="file-info-main"><span class="file-icon">🎨</span><span class="file-name">${cleanFileName}</span></div><span class="open-link-text">Abrir en Canva →</span></div></a>`;
                } else {
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

            // Añadir listeners a los botones de CRUD después de que se han creado
            if (isAdmin) {
                document.querySelectorAll('.btn-edit').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const id = e.target.dataset.id;
                        const { data: file } = await supabaseClient.from('archivos').select('*').eq('id', id).single();
                        if (file) openEditModal(file);
                    });
                });
                document.querySelectorAll('.btn-delete').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const id = e.target.dataset.id;
                        if (confirm(`¿Estás seguro de que quieres eliminar '${e.target.closest(".file-item").querySelector(".file-name").textContent}'?`)) {
                            await supabaseClient.from('archivos').delete().eq('id', id);
                            cargarArchivos(); // Recarga la lista
                        }
                    });
                });
            }
        }

        // --- LÓGICA DEL MODAL CRUD ---
        const modal = document.getElementById('crud-modal');
        const modalTitle = document.getElementById('modal-title');
        const crudForm = document.getElementById('crud-form');
        const cancelBtn = document.getElementById('cancel-btn');
        const addNewBtn = document.getElementById('add-new-btn');
        const fileIdInput = document.getElementById('file-id');
        const fileNameInput = document.getElementById('file-name');
        const fileUrlInput = document.getElementById('file-url');
        const fileTypeInput = document.getElementById('file-type');

        function openCreateModal() { if(modal) { crudForm.reset(); fileIdInput.value = ''; modalTitle.textContent = 'Añadir Nuevo Archivo'; modal.classList.remove('hidden'); } }
        function openEditModal(file) { if(modal) { fileIdInput.value = file.id; fileNameInput.value = file.nombre; fileUrlInput.value = file.url_recurso; fileTypeInput.value = file.tipo; modalTitle.textContent = `Editando: ${file.nombre}`; modal.classList.remove('hidden'); } }
        function closeModal() { if(modal) modal.classList.add('hidden'); }
        
        if(addNewBtn) addNewBtn.addEventListener('click', openCreateModal);
        if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if(crudForm) {
            crudForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = fileIdInput.value;
                const fileData = { nombre: fileNameInput.value, url_recurso: fileUrlInput.value, tipo: fileTypeInput.value, semana_id: semanaId };
                if (id) { await supabaseClient.from('archivos').update(fileData).eq('id', id); } 
                else { await supabaseClient.from('archivos').insert([fileData]); }
                closeModal();
                cargarArchivos();
            });
        }
        
        cargarArchivos();
    }
});