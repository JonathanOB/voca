import 'i18next';

import type en from './locales/en';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'ui';
    resources: {
      ui: typeof en.ui;
      boards: typeof en.boards;
      routines: typeof en.routines;
      vocab: typeof en.vocab;
    };
  }
}
