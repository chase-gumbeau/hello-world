import './morning-brief.css';

/**
 * Work Brief — persona Orient surfaces from
 * “Home as Threshold — Persona Briefs, Lifecycle Stages, and the Orient Surface”.
 * Visual system matches Morning Brief Concept 2 (verdict + Resume / Needs attention).
 */

/** @typedef {{ title?: string, body: string }} BriefItem */
/** @typedef {{ time: string, body: string }} Territory */
/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   date: string,
 *   headline: string,
 *   territories: Territory[],
 *   resume: BriefItem[],
 *   attention: BriefItem[],
 * }} PersonaBrief
 */

/** @type {PersonaBrief[]} */
export const WORK_BRIEF_PERSONAS = [
  {
    id: 'clinician',
    label: 'Clinician',
    date: 'Monday · July 20 2026',
    headline:
      'All six of your patients’ orders are moving. One signature discharges Mrs. Alvarez today.',
    territories: [
      {
        time: 'Between patients',
        body: 'A signature window opens after rounds — about forty seconds if everything’s verified.',
      },
      {
        time: 'Clinic block',
        body: 'No Parachute asks during the afternoon clinic; the one discharge sits until you have a micro-window.',
      },
      {
        time: 'End of shift',
        body: 'Five orders keep moving without you. Nothing waits overnight on a signature.',
      },
    ],
    resume: [
      {
        title: 'Five orders moving without you',
        body: 'Qualified and in fulfillment — nothing left to chase on the supplier side.',
      },
      {
        title: 'Insurance approved for Rivera wheelchair',
        body: 'Prior auth cleared Friday afternoon — delivery window is already on the truck.',
      },
    ],
    attention: [
      {
        title: 'Sign to discharge Mrs. Alvarez',
        body: 'One signature — everything’s verified. About forty seconds between patients.',
      },
    ],
  },
  {
    id: 'supplier_csr',
    label: 'Supplier CSR',
    date: 'Monday · July 20 2026',
    headline:
      'A manageable Monday — fourteen overnight, nine already clean. Start with the two oxygen orders due out before noon.',
    territories: [
      {
        time: 'Before noon',
        body: 'Two oxygen orders must ship — deadline risk sits here; the rest can wait.',
      },
      {
        time: 'Afternoon',
        body: 'Nine clean orders are ready to qualify in a steady stretch after the intake wave.',
      },
      {
        time: 'Handoff',
        body: 'One resolution is waiting on the facility, not you — safe to leave for overnight.',
      },
    ],
    resume: [
      {
        title: 'Nine orders qualified overnight',
        body: 'Agent intake cleared the clean set — nothing left to retype into billing.',
      },
      {
        title: 'Sunday billing sync finished',
        body: 'All 14 of yesterday’s orders synced — nothing to chase on the Brightree side.',
      },
    ],
    attention: [
      {
        title: 'Qualify oxygen order #8841',
        body: 'Must ship by noon — not deferrable. Open qualify to clear it first.',
      },
      {
        title: 'Qualify oxygen order #8847',
        body: 'Second noon ship — same window as #8841; sequence these before the clean nine.',
      },
      {
        body: 'Everything else can wait — the remaining overnight volume is clean and has no deadline today.',
      },
    ],
  },
  {
    id: 'supplier_manager',
    label: 'Supplier Manager',
    date: 'Monday · July 20 2026',
    headline:
      'Intake is running 20 minutes faster than last Tuesday. Maria’s queue is twice the team average — want to rebalance?',
    territories: [
      {
        time: 'Morning flow',
        body: 'Intake wave is lighter than forecast — throughput is ahead of last week’s Tuesday.',
      },
      {
        time: 'Midday risk',
        body: 'CPAP orders remain the rework hotspot this week; three bounced back overnight.',
      },
      {
        time: 'Afternoon fleet',
        body: 'Storm reaches Dayton by 2 — three afternoon deliveries are at risk; dispatch flagged them.',
      },
    ],
    resume: [
      {
        title: 'Team cleared Friday’s backlog',
        body: 'Zero aged intake items carried into the weekend — flow health held without you.',
      },
      {
        title: 'Rework rate down on oxygen',
        body: 'Week-over-week bounce-backs dropped after last Thursday’s checklist change.',
      },
    ],
    attention: [
      {
        title: 'Rebalance Maria’s queue',
        body: 'Twice the team average — three clean orders can move to Jordan without missing noon ships.',
      },
      {
        title: 'Review CPAP rework hotspot',
        body: 'Three bounced overnight — same missing documentation pattern as last week.',
      },
    ],
  },
  {
    id: 'patient',
    label: 'Patient',
    date: 'Monday · July 20 2026',
    headline:
      'Your wheelchair is on the truck. Expect it between 2 and 4 today. Nothing you need to do.',
    territories: [
      {
        time: 'Today',
        body: 'Delivery window is 2–4 PM — your driver is on the route with your order.',
      },
      {
        time: 'Tomorrow',
        body: 'Nothing scheduled. If anything changes with the delivery, you’ll hear here first.',
      },
      {
        time: 'This week',
        body: 'Setup visit is already booked for Wednesday morning after the chair arrives.',
      },
    ],
    resume: [
      {
        title: 'Insurance approved — you owe nothing',
        body: 'Prior authorization cleared Friday. There’s no balance left for you to handle.',
      },
    ],
    attention: [
      {
        body: 'Nothing you need to do — the equipment is coming to you, and no forms are waiting.',
      },
    ],
  },
  {
    id: 'payor',
    label: 'Payor',
    date: 'Monday · July 20 2026',
    headline:
      'Nothing needs your review this morning. Denial rates on oxygen orders dropped 8% since your rule change on the 3rd.',
    territories: [
      {
        time: 'Morning review',
        body: 'No exception queue — utilization is inside the bands you set last month.',
      },
      {
        time: 'Policy drift',
        body: 'Oxygen denial rate is still falling week over week after the July 3rd rule.',
      },
      {
        time: 'This week',
        body: 'One draft rule on mobility caps is ready when you want a quiet review slot.',
      },
    ],
    resume: [
      {
        title: 'Oxygen denials down 8% since July 3',
        body: 'Your rule change is landing downstream — tap through to the claims ledger behind the number.',
      },
      {
        title: 'No stalled reviews overnight',
        body: 'Weekend intake cleared without a payor exception — nothing aged into Monday.',
      },
    ],
    attention: [
      {
        body: 'Nothing needs your review this morning — exception and drift queues are both clear.',
      },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    date: 'Monday · July 20 2026',
    headline:
      'Your Friday import validated clean. Three products flagged overnight for HCPCS mismatches — two are high-volume.',
    territories: [
      {
        time: 'Morning fixes',
        body: 'Two high-volume HCPCS mismatches — clearing these unblocks today’s order volume.',
      },
      {
        time: 'Afternoon',
        body: 'One lower-volume flag can wait; CMS feed quiet after last night’s update.',
      },
      {
        time: 'This week',
        body: 'Friday’s formulary fix is already in use — 214 orders touched it over the weekend.',
      },
    ],
    resume: [
      {
        title: 'Friday import validated clean',
        body: 'No rejected rows — the feed landed without a single mapping error.',
      },
      {
        title: 'Formulary fix used in 214 orders',
        body: 'The SKU mapping you shipped last week is already carrying real volume.',
      },
    ],
    attention: [
      {
        title: 'Fix HCPCS mismatch — high-volume SKU',
        body: 'CMS updated codes overnight; this product sits on active order paths.',
      },
      {
        title: 'Fix HCPCS mismatch — second high-volume SKU',
        body: 'Same overnight feed — pair it with the first so today’s intake stays clean.',
      },
      {
        title: 'Review lower-volume HCPCS flag',
        body: 'Deferrable — one product, light traffic; safe after the two high-volume fixes.',
      },
    ],
  },
  {
    id: 'ops_cs',
    label: 'Ops / CS',
    date: 'Monday · July 20 2026',
    headline:
      'Riverside goes live Monday — 12 of 14 users have signed in. The two who haven’t are both in the discharge unit.',
    territories: [
      {
        time: 'Go-live window',
        body: 'Riverside flips today — twelve users are already in; two discharge-unit seats are still dark.',
      },
      {
        time: 'Account health',
        body: 'No silent-churn signals elsewhere — other live facilities kept steady weekend activity.',
      },
      {
        time: 'This week',
        body: 'Follow-up with Riverside’s discharge unit before Wednesday’s check-in call.',
      },
    ],
    resume: [
      {
        title: 'Twelve Riverside users signed in',
        body: 'Activation held through the weekend — training seats converted without tickets.',
      },
      {
        title: 'No quiet accounts overnight',
        body: 'Usage telemetry stayed inside normal bands across the live book.',
      },
    ],
    attention: [
      {
        title: 'Reach Riverside discharge unit',
        body: 'Two users haven’t signed in — same unit. Absence won’t file a ticket on its own.',
      },
    ],
  },
];

const PERSONA_IDS = WORK_BRIEF_PERSONAS.map((p) => p.id);

/** @param {string} [id] */
export function personaFromId(id) {
  return WORK_BRIEF_PERSONAS.find((p) => p.id === id) ?? WORK_BRIEF_PERSONAS[0];
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Soft morning wash — same fixed ambient as Morning Brief Concept 2. */
function applyMorningWash(page) {
  page.style.setProperty('--mb-wash-x', '-4%');
  page.style.setProperty('--mb-wash-y', '-6%');
  page.style.setProperty('--mb-wash-rx', '150%');
  page.style.setProperty('--mb-wash-ry', '120%');
  page.style.setProperty('--mb-wash-r', '224');
  page.style.setProperty('--mb-wash-g', '120');
  page.style.setProperty('--mb-wash-b', '48');
  page.style.setProperty('--mb-wash-a', '0.3');
}

function grainHtml() {
  const noiseId = `work-brief-noise-${Math.random().toString(36).slice(2, 9)}`;
  return `
    <svg class="morning-brief__grain" aria-hidden="true" focusable="false">
      <defs>
        <filter id="${noiseId}" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.25" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#${noiseId})"/>
    </svg>
  `;
}

/** @param {Territory[]} territories */
function territoriesHtml(territories) {
  const slots = territories
    .map(
      (t) => `
    <article class="morning-brief__slot">
      <h2 class="morning-brief__slot-time">${escapeHtml(t.time)}</h2>
      <p class="morning-brief__slot-body">${escapeHtml(t.body)}</p>
    </article>`,
    )
    .join('');

  return `
  <section class="morning-brief__schedule morning-brief__schedule--territories" aria-label="Day territories">
    ${slots}
  </section>
  <md-divider class="morning-brief__rule" role="separator"></md-divider>`;
}

/** @param {BriefItem[]} items @param {string} listClass */
function cardListHtml(items, listClass = '') {
  return items
    .map((item, index) => {
      const title = item.title
        ? `<h3 class="morning-brief__card-list-title">${escapeHtml(item.title)}</h3>`
        : '';
      const divider =
        index < items.length - 1
          ? `<md-divider class="morning-brief__card-list-divider" role="separator"></md-divider>`
          : '';
      return `
        <li class="morning-brief__card-list-item">
          ${title}
          <p class="morning-brief__card-list-body">${escapeHtml(item.body)}</p>
          ${divider}
        </li>`;
    })
    .join('');
}

/** @param {PersonaBrief} persona */
function statusHtml(persona) {
  const attentionClass =
    persona.attention.length > 1
      ? 'morning-brief__card-list morning-brief__card-list--pins'
      : 'morning-brief__card-list';

  return `
  <section class="morning-brief__schedule morning-brief__schedule--status" aria-label="Status">
    <article class="morning-brief__slot">
      <h2 class="morning-brief__slot-time">Resume</h2>
      <ol class="morning-brief__card-list">
        ${cardListHtml(persona.resume)}
      </ol>
    </article>
    <article class="morning-brief__slot">
      <h2 class="morning-brief__slot-time">Needs attention</h2>
      <ol class="${attentionClass}">
        ${cardListHtml(persona.attention)}
      </ol>
    </article>
  </section>`;
}

/**
 * @param {{ persona?: string }} [options]
 */
export function createWorkBrief({ persona: personaId = 'supplier_csr' } = {}) {
  const persona = personaFromId(personaId);
  const page = document.createElement('main');
  const patientMod = persona.id === 'patient' ? ' morning-brief--patient' : '';
  page.className =
    `morning-brief morning-brief--concept morning-brief--concept-2 morning-brief--morning morning-brief--work${patientMod} m3-scope`;
  page.setAttribute('aria-label', `Work brief — ${persona.label}`);
  page.dataset.persona = persona.id;
  page.dataset.timeOfDay = 'morning';

  page.innerHTML = `${grainHtml()}<div class="morning-brief__inner">
  <p class="morning-brief__date md-typescale-label-large">${escapeHtml(persona.date)}</p>
  <h1 class="morning-brief__headline">${escapeHtml(persona.headline)}</h1>
  ${territoriesHtml(persona.territories)}
  ${statusHtml(persona)}
</div>`;

  applyMorningWash(page);
  return page;
}

/** @param {{ workBriefPersona?: string }} [globals] */
function personaFromGlobals(globals = {}) {
  const id = globals.workBriefPersona;
  return PERSONA_IDS.includes(id) ? id : 'supplier_csr';
}

export default {
  title: 'Projects/Work Brief',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Persona Orient surfaces for Parachute work contexts — same brief grammar as Morning Brief (verdict, territories, Resume / Needs attention). Use the toolbar **Brief** dropdown to switch personas, or open an individual story.',
      },
    },
  },
  render: (_args, { globals }) =>
    createWorkBrief({ persona: personaFromGlobals(globals) }),
};

/** Toolbar-driven default — switches with the Brief dropdown. */
export const Page = {
  name: 'Page',
  parameters: {
    docs: {
      description: {
        story:
          'Default work brief. Switch personas with the toolbar **Brief** dropdown.',
      },
    },
  },
};

export const Clinician = {
  name: 'Clinician',
  globals: { workBriefPersona: 'clinician' },
};

export const SupplierCsr = {
  name: 'Supplier CSR',
  globals: { workBriefPersona: 'supplier_csr' },
};

export const SupplierManager = {
  name: 'Supplier Manager',
  globals: { workBriefPersona: 'supplier_manager' },
};

export const Patient = {
  name: 'Patient',
  globals: { workBriefPersona: 'patient' },
};

export const Payor = {
  name: 'Payor',
  globals: { workBriefPersona: 'payor' },
};

export const Catalog = {
  name: 'Catalog',
  globals: { workBriefPersona: 'catalog' },
};

export const OpsCs = {
  name: 'Ops / CS',
  globals: { workBriefPersona: 'ops_cs' },
};
