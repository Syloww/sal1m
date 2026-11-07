document.getElementById('form-transaction')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const msg = document.getElementById('form-message');
    const btn = form.querySelector('[type="submit"]');

    const payload = {
        csrf: form.csrf.value,
        type: form.type.value,
        amount: parseFloat(form.amount.value),
        label: form.label.value.trim(),
        category_id: form.category_id.value || null,
        notes: form.notes.value.trim() || null,
    };

    btn.disabled = true;

    try {
        const data = await apiFetch('api/transactions.php', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        showMessage(msg, `Opération enregistrée. Nouveau solde : ${data.formatted_balance}`, 'success');
        form.reset();
        const creditRadio = form.querySelector('input[value="credit"]');
        if (creditRadio) creditRadio.checked = true;

        setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
        showMessage(msg, err.message, 'error');
    } finally {
        btn.disabled = false;
    }
});
