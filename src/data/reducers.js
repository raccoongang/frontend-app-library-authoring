import { combineReducers } from 'redux';

import {
  reducer as libraryListReducer,
  storeName as libraryListStoreName,
} from '../library-list';
import {
  reducer as libraryDetailReducer,
  storeName as libraryDetailStoreName,
} from '../library-detail';

const createRootReducer = () => combineReducers({
  [libraryListStoreName]: libraryListReducer,
  [libraryDetailStoreName]: libraryDetailReducer,
});

export default createRootReducer;
