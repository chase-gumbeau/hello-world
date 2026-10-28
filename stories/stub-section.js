/**
 * Placeholder page for a Studies section that has no studies yet.
 * Replace a section's stub story with real stories as they land.
 */
export function createStubSection(name, blurb) {
  const main = document.createElement('main');
  main.className = 'container';
  main.innerHTML = `
    <header class="header">
      <div class="badge" aria-hidden="true">Studies</div>
      <h1 class="hello-world-title">${name}</h1>
      <p class="subtitle">${blurb}</p>
    </header>
  `;
  return main;
}
