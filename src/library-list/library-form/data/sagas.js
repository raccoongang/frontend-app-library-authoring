import { call, put, takeEvery } from 'redux-saga/effects';

import { createLibrary } from './actions';
import * as service from './service';

export function* handleCreateLibrary({payload}) {
  try {
    const { data } = payload;
    const library = yield call(service.createLibrary, data);
    yield put(createLibrary.success({library}));
  } catch (error) {
    yield put(createLibrary.failure({error}));
  } finally {
    yield put(createLibrary.fulfill());
  }
}

export default function* saga() {
  yield takeEvery(createLibrary.TRIGGER, handleCreateLibrary);
}
