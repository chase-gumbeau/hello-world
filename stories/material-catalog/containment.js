import './containment.css';

/** Template tag: strips the shared leading indentation so samples read cleanly. */
const markup = (strings, ...values) => {
  const lines = String.raw({ raw: strings }, ...values)
    .replace(/^\n/, '')
    .replace(/\s+$/, '')
    .split('\n');
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length),
  );
  return lines.map((l) => l.slice(indent)).join('\n');
};

export default [
  {
    id: 'cards',
    title: 'Cards',
    category: 'containment',
    labs: true,
    summary:
      'Cards hold content and actions about a single subject. Pick elevated, filled or outlined to set how much the card separates from the surface behind it.',
    docs: 'https://m3.material.io/components/cards/overview',
    components: [
      { tag: 'md-elevated-card', summary: 'Card lifted off the surface with a shadow (labs).' },
      { tag: 'md-filled-card', summary: 'Card with a tonal fill and no shadow, for subtle grouping (labs).' },
      { tag: 'md-outlined-card', summary: 'Card with an outline, for the most visual separation without elevation (labs).' },
    ],
    gallery: [0, 3],
    variants: [
      {
        label: 'Elevated',
        note: 'Elevated cards use a shadow to stand apart; cards have no padding, so add your own inside.',
        html: markup`
          <md-elevated-card class="mcat-containment-card">
            <div class="mcat-containment-card-body">
              <span class="md-typescale-label-medium mcat-containment-muted">Weekend trip</span>
              <h3 class="md-typescale-title-medium">Coastal cabin, 2 nights</h3>
              <p class="md-typescale-body-medium mcat-containment-muted">
                Ocean view, wood stove and a short walk to the trailhead.
              </p>
              <div class="mcat-containment-actions">
                <md-text-button>Details</md-text-button>
                <md-filled-button>Book</md-filled-button>
              </div>
            </div>
          </md-elevated-card>`,
      },
      {
        label: 'Filled',
        note: 'Filled cards sit flush on the surface with a tonal container, good for dense groups of cards.',
        html: markup`
          <md-filled-card class="mcat-containment-card">
            <div class="mcat-containment-card-body">
              <h3 class="md-typescale-title-medium">Daily step goal</h3>
              <p class="md-typescale-body-medium mcat-containment-muted">
                7,240 of 10,000 steps. A short evening walk will get you there.
              </p>
              <div class="mcat-containment-actions">
                <md-text-button>View history</md-text-button>
              </div>
            </div>
          </md-filled-card>`,
      },
      {
        label: 'Outlined',
        note: 'Outlined cards draw a border instead of a fill or shadow, for the clearest edges on a plain surface.',
        html: markup`
          <md-outlined-card class="mcat-containment-card">
            <div class="mcat-containment-card-body">
              <div class="mcat-containment-row">
                <md-icon>receipt_long</md-icon>
                <h3 class="md-typescale-title-medium">Invoice #1042</h3>
              </div>
              <p class="md-typescale-body-medium mcat-containment-muted">
                Due Friday, Nov 7. $480.00 for October design services.
              </p>
              <div class="mcat-containment-actions">
                <md-outlined-button>Download PDF</md-outlined-button>
              </div>
            </div>
          </md-outlined-card>`,
      },
      {
        label: 'All three styles',
        note: 'Use one card style per collection so the grouping stays consistent.',
        html: markup`
          <div class="mcat-containment-wrap">
            <md-elevated-card class="mcat-containment-card-small">
              <div class="mcat-containment-card-body">
                <h3 class="md-typescale-title-small">Elevated</h3>
                <p class="md-typescale-body-small mcat-containment-muted">Shadow</p>
              </div>
            </md-elevated-card>
            <md-filled-card class="mcat-containment-card-small">
              <div class="mcat-containment-card-body">
                <h3 class="md-typescale-title-small">Filled</h3>
                <p class="md-typescale-body-small mcat-containment-muted">Tonal fill</p>
              </div>
            </md-filled-card>
            <md-outlined-card class="mcat-containment-card-small">
              <div class="mcat-containment-card-body">
                <h3 class="md-typescale-title-small">Outlined</h3>
                <p class="md-typescale-body-small mcat-containment-muted">Border</p>
              </div>
            </md-outlined-card>
          </div>`,
      },
    ],
  },

  {
    id: 'dialogs',
    title: 'Dialogs',
    category: 'containment',
    summary:
      'Dialogs interrupt the current task to ask for a decision or collect a little information. Keep them short and give a clear way to confirm or cancel.',
    docs: 'https://m3.material.io/components/dialogs/overview',
    components: [
      { tag: 'md-dialog', summary: 'Modal surface with headline, content and actions slots; opened with show().' },
    ],
    variants: [
      {
        label: 'Basic',
        note: 'Put the content in a form with method="dialog"; buttons pointing at it with form="..." close the dialog and set its returnValue to their value.',
        html: markup`
          <md-filled-tonal-button data-open="dialog-{id}">Discard draft</md-filled-tonal-button>
          <md-dialog id="dialog-{id}">
            <div slot="headline">Discard draft?</div>
            <form slot="content" id="form-{id}" method="dialog">
              Your unsaved changes to this message will be lost.
            </form>
            <div slot="actions">
              <md-text-button form="form-{id}" value="cancel">Cancel</md-text-button>
              <md-text-button form="form-{id}" value="discard">Discard</md-text-button>
            </div>
          </md-dialog>`,
      },
      {
        label: 'With icon (alert)',
        note: 'type="alert" gives the dialog the alertdialog role for urgent, interrupting messages; slot="icon" adds a hero icon above the headline.',
        html: markup`
          <md-filled-tonal-button data-open="dialog-{id}">Delete account</md-filled-tonal-button>
          <md-dialog id="dialog-{id}" type="alert">
            <md-icon slot="icon">delete_forever</md-icon>
            <div slot="headline">Delete your account?</div>
            <form slot="content" id="form-{id}" method="dialog">
              This permanently removes your profile, saved items and history.
              You can't undo this.
            </form>
            <div slot="actions">
              <md-text-button form="form-{id}" value="cancel" autofocus>Keep account</md-text-button>
              <md-text-button form="form-{id}" value="delete">Delete</md-text-button>
            </div>
          </md-dialog>`,
      },
      {
        label: 'With a form',
        note: 'Dialogs can collect short input; the clicked button value becomes the dialog returnValue, so you know whether to save the fields.',
        html: markup`
          <md-filled-tonal-button data-open="dialog-{id}">New contact</md-filled-tonal-button>
          <md-dialog id="dialog-{id}">
            <div slot="headline">New contact</div>
            <form slot="content" id="form-{id}" method="dialog" class="mcat-containment-stack">
              <md-outlined-text-field label="Name" name="name"></md-outlined-text-field>
              <md-outlined-text-field label="Email" name="email" type="email"></md-outlined-text-field>
            </form>
            <div slot="actions">
              <md-text-button form="form-{id}" value="cancel">Cancel</md-text-button>
              <md-text-button form="form-{id}" value="save">Save</md-text-button>
            </div>
          </md-dialog>`,
      },
    ],
  },

  {
    id: 'dividers',
    title: 'Dividers',
    category: 'containment',
    summary:
      'Dividers are thin lines that separate content into clear groups in lists and layouts. Use them sparingly; spacing alone often does the job.',
    docs: 'https://m3.material.io/components/divider/overview',
    components: [
      { tag: 'md-divider', summary: 'Horizontal rule; full width by default, with inset options.' },
    ],
    variants: [
      {
        label: 'Full width',
        note: 'A full-width divider separates distinct sections of content.',
        html: markup`
          <div class="mcat-containment-stack">
            <p class="md-typescale-body-medium">Shipping address</p>
            <md-divider></md-divider>
            <p class="md-typescale-body-medium">Payment method</p>
          </div>`,
      },
      {
        label: 'In a list',
        note: 'Inside a list, give the divider role="separator" so assistive tech treats it as a break, not an item.',
        html: markup`
          <md-list class="mcat-containment-surface">
            <md-list-item>
              <md-icon slot="start">inbox</md-icon>
              <div slot="headline">Inbox</div>
            </md-list-item>
            <md-list-item>
              <md-icon slot="start">send</md-icon>
              <div slot="headline">Sent</div>
            </md-list-item>
            <md-divider role="separator"></md-divider>
            <md-list-item>
              <md-icon slot="start">delete</md-icon>
              <div slot="headline">Trash</div>
            </md-list-item>
          </md-list>`,
      },
      {
        label: 'Inset',
        note: 'inset indents both ends; inset-start or inset-end indents one side, for example to line up with text after a leading icon.',
        html: markup`
          <div class="mcat-containment-stack mcat-containment-surface mcat-containment-pad">
            <span class="md-typescale-label-medium">inset</span>
            <md-divider inset></md-divider>
            <span class="md-typescale-label-medium">inset-start</span>
            <md-divider inset-start></md-divider>
            <span class="md-typescale-label-medium">inset-end</span>
            <md-divider inset-end></md-divider>
          </div>`,
      },
    ],
  },

  {
    id: 'lists',
    title: 'Lists',
    category: 'containment',
    labs: false,
    summary:
      'Lists are continuous, vertical groups of text and images. Items can be one, two or three lines and can be static, buttons or links.',
    docs: 'https://m3.material.io/components/lists/overview',
    components: [
      { tag: 'md-list', summary: 'Container that handles keyboard navigation between its items.' },
      { tag: 'md-list-item', summary: 'A row with headline, supporting text and start/end slots; can be a button or link.' },
      { tag: 'md-item', summary: 'Labs layout primitive behind list items: the same slots with no interaction, for building custom rows.' },
    ],
    variants: [
      {
        label: 'One line with icons',
        note: 'Use slot="start" and slot="end" for leading and trailing icons or controls.',
        html: markup`
          <md-list class="mcat-containment-surface">
            <md-list-item>
              <md-icon slot="start">wifi</md-icon>
              <div slot="headline">Wi-Fi</div>
              <md-icon slot="end">chevron_right</md-icon>
            </md-list-item>
            <md-list-item>
              <md-icon slot="start">bluetooth</md-icon>
              <div slot="headline">Bluetooth</div>
              <md-icon slot="end">chevron_right</md-icon>
            </md-list-item>
            <md-list-item>
              <md-icon slot="start">battery_full</md-icon>
              <div slot="headline">Battery</div>
              <md-icon slot="end">chevron_right</md-icon>
            </md-list-item>
          </md-list>`,
      },
      {
        label: 'Two line',
        note: 'supporting-text adds a second line; trailing-supporting-text puts short metadata like a time at the end.',
        html: markup`
          <md-list class="mcat-containment-surface">
            <md-list-item>
              <md-icon slot="start">account_circle</md-icon>
              <div slot="headline">Priya Natarajan</div>
              <div slot="supporting-text">Draft looks good, ship it</div>
              <div slot="trailing-supporting-text">9:41</div>
            </md-list-item>
            <md-list-item>
              <md-icon slot="start">account_circle</md-icon>
              <div slot="headline">Marco Silva</div>
              <div slot="supporting-text">Lunch on Thursday?</div>
              <div slot="trailing-supporting-text">Yesterday</div>
            </md-list-item>
          </md-list>`,
      },
      {
        label: 'Three line with overline',
        note: 'overline adds a small label above the headline; longer supporting text wraps to make a three-line item.',
        html: markup`
          <md-list class="mcat-containment-surface">
            <md-list-item>
              <div slot="overline">Flight · SFO to JFK</div>
              <div slot="headline">Departs 7:15 AM, gate B22</div>
              <div slot="supporting-text">
                Boarding starts 40 minutes before departure. Seat 14C, one carry-on included.
              </div>
            </md-list-item>
          </md-list>`,
      },
      {
        label: 'Interactive items',
        note: 'type="button" makes an item clickable, type="link" with href makes it a link, and disabled blocks interaction.',
        html: markup`
          <md-list class="mcat-containment-surface">
            <md-list-item type="button">
              <md-icon slot="start">download</md-icon>
              <div slot="headline">Export data</div>
            </md-list-item>
            <md-list-item type="link" href="https://m3.material.io/components/lists/overview" target="_blank">
              <md-icon slot="start">menu_book</md-icon>
              <div slot="headline">Read the list guidelines</div>
              <md-icon slot="end">open_in_new</md-icon>
            </md-list-item>
            <md-list-item type="button" disabled>
              <md-icon slot="start">cloud_sync</md-icon>
              <div slot="headline">Sync now</div>
              <div slot="supporting-text">Unavailable while offline</div>
            </md-list-item>
          </md-list>`,
      },
      {
        label: 'md-item layout (labs)',
        note: 'md-item gives you list-item layout without list semantics or interaction, for custom rows inside cards or other surfaces.',
        html: markup`
          <md-outlined-card class="mcat-containment-card">
            <md-item>
              <md-icon slot="start">local_shipping</md-icon>
              <div slot="headline">Package out for delivery</div>
              <div slot="supporting-text">Arriving today by 6 PM</div>
              <div slot="trailing-supporting-text">2 of 3</div>
            </md-item>
          </md-outlined-card>`,
      },
    ],
  },
];
