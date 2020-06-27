import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { LIBRARY_TYPES, unpackLibraryKey } from '../../library-common';

ensureConfig(['CMS_BASE_URL'], 'library API service');

export async function getLibraryList(username) {
  const client = getAuthenticatedHttpClient();
  const base_url = getConfig().CMS_BASE_URL;

  /* Fetch modulestore and blockstore libraries simultaneously. */
  const [v1Response, v2Response] = await Promise.all([
      client.get(`${base_url}/library/`),
      client.get(`${base_url}/api/libraries/v2/`),
  ]);

  /* Normalize modulestore properties to conform to the v2 API, marking them as
   * type LEGACY in the process. */
  const v1Libraries = v1Response.data.map(library => {
    const { org, slug } = unpackLibraryKey(library.library_key);

    return {
      id: library.library_key,
      org,
      slug,
      bundle_uuid: null,
      title: library.display_name,
      description: null,
      version: null,
      has_unpublished_changes: false,
      has_unpublished_deletes: false,
      type: LIBRARY_TYPES.LEGACY,
    };
  });

  /* Mark blockstore libraries as COMPLEX. */
  const v2Libraries = v2Response.data.map(lib => ({
      ...lib,
      type: LIBRARY_TYPES.COMPLEX,
  }));

  /* Concatenate the libraries and sort them by title. */
  const libraries = v2Libraries.concat(v1Libraries);
  libraries.sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    if (titleA < titleB) {
      return -1;
    }

    if (titleA > titleB) {
      return 1;
    }

    return 0;
  });

  return libraries;
}

export async function createLibrary({type, ...data}) {
  const client = getAuthenticatedHttpClient();
  const base_url = getConfig().CMS_BASE_URL;

  let response;
  if (type === LIBRARY_TYPES.COMPLEX) {
    response = await client.post(`${base_url}/api/libraries/v2/`, {data});
  } else if (type === LIBRARY_TYPES.LEGACY) {
    response = await client.post(`${base_url}/library/`, {
      org: data.org,
      number: data.slug,
      display_name: data.title,
    });
  } else {
    throw new Error("Unknown library type.");
  }

  return response.data;
}
