/**
 * Design OS Mini World — content.
 *
 * Source of record: FigJam "Design OS map — loop stages × dimensions" (Oct 10 2026)
 * https://www.figma.com/board/o7VkFcdbO4mBElHPg8Pkt5
 * Blueprints come from the Notion idea log "Design OS — connecting Linear × Figma ×
 * GitHub × Claude/Cursor × Redshift × Storybook × Canopy for UX-designer workflows".
 *
 * Map coordinates are in art pixels on a 384 × 240 world.
 */

export const SOURCES = {
  figjam: 'https://www.figma.com/board/o7VkFcdbO4mBElHPg8Pkt5',
  notion: 'https://app.notion.com/p/4511259cbfce4ce8b47d3c426c9e1194',
};

/** The six rows of the FigJam map, in order. `shape` names the FigJam shape it used. */
export const DIMENSIONS = [
  { key: 'objects', label: 'Objects', icon: 'database', hint: 'What exists at this stage — records, artifacts, issues.' },
  { key: 'keys', label: 'Keys', icon: 'key', hint: 'The identifiers that join this stage to the rest of the OS.' },
  { key: 'tools', label: 'Tools', icon: 'hammer', hint: 'Where the work happens. One job per tool.' },
  { key: 'agent', label: 'Agent role', icon: 'agent', hint: 'What an agent or skill does here. Agents coach and draft; they never decide.' },
  { key: 'human', label: 'Human decision', icon: 'diamond', hint: 'The decision only a person makes at this stage.' },
  { key: 'notion', label: 'Written back to Notion', icon: 'scroll', hint: 'What the stage leaves behind so context travels with the work.' },
];

/**
 * @typedef {{
 *   id: string, n: number, name: string, short: string, sub: string, land: string,
 *   accent: string, anchor: [number, number], label: [number, number],
 *   objects: string[], keys: string[], tools: string[], agent: string[], human: string[], notion: string[],
 * }} Stage
 */

