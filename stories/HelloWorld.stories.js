export default {
  title: 'GitNewb/Hello World',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export const Page = {
  name: 'Page',
  render: () => {
    const main = document.createElement('main');
    main.className = 'container';
    main.innerHTML = `
      <header class="header">
        <div class="badge" aria-hidden="true">GitNewb</div>
        <h1 class="hello-world-title">Hello World</h1>
        <p class="subtitle">A simple first page in the GitNewb Storybook.</p>
      </header>

      <footer class="footer">
        <p class="subtitle" style="font-size: 14px;">Hello from GitNewb.</p>
      </footer>
    `;

    const button = main.querySelector('md-filled-button');
    button?.addEventListener('click', () => {
      const subtitle = main.querySelector('.subtitle');
      if (subtitle) subtitle.textContent = 'Hello, world! Nice to meet you.';
    });

    return main;
  },
};
