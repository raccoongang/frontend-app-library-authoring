import { createSelector } from 'reselect';

import { initLibraryUrl } from '../../library-common';

export const storeName = 'libraryList';

export const libraryListSelector = state => ({ ...state[storeName].list });

export const libraryListPageSelector = createSelector(
  libraryListSelector,
  (state) => ({
    ...state,
    libraries: state.libraries.map(initLibraryUrl),
  }),
);
