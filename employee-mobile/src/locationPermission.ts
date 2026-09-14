import { Platform } from 'react-native';
import {
  checkMultiple,
  openSettings,
  PERMISSIONS,
  requestMultiple,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';

export type LocationPermissionState =
  | 'granted'
  | 'limited'
  | 'denied'
  | 'blocked'
  | 'unavailable';

const androidPermissions = [
  PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
] as const;

function normalize(values: string[]): LocationPermissionState {
  if (values.includes(RESULTS.GRANTED)) return 'granted';
  if (values.includes(RESULTS.LIMITED)) return 'limited';
  if (values.includes(RESULTS.BLOCKED)) return 'blocked';
  if (values.every(value => value === RESULTS.UNAVAILABLE)) return 'unavailable';
  return 'denied';
}

export async function checkLocationPermission(): Promise<LocationPermissionState> {
  if (Platform.OS !== 'android') return 'unavailable';
  const statuses = await checkMultiple([...androidPermissions]);
  return normalize(Object.values(statuses));
}

export async function requestLocationPermission(): Promise<LocationPermissionState> {
  if (Platform.OS !== 'android') return 'unavailable';
  const statuses = await requestMultiple([...androidPermissions]);
  return normalize(Object.values(statuses));
}

export function openLocationSettings() {
  return openSettings('application');
}

export async function requestGalleryPermission(): Promise<LocationPermissionState> {
  if (Platform.OS !== 'android') return 'granted';
  const permission = Number(Platform.Version) >= 33
    ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
    : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  const result = await requestMultiple([permission]);
  return normalize(Object.values(result));
}

export async function requestNotificationPermission(): Promise<LocationPermissionState> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) return 'granted';
  const result = await requestNotifications(['alert', 'sound', 'badge']);
  return normalize([result.status]);
}
