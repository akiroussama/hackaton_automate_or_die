# Mandatory Phase 2 coordination

Before any repository action, read:

`docs/collaboration/phase2-codex-claude-handoff.md`

Obey the active-owner lock in that file.

- If the active owner is `Claude Code`, Claude may work only on the declared
  scope and Codex must stop.
- If the active owner is `Codex`, Codex may work only on the declared scope and
  Claude must stop.
- The non-owner must not draft, edit, stage, commit or run a parallel task.
- At the end of a block, append a complete handoff entry, change the active
  owner and record the exact next permitted action.
- Never rely on Oussama to relay messages between agents. The handoff file is
  the mailbox and source of truth.

Do not use `git add .`, destructive resets or branch switching in the shared
workspace.
