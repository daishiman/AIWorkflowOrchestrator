# Phase 2: 設計

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 2                                                        |
| 名称       | 設計                                                     |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 前提       | Phase 1                                                  |
| ステータス | Draft                                                    |

## 目的

screenshot コマンド登録と workflow02 文書同期を、同じ命名規約と検証フローで実行できる設計にする。

## 実行タスク

- コマンド設計: `screenshot:skill-import-idempotency-guard` の登録仕様を定義する。
- 文書同期設計: Phase 11/12 の更新対象と置換規則を定義する。
- 監査設計: `verify-all-specs` と `validate-phase11-screenshot-coverage` の記録方式を定義する。
- SubAgent設計: Atent Team の並列実行手順と直列結合点を定義する。

## 参照資料

| 資料                     | パス                                                                                                                       | 用途               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件             | `outputs/phase-1/requirements-definition.md`                                                                               | FR/NFR 参照        |
| Phase 1 受入基準         | `outputs/phase-1/acceptance-criteria.md`                                                                                   | 判定基準参照       |
| package scripts          | `apps/desktop/package.json`                                                                                                | scripts 設計       |
| screenshot script        | `apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`                                              | 実行対象参照       |
| workflow02 Phase 11      | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/manual-test-result.md`  | 文書同期対象       |
| workflow02 Phase 12      | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/spec-update-summary.md` | 文書同期対象       |
| aiworkflow要件: task台帳 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                       | 更新台帳設計       |
| aiworkflow要件: 教訓     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                     | 教訓同期設計       |
| 抽出マトリクス           | `outputs/phase-2/aiworkflow-spec-extraction.md`                                                                            | 必要仕様抽出の根拠 |
| スコープ定義             | `outputs/phase-1/scope-definition.md`                                                                                      | Phase 1 成果物     |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                                        | 内容                    |
| --------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| 実装パターン    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Phase 12 更新順序       |
| セキュリティIPC | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | preload/main 境界ルール |
| Agent SDK契約   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | IPC契約との整合確認     |

## 実行手順

### Step 1: コマンド登録設計

1. `apps/desktop/package.json` の scripts に `screenshot:skill-import-idempotency-guard` を追加する。
2. 値は `node scripts/capture-skill-import-idempotency-guard-screenshots.mjs` を採用する。
3. 命名規約を `screenshot:<feature>` へ固定する。

### Step 2: 文書同期設計

| 更新対象              | 置換前                                                                                                 | 置換後                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Phase 11 実行コマンド | `node apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`                     | `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` |
| Phase 12 実行コマンド | `pnpm --filter @repo/desktop exec node scripts/capture-skill-import-idempotency-guard-screenshots.mjs` | `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` |

### Step 3: 監査設計

- 検証コマンドを以下の順序で固定する。
  1. `pnpm --filter @repo/desktop run | rg screenshot`
  2. `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard`
  3. `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001`
  4. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001`

### Step 4: aiworkflow仕様抽出確認

1. `resource-map.md` を起点に初期対象仕様を確定する。
2. `search-spec.js` で `task-workflow` / `lessons-learned` / `screenshot` を再確認する。
3. 抽出結果を `outputs/phase-2/aiworkflow-spec-extraction.md` に固定する。

### Step 5: SubAgent実行設計

| SubAgent       | 並列可否 | 入力         | 出力                   |
| -------------- | -------- | ------------ | ---------------------- |
| A: scripts登録 | 並列可   | Phase 1 要件 | package scripts 更新案 |
| B: 文書同期    | 並列可   | Phase 1 要件 | Phase 11/12 更新案     |
| C: 監査        | 直列     | A/B 出力     | 検証ログ               |

## 統合テスト連携

| 観点         | テスト入力              | 判定                       |
| ------------ | ----------------------- | -------------------------- |
| scripts 登録 | package.json diff       | キーと値が一致             |
| 文書同期     | `rg` 結果               | 旧コマンド文字列が 0 件    |
| 実行検証     | screenshot command 実行 | 出力ファイル更新時刻が更新 |

## 成果物

| 成果物             | パス                                            | 説明                          |
| ------------------ | ----------------------------------------------- | ----------------------------- |
| 設計書             | `outputs/phase-2/architecture-design.md`        | コマンド登録設計              |
| 文書同期マトリクス | `outputs/phase-2/document-sync-matrix.md`       | 更新対象と置換規則            |
| 検証設計書         | `outputs/phase-2/verification-commands.md`      | 監査コマンド順序              |
| 仕様抽出マトリクス | `outputs/phase-2/aiworkflow-spec-extraction.md` | aiworkflow 必要仕様の抽出根拠 |

## 完了条件

- [ ] scripts 命名規約が定義されている
- [ ] 文書同期対象が列挙されている
- [ ] 検証コマンド順序が定義されている
- [ ] SubAgent の並列可否が定義されている
- [ ] Phase 1 参照が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3 で設計レビューゲート判定を実施する。

## 多角的チェック観点

| 観点           | 適用内容                                                | 参照仕様                                                                                    |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ   | 実行コマンドの公開範囲が限定されているか                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| UI/UX証跡      | Phase 11 の証跡取得コマンドが一意か                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ | スクリプト実体と公開コマンドの責務が分離されているか    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質           | verify/validate/coverage/audit の検証順序が維持されるか | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## サブタスク管理

| サブタスク         | 状態    |
| ------------------ | ------- |
| 参照資料確認       | pending |
| 実行タスク実施     | pending |
| 統合テスト連携確認 | pending |
| 成果物定義確認     | pending |
| 完了条件確認       | pending |

## タスク100%実行確認【必須】

- [ ] 本Phaseの実行タスクをすべて実行した
- [ ] 本Phaseの成果物定義と参照資料を照合した
- [ ] 本Phaseの完了条件を全て満たした
- [ ] 次Phaseへ渡す入力を明記した
