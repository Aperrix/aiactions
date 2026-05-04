/**
 * Tests for the `uses:` ref grammar. Two forms are accepted (registry,
 * local); `git+` is rejected with an explicit message; everything else
 * raises a generic "unrecognised ref" issue.
 *
 * Contents:
 * - `usesRefSchema` registry form: positive shapes + version flavours.
 * - `usesRefSchema` local form: `./`, `../`, `file:///` accepted with
 *   `path` field stripped of the `file://` scheme.
 * - `usesRefSchema` rejection: `git+...`, malformed registry refs,
 *   empty strings, garbage.
 */

import { describe, expect, test } from "vite-plus/test";

import { RefKind, usesRefSchema } from "../src/schema/ref.ts";

describe("usesRefSchema — registry form", () => {
  test("parses canonical `<ns>/<name>@<ver>` into a registry ref", () => {
    const result = usesRefSchema.safeParse("aiactions/lint@1");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        kind: RefKind.registry,
        raw: "aiactions/lint@1",
        namespace: "aiactions",
        name: "lint",
        version: "1",
      });
    }
  });

  test("accepts kebab-case namespace and name", () => {
    const result = usesRefSchema.safeParse("my-org/my-action@v1");
    expect(result.success).toBe(true);
    if (result.success && result.data.kind === RefKind.registry) {
      expect(result.data.namespace).toBe("my-org");
      expect(result.data.name).toBe("my-action");
      expect(result.data.version).toBe("v1");
    }
  });

  test("preserves opaque version strings (semver, tag, prerelease)", () => {
    for (const ver of ["1", "1.0.0", "v2", "1.2.3-beta", "main", "abc123"]) {
      const result = usesRefSchema.safeParse(`org/name@${ver}`);
      expect(result.success).toBe(true);
      if (result.success && result.data.kind === RefKind.registry) {
        expect(result.data.version).toBe(ver);
      }
    }
  });

  test("rejects registry refs with uppercase letters in namespace or name", () => {
    expect(usesRefSchema.safeParse("Org/name@1").success).toBe(false);
    expect(usesRefSchema.safeParse("org/Name@1").success).toBe(false);
  });

  test("rejects registry refs missing the version component", () => {
    expect(usesRefSchema.safeParse("org/name").success).toBe(false);
    expect(usesRefSchema.safeParse("org/name@").success).toBe(false);
  });

  test("rejects registry refs with no name component", () => {
    expect(usesRefSchema.safeParse("aiactions@1").success).toBe(false);
  });
});

describe("usesRefSchema — registry form (review tightening)", () => {
  test("rejects multiple '@' separators in the version", () => {
    const result = usesRefSchema.safeParse("org/name@v@1");
    expect(result.success).toBe(false);
  });

  test("rejects '/' inside the version", () => {
    const result = usesRefSchema.safeParse("org/name@v/with/slash");
    expect(result.success).toBe(false);
  });

  test("rejects whitespace inside the version", () => {
    const result = usesRefSchema.safeParse("org/name@v 1");
    expect(result.success).toBe(false);
  });
});

describe("usesRefSchema — local form", () => {
  test("accepts `./relative` with path preserved verbatim", () => {
    const result = usesRefSchema.safeParse("./actions/lint");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        kind: RefKind.local,
        raw: "./actions/lint",
        path: "./actions/lint",
      });
    }
  });

  test("accepts `../up` for parent-relative refs", () => {
    const result = usesRefSchema.safeParse("../neighbour/foo");
    expect(result.success).toBe(true);
    if (result.success && result.data.kind === RefKind.local) {
      expect(result.data.path).toBe("../neighbour/foo");
    }
  });

  test("accepts `file:///abs/path` and strips the scheme", () => {
    const result = usesRefSchema.safeParse("file:///home/user/actions/foo");
    expect(result.success).toBe(true);
    if (result.success && result.data.kind === RefKind.local) {
      expect(result.data.path).toBe("/home/user/actions/foo");
    }
  });

  test("rejects bare `file://` with no path after the scheme", () => {
    expect(usesRefSchema.safeParse("file://").success).toBe(false);
  });

  test("rejects `./` and `../` with no path segment after the prefix", () => {
    expect(usesRefSchema.safeParse("./").success).toBe(false);
    expect(usesRefSchema.safeParse("../").success).toBe(false);
    expect(usesRefSchema.safeParse("./.").success).toBe(false);
  });

  test("rejects `file://` with a relative path after the scheme", () => {
    expect(usesRefSchema.safeParse("file://./relative").success).toBe(false);
    expect(usesRefSchema.safeParse("file://relative").success).toBe(false);
  });

  test("rejects `file:///` with only the root slash", () => {
    expect(usesRefSchema.safeParse("file:///").success).toBe(false);
  });
});

describe("usesRefSchema — rejection", () => {
  test("rejects git+ refs with an explicit not-supported message", () => {
    const result = usesRefSchema.safeParse("git+https://github.com/foo/bar.git#main");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/git\+ refs are not supported/);
    }
  });

  test("rejects empty string", () => {
    expect(usesRefSchema.safeParse("").success).toBe(false);
  });

  test("rejects garbage strings with the unrecognised-ref message", () => {
    const result = usesRefSchema.safeParse("not a valid ref");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/unrecognised uses ref/);
    }
  });

  test("rejects non-string inputs", () => {
    expect(usesRefSchema.safeParse(42).success).toBe(false);
    expect(usesRefSchema.safeParse(null).success).toBe(false);
    expect(usesRefSchema.safeParse({}).success).toBe(false);
  });
});
