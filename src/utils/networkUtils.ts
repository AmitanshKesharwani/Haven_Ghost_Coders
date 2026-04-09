// Network utility functions
export const checkNetworkConnection = (): boolean => {
  return navigator.onLine;
};

export const waitForNetwork = (timeout: number = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
};

export const isFirebaseReachable = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://firebase.googleapis.com/', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    return false;
  }
};