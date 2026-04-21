# Phase 13: local check result（**draft / 未実行**）

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 13                                                   |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                |
| タスク種別 | NON_VISUAL code task                                 |
| Task       | 13-1                                                 |
| ステータス | **draft（user 承認後に実コード導入と合わせて実行）** |

## 重要な前提

本 task は **spec-only task** である。実コード 4 ファイルの変更 / 新規テスト 4 シナリオ追加はまだ行われていないため、typecheck / lint / test の実機実行は**未実施**である。

**承認後（user が「PR を作成してよい」旨を明示指示）に**、実コード変更をブランチに適用した上で以下の 4 コマンドを実行し、全 PASS を確認してから Phase 13 の確定に進む。

## 実行予定コマンド（Task 13-1）

| #   | コマンド                                                         | 目的                                                                                         | 期待結果                     |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| 1   | `pnpm --filter @repo/desktop typecheck`                          | 型追加（`planId?` / `requestId?` + `UseStreamingProgressOptions`）が全参照箇所と整合すること | exit code 0 / 型エラー 0 件  |
| 2   | `pnpm --filter @repo/desktop lint`                               | ESLint 違反がないこと（`any` 型導入なし / 未使用変数なし等）                                 | exit code 0 / 警告許容範囲内 |
| 3   | `pnpm --filter @repo/desktop test -- --run useStreamingProgress` | Hook の filter 4 シナリオ（match / miss / legacy / no-options）および既存テスト全 PASS       | exit code 0 / fail 0 件      |
| 4   | `pnpm --filter @repo/desktop test -- --run skill-creator`        | skill-creator 関連テスト群が破壊されていないこと（Main ipc / service レイヤ等）              | exit code 0 / fail 0 件      |

## 実行結果記録欄（承認後に記入）

| #   | 実行日時 | コマンド                                                         | 結果   | 備考 |
| --- | -------- | ---------------------------------------------------------------- | ------ | ---- |
| 1   | 未実行   | `pnpm --filter @repo/desktop typecheck`                          | 未実行 | —    |
| 2   | 未実行   | `pnpm --filter @repo/desktop lint`                               | 未実行 | —    |
| 3   | 未実行   | `pnpm --filter @repo/desktop test -- --run useStreamingProgress` | 未実行 | —    |
| 4   | 未実行   | `pnpm --filter @repo/desktop test -- --run skill-creator`        | 未実行 | —    |

## ルール再掲

- **`--no-verify` 禁止**（プロジェクト `CLAUDE.md` 準拠）。pre-commit / pre-push フックを必ず通す
- typecheck / lint / test がいずれも PASS した状態で初めて `pr-info.md` を確定 → `gh pr create`（承認後のみ）に進む
- 失敗した場合は根本原因を修正。`.skip` 暫定措置を使う場合は必ず Issue / TODO を作成

## 参照

- `phase-13-pr-creation.md` Task 13-1
- `phase-1-requirements.md` AC-9（typecheck / lint / targeted test PASS）
- `CLAUDE.md`（プロジェクトルート）
