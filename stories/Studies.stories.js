export default {
  title: 'Studies',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export const Overview = {
  name: 'Overview',
  render: () => {
    const main = document.createElement('main');
    main.className = 'container';
    main.innerHTML = `
      <header class="header">
        <div class="badge" aria-hidden="true">Studies</div>
        <h1 class="hello-world-title">Studies</h1>
        <p class="subtitle">
          Explorations and experiments live here — mesh gradient buttons, shader type on glyphs, and more.
        </p>
      </header>
    `;
    return main;
  },
};
