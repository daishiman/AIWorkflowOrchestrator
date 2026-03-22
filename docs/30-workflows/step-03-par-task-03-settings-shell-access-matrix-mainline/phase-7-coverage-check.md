# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 7                                                  |
| Phase 名   | カバレッジ確認                                     |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 6                                            |
| 後続 Phase | Phase 8（リファクタリング）                        |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix の coverage gate と統合再確認条件を定義する。

## 実行タスク

- coverage gate 設計: line / branch / function / scenario の最低基準を定義する
- 統合ゲート設計: 再実行すべき smoke / integration / walkthrough を決める
- 不足観点整理: Phase 9 へ持ち越す residual risk を整理する

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
| Task02 index           | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                                               | 共有 policy の消費契約                            |
| ui-ux-settings         | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                                                                        | Settings 正本の親入口                             |
| ui-ux-settings-core    | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                                                   | Settings IA / bypass / screenshot 契約            |
| ui-ux-navigation       | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                                                      | settings 公開導線・nav 契約                       |
| llm-ipc-types          | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                                                         | health row の型契約                               |

## 実行手順

### ステップ1: Phase 6 の回帰拡張結果を確認し、カバレッジ計測を実行する

1. `outputs/phase-6/regression-expansion-plan.md` で SC-01〜06, RG-01〜06 の PASS 状況を確認する
2. `outputs/phase-6/edge-case-matrix.md` で未カバー境界ケースの一覧を確認する
3. カバレッジ計測を実行する:

```bash
cd apps/desktop
pnpm vitest run --coverage \
  src/renderer/components/settings/CapabilityCard.test.tsx \
  src/renderer/components/settings/HealthStatusRow.test.tsx \
  src/renderer/components/settings/ProviderSummaryCard.test.tsx \
  src/renderer/components/settings/AccessMatrixSection.test.tsx \
  src/renderer/components/layout/TerminalLauncher.test.tsx
```

### ステップ2: coverage gate を判定する

以下の最低基準と推奨基準で判定する。**最低基準を1つでも下回る場合は Phase 6 に差し戻す。**

| 指標              | 最低基準 | 推奨基準 | 対象ファイル群                                                                                  |
| ----------------- | -------- | -------- | ----------------------------------------------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | CapabilityCard / HealthStatusRow / ProviderSummaryCard / AccessMatrixSection / TerminalLauncher |
| Branch Coverage   | 60%      | 70%      | 同上（capability 4状態 + 未認証 + loading の分岐を重点確認）                                    |
| Function Coverage | 80%      | 90%      | 同上                                                                                            |

**判定フロー:**

- 全指標が最低基準以上 → ステップ3 へ進む
- いずれかの指標が最低基準未満 → 不足箇所を特定し、Phase 6 に差し戻して追加テストを作成する
- 差し戻し時は `outputs/phase-7/coverage-targets.md` に不足箇所と必要テスト数を記録する

### ステップ3: 統合ゲートを判定する

Phase 6 で実装した統合シナリオと回帰テストの再実行を行い、統合ゲートを判定する。

**再実行対象:**

| ゲート種別  | 対象テスト                                    | PASS 条件                                |
| ----------- | --------------------------------------------- | ---------------------------------------- |
| Smoke       | TC-C01（full/ready）, TC-L01（launcher 活性） | 基本パスが動作すること                   |
| Integration | SC-01〜SC-06                                  | 全統合シナリオが PASS すること           |
| Regression  | RG-01〜RG-06                                  | 全回帰テストが PASS すること             |
| Walkthrough | SC-01 + SC-02（認証/未認証の切り替えフロー）  | 認証状態変更時の UI 整合性が保たれること |

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/settings/ src/renderer/components/layout/TerminalLauncher
```

### ステップ4: residual risk を整理し、成果物に出力する

1. カバレッジ数値と判定結果を `outputs/phase-7/coverage-targets.md` に記録する（実測値 + 判定: PASS/FAIL）
2. 統合ゲート判定結果を `outputs/phase-7/integration-gate.md` に記録する
3. Phase 9（品質検証）へ持ち越す residual risk を整理する:
   - Branch Coverage が推奨基準未達の場合: 不足分岐の一覧と対応優先度
   - 境界ケース（Phase 6 edge-case-matrix.md）で未テストの項目
   - P31/P48/P62 以外の pitfall パターンで未検証のもの
4. 完了条件チェックリストを検証し、次 Phase handoff 条件を確認する

## 統合テスト連携（Phase 1〜11は必須）

coverage と統合ゲートの不足を整理し、Phase 9 へ handoff する。

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

| 成果物         | パス                                | 内容                                     |
| -------------- | ----------------------------------- | ---------------------------------------- |
| カバレッジ計画 | outputs/phase-7/coverage-targets.md | line / branch / function / scenario 目標 |
| 統合ゲート     | outputs/phase-7/integration-gate.md | 再実行すべき統合観点                     |

## 完了条件

- [ ] coverage gate と integration gate が定義されている
- [ ] 不足観点が residual risk として整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-7/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)
