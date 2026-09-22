export const PORTAL_URL = (import.meta.env.VITE_PORTAL_URL || (import.meta.env.DEV ? "http://127.0.0.1:4175" : "https://wefyx.pro/portal")).replace(/\/$/, "");

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
