/**
 * Single source of truth for the Mom v7.0 application version (REQ-GEN-010).
 * Rule: MUST be incremented on every application update.
 * Format: XXX.YYY.ZZZ (3-digit zero-padded Major.Minor.Patch).
 */
export const APP_VERSION = '001.002.000';

export const APP_VERSION_REGEX = /^\d{3}\.\d{3}\.\d{3}$/;

export function isValidAppVersion(version: string): boolean {
  return APP_VERSION_REGEX.test(version);
}
