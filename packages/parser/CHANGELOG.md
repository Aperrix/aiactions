# Changelog

## [2.0.0](https://github.com/Aperrix/aiactions/compare/@aiactions/parser@v1.0.0...@aiactions/parser@v2.0.0) (2026-05-10)


### ⚠ BREAKING CHANGES

* **workflows:** @aiactions/workflows no longer exists. Consumers must import from @aiactions/schema (zod schemas, types, errors), @aiactions/parser (parseWorkflow, parseAction, validateWorkflow), or @aiactions/discovery (discoverWorkflows, findGitRoot, loadWorkflowsFromDir).

### Features

* **parser:** migrate workflow parser + topology validator ([30850e3](https://github.com/Aperrix/aiactions/commit/30850e3d996498716dba6b21f388e6a580514e10))
* **schema,parser,discovery:** scaffold three new packages ([20f3f15](https://github.com/Aperrix/aiactions/commit/20f3f157592046805a2176896e0c7fac91e786ec))
* **workflows:** delete @aiactions/workflows package ([35e5719](https://github.com/Aperrix/aiactions/commit/35e57192cb4de6d3914346b1fab11e1a1146065e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @aiactions/schema bumped to 1.1.0
