import { all, call, put, takeEvery } from 'redux-saga/effects';

import { saga as libraryFormSaga } from '../library-form';

import { fetchLibraryList } from './actions';
import * as service from './service';

export function* handleFetchLibraryList() {
  try {
    const libraries = yield call(service.getLibraryList);
    /* Update redux store. */
    yield put(fetchLibraryList.success({libraries}));
  } catch (error) {
    yield put(fetchLibraryList.failure({error: error.message}));
  } finally {
    /* Mark as loaded. */
    yield put(fetchLibraryList.fulfill());
  }
}

export default function* saga() {
  yield takeEvery(fetchLibraryList.TRIGGER, handleFetchLibraryList);
  yield all([
    libraryFormSaga(),
  ]);
}
