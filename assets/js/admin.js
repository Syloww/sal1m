document.getElementById('form-create-user')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const msg = document.getElementById('user-form-message');
    const btn = form.querySelector('[type="submit"]');

    const payload = {
        csrf: form.csrf.value,
        action: 'create',
        username: form.username.value.trim(),
        display_name: form.display_name.value.trim(),
        password: form.password.value,
        is_admin: form.is_admin?.checked ? 1 : 0,
    };

    btn.disabled = true;

    try {
        await apiFetch('api/users.php', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        showMessage(msg, 'Compte créé avec succès.', 'success');
        form.reset();
        setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
        showMessage(msg, err.message, 'error');
    } finally {
        btn.disabled = false;
    }
});

document.querySelectorAll('.btn-toggle-user').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id, 10);
        const active = parseInt(btn.dataset.active, 10);
        const action = active ? 'désactiver' : 'activer';

        if (!confirm(`Voulez-vous ${action} ce compte ?`)) return;

        try {
            await apiFetch('api/users.php', {
                method: 'POST',
                body: JSON.stringify({ csrf: window.CSRF_TOKEN, action: 'toggle', id }),
            });
            window.location.reload();
        } catch (err) {
            alert(err.message);
        }
    });
});

document.querySelectorAll('.btn-reset-pwd').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const username = btn.dataset.username;
        const id = parseInt(btn.dataset.id, 10);
        const password = prompt(`Nouveau mot de passe pour « ${username} » (min. 8 car.) :`);

        if (!password) return;
        if (password.length < 8) {
            alert('Le mot de passe doit faire au moins 8 caractères.');
            return;
        }

        try {
            await apiFetch('api/users.php', {
                method: 'POST',
                body: JSON.stringify({
                    csrf: window.CSRF_TOKEN,
                    action: 'reset_password',
                    id,
                    password,
                }),
            });
            alert('Mot de passe mis à jour.');
        } catch (err) {
            alert(err.message);
        }
    });
});
