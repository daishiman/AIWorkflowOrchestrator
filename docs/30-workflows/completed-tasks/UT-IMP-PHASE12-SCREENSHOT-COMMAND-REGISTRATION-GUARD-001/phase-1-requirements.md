# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 1                                                        |
| 名称       | 要件定義                                                 |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| タスク名   | Phase 12 スクリーンショット実行コマンド登録ガード        |
| 作成日     | 2026-03-04                                               |
| ステータス | Draft                                                    |
| 関連Issue  | #968                                                     |

## 目的

`apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs` を `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` で実行できる運用に統一し、Phase 11/12 文書と検証手順を同一コマンド基準へ揃える。

## 実行タスク

- 要件抽出: Issue #968 と未タスク指示書から機能要件と非機能要件を抽出する。
- 受け入れ基準定義: 機械検証可能な完了判定を FR/NFR ごとに定義する。
- スコープ確定: 変更対象と非対象を明示して作業境界を固定する。
- SubAgent分担設計: Atent Team 前提で責務を分離し、並列可能範囲を定義する。

## 参照資料

| 資料                         | パス                                                                                                              | 用途                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Issue定義                    | `https://github.com/daishiman/AIWorkflowOrchestrator/issues/968`                                                  | 背景とゴールの一次情報    |
| 未タスク指示書               | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-screenshot-command-registration-guard-001.md` | Why/What/How の正本       |
| 対象workflow                 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/`                               | 文書更新対象の特定        |
| 実行スクリプト               | `apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`                                     | scripts 登録対象          |
| package scripts              | `apps/desktop/package.json`                                                                                       | コマンド公開対象          |
| aiworkflow要件: task台帳     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | Phase 12 同期ルール       |
| aiworkflow要件: 教訓         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                            | 再発防止ルール            |
| aiworkflow要件: 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                       | Phase 12 監査コマンド順序 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 内容                       |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| タスク台帳仕様   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了記録と残課題同期ルール |
| 教訓仕様         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 苦戦箇所の構造化ルール     |
| 実装パターン仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 検証コマンドと同期順序     |

## 実行手順

### Step 1: 現状差分の確認

1. `apps/desktop/package.json` に `screenshot:skill-import-idempotency-guard` が未登録である事実を確認する。
2. workflow02 の Phase 11/12 文書が `node scripts/...` 実行を参照している箇所を列挙する。
3. `pnpm --filter @repo/desktop run | rg screenshot` の発見性要件を明確化する。

### Step 2: FR/NFR 定義

- FR-1: `apps/desktop/package.json` に screenshot コマンドを追加する。
- FR-2: workflow02 の Phase 11/12 文書を `run screenshot:*` 記法へ統一する。
- FR-3: `run` 一覧と screenshot 再取得の検証証跡を残す。
- NFR-1: 同一手順で再実行したときに同じコマンドで実行できる。
- NFR-2: 手順が 3 コマンド以内で再現できる。
- NFR-3: current/baseline 判定を分離して監査値を記録できる。

### Step 3: スコープ確定

- 対象:
  - `apps/desktop/package.json`
  - `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/`
  - `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/`
- 非対象:
  - Playwright テストケース増減
  - workflow02 以外の一括書換
  - 実装本体コードの新規機能追加

### Step 4: SubAgent分担定義

| SubAgent | 担当             | 成果物                      |
| -------- | ---------------- | --------------------------- |
| A        | コマンド登録仕様 | command registration 要件表 |
| B        | 文書同期仕様     | 文書更新対象マトリクス      |
| C        | 検証仕様         | 実行コマンドと判定基準      |

## 統合テスト連携

| 観点           | 確認方法                                                                    | 期待結果                      |
| -------------- | --------------------------------------------------------------------------- | ----------------------------- | ------------------------------- |
| コマンド発見性 | `pnpm --filter @repo/desktop run                                            | rg screenshot`                | 登録コマンドが 1 行で表示される |
| コマンド実行性 | `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` | screenshot 再取得が開始される |
| 証跡整合性     | `validate-phase11-screenshot-coverage` 実行                                 | PASS 判定が取得できる         |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR の確定版  |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証条件一覧     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象・非対象一覧 |

## 完了条件

- [ ] FR-1〜FR-3 が定義されている
- [ ] NFR-1〜NFR-3 が定義されている
- [ ] 変更対象ファイルと非対象ファイルが明示されている
- [ ] SubAgent-A/B/C の責務が明示されている
- [ ] 統合テスト連携の判定基準が 3 観点で記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 2 でコマンド命名規約、文書同期設計、監査ログ設計を定義する。

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
