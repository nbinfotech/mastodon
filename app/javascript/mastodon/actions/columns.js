import { saveSettings } from './settings';
import uuid from '../uuid';

export const COLUMN_ADD           = 'COLUMN_ADD';
export const COLUMN_REMOVE        = 'COLUMN_REMOVE';
export const COLUMN_MOVE          = 'COLUMN_MOVE';
export const COLUMN_PARAMS_CHANGE = 'COLUMN_PARAMS_CHANGE';

export function addColumn(id, params) {
  return dispatch => {
    dispatch({
      type: COLUMN_ADD,
      uuid: uuid(),
      id,
      params,
    });

    dispatch(saveSettings());
  };
};

export function removeColumn(uuid) {
  return dispatch => {
    dispatch({
      type: COLUMN_REMOVE,
      uuid,
    });

    dispatch(saveSettings());
  };
};

export function moveColumn(uuid, direction) {
  return dispatch => {
    dispatch({
      type: COLUMN_MOVE,
      uuid,
      direction,
    });

    dispatch(saveSettings());
  };
};

export function changeColumnParams(uuid, params) {
  return dispatch => {
    dispatch({
      type: COLUMN_PARAMS_CHANGE,
      uuid,
      params,
    });

    dispatch(saveSettings());
  };
}
