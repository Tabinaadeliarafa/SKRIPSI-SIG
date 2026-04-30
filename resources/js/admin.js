// Admin CRUD helpers

// Auto risiko calculation
function calcRisiko(n) {
  if (n >= 7) return 'tinggi';
  if (n >= 3) return 'sedang';
  if (n >= 1) return 'rendah';
  return 'aman';
}

const jumlah = document.getElementById('jumlah_desa');
const risiko = document.getElementById('tingkat_risiko');
function syncRisiko() {
  if (!jumlah || !risiko) return;
  risiko.value = calcRisiko(Number(jumlah.value || 0));
}
if (jumlah) {
  jumlah.addEventListener('input', syncRisiko);
  syncRisiko();
}

// Stepper +/-
document.querySelectorAll('[data-step]').forEach((btn) => {
  if (!jumlah) return;
  btn.addEventListener('click', () => {
    const step = Number(btn.dataset.step);
    jumlah.value = Math.max(0, Number(jumlah.value || 0) + step);
    jumlah.dispatchEvent(new Event('input'));
  });
});

// Delete confirmation modal
const modal = document.getElementById('delete-modal');
let pendingForm = null;

document.querySelectorAll('[data-delete]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    pendingForm = btn.closest('form');
    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
  });
});

modal?.querySelector('[data-cancel]')?.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  pendingForm = null;
});

modal?.querySelector('[data-confirm]')?.addEventListener('click', () => {
  if (pendingForm) pendingForm.submit();
  else window.location.reload();
});
