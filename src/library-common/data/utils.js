import { ensureConfig, getConfig } from '@edx/frontend-platform';

import { LIBRARY_TYPES } from '../../library-common';

ensureConfig(['CMS_BASE_URL'], 'library utils');

/* Add a "url" property to the library object, set to the proper library URL
 * according to its type. */
export const initLibraryUrl = (library) => {
  if (library == null) {
    return null;
  }

  let url;
  if (library.type == LIBRARY_TYPES.LEGACY) {
    url = `${getConfig().CMS_BASE_URL}/library/${library.id}`;
  } else {
    url = `/library/${library.id}`;
  }

  return {
    ...library,
    url,
  };
};

/* Given a v1 library key, unpack it into org and slug. */
export const unpackLibraryKey = (key) => {
  const re = /library-v1:(?<org>.+)\+(?<slug>.+)/;
  const match = key.match(re);
  if (match) {
    return match.groups;
  } else {
    return {
      org: null,
      slug: null,
    };
  }
};
