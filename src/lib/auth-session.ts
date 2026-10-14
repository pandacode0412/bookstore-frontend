export const AUTH_SESSION_CHANGED_EVENT = 'bookstore:auth-session-changed';

/** Notify client-only consumers (such as the persistent site header) after auth changes. */
export function notifyAuthSessionChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}
