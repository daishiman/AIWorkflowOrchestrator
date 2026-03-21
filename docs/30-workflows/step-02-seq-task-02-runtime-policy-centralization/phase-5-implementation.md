# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 5                                          |
| Phase 名   | 実装                                       |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 4                                    |
| 後続 Phase | Phase 6（テスト拡充）                      |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

surface 横断 runtime policy の中央集約 の実装順序・変更 ownership・禁止事項を future executor 向けに固定する。
設計タスクとして、将来の実装者が Task03〜Task09 を安全に着手できる実装計画・変更スコープ・禁止事項チェックリストを文書成果物として残す。

## 実行タスク

- M-1 対処: `RuntimeDecisionForRenderer` 型の定義を `contract-matrix.md` に追記する（サニタイズ型の未定義解消）
- 実装順序設計: Task03→04→05→06→07→08→09 の依存順序と各 surface の変更タイミングを定義し、消費契約が壊れない変更順序を固定する
- ownership 固定: 変更ファイルと各 concern（runtime 実行可否 / health check / handoff bundle / authMode 参照）の所有境界を表形式で定義する
- 禁止事項明記: silent fallback / local 判定 / no-op の再発防止ルールをチェックリスト形式で固定する

## 参照資料

| 参照資料                   | パス                                                                                                          | 内容                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/index.md                                  | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                       | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                             | 設計内容と validation matrix                      |
| Phase 3                    | phase-3-design-review.md                                                                                      | review gate の判定                                |
| Phase 4                    | phase-4-test-creation.md                                                                                      | Phase 4（テスト作成）の仕様書                     |
| 旧canonical workflow       | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                        | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                           | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス     | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                      | 矛盾・依存・漏れの監査軸                          |
| workflow 正本              | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | runtime 責務再配線の current canonical            |
| resource map               | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                | 必要仕様の初動選定                                |
| quick reference            | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                             | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth            | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                          | auth/access 契約の親入口                          |
| api-ipc-system             | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                           | system IPC 契約の親入口                           |
| arch-state-management      | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                    | Renderer 責務境界の親入口                         |
| Task01 index               | docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md   | foundation で固定した capability 契約             |
| api-ipc-system-core        | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                                      | health route / llm IPC canonical                  |
| llm-ipc-types              | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                            | health / selected-config 型契約                   |
| security-electron-ipc-core | .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md                               | preload / sender 検証の境界                       |
| arch-state-management-core | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | store ownership と selector 境界                  |

## 実行手順

### ステップ1: Phase 4 の成果物（resolve-signature-decision.md / test-case-specification.md）を確認する

Phase 4 で確定した `IRuntimePolicyResolver.resolve()` シグネチャおよびテストケース仕様を読み込み、実装計画の前提条件として固定する。

### ステップ2: M-1（RuntimeDecisionForRenderer 型）を contract-matrix.md に追記する

`phase-2-design.md` の contract-matrix 相当箇所に以下を追記し、`outputs/phase-5/sanitize-type-addendum.md` に対処結果を記録する。

- `RuntimeDecisionForRenderer` の型定義（フィールド名・型・null 可否）
- Renderer が受け取る前にサニタイズされるべきフィールドの明示

### ステップ3: Task03〜Task09 の変更順序を定義する

DD-1〜DD-6 の設計判断を踏まえ、以下の観点で Task の依存順序を定義する。

- Task03（IRuntimePolicyResolver インターフェース定義）を最初に実施
- 各 surface（Chat / Agent / Skill）のローカル判定除去は当該 surface の surface-handler 変更より前に contract を固定する
- handoff bundle 変更は health check 変更より後

成果物: `outputs/phase-5/implementation-plan.md`（変更順序・依存関係・各 Task の入力/出力契約）

### ステップ4: 変更ファイルと ownership を表形式で定義する

各ファイルについて「どの concern が所有するか」「変更種別（新規/修正/削除）」「担当 Task」を記録する。

成果物: `outputs/phase-5/file-change-scope.md`

### ステップ5: 禁止事項チェックリストを作成する

以下の禁止パターンが再発しないよう、実装者が確認できるチェックリスト形式で固定する。

- surface 内での silent fallback（`DEFAULT_CONFIG` への暗黙 fallback を含む）
- surface 内でのローカル runtime 判定（policy を経由しない直接判定）
- ハンドラが no-op で正常終了するパターン（P62 対策）

### ステップ6: 統合テスト連携を更新し、完了条件と次 Phase handoff を確認する

変更順序が integration contract を壊さないことを前提条件として outputs に反映した後、残件・blocked 条件・次 Phase 前提を記録する。

## 統合テスト連携（Phase 1〜11は必須）

変更順序が integration contract を壊さないことを前提条件として記述する。

- Task03（インターフェース定義）完了後に Task04 以降の変更を着手
- 各変更ステップで Phase 4 の Integration テストケースが PASS することを確認してから次 Task へ進む
- handoff bundle の変更は health check IPC 契約が確定した後に実施

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 各 surface のローカル runtime 判定を中央 policy / resolver に寄せ、消費契約を統一する

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物               | パス                                      | 内容                                                              |
| -------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| 実装計画             | outputs/phase-5/implementation-plan.md    | Task03〜09 の変更順序・依存関係・各 Task の入力/出力契約          |
| 変更ファイルスコープ | outputs/phase-5/file-change-scope.md      | 変更対象ファイル・concern ownership・変更種別・担当 Task の対応表 |
| M-1 対処結果         | outputs/phase-5/sanitize-type-addendum.md | RuntimeDecisionForRenderer 型定義とサニタイズ対象フィールドの明示 |

## 完了条件

- [ ] Task03〜Task09 の変更順序と依存関係が `implementation-plan.md` に定義されている
- [ ] 変更ファイルごとの concern ownership が `file-change-scope.md` の表形式で定義されている
- [ ] M-1（RuntimeDecisionForRenderer 型）が `sanitize-type-addendum.md` に定義されている
- [ ] 禁止事項（silent fallback / local 判定 / no-op）の再発防止チェックリストが `implementation-plan.md` に含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-5/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md)
