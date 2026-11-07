/**
 * Budget CGT — scripts globaux
 */

function appUrl(path) {
    const base = window.BASE_PATH || '';
    const clean = String(path).replace(/^\//, '');
    return (base ? base + '/' : '/') + clean;
}

window.appUrl = appUrl;

document.getElementById('btn-logout')?.addEventListener('click', async () => {
    const formData = new FormData();
    formData.append('csrf', window.CSRF_TOKEN || '');

    await fetch(appUrl('api/logout.php'), {
        method: 'POST',
        body: formData,
    });

    window.location.href = appUrl('login.php');
});

async function apiFetch(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : appUrl(url.replace(/^\//, ''));

    const defaults = {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': window.CSRF_TOKEN || '',
        },
    };

    const merged = {
        ...defaults,
        ...options,
        headers: { ...defaults.headers, ...options.headers },
    };

    const res = await fetch(fullUrl, merged);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || 'Erreur serveur');
    }

    return data;
}

window.apiFetch = apiFetch;

function showMessage(el, text, type = 'success') {
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`;
    el.hidden = false;
    setTimeout(() => { el.hidden = true; }, 5000);
}

window.showMessage = showMessage;
