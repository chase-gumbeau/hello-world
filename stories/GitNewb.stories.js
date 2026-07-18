export default {
  title: 'GitNewb/Page',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export const Home = {
  render: () => {
    const main = document.createElement('main');
    main.className = 'container';
    main.innerHTML = `
      <header class="header">
        <div class="badge" aria-hidden="true">GitHub Pages</div>
        <h1>GitNewb</h1>
        <p class="subtitle">A tiny first project, published with GitHub Pages.</p>
      </header>

      <section class="card">
        <h2>What is this?</h2>
        <p>
          This is a simple static website (just HTML + CSS) so I can practice using GitHub.
        </p>
      </section>

      <section class="card material-demo">
        <h2>Material experiment</h2>
        <p>
          Google Material Web components (Material 3). These load on GitHub Pages after
          you push — or run <code>npm run dev</code> locally.
        </p>

        <md-filled-text-field
          class="material-field"
          label="Name"
          placeholder="Your name"
        ></md-filled-text-field>

        <md-chip-set class="material-chips">
          <md-filter-chip label="HTML"></md-filter-chip>
          <md-filter-chip label="CSS"></md-filter-chip>
          <md-filter-chip label="Material" selected></md-filter-chip>
        </md-chip-set>

        <div class="material-row">
          <md-filled-button>Get started</md-filled-button>
          <md-outlined-button>Learn more</md-outlined-button>
          <md-filled-button id="open-dialog">Open dialog</md-filled-button>
        </div>

        <label class="material-checkbox">
          <md-checkbox checked></md-checkbox>
          Enable notifications
        </label>
      </section>

      <section class="card">
        <h2>Next steps</h2>
        <ol>
          <li>Edit <code>index.html</code> to change the text.</li>
          <li>Edit <code>style.css</code> to change the look.</li>
          <li>Commit and push to publish updates.</li>
        </ol>
      </section>

      <footer class="footer">
        <a class="link" href="#">Read the README</a>
      </footer>
    `;

    const dialog = document.createElement('md-dialog');
    dialog.id = 'welcome-dialog';
    dialog.innerHTML = `
      <div slot="headline">Welcome to Material</div>
      <form slot="content" id="welcome-dialog-form" method="dialog">
        This dialog uses Google Material Web. It works on GitHub Pages after the site is
        built with Vite.
      </form>
      <div slot="actions">
        <md-text-button form="welcome-dialog-form" value="close">Close</md-text-button>
      </div>
    `;

    const openDialogButton = main.querySelector('#open-dialog');
    openDialogButton?.addEventListener('click', () => dialog.show());

    const wrapper = document.createElement('div');
    wrapper.append(main, dialog);
    return wrapper;
  },
};
