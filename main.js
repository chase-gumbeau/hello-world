import { createScrolls } from './scrolls.js';

document.body.classList.add('scrolls-page');
document.body.replaceChildren(createScrolls());
