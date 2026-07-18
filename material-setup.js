/**
 * Loads every Material Web component for prototyping.
 * Prefer individual imports in production builds.
 */
import '@material/web/all.js';

// Labs components (not in all.js) — useful for layout / surfaces
import '@material/web/labs/badge/badge.js';
import '@material/web/labs/card/elevated-card.js';
import '@material/web/labs/card/filled-card.js';
import '@material/web/labs/card/outlined-card.js';
import '@material/web/labs/item/item.js';
import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationdrawer/navigation-drawer.js';
import '@material/web/labs/navigationdrawer/navigation-drawer-modal.js';
import '@material/web/labs/navigationtab/navigation-tab.js';
import '@material/web/labs/segmentedbutton/outlined-segmented-button.js';
import '@material/web/labs/segmentedbuttonset/outlined-segmented-button-set.js';

import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';

document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
