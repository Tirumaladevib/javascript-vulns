/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */

export const None = <T>(
  value: T | null | undefined
): value is null | undefined => value == null;
