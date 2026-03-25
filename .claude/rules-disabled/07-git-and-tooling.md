# Git & ツーリングルール

> pnpm 必須・`--no-verify` 禁止・Hook 環境変数等の基本情報は **CLAUDE.md** を参照。
> 本ファイルは CLAUDE.md に記載のない**補足ルール**を定義する。

## Git 操作ルール

- DON'T: `git push --force` を main/master に実行しない
- DON'T: `git reset --hard` は未コミット変更がないことを確認してから
- DON'T: `git rebase -i`（インタラクティブモード）は Claude Code から使用不可
- DO: テスト失敗時は `.skip` + Issue/TODO 作成で対処（`--no-verify` ではない）

## Husky Hooks

### pre-push（2フェーズ並列実行）

| Phase | 内容                | 依存関係             |
| ----- | ------------------- | -------------------- |
| 1     | Lint + Shared Build | 独立実行可能         |
| 2     | TypeCheck + Tests   | Phase 1 完了後に実行 |

- ドキュメントのみの変更はテスト自動スキップ
- Node.js バージョン不一致時はネイティブテストのみスキップ
  → 失敗事例: [06-known-pitfalls.md#P7](./06-known-pitfalls.md)

## Claude Code Hooks

PostToolUse は実行順序が重要（前段の出力を後段が利用）:

**Format → Lint → TypeCheck → Test → Issue同期**

環境変数の一覧は **CLAUDE.md のフック制御用環境変数**を参照。

## PR 作成ルール

- DO: ブランチ名は `feature/`, `fix/`, `refactor/`, `docs/` プレフィックス
- DO: PR タイトルは70文字以内
- DO: PR 本文に Summary（1-3箇条書き）+ Test Plan を含める
- DON'T: main ブランチに直接 push しない

## コミット前チェックリスト

- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 関連テストが全て PASS すること
- [ ] `--no-verify` を使っていないこと
