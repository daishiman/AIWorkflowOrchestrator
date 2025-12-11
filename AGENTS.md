# Repository Guidelines

## Project Structure & Module Organization

- Core assets live in `docs/`, organized numerically (e.g., `00-requirements/`, `10-guides/`) for IEEE-830-style flows; place new requirements in `00-`, tutorials in `10-`, specs in `20-`, and architecture in `30-`.
- Operational assets for Claude/agent orchestration reside in `.claude/` (agents, commands, prompts, skills); keep generated or synced files there.
- Maintenance utilities sit in `scripts/` (`simplify_command_list.py`, `refactor_command_list.py`, `fix_truncated_agents.py`); run them from the repo root.
- Top-level `README.md` defines branching (`main`, `develop`, `feature/*`) and the high-level workflow.

## Build, Test, and Development Commands

- No global build pipeline yet; docs are plain Markdown.
- Run maintenance scripts with `python3 scripts/<script>.py` from the repo root (paths inside scripts assume this root layout).
- Use `rg` for searching text and `rg --files` for inventorying files; both are fast and preferred.

## Coding Style & Naming Conventions

- Python: 4-space indentation, type hints where practical, module-level docstrings (see `scripts/*.py`), and UTF-8 encoding.
- Markdown: use ATX headings, short paragraphs, and fenced code blocks with language tags.
- File naming: prefix doc folders with two-digit numbers for ordering; use kebab-case for new Markdown filenames (`skill-creation/`, `knowledge-management-example.md`).
- Keep scripts side-effect free except for their intended output files; avoid hard-coded absolute paths when adding new utilities.

## Testing Guidelines

- No automated test suite is defined. When adding Python utilities, provide minimal self-checks or docstring examples.
- For new scripts, prefer idempotent behavior and include a dry-run mode or clear logging.
- If you introduce tests, use `pytest`, follow `tests/<feature>_test.py`, and document commands in this guide.

## Commit & Pull Request Guidelines

- Branch from `develop` into `feature/<short-purpose>`; merge back to `develop`, then to `main` after verification.
- Commit messages: short, present-tense summaries (`fix`, `add`, `update`), referencing issues when applicable.
- Pull requests: include scope/intent, key changes, and test notes; attach screenshots or sample outputs when altering docs that include diagrams or generated lists.

## Security & Configuration Tips

- Avoid committing secrets; `.claude/settings.local.json` is local-only—add new local configs to `.gitignore`.
- Scripts touch files under `.claude/commands` and `.claude/agents`; confirm paths before running on fresh clones to prevent accidental writes.
