# Phase 5: 実装

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 5                                                        |
| 名称       | 実装                                                     |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 依存       | Phase 4                                                  |
| ステータス | Draft                                                    |

## 目的

screenshot コマンド登録と workflow02 文書同期を実施し、検証コマンドで再現可能な実装状態を作る。

## 実行タスク

- コマンド登録実装: `apps/desktop/package.json` へ scripts エントリを追加する。
- 文書同期実装: workflow02 の Phase 11/12 文書を新コマンドへ更新する。
- 検証実装: run 一覧、screenshot 実行、coverage 判定を実行してログを残す。

## 参照資料

| 資料                | パス                                                                                                                       | 用途             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 4             | `phase-4-test-creation.md`                                                                                                 | TC/FC 参照       |
| Phase 4成果物       | `outputs/phase-4/test-cases.md`                                                                                            | 実装チェック項目 |
| package scripts     | `apps/desktop/package.json`                                                                                                | 実装対象         |
| screenshot script   | `apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`                                              | 実行対象         |
| workflow02 Phase 11 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/manual-test-result.md`  | 同期対象         |
| workflow02 Phase 12 | `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/spec-update-summary.md` | 同期対象         |
| aiworkflow台帳      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                       | 完了台帳同期先   |
| テスト仕様書        | `outputs/phase-4/test-specification.md`                                                                                    | Phase 4 成果物   |
| 統合テスト設計      | `outputs/phase-4/integration-test-design.md`                                                                               | Phase 4 成果物   |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                              | 内容                   |
| ------------- | --------------------------------------------------------------------------------- | ---------------------- |
| IPC/API       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | コマンド公開契約の参照 |
| interface契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 運用契約との整合確認   |
| 教訓          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 運用ルール更新先       |

## 実行手順

### Step 1: scripts 登録

1. `apps/desktop/package.json` に `screenshot:skill-import-idempotency-guard` を追加する。
2. 値を `node scripts/capture-skill-import-idempotency-guard-screenshots.mjs` に設定する。
3. 命名が `screenshot:<feature>` 規約を満たすことを確認する。

### Step 2: 文書同期

1. workflow02 Phase 11 文書の実行コマンドを新規 scripts 呼び出しへ更新する。
2. workflow02 Phase 12 文書の実行コマンドを同じ表記へ更新する。
3. 旧コマンド文字列の残存を `rg` で確認する。

### Step 3: 実行検証

1. `pnpm --filter @repo/desktop run | rg screenshot` を実行する。
2. `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` を実行する。
3. `validate-phase11-screenshot-coverage` を実行する。

## 統合テスト連携

| 連携対象       | 入力                      | 期待結果            |
| -------------- | ------------------------- | ------------------- |
| run一覧検証    | scripts 追加後の run 出力 | 新規コマンド表示    |
| screenshot実行 | scripts 実行              | screenshot 証跡更新 |
| coverage検証   | validator 実行            | PASS                |

## 成果物

| 成果物       | パス                                        | 説明               |
| ------------ | ------------------------------------------- | ------------------ |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更内容と検証結果 |
| 変更差分一覧 | `outputs/phase-5/changed-files.md`          | ファイル差分一覧   |
| 実行ログ     | `outputs/phase-5/command-run-log.md`        | コマンド実行証跡   |

## 完了条件

- [ ] scripts エントリが追加されている
- [ ] Phase 11/12 文書が新コマンド記法へ更新されている
- [ ] run 一覧で新コマンドが表示される
- [ ] screenshot コマンドが実行できる
- [ ] coverage validator の判定を記録できる
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6 で失敗系と回帰ケースを追加し、運用安定性を強化する。

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
