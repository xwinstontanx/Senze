import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

// export default createStore(rootReducer);

const middleware = [thunk]; // explore further.

const store = createStore(
  rootReducer,
  // initialState,
  applyMiddleware(...middleware),
);

/**
 * Redux store creation
 */
export default store;
