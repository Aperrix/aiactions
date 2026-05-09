# Changelog

## [1.2.1](https://github.com/Aperrix/aiactions/compare/@aiactions/cli@v1.2.0...@aiactions/cli@v1.2.1) (2026-05-09)

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @aiactions/runtime bumped to 3.0.1

## [1.2.0](https://github.com/Aperrix/aiactions/compare/@aiactions/cli@v1.1.0...@aiactions/cli@v1.2.0) (2026-05-08)

### Features

- **cli:** include resolvedVersion in install JSON receipt ([13bac25](https://github.com/Aperrix/aiactions/commit/13bac253822dde339c1b186e99e5bb751faa5d3f))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @aiactions/runtime bumped to 3.0.0
    - @aiactions/workflows bumped to 1.0.1

## [1.1.0](https://github.com/Aperrix/aiactions/compare/@aiactions/cli@v1.0.0...@aiactions/cli@v1.1.0) (2026-05-08)

### Features

- **cli:** add 'aia action check' to validate aiaction.yaml manifests ([4c7c1cf](https://github.com/Aperrix/aiactions/commit/4c7c1cf217140562b415b6fc8eb6dcebfee08c14))
- **cli:** add EXIT.REGISTRY and registry error classes ([2bd5d5a](https://github.com/Aperrix/aiactions/commit/2bd5d5a596d14a45ac9649c982527725c5db8193))
- **cli:** add parseShortRef for '&lt;ns&gt;/&lt;name&gt;' install form ([702291b](https://github.com/Aperrix/aiactions/commit/702291b6d8f3a33ab6e8561b3f94b54637b1932c))
- **cli:** add registry adapter (fetch, resolve, group) ([dfd3974](https://github.com/Aperrix/aiactions/commit/dfd3974f027d769d43499f4238b680521925d9dd))
- **cli:** registry-aware install (short-name + picker) ([9a85e66](https://github.com/Aperrix/aiactions/commit/9a85e662922cad1f96ccb8baa5f846d2449ad093))
- **cli:** registry-aware list with badges and --json shape ([73c92ec](https://github.com/Aperrix/aiactions/commit/73c92ec1a3fc09a4354e81598c5f9109bfb06054))

### Bug Fixes

- **cli:** canonicalize outdated-cache badge to single-bracket form ([22288d0](https://github.com/Aperrix/aiactions/commit/22288d01fe205ba137f80c7ad176b58d144c441a))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @aiactions/runtime bumped to 2.0.0
    - @aiactions/workflows bumped to 1.0.0

## 1.0.0 (2026-05-06)

### ⚠ BREAKING CHANGES

- **registry:** `@aiactions/runtime` callers must now pass bare semver to `RegistryCoordinate.version` (e.g. "1.0.0", not "v1.0.0"). action package renamed from `@aiactions-public/claude-agent` to `@claude/agent`.

### Features

- **registry:** MS1.5 — actions registry backend ([7a52499](https://github.com/Aperrix/aiactions/commit/7a524994d0732a0685582888a36097bf041e7ba0))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @aiactions/runtime bumped to 1.0.0
