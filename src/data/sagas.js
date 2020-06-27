import { all } from 'redux-saga/effects';

import { saga as libraryListSaga } from '../library-list';
import { saga as libraryDetailSaga } from '../library-detail';

export default function* rootSaga() {
  yield all([
    libraryListSaga(),
    libraryDetailSaga(),
  ]);
}
