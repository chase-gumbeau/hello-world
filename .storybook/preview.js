import '../material-setup.js';
import '../material-theme.css';
import '../style.css';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Foundations',
          'Studies',
          'Projects',
          [
            'Morning Brief',
            'Work Brief',
            [
              'Page',
              'Clinician',
              'Supplier CSR',
              'Supplier Manager',
              'Patient',
              'Payor',
              'Catalog',
              'Ops / CS',
            ],
            'Solari Board',
            'Scrolls',
            ['Home', 'Home Left', '2025', '2024', '2023'],
          ],
          '*',
        ],
      },
    },
  },
  globalTypes: {
    scrollsHome: {
      description: 'Scrolls home layout version',
      toolbar: {
        title: 'Home',
        icon: 'sidebar',
        items: [
          { value: 'centered', title: 'Home · Centered' },
          { value: 'left', title: 'Home · Left' },
        ],
        dynamicTitle: true,
      },
    },
    workBriefPersona: {
      description: 'Work Brief persona variant',
      toolbar: {
        title: 'Brief',
        icon: 'user',
        items: [
          { value: 'clinician', title: 'Brief · Clinician' },
          { value: 'supplier_csr', title: 'Brief · Supplier CSR' },
          { value: 'supplier_manager', title: 'Brief · Supplier Manager' },
          { value: 'patient', title: 'Brief · Patient' },
          { value: 'payor', title: 'Brief · Payor' },
          { value: 'catalog', title: 'Brief · Catalog' },
          { value: 'ops_cs', title: 'Brief · Ops / CS' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    scrollsHome: 'centered',
    workBriefPersona: 'supplier_csr',
  },
};

export default preview;
