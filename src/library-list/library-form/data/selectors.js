import { createSelector } from 'reselect';

import { initLibraryUrl } from '../../../library-common';

/* The parent store name is hard-coded, as we don't want to import from a
 * parent (to avoid circular imports.) */
export const libraryFormSelector = state => ({ ...state.libraryList.form });

export const libraryFormComponentSelector = createSelector(
  libraryFormSelector,
  (state) => ({
    ...state,
    library: initLibraryUrl(state.library),
  }),
);
