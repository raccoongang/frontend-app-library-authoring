import { createSelector } from 'reselect';

import { initLibraryUrl } from '../../library-common';

export const storeName = 'libraryDetail';

export const libraryStateSelector = state => ({ ...state[storeName] });

export const libraryDetailSelector = createSelector(
  libraryStateSelector,
  (state) => {
    return {
      ...state,
      library: initLibraryUrl(state.library),
    }
  },
);