/** @type {Stage[]} */
export const STAGES = [
  {
    id: 'frame',
    n: 1,
    name: 'Frame',
    short: 'Frame',
    sub: 'Problem verified, decision named',
    land: 'Compass Meadow',
    accent: '#feae34',
    anchor: [66, 84],
    label: [62, 58],
    objects: ['Intent brief (problem, assumption, success measure, primary risk)', 'Research plan', 'Linear project spec'],
    keys: ['UXAF feature / workflow / surface IDs', 'Linear project', 'Research plan URL'],
    tools: ['Notion (intent, research hub)', 'Linear (project)'],
    agent: ['Prompts for the decision being informed and for existing signals and insights'],
    human: ['Problem verified', 'Decision named', 'PM + design co-write intent'],
    notion: ['Intent brief', 'Research plan ↔ Linear project link'],
  },
  {
    id: 'explore',
    n: 2,
    name: 'Explore',
    short: 'Explore',
    sub: 'Divergent options, shared rough',
    land: 'Sketchwood',
    accent: '#63c74d',
    anchor: [164, 42],
    label: [164, 16],
    objects: [
      '2–3 directions shared rough',
      '“Explore designs” placeholder issue',
      'Figma explore frames',
      'Playroom checks',
      'Prototypes DB row created at scaffold',
    ],
    keys: ['Story URL (assigned at scaffold)', 'Figma frame links', 'Linear explore issue'],
    tools: [
      'Figma (explore)',
      'Playroom (component check)',
      'Cursor / Claude + Canopy MCP',
      'Storybook rough',
      'the Pantry (recipes, layouts, canonical screens)',
    ],
    agent: ['Canopy-aware generation from recipes', 'Clone and template-referencing skills', 'Reminder to share early'],
    human: ['Which directions to share', 'When to converge'],
    notion: ['Directions considered and why', 'Feasibility notes', 'Prototypes DB row'],
  },
  {
    id: 'test',
    n: 3,
    name: 'Test',
    short: 'Test',
    sub: 'Hypothesis, sessions, verdict',
    land: 'Test Kitchen Farms',
    accent: '#f77622',
    anchor: [280, 58],
    label: [284, 26],
    objects: [
      'North star prototype (canonical) + forks',
      'Hypothesis',
      'Research sessions',
      'Feedback rounds',
      'Pattern Findings',
      'Verdict',
    ],
    keys: ['Story URL (canonical join)', 'Prototypes DB row', 'Feedback DB rows', 'Posture'],
    tools: [
      'Storybook Prototypes',
      'Research hub',
      'Design Feedback Logger via Slack',
      'Test Kitchen + canvas frames',
      'the Lab',
    ],
    agent: ['Feedback capture', 'State coverage', 'Prototype telemetry', 'Drafts decision-log entry after sessions'],
    human: ['Verdict', 'Accept or reject a fork', 'What the fork was testing'],
    notion: ['Feedback rows', 'Verdict', 'Results against intent', 'Canonical vs. fork relation'],
  },
  {
    id: 'decide',
    n: 4,
    name: 'Decide & break down',
    short: 'Decide',
    sub: 'Direction chosen, work decomposed',
    land: 'Crossroads Market',
    accent: '#b55088',
    anchor: [332, 128],
    label: [358, 110],
    objects: [
      'Direction chosen',
      'Linear sub-issues',
      'the Bundle',
      'Figma spec page',
      'Acceptance criteria from logic rules',
      'Readiness checklist',
      'Gap list',
    ],
    keys: ['UXAF feature + logic-rule IDs (e.g. ft-esign)', 'Story version the spec was rebuilt from', 'Linear issue'],
    tools: ['Linear', 'Figma spec page (rebuilt via Code Connect map + use_figma)', 'Notion decisions log'],
    agent: [
      'Coaches breakdown; drafts sub-issues after direction chosen',
      'Storybook → Figma rebuild',
      'Advisory checks: state, microcopy, logic coverage, a11y',
      'Pre-read lists questions',
    ],
    human: ['Direction', 'Designer files the breakdown', 'Readiness verdict (ready, not complete)'],
    notion: ['Decisions + open questions', 'Spec status', 'Frame links', 'Story version reviewed'],
  },
  {
    id: 'ship',
    n: 5,
    name: 'Ship',
    short: 'Ship',
    sub: 'Canopy-aware build, conformance checks',
    land: 'Release Harbor',
    accent: '#0099db',
    anchor: [270, 190],
    label: [234, 214],
    objects: [
      'PR in app-workflow',
      'Implementation sub-issues',
      'Conformance results',
      'Release, feature flag, Release Hub entry',
      'Bypass ledger entry if any',
    ],
    keys: ['Linear issue ↔ PR', 'UXAF IDs in code and PR template', 'Commit / release'],
    tools: ['Cursor / Claude (engineer’s agent)', 'GitHub', 'CI', 'Two-tier CODEOWNERS', 'Release Hub'],
    agent: [
      'Engineer’s agent reads the bundle',
      'Conformance checks vs. Canopy',
      'Screenshot diff via Capture',
      'Creates post-launch check issue at ship',
    ],
    human: ['Merge', 'Deviations accepted and logged against IDs', 'Instrumentation confirmed before Early Access'],
    notion: ['Deviations → spec + decision log', 'Launch link (flag, release, Linear project, GA readiness doc)'],
  },
  {
    id: 'observe',
    n: 6,
    name: 'Observe',
    short: 'Observe',
    sub: 'Baseline, thresholds, check-ins, owner after GA',
    land: 'Watchtower Ridge',
    accent: '#2ce8f5',
    anchor: [156, 198],
    label: [150, 226],
    objects: [
      'Baseline + comparison window',
      'Thresholds (look into it / roll back)',
      'Check-ins at 1 week, 4 weeks, 90 days',
      'Post-launch check issue',
      'Standing dashboard',
    ],
    keys: ['Feature flag', 'Release Hub entry', 'Linear project', 'Event name → UXAF surface mapping (missing)'],
    tools: ['Datadog RUM', 'Metabase', 'Redshift where surface-level events exist', 'Linear post-launch milestone'],
    agent: ['Drafts the readout', 'Capture + analytics flow diagram (screenshots with numbers, citations, annotations)'],
    human: ['Threshold calls', 'Named owner after GA', 'Qual pairing: which replays or interviews explain the numbers'],
    notion: ['Readout', 'Insight promoted'],
  },
  {
    id: 'learn',
    n: 7,
    name: 'Learn',
    short: 'Learn',
    sub: 'Insights promoted and linked back to framing',
    land: 'Archive Grove',
    accent: '#e43b44',
    anchor: [60, 156],
    label: [48, 186],
    objects: [
      'Insight (single-insight unit)',
      'Pattern candidate',
      'Codified Canopy pattern',
      'Product documentation (how it works, what to explore)',
      'Recipe updates and retirements',
    ],
    keys: ['Insight → research plan → decision', 'Pattern ID', 'Recipe + keyframe IDs'],
    tools: ['Notion insights registry (proposed)', 'Test Kitchen', 'Canopy docs', 'the Pantry', 'Cross-team readout ritual'],
    agent: ['Promote-to-insight', 'Monthly health read', 'Links insight to research plan', 'Generative docs regenerate on push'],
    human: ['Promote insight', 'Codify pattern', 'Retire recipe', 'Canopy pattern vs. stays local'],
    notion: ['Insight', 'Pattern', 'Decision link', 'Next exploration seeded back to Frame'],
  },
];

