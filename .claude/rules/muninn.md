# MuninnDB usage rules for AIactions

## Vault — **always `aiactions`**

Every MuninnDB tool call made while working in this repository **must** pass `vault: "aiactions"` explicitly. Never fall back to the `default` vault for project work.

Applies to all tools, including but not limited to:
`muninn_remember`, `muninn_remember_batch`, `muninn_remember_tree`, `muninn_recall`, `muninn_recall_tree`, `muninn_read`, `muninn_link`, `muninn_forget`, `muninn_evolve`, `muninn_where_left_off`, `muninn_decide`, `muninn_traverse`, `muninn_status`, `muninn_consolidate`, `muninn_contradictions`, `muninn_session`, `muninn_entities`, `muninn_entity`, etc.

The `default` vault is reserved for the user's cross-project notes (see `~/.claude/CLAUDE.md`). Keeping AIactions-specific context in its own vault avoids contaminating general recall and keeps the project's knowledge graph clean.

## What to persist

Follow the global MuninnDB policy in `~/.claude/CLAUDE.md`. Proactively store (without being asked):

- Architectural decisions and their rationale
- Hard constraints (compliance, performance, security, deployment)
- User preferences on collaboration style and code conventions
- Non-obvious project context (_why_, not _what_ — the _what_ is in the code)
- Bugs, incidents, and their resolutions — with root cause

Do **not** store: code that lives in the repo, facts derivable from `git log`/`git blame`, ephemeral session state, intermediate task progress (use TaskCreate for that).

## How to write memories

- **Atomic** — one concept, one decision, or one fact per memory. Split batches at concept boundaries.
- Include `type` (decision / constraint / project / positioning / …), `summary`, `entities`, and relevant `tags`.
- Use `muninn_remember_batch` when persisting multiple memories from the same conversation.
- Use `muninn_link` with specific relations (`causes`, `supports`, `contradicts`, `supersedes`, `resolves`, …) to connect memories and enrich the graph.

## How to recall

- **Session start**: `muninn_where_left_off(vault: "aiactions")` — purpose-built for resumption.
- **Topic lookup**: `muninn_recall(vault: "aiactions", context: [<topic>], mode: "semantic")`.
- **Exhaustive search**: `mode: "deep"` for multi-hop traversal.
- **Recent continuity**: `mode: "recent"` when topic is unclear.

Verify before acting: memory is a claim about the past. If a memory names a file, function, or decision, confirm it still matches current repo state before recommending action on it.
