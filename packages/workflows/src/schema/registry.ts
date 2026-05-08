import { z } from "zod";

const REGISTRY_REF_RE = /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*@\d+\.\d+\.\d+(?:-[\w.-]+)?$/u;

export const registryEntrySchema = z.object({
  ref: z.string().regex(REGISTRY_REF_RE, "ref must be '<ns>/<name>@<semver>' (lowercase)"),
  description: z.string().min(1, "description must not be empty"),
});

export type RegistryEntry = z.infer<typeof registryEntrySchema>;

export const registrySchema = z.object({
  actions: z.array(registryEntrySchema),
});

export type Registry = z.infer<typeof registrySchema>;
