// CONFIGURATION
const SELECTORS = {
    ITEM: 'div[role="listitem"]',
    WRAPPER: '.relative',
    IMAGE: 'img',
    PROCESSED_ATTR: 'data-ext-dl-ready',
    BTN_CLASS: 'ext-dl-btn'
};

/**
 * Main Observer: Monitors the DOM for new items or re-renders
 */
const observer = new MutationObserver((mutations) => {
    // We run the check on every DOM update. 
    // This is lightweight because we check for the attribute before doing work.
    scanAndInject();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial run
scanAndInject();


/**
 * Scans for list items and injects the button if missing.
 */
function scanAndInject() {
    const items = document.querySelectorAll(SELECTORS.ITEM);

    items.forEach(item => {
        // 1. Check if we already injected into this specific ITEM
        if (item.hasAttribute(SELECTORS.PROCESSED_ATTR)) {
            // OPTIONAL: Double check if the button was deleted by a framework re-render
            if (item.querySelector('.ext-dl-btn')) return;
        }

        // 2. Find the wrapper to attach to
        const wrapper = item.querySelector(SELECTORS.WRAPPER);
        if (!wrapper) return;

        // 3. Inject Button
        injectButton(wrapper);

        // 4. Mark item as processed
        item.setAttribute(SELECTORS.PROCESSED_ATTR, 'true');
    });
}

/**
 * Creates and appends the download button.
 */
function injectButton(container) {
    // Prevent duplicates inside the same container
    if (container.querySelector('.ext-dl-btn')) return;

    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'ext-dl-btn-container';

    const btn = document.createElement('button');
    btn.className = 'ext-dl-btn';
    btn.title = 'Download Image';
    btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="ext-dl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    `;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentImg = container.querySelector('img') || container.closest(SELECTORS.ITEM)?.querySelector('img');

        if (currentImg && currentImg.src) {
            // Get saved format and quality from storage
            chrome.storage.local.get(['dl_format', 'dl_quality'], (data) => {
                const format = data.dl_format || 'jpeg';
                const quality = data.dl_quality || 0.95; // Default to 95% JPEG

                downloadImage(currentImg.src, format, quality);
            });
        } else {
            console.warn('Download Error: No image found at click time.');
            // Visual feedback for error
            btn.style.borderColor = 'red';
            setTimeout(() => btn.style.borderColor = 'rgba(255,255,255,0.3)', 500);
        }
    });

    btnWrapper.appendChild(btn);
    container.appendChild(btnWrapper);
}


/**
 * Converts Base64 -> Canvas -> Output Blob -> Download
 * Accepts format and quality.
 */
function downloadImage(source, format, quality) {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (source.startsWith('data:')) {
        // --- SCENARIO 1: Base64 Data (Requires Canvas Conversion) ---

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const extension = format === 'jpeg' ? 'jpg' : 'png';
        const jpegQuality = format === 'jpeg' ? quality : undefined;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = source;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create image blob.');
                    return;
                }

                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = `generated-image-${timestamp}.${extension}`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, mimeType, jpegQuality);
        };

        img.onerror = () => {
            console.error('Could not load Base64 image for processing.');
        };

    } else {
        // --- SCENARIO 2: Direct URL (Using fetch() for reliable download) ---

        // 1. Determine file extension for filename
        const urlObj = new URL(source.split('?')[0]);
        const path = urlObj.pathname;
        const extensionMatch = path.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
        const originalExtension = extensionMatch ? extensionMatch[1] : 'png';

        // 2. Fetch the image data as a Blob
        // This relies on the server sending the correct Content-Type (image/jpeg or image/png)
        fetch(source)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // IMPORTANT: Use response.blob() without arguments. 
                // It respects the Content-Type header received from the server.
                return response.blob();
            })
            .then(blob => {
                // 3. Create a safe, local URL from the Blob
                const url = URL.createObjectURL(blob);

                // 4. Trigger download using the safe Blob URL
                link.href = url;
                link.download = `downloaded-image-${timestamp}.${originalExtension}`;

                // Adding target="_blank" can sometimes help force the download 
                // in some browsers, but often the blob URL fixes it entirely.
                // We'll rely on the blob URL but add target for max compatibility.
                link.target = '_blank';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Download failed using fetch:', error);

                // --- Fallback for severe CORS or network failure ---
                // If fetch completely fails, resort to the simple link, 
                // but this will likely open in a new tab if it failed the fetch logic.
                link.href = source;
                link.download = `downloaded-image-${timestamp}.${originalExtension}`;
                link.target = '_blank';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }
}