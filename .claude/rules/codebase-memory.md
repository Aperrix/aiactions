# Codebase-memory MCP rules

Always ground code answers and design decisions in what the code **actually** says — not what you remember or assume. Use the `codebase-memory-mcp` tools as the primary lens onto any codebase.

## Indexed projects

Two projects are pre-indexed and must be used in this repository:

| Project name (for tool calls)               | Root path                                    | Role                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home-aperrix-Documents-PROJECTS-aiactions` | `/home/aperrix/Documents/PROJECTS/aiactions` | The project you are working on (CWD).                                                                                                                                                                                                                                                                      |
| `home-aperrix-Documents-PROJECTS-archon`    | `/home/aperrix/Documents/PROJECTS/archon`    | Reference / inspiration. Query it whenever you need to study how Archon solves something — but treat the findings as _evidence_, not _authority_, because AIactions must identify Archon's legacy mistakes and avoid reproducing them (see muninn memory "AIactions inspired by Archon — but greenfield"). |

## Discovery protocol — use the graph FIRST

Before reading files with `Read`/`Grep`/`Glob`, reach for the graph:

- `search_graph(project, name_pattern | label | qn_pattern)` — find functions/classes/routes by name or label.
- `trace_path(project, function_name, mode=calls|data_flow|cross_service)` — follow call chains and data flow.
- `get_code_snippet(project, qualified_name)` — fetch the actual source of a symbol (preferred over `Read` for known symbols).
- `query_graph(project, query)` — complex Cypher-style patterns.
- `get_architecture(project, aspects)` — structural overview.
- `search_code(project, pattern)` — graph-augmented grep across the indexed corpus.

Fall back to `Read`/`Grep`/`Glob` only for non-code files, config values, or raw text content the graph cannot answer.

## Cross-project reasoning (AIactions ↔ Archon)

When designing or debating an AIactions feature that has an Archon counterpart:

1. `search_graph` in **both** projects for the relevant concept.
2. Compare the shape of the implementation (what functions exist, how they connect, what they depend on).
3. Record what Archon does well (port the idea) and what it does poorly (document as anti-pattern to avoid). Persist anti-pattern findings in MuninnDB under vault `aiactions` with `type: "decision"` or `type: "anti-pattern"`.

Never cite Archon's code from memory. Always fetch it through `get_code_snippet` / `search_code` so the reference stays factual.

## Keeping the index fresh

**After every `git commit` on the AIactions repo**, call:

```
mcp__codebase-memory-mcp__detect_changes(project: "home-aperrix-Documents-PROJECTS-aiactions", since: "HEAD~1")
```

If `detect_changes` reports significant structural drift (new files, deletions, major refactors), run a full re-index:

```
mcp__codebase-memory-mcp__index_repository(repo_path: "/home/aperrix/Documents/PROJECTS/aiactions", mode: "moderate")
```

Use `mode: "fast"` for quick structural updates, `moderate` for SIMILAR_TO / SEMANTICALLY_RELATED edges, `full` for a complete re-index with semantic edges. A PostToolUse hook on `git commit` surfaces a reminder to do this — do not skip it.

For Archon, only re-index if the user explicitly asks or if a `detect_changes` query returns obviously stale results — it is a read-only reference for this project.

## When memory and index conflict

Trust the index. If a MuninnDB memory says "function X lives at path Y" and `search_graph` disagrees, update the memory via `muninn_evolve` rather than acting on the stale claim. Memory captures _decisions and rationale_; the index captures _current code state_ — they serve different purposes.
