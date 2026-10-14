export const CATALOG_CHANGED_EVENT = 'bookstore:catalog-changed';
const channelName = 'bookstore-catalog';

/**
 * Refresh public catalog consumers after an ADMIN changes a book's published
 * data. The API remains the source of truth; this only invalidates UI views.
 */
export function notifyCatalogChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CATALOG_CHANGED_EVENT));
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage({ type: CATALOG_CHANGED_EVENT });
    channel.close();
  }
}

export function subscribeToCatalogChanges(onChange: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(CATALOG_CHANGED_EVENT, onChange);
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null;
  channel?.addEventListener('message', onChange);

  return () => {
    window.removeEventListener(CATALOG_CHANGED_EVENT, onChange);
    channel?.removeEventListener('message', onChange);
    channel?.close();
  };
}
