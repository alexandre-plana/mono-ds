/* Préférences d'affichage partagées par le catalogue et les exemples : thème, accent et grain.
   Le thème et l'accent peuvent aussi être imposés dans l'adresse (?theme=papier&accent=fort).
   À charger dans <head>, avant le premier affichage. */
(() => {
  const q = new URLSearchParams(location.search), get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const theme = q.get('theme') || get('mono-theme'), accent = q.get('accent') || get('mono-accent');
  if (theme === 'encre' || theme === 'papier') document.documentElement.dataset.theme = theme;
  if (accent === 'fort' || accent === 'flash') document.documentElement.dataset.accent = accent;
  document.documentElement.dataset.grain = get('mono-grain') === 'off' ? 'off' : 'on';
})();
