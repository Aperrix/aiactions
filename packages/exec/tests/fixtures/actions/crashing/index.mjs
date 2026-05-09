/**
 * Crashing fixture — throws unconditionally so the test can assert
 * the error frame is captured and the step status becomes failed.
 */
export async function run() {
  throw new Error("crashing fixture: intentional failure");
}
