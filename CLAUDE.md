# CLAUDE.md - Instructions for Claude Code Agent

See [`AGENTS.md`](./AGENTS.md) for master architecture invariants and engineering rules.

## Quick Reference Commands
- Build project: `npm run build`
- Install dependencies: `npm install`
- Check git status: `git status`

## Workflow Rules
- Always run `npm run build` after modifying files in `src/` to verify production bundling.
- Auto-commit and push changes (`git add . && git commit -m "..." && git push origin master`) upon completing work items.
