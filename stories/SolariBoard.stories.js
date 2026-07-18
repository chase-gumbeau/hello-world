import './solari-board.css';
import { createSolariBoard } from './solari-board.js';

export default {
  title: 'Projects/Solari Board',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export const HelloWorld = {
  name: 'Hello World',
  render: () => createSolariBoard('HELLO WORLD'),
};
