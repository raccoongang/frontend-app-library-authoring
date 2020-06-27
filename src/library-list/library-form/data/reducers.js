import { createLibrary } from './actions';

const initialState = {
  error: null,
  library: null,
  submitted: false,
  submitting: false,
};

const reducer = (state = initialState, action = null) => {
  if (action !== null) {
    const { payload, type } = action;
    switch (type) {
      case createLibrary.TRIGGER:
        return {
          ...state,
          submitted: false,
          submitting: true,
        };
      case createLibrary.SUCCESS:
        return {
          ...state,
          library: payload.library,
        };
      case createLibrary.FAILURE:
        return {
          ...state,
          error: payload.error,
        };
      case createLibrary.FULFILL:
        return {
          ...state,
          submitted: true,
          submitting: false,
        };
      default:
    }
  }

  return state;
};

export default reducer;
