document.addEventListener('DOMContentLoaded', () => {
    // Revisa si el usuario es admin
    const isAdmin = sessionStorage.getItem('userIsAdmin') === 'true';
    const sessionStatus = document.getElementById('session-status');
    const addFileContainer = document.getElementById('add-file-container');

    // Actualiza el texto y muestra el botón "Añadir" si es admin
    if (isAdmin) {
        sessionStatus.textContent = 'Modo: Administrador';
        addFileContainer.classList.remove('hidden');
    }

    // --- El resto del script para cargar archivos es igual ---
    const USUARIO = "Crist206"; 
    const REPOSITORIO = "base-de-datos-ii";
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(part => part !== '');
    const semanaFolder = pathParts[pathParts.length - 1];
    document.getElementById('titulo-semana').textContent = `Contenido de la ${semanaFolder.replace(/-/g, ' ')}`;
    document.title = `${semanaFolder.replace(/-/g, ' ')} - ${REPOSITORIO}`;
    const apiUrl = `https://api.github.com/repos/${USUARIO}/${REPOSITORIO}/contents/${semanaFolder}`;

    function getUrlFromFileContent(content) {
        const lines = content.split('\n');
        const urlLine = lines.find(line => line.trim().startsWith('URL='));
        return urlLine ? urlLine.substring(urlLine.indexOf('=') + 1).trim() : null;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(async files => {
            const fileList = document.getElementById('lista-archivos');
            if (files.message || files.length === 0) {
                fileList.innerHTML = '<li class="file-item-empty">No se encontraron archivos en esta carpeta.</li>';
                return;
            }
            
            let html = '';
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

            for (const file of files) {
                if (file.name === 'index.html' || file.name === '.gitkeep') continue;
                const fileNameLower = file.name.toLowerCase();
                const isImage = imageExtensions.some(ext => fileNameLower.endsWith(ext));
                const isUrlFile = fileNameLower.endsWith('.url');
                const isPdf = fileNameLower.endsWith('.pdf');
                const isDocx = fileNameLower.endsWith('.docx');
                let fileType = 'file';
                if (isImage) fileType = 'image';
                else if (isPdf) fileType = 'pdf';
                else if (isDocx) fileType = 'docx';
                else if (isUrlFile) fileType = 'url';
                
                const cleanFileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                let itemHtml = `<li class="file-item file-type-${fileType}">`;
                let fileContentHtml = '';

                if (isImage) {
                    fileContentHtml = `<a href="${file.download_url}" target="_blank" title="Ver imagen completa"><div class="file-info"><span class="file-icon">🖼️</span><span class="file-name">${file.name}</span></div><img src="${file.download_url}" alt="${file.name}" class="file-preview-image"></a>`;
                } else if (isPdf) {
                    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.download_url)}&embedded=true`;
                    fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">📄</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper"><iframe src="${googleViewerUrl}" frameborder="0"></iframe></div></div>`;
                } else if (isDocx) {
                    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.download_url)}`;
                    fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">📄</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper"><iframe src="${officeViewerUrl}" frameborder="0"></iframe></div></div>`;
                } else if (isUrlFile) {
                    try {
                        const contentResponse = await fetch(file.download_url);
                        const contentText = await contentResponse.text();
                        const externalUrl = getUrlFromFileContent(contentText);
                        if (externalUrl && externalUrl.includes('canva.com/design/')) {
                            const embedUrl = externalUrl.substring(0, externalUrl.indexOf('?')) + '?embed';
                            fileContentHtml = `<div class="embed-container"><div class="file-info"><span class="file-icon">🎨</span><span class="file-name">${cleanFileName}</span></div><div class="iframe-wrapper"><iframe loading="lazy" src="${embedUrl}"></iframe></div></div>`;
                        } else if (externalUrl) {
                            fileContentHtml = `<a href="${externalUrl}" target="_blank" title="Abrir enlace externo"><div class="file-info"><span class="file-icon">🔗</span><span class="file-name">${cleanFileName}</span></div></a>`;
                        }
                    } catch (e) { console.error("Error al leer archivo .url", e); }
                } else {
                    fileContentHtml = `<a href="${file.html_url}" target="_blank" title="Ver archivo en GitHub"><div class="file-info"><span class="file-icon">📄</span><span class="file-name">${file.name}</span></div></a>`;
                }

                itemHtml += fileContentHtml;

                // NUEVO: Añade los botones de acción SOLO si es admin
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
});