import { fetchLibraryDetail } from './actions';

const libraryDetailInitialState = {
  error: null,
  library: null,
  loaded: false,
  loading: true,
};

const libraryReducer = (state = libraryDetailInitialState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case fetchLibraryDetail.TRIGGER:
        return {
          ...state,
          loading: true,
        };
      case fetchLibraryDetail.SUCCESS:
        const { library } = action.payload;
        return {
          ...state,
          library,
        };
      case fetchLibraryDetail.FAILURE:
        const { error } = action.payload;
        return {
          ...state,
          error,
        };
      case fetchLibraryDetail.FULFILL:
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

export default libraryReducer;
