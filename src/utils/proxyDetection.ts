// Proxy and network detection utilities

export const detectProxyIssues = async (): Promise<{
  hasProxy: boolean;
  canReachFirebase: boolean;
  canReachGoogle: boolean;
  recommendations: string[];
}> => {
  const recommendations: string[] = [];
  let hasProxy = false;
  let canReachFirebase = false;
  let canReachGoogle = false;

  // Check if we can reach Google services
  try {
    const googleResponse = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    canReachGoogle = true;
  } catch (error) {
    canReachGoogle = false;
    recommendations.push('Cannot reach Google services - check your internet connection');
  }

  // Check if we can reach Firebase
  try {
    const firebaseResponse = await fetch('https://firebase.googleapis.com/', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    canReachFirebase = true;
  } catch (error) {
    canReachFirebase = false;
    recommendations.push('Cannot reach Firebase services - this may be a proxy/firewall issue');
  }

  // Simple proxy detection (not 100% accurate but helpful)
  const userAgent = navigator.userAgent;
  const connection = (navigator as any).connection;
  
  if (connection && connection.type === 'cellular' && !canReachGoogle) {
    recommendations.push('You may be on a restricted cellular network');
  }

  if (!canReachGoogle && !canReachFirebase) {
    hasProxy = true;
    recommendations.push('Disable proxy settings in Windows and browser');
    recommendations.push('Try using a different network (mobile hotspot)');
    recommendations.push('Check if you\'re behind a corporate firewall');
  }

  return {
    hasProxy,
    canReachFirebase,
    canReachGoogle,
    recommendations
  };
};

export const getNetworkDiagnostics = async (): Promise<string[]> => {
  const diagnostics: string[] = [];
  
  diagnostics.push(`Online status: ${navigator.onLine ? 'Connected' : 'Offline'}`);
  diagnostics.push(`User Agent: ${navigator.userAgent}`);
  
  const connection = (navigator as any).connection;
  if (connection) {
    diagnostics.push(`Connection type: ${connection.effectiveType || 'unknown'}`);
    diagnostics.push(`Downlink: ${connection.downlink || 'unknown'} Mbps`);
  }

  const proxyCheck = await detectProxyIssues();
  diagnostics.push(`Can reach Google: ${proxyCheck.canReachGoogle}`);
  diagnostics.push(`Can reach Firebase: ${proxyCheck.canReachFirebase}`);
  
  return diagnostics;
};