export const LOOP_CLOSE = 'Loop closes: insights seed the next framing';

/**
 * Gap register. `waiting` = red sticky: depends on the Oct 9 session with Thomas, Adam,
 * and Stacy (decision rights, funding, the Agentic Ordering experiment).
 * @type {{ id: string, stage: string, text: string, waiting?: boolean, main?: boolean }[]}
 */
export const GAPS = [
  { id: 'G1', stage: 'frame', main: true, text: 'No link from research plan → Linear project → post-launch check. Named the highest-leverage fix.' },
  { id: 'G2', stage: 'frame', text: 'Minimum intent brief a north star needs before it is built is undefined.' },
  { id: 'G3', stage: 'frame', text: 'Insights registry does not exist, so nothing can be cited at framing.' },
  { id: 'G4', stage: 'explore', waiting: true, text: 'PM lane undecided: Make kit vs. a Canopy lane in Storybook. PMs fork outside Canopy today.' },
  { id: 'G5', stage: 'explore', text: 'Route B (Figma agent commits to GitHub) untested; needs a per-PR Storybook preview.' },
  { id: 'G6', stage: 'explore', text: 'Figma explorations have no key until scaffold; time-to-first-share not captured.' },
  { id: 'G7', stage: 'test', text: 'Verdict closure not tracked; hypothesis often written after sessions.' },
  { id: 'G8', stage: 'test', text: 'Pattern Findings and Feedback rows have no Disposition field.' },
  { id: 'G9', stage: 'test', text: 'Feedback enrichment with screenshots and GIFs not built; Capture is not yet a service.' },
  { id: 'G10', stage: 'test', text: 'Research hub does not relate a plan to a prototype, release, flag, or dashboard.' },
  { id: 'G11', stage: 'decide', waiting: true, text: 'Designer vs. PM decision rights on scope in Linear.' },
  { id: 'G12', stage: 'decide', text: 'What triggers a Storybook → Figma spec rebuild, and who runs it.' },
  { id: 'G13', stage: 'decide', text: 'State-checker rules table has no owner or home in Canopy .md.' },
  { id: 'G14', stage: 'decide', text: 'Engineers’ preference unknown: spec, prototype, or both — what do they open first?' },
  { id: 'G15', stage: 'decide', text: 'Standard Linear bundle template undefined.' },
  { id: 'G16', stage: 'decide', text: 'Which quality checks become blocking, and when.' },
  { id: 'G17', stage: 'ship', text: 'Instrumentation decided during or after build instead of before Early Access.' },
  { id: 'G18', stage: 'ship', text: 'Unknown what the engineer’s agent actually reads from each link in the bundle.' },
  { id: 'G19', stage: 'ship', text: 'Deviation logging against IDs is a practice, not instrumented.' },
  { id: 'G20', stage: 'ship', waiting: true, text: 'Protopack contribution model: review tiers for recipes, layouts, canonical screens undefined; reviewer capacity.' },
  { id: 'G21', stage: 'observe', waiting: true, text: 'Loop stops at GA; no default owner after GA; most numbers are do-no-harm gates.' },
  { id: 'G22', stage: 'observe', text: 'No event-name → UXAF-surface mapping; unclear whether Datadog RUM, Metabase, or Redshift has surface-level events.' },
  { id: 'G23', stage: 'learn', text: 'No retirement path for recipes, keyframes, or patterns.' },
  { id: 'G24', stage: 'learn', waiting: true, text: 'No cross-team readout ritual since Data Wednesday lapsed (June 2024); repository adoption risk.' },
  { id: 'G25', stage: 'all', waiting: true, text: 'Is the capability funded with maintained capacity and enablement, or side-of-desk for Chase and Adam?' },
];

