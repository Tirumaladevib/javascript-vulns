/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */

export const Some = <T>(value: T | null | undefined): value is T =>
  value != null;
