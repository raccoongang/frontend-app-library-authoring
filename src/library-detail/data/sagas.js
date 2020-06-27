import { call, put, takeEvery } from 'redux-saga/effects';

import { fetchLibraryDetail } from './actions';
import * as service from './service';

export function* handleFetchLibraryDetail({payload}) {
  try {
    const { libraryId } = payload;
    const library = yield call(service.getLibraryDetail, libraryId);
    /* Update redux store. */
    yield put(fetchLibraryDetail.success({library}));
  } catch (error) {
    yield put(fetchLibraryDetail.failure({error: error.message}));
  } finally {
    /* Mark as loaded. */
    yield put(fetchLibraryDetail.fulfill());
  }
}

export default function* saga() {
  yield takeEvery(fetchLibraryDetail.TRIGGER, handleFetchLibraryDetail);
}
