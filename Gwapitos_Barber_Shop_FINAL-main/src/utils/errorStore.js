let _lastError = null;

export const setLastError = (err) => {
  try {
    _lastError = err;
  } catch (e) {
    // ignore
  }
};

export const getLastError = () => _lastError;

export const clearLastError = () => {
  _lastError = null;
};

export default {
  setLastError,
  getLastError,
  clearLastError,
};
