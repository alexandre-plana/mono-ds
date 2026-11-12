/* Préférences d'affichage partagées par le catalogue et les exemples : thème et accent.
   Lues dans l'adresse (?theme=papier&accent=fort) puis dans le stockage local.
   À charger dans <head>, avant le premier affichage. */
(() => {
  const q = new URLSearchParams(location.search), get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const theme = q.get('theme') || get('mono-theme'), accent = q.get('accent') || get('mono-accent');
  if (theme === 'encre' || theme === 'papier') document.documentElement.dataset.theme = theme;
  if (accent === 'fort' || accent === 'flash') document.documentElement.dataset.accent = accent;
})();
