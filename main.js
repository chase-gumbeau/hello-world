import './material-setup.js';
import './material-theme.css';

const dialog = document.querySelector('#welcome-dialog');
const openDialogButton = document.querySelector('#open-dialog');

openDialogButton?.addEventListener('click', () => {
  dialog?.show();
});
