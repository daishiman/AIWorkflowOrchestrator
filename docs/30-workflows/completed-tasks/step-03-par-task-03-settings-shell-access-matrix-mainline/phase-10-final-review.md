# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 10                                                 |
| Phase 名   | 最終レビュー                                       |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 9                                            |
| 後続 Phase | Phase 11（手動テスト）                             |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix を final gate で再評価し、戻り先と unresolved risk を決める。

## 実行タスク

- 最終レビュー: task 全体の整合・漏れ・矛盾を最終確認する
- 戻り先決定: MAJOR / CRITICAL の戻り先を明記する
- 完了条件照合: AC と phase output の整合を確認する

## 参照資料

| 参照資料               | パス                                                                                                                                       | 内容                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                                 | 依存順・並列可否・設計ゲート                      |
| Task index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                | phase-1-requirements.md                                                                                                                    | 要件定義の確定内容                                |
| Phase 2                | phase-2-design.md                                                                                                                          | 設計内容と validation matrix                      |
| Phase 3                | phase-3-design-review.md                                                                                                                   | review gate の判定                                |
| Phase 4                | phase-4-test-creation.md                                                                                                                   | Phase 4（テスト作成）の仕様書                     |
| Phase 5                | phase-5-implementation.md                                                                                                                  | Phase 5（実装）の仕様書                           |
| Phase 6                | phase-6-test-expansion.md                                                                                                                  | Phase 6（テスト拡充）の仕様書                     |
| Phase 7                | phase-7-coverage-check.md                                                                                                                  | Phase 7（カバレッジ確認）の仕様書                 |
| Phase 8                | phase-8-refactoring.md                                                                                                                     | Phase 8（リファクタリング）の仕様書               |
| Phase 9                | phase-9-quality-assurance.md                                                                                                               | Phase 9（品質検証）の仕様書                       |
| 旧canonical workflow   | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                                              | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                                                     | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                                                        | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                                                   | 矛盾・依存・漏れの監査軸                          |
| workflow 正本          | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md                              | runtime 責務再配線の current canonical            |
| resource map           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                                             | 必要仕様の初動選定                                |
| quick reference        | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                                                          | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth        | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                                                       | auth/access 契約の親入口                          |
| api-ipc-system         | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                                                        | system IPC 契約の親入口                           |
| arch-state-management  | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                                                 | Renderer 責務境界の親入口                         |
| Task02 index           | docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/index.md                                                               | 共有 policy の消費契約                            |
| ui-ux-settings         | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                                                                        | Settings 正本の親入口                             |
| ui-ux-settings-core    | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                                                   | Settings IA / bypass / screenshot 契約            |
| ui-ux-navigation       | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                                                      | settings 公開導線・nav 契約                       |
| llm-ipc-types          | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                                                         | health row の型契約                               |

## 実行手順

### ステップ1: Phase 1〜9 全成果物の読み込みと最終レビュー scope 確定

1. `outputs/phase-9/quality-checklist.md` を読み込み、RG-01〜RG-06 の判定結果が全て PASS であることを確認する
2. `outputs/phase-9/risk-register.md` を読み込み、CRITICAL/HIGH リスクが残存しないことを確認する
3. Phase 1（要件定義）の AC-1〜AC-4 を再読し、最終照合の基準を固定する

### ステップ2: AC-1〜AC-4 の個別照合

各受入基準に対応する設計成果物が存在し、整合していることを検証する:

**AC-1: Capability Cards**

- Settings 画面に CapabilityCard コンポーネントの設計が存在するか確認する
- 4 capability 状態（active / degraded / unavailable / not-configured）の全状態が設計上カバーされているか確認する
- HealthStatusRow / ProviderSummaryCard の設計が AC-1 の要件を満たしているか確認する
- 判定: PASS / FAIL（不足内容を具体的に記録）

**AC-2: Bypass 整合**

- Settings bypass（PUBLIC_UNAUTHENTICATED_VIEWS）に変更がないことを確認する
- Reset exclusion の既存契約が維持されていることを確認する
- 判定: PASS / FAIL

**AC-3: State Mapping**

- RuntimePolicyResolver の 4 状態モデルと CapabilityCard の状態マッピングが整合しているか確認する
- 状態遷移の網羅性を Phase 2 設計の validation matrix と照合する
- 判定: PASS / FAIL

**AC-4: Mainline IA**

- AppLayout Persistent Launcher（TerminalLauncher）の配置が mainline IA に適合しているか確認する
- Public Shell Access Contract（未認証時 guidance-only）が IA 上で矛盾なく動作するか確認する
- 判定: PASS / FAIL

### ステップ3: PASS/MINOR/MAJOR/CRITICAL 判定と戻り先決定

1. AC-1〜AC-4 の照合結果と RG-01〜RG-06 の検証結果を総合し、以下の判定基準で gate 判定を行う:

| 判定     | 条件                                               | 対応                                                   |
| -------- | -------------------------------------------------- | ------------------------------------------------------ |
| PASS     | AC 全 PASS + RG 全 PASS + CRITICAL/HIGH リスクなし | Phase 11 へ進む                                        |
| MINOR    | AC 全 PASS だが軽微な改善点あり                    | 改善点を未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | AC の一部 FAIL または RG の一部 FAIL               | 影響範囲に応じて Phase 1-5 へ戻る                      |
| CRITICAL | 設計の根本的な矛盾、セキュリティ上の問題           | Phase 1 へ戻り要件再確認                               |

2. MINOR 指摘がある場合、全て未タスク仕様書に変換する（「機能影響なし」でも省略不可 -- 05-task-execution.md 準拠）
3. MAJOR/CRITICAL の場合、具体的な戻り先 Phase と修正内容を `outputs/phase-10/final-gate-decision.md` に記録する

### ステップ4: 成果物の確定と Phase 11 handoff

1. `outputs/phase-10/final-review-report.md` を作成: AC-1〜AC-4 の個別照合結果 + 既存契約整合（Settings bypass / Reset exclusion / Public shell / CTA 契約 / P31・P48 対策）の総合評価
2. `outputs/phase-10/final-gate-decision.md` を作成: gate 判定（PASS/MINOR/MAJOR/CRITICAL）+ 戻り先（該当時）+ MINOR 指摘の未タスク仕様書リスト
3. Phase 11 へ引き渡す情報として「MT-01〜MT-06 の手動テスト対象が確定していること」を明記する

## 統合テスト連携（Phase 1〜11は必須）

最終 gate で integration completeness と documentation completeness を同時確認する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: Settings / AppLayout / public unauthenticated shell に capability cards / health row / terminal launcher を実装する設計を固める

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                    | 内容                      |
| ---------------- | --------------------------------------- | ------------------------- |
| 最終レビュー報告 | outputs/phase-10/final-review-report.md | 最終 review の結論        |
| 最終ゲート判定   | outputs/phase-10/final-gate-decision.md | MAJOR / CRITICAL の戻り先 |

## 完了条件

- [ ] 最終 gate と戻り先が明示されている
- [ ] AC と成果物の整合が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-10/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md)
