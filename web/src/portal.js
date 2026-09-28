// Keep the portal in this application unless a separate portal deployment was
// explicitly configured. The previous development fallback pointed at port
// 4175, which is not served by this project and caused sign-in to fail after
// registration.
export const PORTAL_URL = (import.meta.env.VITE_PORTAL_URL || `${window.location.origin}/portal`).replace(/\/$/, "");

export function portalSessionUrl() {
  const token = localStorage.getItem("wefyx-token");
  const rawUser = localStorage.getItem("wefyx-user");
  if (!token || !rawUser) return PORTAL_URL;
  try {
    const user = JSON.parse(rawUser);
    const params = new URLSearchParams({ access_token: token, user: JSON.stringify(user) });
    return `${PORTAL_URL}/#${params.toString()}`;
  } catch {
    return PORTAL_URL;
  }
}

export function goToPortal() {
  window.location.assign(portalSessionUrl());
}
