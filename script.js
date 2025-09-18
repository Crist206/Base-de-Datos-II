document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA COMÚN PARA TODAS LAS PÁGINAS ---
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

    if(showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            loginFormContainer.classList.toggle('hidden');
        });
    }

    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
    
            if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
                sessionStorage.setItem('userIsAdmin', 'true');
                checkAdminStatus(); 
            } else {
                errorMessage.textContent = 'Credenciales incorrectas.';
            }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('userIsAdmin');
            checkAdminStatus();
        });
    }

    function checkAdminStatus() {
        const isAdmin = sessionStorage.getItem('userIsAdmin') === 'true';
        if (isAdmin) {
            if(loginFormContainer) loginFormContainer.classList.add('hidden');
            if(showLoginBtn) showLoginBtn.classList.add('hidden');
            if(userSession) userSession.classList.remove('hidden');
            if(loggedInUser) loggedInUser.textContent = CORRECT_USERNAME;
        } else {
            if(userSession) userSession.classList.add('hidden');
            if(showLoginBtn) showLoginBtn.classList.remove('hidden');
        }

        const addFileContainer = document.getElementById('add-file-container');
        if (addFileContainer) {
            if (isAdmin) {
                addFileContainer.classList.remove('hidden');
            } else {
                addFileContainer.classList.add('hidden');
            }
        }
        
        const fileActions = document.querySelectorAll('.file-actions');
        fileActions.forEach(actions => {
            actions.style.display = isAdmin ? 'flex' : 'none';
        });
    }
    
    checkAdminStatus();

    // --- LÓGICA ESPECÍFICA PARA LAS PÁGINAS DE SEMANA ---
    if (document.body.classList.contains('content-page')) {
        const USUARIO = "Crist206"; 
        const REPOSITORIO = "base-de-datos-ii";
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(part => part !== '');
        const semanaFolder = pathParts[pathParts.length - 1];
        
        const tituloSemana = document.getElementById('titulo-semana');
        if (tituloSemana) {
            tituloSemana.textContent = `Contenido de la ${semanaFolder.replace(/-/g, ' ')}`;
        }
        document.title = `${semanaFolder.replace(/-/g, ' ')} - ${REPOSITORIO}`;
        const apiUrl = `https://api.github.com/repos/${USUARIO}/${REPOSITORIO}/contents/${semanaFolder}`;

        function getUrlFromFileContent(content) {
            const lines = content.split('\n');
            const urlLine = lines.find(line => line.trim().startsWith('URL='));
            return urlLine ? urlLine.substring(urlLine.indexOf('=') + 1).trim() : null;
        }

        const fileList = document.getElementById('lista-archivos');
        if (fileList) {
            fetch(apiUrl)
                .then(response => response.json())
                .then(async files => {
                    if (!files || files.message || files.length === 0) {
                        fileList.innerHTML = '<li class="file-item-empty">No se encontraron archivos en esta carpeta.</li>';
                        return;
                    }
                    
                    let html = '';
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                    const isAdmin = sessionStorage.getItem('userIsAdmin') === 'true';

                    // CORRECCIÓN: Se reconstruyó este bucle para asegurar que cada tipo de archivo se procese correctamente.
                    for (const file of files) {
                        if (file.name === 'index.html' || file.name === '.gitkeep') continue;
                        
                        const cleanFileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                        const fileNameLower = file.name.toLowerCase();
                        
                        const isImage = imageExtensions.some(ext => fileNameLower.endsWith(ext));
                        const isUrlFile = fileNameLower.endsWith('.url');
                        const isPdf = fileNameLower.endsWith('.pdf');
                        const isDocx = fileNameLower.endsWith('.docx');
                        
                        let fileContentHtml = '';

                        if (isImage) {
                            fileContentHtml = `<a href="${file.download_url}" target="_blank" title="Ver imagen completa"><div class="file-info"><span class="file-icon">🖼️</span><span class="file-name">${file.name}</span></div><img src="${file.download_url}" alt="${file.name}" class="file-preview-image"></a>`;
                        } else if (isPdf) {
                            const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.download_url)}&embedded=true`;
                            fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">📄</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper aspect-ratio-portrait"><iframe src="${googleViewerUrl}" frameborder="0"></iframe></div></div>`;
                        } else if (isDocx) {
                            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.download_url)}`;
                            fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">📄</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper aspect-ratio-portrait"><iframe src="${officeViewerUrl}" frameborder="0"></iframe></div></div>`;
                        } else if (isUrlFile) {
                             try {
                                const contentResponse = await fetch(file.download_url);
                                const contentText = await contentResponse.text();
                                const externalUrl = getUrlFromFileContent(contentText);
                                if (externalUrl && externalUrl.includes('canva.com/design/')) {
                                    const embedUrl = externalUrl.substring(0, externalUrl.indexOf('?')) + '?embed';
                                    fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">🎨</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper aspect-ratio-landscape"><iframe loading="lazy" src="${embedUrl}"></iframe></div></div>`;
                                } else if (externalUrl) {
                                    fileContentHtml = `<a href="${externalUrl}" target="_blank" title="Abrir enlace externo"><div class="file-info"><span class="file-icon">🔗</span><span class="file-name">${cleanFileName}</span></div></a>`;
                                }
                            } catch (e) { console.error("Error al leer archivo .url", e); }
                        } else {
                            fileContentHtml = `<a href="${file.html_url}" target="_blank" title="Ver archivo en GitHub"><div class="file-info"><span class="file-icon">📄</span><span class="file-name">${file.name}</span></div></a>`;
                        }

                        let itemHtml = `<li class="file-item">${fileContentHtml}`;
                        if (isAdmin) {
                            itemHtml += `<div class="file-actions">
                                          <button class="action-btn btn-edit">🖊️ Editar</button>
                                          <button class="action-btn btn-delete">🗑️ Eliminar</button>
                                       </div>`;
                        }
                        itemHtml += `</li>`;
                        html += itemHtml;
                    }
                    fileList.innerHTML = html || '<li class="file-item-empty">No hay tareas para mostrar en esta semana.</li>';
                })
                .catch(error => {
                    console.error('Error al cargar los archivos:', error);
                    fileList.innerHTML = '<li class="file-item-empty">Error al cargar la lista de archivos.</li>';
                });
        }
    }
});