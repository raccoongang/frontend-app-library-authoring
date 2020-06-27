import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { LIBRARY_TYPES } from '../../../library-common';

ensureConfig([
  'CMS_BASE_URL',
  'BLOCKSTORE_COLLECTION_UUID',
], 'Library API service');

export async function createLibrary({type, ...data}) {
  const client = getAuthenticatedHttpClient();
  const { CMS_BASE_URL, BLOCKSTORE_COLLECTION_UUID } = getConfig();

  let response;
  let library;
  if (type === LIBRARY_TYPES.COMPLEX) {
    response = await client.post(`${CMS_BASE_URL}/api/libraries/v2/`, {
      ...data,
      description: data.title,
      collection_uuid: BLOCKSTORE_COLLECTION_UUID,
    }).catch((error) => {
      /* Normalize error data. */
      const apiError = Object.create(error);
      apiError.fieldErrors = JSON.parse(error.customAttributes.httpErrorResponseData);
      apiError.message = null;
      throw apiError;
    });
    library = {
      ...response.data,
      type,
    };
  } else if (type === LIBRARY_TYPES.LEGACY) {
    response = await client.post(`${CMS_BASE_URL}/library/`, {
      org: data.org,
      number: data.slug,
      display_name: data.title,
    }).catch((error) => {
      /* Normalize error data. */
      const apiError = Object.create(error);
      apiError.message = JSON.parse(error.customAttributes.httpErrorResponseData).ErrMsg;
      throw apiError;
    });
    library = {
      id: response.data.library_key,
      org: data.org,
      slug: data.slug,
      bundle_uuid: null,
      title: data.title,
      description: null,
      version: null,
      has_unpublished_changes: false,
      has_unpublished_deletes: false,
      type,
    };
  } else {
    throw new Error("Unknown library type.");
  }

  return library;
}
