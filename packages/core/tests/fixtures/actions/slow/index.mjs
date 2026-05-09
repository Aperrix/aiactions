/**
 * Slow fixture — sleeps until the abort signal fires, then writes a
 * sentinel file at $SLOW_FIXTURE_SENTINEL so the test can assert the
 * abort actually delivered. Times out after 60 s as a hard cap.
 */
import { writeFile } from "node:fs/promises";

export async function run(ctx) {
  ctx.log("info", "slow: starting");
  const sentinel = process.env.SLOW_FIXTURE_SENTINEL;
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 60_000);
    ctx.signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });
  if (ctx.signal.aborted && sentinel !== undefined) {
    await writeFile(sentinel, "aborted", "utf-8");
  }
}
