/**
 * Echo fixture — emits the `message` input back as the `echoed` output.
 * Matches the `outputs.echoed` declaration in `aiaction.yaml`.
 */
export async function run(ctx) {
  const message = ctx.inputs.message ?? "";
  ctx.emitOutput("echoed", message);
  ctx.log("info", `echo: emitted ${message.length} chars`);
}
