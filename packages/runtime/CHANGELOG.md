# Changelog

## [2.0.0](https://github.com/Aperrix/aiactions/compare/@aiactions/runtime@v1.0.0...@aiactions/runtime@v2.0.0) (2026-05-08)


### ⚠ BREAKING CHANGES

* **runtime:** lockfile path changed from `<cwd>/.aiactions/lock.yaml` to `<cwd>/.aiactions/lock.json`. Existing consumer projects with a YAML lockfile see the file silently ignored (wipe-on-mismatch policy); a fresh JSON lockfile is generated on next install. Consumer projects that committed `.aiactions/lock.yaml` should delete the stale file from VCS after the upgrade.

### Features

* **cli:** add 'aia action check' to validate aiaction.yaml manifests ([4c7c1cf](https://github.com/Aperrix/aiactions/commit/4c7c1cf217140562b415b6fc8eb6dcebfee08c14))
* **runtime:** redesign lockfile (YAML → JSON, schema-versioned, merge-friendly) ([02ccf32](https://github.com/Aperrix/aiactions/commit/02ccf32183b27f41ebdae285d576388280834ff2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aiactions/workflows bumped to 1.0.0

## 1.0.0 (2026-05-06)

### ⚠ BREAKING CHANGES

- **registry:** `@aiactions/runtime` callers must now pass bare semver to `RegistryCoordinate.version` (e.g. "1.0.0", not "v1.0.0"). action package renamed from `@aiactions-public/claude-agent` to `@claude/agent`.

### Features

- **registry:** MS1.5 — actions registry backend ([7a52499](https://github.com/Aperrix/aiactions/commit/7a524994d0732a0685582888a36097bf041e7ba0))
