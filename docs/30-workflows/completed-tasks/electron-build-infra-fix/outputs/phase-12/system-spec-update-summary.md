# Phase 12: System Spec Update Summary

## Step 1: Close-out

### Step 1-A: 完了記録

- タスク TASK-ELECTRON-BUILD-FIX: Phase 1-12 完了（Phase 13 は blocked）
- 問題A (shared/preload ESM/CJS) と問題B (better-sqlite3 ABI) の両方を修正
- AC-1〜AC-6, AC-8, AC-9 は自動検証で PASS
- AC-7 はユーザー手動確認待ち
- Phase 11 は UI 差分なしを current fact として再判定し、`manual-test-result.md`、`screenshot-plan.json`、review-board PNG、capture metadata で NON_VISUAL 根拠を固定

### Step 1-B: 実装状況

workflow 成果物の status / evidence / close-out を current facts に合わせて補正した。

- `implementation-guide.md`: Part 1/2 構成、実行コマンド、型シグネチャ、NON_VISUAL 証跡方針を補強
- `manual-test-result.md` / `manual-test-checklist.md` / `screenshot-plan.json` / `screenshot-coverage.md` / `discovered-issues.md`: UI 差分なしの証跡に是正
- placeholder 依存を廃止し、Phase 11 は `manual-test-result.md`、`phase11-capture-metadata.json`、`screenshots/phase11-build-infra-review-board.png` を含む NON_VISUAL evidence に統一
- `unassigned-task-detection.md`: 新規 formalize 不要の結論へ更新
- `phase12-task-spec-compliance-check.md`: Task 1-5 / Step 1-A-1-C / Step 2 を 1 ファイルへ集約

### Step 1-C: 関連タスク

- GitHub Issue #1786 に対応する修正
- system spec same-wave sync:
  - `references/task-workflow-completed.md`
  - `references/lessons-learned-conversation-db-robustness.md`
  - `references/technology-desktop.md`
  - `references/technology-devops-history.md`
  - `LOGS.md`

## Step 2: 新規 interface/API 変更

**限定的に該当あり** — アプリ公開 API や IPC 契約の変更はないが、build/runtime infrastructure の実運用契約は更新した。

- `@repo/shared` exports に `require` 条件を追加し、CJS consumer を正式サポート
- `rebuild:electron` 導線と `afterPack` rebuild を canonical な運用知見として追記
- `rebuild-native-for-electron.mjs` の `normalizeElectronBuilderArch()` を実装 detail として記録

更新理由:

- packages / preload / packaged app の 3 面で build 条件が変わっており、「内部変更のみ」と扱うと再発防止知見が残らない
- ただし renderer / IPC / domain API の breaking change はないため、更新先は build/devops/history bundle に限定した
