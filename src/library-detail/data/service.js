import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { LIBRARY_TYPES } from '../../library-common';

ensureConfig(['CMS_BASE_URL'], 'library API service');

export async function getLibraryDetail(libraryId) {
  const client = getAuthenticatedHttpClient();
  const base_url = getConfig().CMS_BASE_URL;

  /* Fetch the library. */
  const response = await client.get(`${base_url}/api/libraries/v2/${libraryId}/`);
  const library = {
      ...response.data,
      type: LIBRARY_TYPES.COMPLEX,
  };

  return library;
}