export const WAITING_NOTE =
  'Red quests depend on the Oct 9 session with Thomas, Adam, and Stacy (decision rights, funding, the Agentic Ordering experiment).';

/**
 * Blueprints: skills to build and new ideas from the Notion idea log, shown as
 * construction sites. `at` is the art-pixel position of the site.
 */
export const BLUEPRINTS = [
  {
    id: 'bp-workflows',
    home: 'explore',
    kind: 'Skill to build',
    name: 'Generate workflows from production + recipes',
    text: 'Build workflows from production and the recipes in the prototypes repo.',
    surfaces: 'Prototypes repo, Storybook',
    at: [142, 22],
  },
  {
    id: 'bp-enrich',
    home: 'test',
    kind: 'Skill to build',
    name: 'Enrich UX feedback signal reports',
    text: 'Attach images and GIFs of the product so feedback is contextualized visually.',
    surfaces: 'Feedback DB, Notion reports',
    at: [322, 46],
  },
  {
    id: 'bp-flows',
    home: 'observe',
    kind: 'Skill to build',
    name: 'Analytics + screenshots flow diagrams',
    text: 'Flow diagrams using product screenshots layered with citations and annotations.',
    surfaces: 'FigJam, Figma Design, prototypes, Notion docs',
    at: [122, 192],
  },
  {
    id: 'bp-contribution',
    home: 'ship',
    kind: 'New idea',
    name: 'Durable contribution model',
    text: 'The Storybook → Figma push becomes the contribution path. Consumers branch, open a PR, Chase reviews and comments, and the PR merges with a description and supporting data. Contribution stops being ad hoc and gains a review record.',
    surfaces: 'GitHub, Storybook, Figma',
    at: [244, 196],
  },
  {
    id: 'bp-routing',
    home: 'disposition',
    kind: 'New idea',
    name: 'Feedback routing skill',
    text: 'The skill feedback database already exists; it needs to report issues onward to a kanban or Linear so generative quality improves through positive and negative examples.',
    surfaces: 'Feedback DB, Linear',
    at: [284, 110],
  },
  {
    id: 'bp-sync',
    home: 'pantry',
    kind: 'Task',
    name: 'Key frames + recipes libraries sync with the prototypes repo',
    text: 'A headless experience outside the app-workflow production codebase — how assets are organized pre-production.',
    surfaces: 'Figma, prototypes repo',
    at: [120, 64],
  },
];

/**
 * Landmarks: the cross-cutting lanes, the Pantry, and Canopy itself.
 * Hotspot boxes live with the art in design-os-world.js.
 */
