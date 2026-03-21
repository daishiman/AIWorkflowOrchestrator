# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 6                                          |
| Phase 名   | テスト拡充                                 |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 5                                    |
| 後続 Phase | Phase 7（カバレッジ確認）                  |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

surface 横断 runtime policy の中央集約 の edge / fallback / regression 観点を拡張する。
設計タスクとして、将来の実装者が Phase 4 のテストケース仕様を補完できる回帰観点・edge case・統合シナリオ拡張を文書成果物として残す。

## 実行タスク

- 回帰観点追加: 既知 pitfall（P31 / P48 / P50 / P64 / P65）に対応する回帰テスト観点を Phase 4 のテストケース仕様に追記する
- Edge case 設計: authMode 未定義 / apiKey 不正形式 / health timeout / surface 未知値の境界条件を `edge-case-matrix.md` に列挙する
- 統合シナリオ拡張: Chat→Agent→Skill の surface 横断連続実行シナリオを `regression-expansion-plan.md` に追加する

## 参照資料

| 参照資料                   | パス                                                                                                          | 内容                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                  | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                       | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                             | 設計内容と validation matrix                      |
| Phase 3                    | phase-3-design-review.md                                                                                      | review gate の判定                                |
| Phase 4                    | phase-4-test-creation.md                                                                                      | Phase 4（テスト作成）の仕様書                     |
| Phase 5                    | phase-5-implementation.md                                                                                     | Phase 5（実装）の仕様書                           |
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

### ステップ1: Phase 4 のテストケース仕様をレビューする

`outputs/phase-4/test-case-specification.md` を読み込み、以下の不足観点を特定する。

- 既知 pitfall（P31 / P48 / P50 / P64 / P65）が対象テストケースに含まれているか
- fallback / blocked / legacy coexistence のシナリオが網羅されているか

### ステップ2: 既知 pitfall に対する回帰観点を追加する

以下の pitfall ごとに回帰テスト観点を定義し、`outputs/phase-6/regression-expansion-plan.md` に記録する。

- P31（Zustand Store Hooks 無限ループ）: policy 更新時の Renderer 再レンダー回数を検証する観点
- P48（useShallow 未適用）: policy セレクタが派生配列を返す場合の shallow 比較適用確認
- P50（既実装防御の発見による Phase 転換）: 実装前に対象ファイルの現在の実装状態を確認する観点
- P64（surface 未知値）: unknown surface が渡された場合の fallback 動作（エラー vs デフォルト）
- P65（連続呼び出し）: 同一 surface の policy チェックが重複実行される場合の冪等性確認

### ステップ3: edge case と boundary condition を列挙する

以下の境界条件について「入力値」「期待される動作」「検証方法」を `outputs/phase-6/edge-case-matrix.md` に記録する。

- authMode 未定義（undefined）: policy resolver がエラーを返すか、明示的な fallback を定義しているか
- apiKey 不正形式（空文字 / スペースのみ / 過剰長）: P42 準拠 3 段バリデーションの適用確認
- health timeout: タイムアウト発生時に policy が blocked 状態を返すか、silent 無視しないか
- surface 未知値: ownership table 外の surface 名が来た場合に型エラーが発生するか

### ステップ4: 統合シナリオを拡張する

Chat→Agent→Skill の surface 横断連続実行シナリオにおいて、中途の surface で policy が blocked になった場合の後続 surface への影響を `regression-expansion-plan.md` に追加する。

### ステップ5: 統合テスト連携を更新し、完了条件と次 Phase handoff を確認する

phase 固有の integration 観点を outputs とチェックリストへ反映した後、残件・blocked 条件・次 Phase 前提を記録する。

## 統合テスト連携（Phase 1〜11は必須）

regression へ以下の観点を追加する。

- blocked / fallback / legacy coexistence シナリオの回帰テスト計画
- 既知 pitfall（P31 / P48 / P50）への回帰テスト観点
- surface 横断連続実行シナリオ（Chat→Agent→Skill）での連携検証

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

| 成果物         | パス                                         | 内容                                                                                                          |
| -------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 回帰拡張計画   | outputs/phase-6/regression-expansion-plan.md | P31 / P48 / P50 / P64 / P65 への回帰テスト観点・surface 横断連続実行シナリオ（Chat→Agent→Skill）              |
| edge case 一覧 | outputs/phase-6/edge-case-matrix.md          | authMode 未定義 / apiKey 不正形式 / health timeout / surface 未知値の「入力値」「期待動作」「検証方法」の一覧 |

## 完了条件

- [ ] P31 / P48 / P50 に対応する回帰テスト観点が `regression-expansion-plan.md` に記録されている
- [ ] authMode 未定義 / apiKey 不正形式 / health timeout / surface 未知値の4境界が `edge-case-matrix.md` に列挙されている
- [ ] Chat→Agent→Skill の surface 横断連続実行シナリオが `regression-expansion-plan.md` に追加されている
- [ ] Phase 7-9 で確認すべき不足観点が `edge-case-matrix.md` に見える化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-6/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
