import { combineReducers } from 'redux';

import { reducer as libraryFormReducer } from '../library-form';

import { fetchLibraryList } from './actions';

const libraryListInitialState = {
  error: null,
  libraries: [],
  loaded: false,
  loading: true,
};

const libraryListReducer = (state = libraryListInitialState, action = null) => {
  if (action !== null) {
    const { payload, type } = action;
    switch (type) {
      case fetchLibraryList.TRIGGER:
        return {
          ...state,
          loading: true,
        };
      case fetchLibraryList.SUCCESS:
        return {
          ...state,
          libraries: payload.libraries,
        };
      case fetchLibraryList.FAILURE:
        return {
          ...state,
          error: payload.error,
        };
      case fetchLibraryList.FULFILL:
        return {
          ...state,
          loading: false,
          loaded: true,
        };
      default:
    }
  }

  return state;
};

const reducer = combineReducers({
  list: libraryListReducer,
  form: libraryFormReducer,
});

export default reducer;
