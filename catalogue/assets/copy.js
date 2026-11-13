/* Copier — démonstration, sans dépendance.

   Le système dessine le bloc à copier (.c-snippet) ; il ne copie rien : c'est l'affaire du produit.
   Voici le branchement le plus court. Un clic sur .c-snippet__copy prend le texte du .c-snippet__body
   voisin (ou de l'élément visé par data-copy-target, ou la valeur de data-copy), le met au presse-papiers
   et pose data-state="done" sur le bouton pendant deux secondes — "error" si le navigateur refuse. */
'use strict';
(() => {
  const write = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
    // Contexte non sécurisé ou permission refusée : l'ancien chemin, par une zone de texte hors champ.
    const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0';
    document.body.append(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch {} t.remove(); return ok;
  };
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('.c-snippet__copy, [data-copy], [data-copy-target]'); if (!b) return;
    const src = b.dataset.copyTarget ? document.querySelector(b.dataset.copyTarget) : b.closest('.c-snippet')?.querySelector('.c-snippet__body');
    const text = b.dataset.copy ?? src?.textContent ?? ''; if (!text) return;
    b.dataset.state = (await write(text)) ? 'done' : 'error';
    clearTimeout(b.copyTimer); b.copyTimer = setTimeout(() => { delete b.dataset.state; }, 2000);
  });
})();
