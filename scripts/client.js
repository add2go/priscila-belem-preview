const nav = document.querySelector('#main-nav');
const toggle = document.querySelector('.menu-toggle');
function closeMenu() { toggle?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open'); }
toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav?.classList.toggle('is-open', open); });
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
} });
window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => { b.setAttribute('aria-pressed', String(b === button)); b.classList.toggle('active', b === button); });
    let count = 0;
    document.querySelectorAll('.work-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden)
        count++; });
    const counter = document.querySelector('.work-count');
    if (counter)
        counter.textContent = `${String(count).padStart(2, '0')} ${document.body.dataset.locale === 'pt' ? 'CONCEITOS' : 'CONCEPTS'}`;
    const empty = document.querySelector('.empty-work');
    if (empty)
        empty.hidden = count > 0;
}));
let lastTrigger = null;
function openDialog(dialog, trigger) { if (!dialog)
    return; lastTrigger = trigger; dialog.showModal(); document.body.classList.add('modal-open'); }
document.querySelectorAll('.work-open').forEach(button => button.addEventListener('click', () => {
    const img = document.querySelector('#dialog-image');
    if (img)
        img.src = button.dataset.image || '';
    const title = document.querySelector('#work-dialog-title');
    if (title)
        title.textContent = button.dataset.title || '';
    const category = document.querySelector('#dialog-category');
    if (category)
        category.textContent = button.dataset.categoryLabel || '';
    openDialog(document.querySelector('#work-dialog'), button);
}));
document.querySelectorAll('[data-open-privacy]').forEach(b => b.addEventListener('click', () => openDialog(document.querySelector('#privacy-dialog'), b)));
document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
            dialog.close();
    } });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastTrigger?.focus(); });
});
const form = document.querySelector('#inquiry-form');
form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity())
        return;
    const status = document.querySelector('#form-status');
    const button = form.querySelector('button[type="submit"]');
    if (!status || !button)
        return;
    if (form.dataset.enabled !== 'true') {
        status.textContent = form.dataset.demo || '';
        status.hidden = false;
        status.className = 'form-status demo-status';
        status.focus();
        return;
    }
    if (button.disabled)
        return;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = document.body.dataset.locale === 'pt' ? 'Enviando…' : 'Sending…';
    try {
        const payload = Object.fromEntries(new FormData(form));
        const requestId = form.dataset.requestId || crypto.randomUUID();
        form.dataset.requestId = requestId;
        const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestId }, body: JSON.stringify(payload) });
        if (!response.ok)
            throw new Error('send_failed');
        const result = await response.json();
        if (result.accepted !== true)
            throw new Error('not_accepted');
        status.textContent = form.dataset.success || '';
        status.className = 'form-status success-status';
        form.reset();
        delete form.dataset.requestId;
    }
    catch {
        status.textContent = form.dataset.error || '';
        status.className = 'form-status error-status';
    }
    finally {
        button.disabled = false;
        form.removeAttribute('aria-busy');
        status.focus();
    }
});
form?.addEventListener('input', () => { delete form.dataset.requestId; });
