# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 9                                                  |
| Phase 名   | 品質検証                                           |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 8                                            |
| 後続 Phase | Phase 10（最終レビュー）                           |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix の品質・risk・security を review checklist として固定する。

## 実行タスク

- 品質観点確認: UX / architecture / IPC / security / workflow を横断確認する
- risk 登録: 残余 risk と mitigation を明文化する
- release readiness 判定: implementation_ready に進める条件を整理する

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

### ステップ1: Phase 8 成果物の読み込みと品質検証 scope 確定

1. `outputs/phase-8/refactor-boundaries.md` を読み込み、RG-01〜RG-06 の不変条件一覧を把握する
2. `outputs/phase-8/simplification-candidates.md` を読み込み、採用/不採用の判断が妥当か確認する
3. 品質検証の scope を「設計ドキュメントの整合性・回帰安全性・リスク評価」に固定する（本タスクは設計タスクのためコード実行ベースの検証は対象外）

### ステップ2: RG-01〜RG-06 の個別品質チェック

各 RG-ID を順番に検証し、quality-checklist.md に PASS/FAIL/N-A を記録する:

**RG-01: P31 Store Hook 無限ループ防止**

- 設計ドキュメント内の新セレクタ定義が個別セレクタパターン（`useXxx()` 単体）であることを確認する
- 合成 Hook（`useXxxStore()`）を useEffect 依存配列に含める設計がないことを確認する
- 判定: PASS / FAIL

**RG-02: P48 useShallow 未適用防止**

- `.filter()` / `.map()` で配列を返す派生セレクタの設計箇所を特定する
- 該当箇所に `useShallow` 適用が設計指示として明記されているか確認する
- 判定: PASS / FAIL / N-A（該当箇所なし）

**RG-03: P5 リスナー二重登録防止**

- health subscription の設計で useEffect cleanup が明示されているか確認する
- React StrictMode での二重実行に対するガード設計があるか確認する
- 判定: PASS / FAIL

**RG-04: P62 DEFAULT_CONFIG 暗黙 fallback 防止**

- provider/model 未選択時の振る舞いが「エラー表示 or セレクター画面リダイレクト」と明記されているか確認する
- DEFAULT_CONFIG への暗黙 fallback パスが設計上存在しないことを確認する
- 判定: PASS / FAIL

**RG-05: Settings bypass 不変**

- PUBLIC_UNAUTHENTICATED_VIEWS の定義に変更がないことを設計ドキュメントから確認する
- 判定: PASS / FAIL

**RG-06: CTA 契約 Task01 準拠**

- 各画面状態で primary CTA 1 + secondary CTA 1 の上限が守られている設計か確認する
- 判定: PASS / FAIL

### ステップ3: 残余リスク登録と implementation_ready 判定

1. **リスク登録簿の作成**: 以下の観点で残余リスクを洗い出し `outputs/phase-9/risk-register.md` に記録する
   - UX リスク: 4 capability 状態の視認性・操作性に関する懸念
   - アーキテクチャリスク: 3 Concern 間の依存方向に関する懸念
   - セキュリティリスク: 未認証時 guidance-only の境界が曖昧になるケース
   - 既存契約との整合リスク: Settings bypass / Reset exclusion / Public shell / CTA 契約
2. **implementation_ready 判定条件の整理**: Phase 10 最終レビューに進む前提として以下を確認する
   - RG-01〜RG-06 が全て PASS であること
   - CRITICAL / HIGH リスクが残存しないこと
   - AC-1〜AC-4 に対応する設計成果物が全て存在すること

### ステップ4: 成果物の確定と Phase 10 handoff

1. `outputs/phase-9/quality-checklist.md` を作成: RG-01〜RG-06 の個別判定結果 + UX/Architecture/Security/Workflow の横断チェック結果
2. `outputs/phase-9/risk-register.md` を作成: リスク一覧と緩和策（severity: CRITICAL/HIGH/MEDIUM/LOW）
3. Phase 10 へ引き渡す判定として「implementation_ready: YES/NO」を明記する

## 統合テスト連携（Phase 1〜11は必須）

manual / automated / system spec の 3 系統で品質確認する。

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

| 成果物             | パス                                 | 内容                                       |
| ------------------ | ------------------------------------ | ------------------------------------------ |
| 品質チェックリスト | outputs/phase-9/quality-checklist.md | 契約・UX・security・performance の最終確認 |
| リスク登録簿       | outputs/phase-9/risk-register.md     | 残余リスクと緩和策                         |

## 完了条件

- [ ] quality checklist と risk register が揃っている
- [ ] implementation_ready 判定条件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-9/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md)
