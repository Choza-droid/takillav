# CLAUDE.md - Token Efficient Rules

1. Think before acting. Read existing files before writing code.
2. Be concise in output but thorough in reasoning.
3. Prefer editing over rewriting whole files.
4. Do not re-read files you have already read unless the file may have changed.
5. Test your code before declaring done.
6. No sycophantic openers or closing fluff.
7. Keep solutions simple and direct.
8. User instructions always override this file.

9. This project uses **pnpm** as package manager. Always use `pnpm install` (never `npm install`) when adding dependencies, or the production build on Render will fail with `ERR_PNPM_OUTDATED_LOCKFILE`. Always commit `pnpm-lock.yaml` after installing new packages.

@AGENTS.md