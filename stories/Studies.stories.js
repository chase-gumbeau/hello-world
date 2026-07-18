import './solari-board.css';
import { createSolariBoard } from './solari-board.js';

export default {
  title: 'GitNewb/Studies',
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
        <div class="badge" aria-hidden="true">GitNewb</div>
        <h1 class="hello-world-title">Studies</h1>
        <p class="subtitle">
          Explorations and experiments live here — add new stories under this section as you go.
        </p>
      </header>
    `;
    return main;
  },
};

export const SolariBoard = {
  name: 'Solari Board',
  render: () => createSolariBoard('HELLO WORLD'),
};