export const LANDMARKS = [
  {
    id: 'canopy',
    name: 'The Canopy',
    kind: 'Design system',
    accent: '#63c74d',
    sub: 'The design system every land grows from.',
    lede:
      'Canopy is not a stage; it is the ground the loop stands on. The protopack — recipes, layouts, and canonical screens built from Canopy components — is live today, and the Canopy component library in Figma is Code Connect CLI mapped.',
    roots: [
      ['explore', 'Canopy-aware generation from recipes · Cursor / Claude + Canopy MCP'],
      ['decide', 'Figma spec page rebuilt via the Code Connect map + use_figma'],
      ['ship', 'Canopy-aware build · conformance checks vs. Canopy'],
      ['learn', 'Codified Canopy pattern · Canopy docs · Canopy pattern vs. stays local'],
      ['disposition', 'Rule → Canopy .md instructions + state-checker rules table'],
    ],
  },
  {
    id: 'keystone',
    name: 'The Keystone',
    kind: 'Cross-cutting lane 1 · Keys spine',
    accent: '#fee761',
    sub: 'Story URL from scaffold onward; UXAF IDs everywhere.',
    lede:
      'A comment, finding, or deviation without an ID cannot enter the record — this is the discipline the whole map depends on. On the map, the ring road is the spine: nothing travels between lands without a key.',
    core: 'Story URL + UXAF IDs (feature · surface · workflow · logic rule). One ID per item, everywhere.',
    items: [
      'Story parameters carry Notion URL + UXAF IDs; Storybook panel shows intent beside the prototype',
      'Figma annotations pin rule + state IDs to frames; each frame back-links its Notion row',
      'Linear issue carries UXAF IDs; the bundle links intent, spec, story, and story version',
      'PR template carries Linear issue + UXAF IDs; deviations logged against IDs',
      'Prototypes DB row keyed by story URL is the intent record; canonical vs. fork relation',
      'Code carries UXAF IDs so the engineer’s agent and the Graph can be reconciled',
    ],
  },
  {
    id: 'capture',
    name: 'Capture Lighthouse',
    kind: 'Cross-cutting lane 2 · Capture service',
    accent: '#fee761',
    sub: 'One primitive, five consumers.',
    lede:
      'Already built once for the keyframe drift check — make it a service instead of re-implementing it per skill.',
    core:
      'Screenshot of surface X in state Y from a staging fixture, keyed by story URL or UXAF surface ID. Playwright → staging login with the row’s fixture → screenshot. Never production PHI.',
    consumers: [
      ['test', 'Feedback enrichment — images and GIFs attached to feedback rows'],
      ['decide', 'Spec cover + state-matrix screenshots for the Figma review layer'],
      ['ship', 'Conformance diff — built surface vs. prototype keyframe'],
      ['observe', 'Analytics flow diagrams — screenshots with numbers, citations, annotations'],
      ['learn', 'Keyframe drift check on a schedule — monthly or per release'],
    ],
  },
  {
    id: 'disposition',
    name: 'The Sorting Post',
    kind: 'Cross-cutting lane 3 · Disposition triage',
    accent: '#feae34',
    sub: 'Review is a triage, not a pipe.',
    lede:
      '“Report issues to Linear” is only one row — the Example row is where generative quality compounds, and nothing writes to it today.',
    inputs: [
      ['Experience review findings', 'Test Kitchen verdicts · Feedback DB · Pattern Findings'],
      ['Readiness review findings', 'Agent pre-read questions · gap list'],
      ['Conformance review findings', 'Deviations · screenshot diff'],
    ],
    decision: 'Disposition — agent proposes · designer confirms',
    outputs: [
      ['Rule', 'Canopy .md instructions + state-checker rules table'],
      ['Example', 'Golden set for the Cursor + Canopy agent (positive and negative)', true],
      ['Ticket', 'Linear — a defect an engineer will actually take'],
      ['Pattern candidate', 'Test Kitchen queue (same finding on 3+ surfaces)'],
      ['Resolved / Dismissed', 'Record only (answered in thread; taste, not intent)'],
    ],
  },
  {
    id: 'pantry',
    name: 'The Pantry',
    kind: 'UXAF on disk',
    accent: '#e4a672',
    sub: 'UXAF projected onto a filesystem.',
    lede:
      'Adam’s three repo axes map one-to-one onto UXAF layers. Once explicit, “scan for missing elements” is a query against the Graph, not a visual scan: a Surface with no keyframe, a Workflow with no flow file, a Capability with no recipe. Engineers maintain UXAF without knowing they are maintaining UXAF.',
    shelves: [
      ['Capability files', 'Catalog, Order Core first', 'Capabilities', '12 proposed, formerly Code Domains', 'Keyframes DB', 'linked to Capabilities'],
      ['Persona files', 'instances of capability files', 'Surfaces × Persona', '', 'Surfaces DB', '62 of 78 tagged'],
      ['Product-flow files', '', 'Workflows', '', 'Workflows DB', ''],
    ],
  },
];

export const STAGE_BY_ID = Object.fromEntries(STAGES.map((s) => [s.id, s]));
export const LANDMARK_BY_ID = Object.fromEntries(LANDMARKS.map((l) => [l.id, l]));
