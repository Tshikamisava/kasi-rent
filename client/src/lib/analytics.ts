export function trackEvent(name: string, payload?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && (window as any).dataLayer && Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({ event: name, ...payload });
    } else {
      // fallback to console so developers can see events locally
      // eslint-disable-next-line no-console
      console.log('trackEvent', name, payload ?? {});
    }
  } catch (e) {
    // fail silently
  }
}

export default trackEvent;
