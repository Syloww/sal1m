if (window.IS_ADMIN) {
    document.querySelectorAll('.btn-delete-tx').forEach((btn) => {
        btn.addEventListener('click', async () => {
            if (!confirm('Supprimer ce mouvement ? Cette action est irréversible.')) {
                return;
            }

            const id = parseInt(btn.dataset.id, 10);

            try {
                await apiFetch('api/transactions.php', {
                    method: 'DELETE',
                    body: JSON.stringify({ csrf: window.CSRF_TOKEN, id }),
                });
                btn.closest('tr')?.remove();
            } catch (err) {
                alert(err.message);
            }
        });
    });
}
