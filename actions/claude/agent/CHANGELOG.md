# Changelog

## [1.0.0](https://github.com/Aperrix/aiactions/compare/claude/agent@v1.0.0...claude/agent@v1.0.0) (2026-05-08)

### ⚠ BREAKING CHANGES

- **registry:** `@aiactions/runtime` callers must now pass bare semver to `RegistryCoordinate.version` (e.g. "1.0.0", not "v1.0.0"). action package renamed from `@aiactions-public/claude-agent` to `@claude/agent`.

### Features

- **registry:** MS1.5 — actions registry backend ([7a52499](https://github.com/Aperrix/aiactions/commit/7a524994d0732a0685582888a36097bf041e7ba0))
