import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log('Navigation not ready yet');
    // Retry shortly in case the ref becomes ready
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
      } else {
        console.warn('Navigation still not ready for', name);
      }
    }, 100);
  }
}

export function replace(name, params) {
  if (navigationRef.isReady() && navigationRef.current?.dispatch) {
    try {
      navigationRef.current.dispatch({ type: 'REPLACE', payload: { name, params } });
    } catch (err) {
      // If REPLACE isn't supported, fallback to navigate
      navigate(name, params);
    }
  } else if (navigationRef.isReady()) {
    navigate(name, params);
  } else {
    console.warn('Navigation ref not ready — could not replace to', name);
  }
}

export default {
  navigationRef,
  navigate,
  replace,
};
