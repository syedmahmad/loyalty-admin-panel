// third-party
import { combineReducers } from 'redux';

// redux states (reducers) import
import menu from './menu';
import snackbar from './snackbar';
import categories from './categories';
import user from './user';

export * from './user';

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  user,
  menu,
  snackbar,
  categories
});

export default reducers;
