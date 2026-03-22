# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 5                                                  |
| Phase 名   | 実装                                               |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 4                                            |
| 後続 Phase | Phase 6（テスト拡充）                              |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix の実装順序・変更 ownership・禁止事項を future executor 向けに固定する。

## 実行タスク

- 実装順序設計: Settings / AppLayout / public unauthenticated shell に capability cards / health row / terminal launcher を実装する設計を固める を崩さない変更順序を定義する
- ownership 固定: 変更ファイルと各 concern の所有境界を定義する
- 禁止事項明記: silent fallback / local 判定 / no-op を再発させないルールを固定する

## 参照資料

| 参照資料               | パス                                                                                                                                       | 内容                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                                 | 依存順・並列可否・設計ゲート                      |
| Task index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                | phase-1-requirements.md                                                                                                                    | 要件定義の確定内容                                |
| Phase 2                | phase-2-design.md                                                                                                                          | 設計内容と validation matrix                      |
| Phase 3                | phase-3-design-review.md                                                                                                                   | review gate の判定                                |
| Phase 4                | phase-4-test-creation.md                                                                                                                   | Phase 4（テスト作成）の仕様書                     |
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

### ステップ1: Phase 4 テストマトリクスとモック戦略を確認し、実装スコープを固定する

1. `outputs/phase-4/test-matrix.md` の TC-ID 一覧（TC-C01〜C06, TC-H01〜H04, TC-P01〜P03, TC-L01〜L03）を確認する
2. `outputs/phase-4/mock-strategy.md` の mock 境界を確認し、実装が mock 契約を破らない前提を固定する
3. 実装順序を **Concern 1 → Concern 2 → Concern 3** に固定する（依存方向: Concern 3 は 1/2 に依存しない）

### ステップ2: Concern 1 — Settings Access Matrix Section を実装する

**実装対象コンポーネントと ownership:**

| コンポーネント        | ファイルパス（想定）                                                    | 責務                                       |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------ |
| `CapabilityCard`      | `apps/desktop/src/renderer/components/settings/CapabilityCard.tsx`      | capability 4状態 + 未認証 + loading の表示 |
| `HealthStatusRow`     | `apps/desktop/src/renderer/components/settings/HealthStatusRow.tsx`     | connected/disconnected/error/null の表示   |
| `ProviderSummaryCard` | `apps/desktop/src/renderer/components/settings/ProviderSummaryCard.tsx` | provider/model 選択状態の表示              |
| `AccessMatrixSection` | `apps/desktop/src/renderer/components/settings/AccessMatrixSection.tsx` | 上記3コンポーネントの合成、Props 受け渡し  |

**実装手順:**

1. `AccessMatrixProps` 型定義を作成する（`capability`, `uiState`, `blockedInfo?`, `health`, `selectedProvider?`, `selectedModel?`, `isAuthenticated`）
2. `CapabilityCard` を Props ベースで実装する（4状態分岐 + 未認証 guidance-only + loading skeleton）
3. `HealthStatusRow` を Props ベースで実装する（4状態インジケーター + CTA）
4. `ProviderSummaryCard` を Props ベースで実装する（選択済み/未選択の分岐）
5. `AccessMatrixSection` で3コンポーネントを合成し、Phase 4 の TC-C01〜C06, TC-H01〜H04, TC-P01〜P03 が PASS することを確認する

**禁止事項:**

- P62 違反: provider/model 未選択時に `DEFAULT_CONFIG` への silent fallback を行わない。未選択はエラー表示またはセレクター導線で処理する
- P31 違反: Store から値を取得する場合は個別セレクタを使用する。合成 Hook の戻り値関数を `useEffect` 依存配列に含めない
- P48 違反: IPC レスポンスの `result.data!` を使用しない。`Array.isArray()` / optional chaining で実行時検証する

### ステップ3: Concern 2 — AppLayout Persistent Launcher を実装する

**実装対象コンポーネントと ownership:**

| コンポーネント      | ファイルパス（想定）                                               | 責務                                    |
| ------------------- | ------------------------------------------------------------------ | --------------------------------------- |
| `TerminalLauncher`  | `apps/desktop/src/renderer/components/layout/TerminalLauncher.tsx` | terminal 起動ボタン + disabled 制御     |
| `AppLayout`（変更） | `apps/desktop/src/renderer/components/layout/AppLayout.tsx`        | persistent 領域に TerminalLauncher 配置 |

**実装手順:**

1. `TerminalLauncherProps` 型定義を作成する（`capability`, `isDisabled`, `disabledReason?`）
2. `TerminalLauncher` を実装する（活性/非活性 + disabledReason ツールチップ + IPC 経由 terminal 起動）
3. `AppLayout` の persistent 領域に `TerminalLauncher` を配置する
4. Phase 4 の TC-L01〜L03 が PASS することを確認する

### ステップ4: Concern 3 — Public Shell Access Contract を実装し、統合検証する

**実装内容:**

1. 未認証（`isAuthenticated: false`）時の guidance-only 表示ロジックを `AccessMatrixSection` に実装する
   - 操作 CTA を非表示にし、設定案内メッセージのみ表示する
   - `TerminalLauncher` は `isDisabled: true`, `disabledReason: "認証が必要です"` を渡す
2. 認証状態の取得は個別セレクタ（`useIsAuthenticated()` 等）経由とし、P31 準拠を維持する

**統合検証:**

1. Phase 4 の全 TC-ID（TC-C01〜C06, TC-H01〜H04, TC-P01〜P03, TC-L01〜L03）を実行し全 PASS を確認する
2. 変更ファイル一覧と ownership を `outputs/phase-5/file-change-scope.md` に記録する
3. 実装計画の実績を `outputs/phase-5/implementation-plan.md` に記録する
4. 完了条件チェックリストを検証し、次 Phase handoff 条件を確認する

## 統合テスト連携（Phase 1〜11は必須）

変更順序が integration contract を壊さないことを前提条件として書く。

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

| 成果物       | パス                                   | 内容                          |
| ------------ | -------------------------------------- | ----------------------------- |
| 実装計画     | outputs/phase-5/implementation-plan.md | 変更順序・責務分離・ownership |
| 変更スコープ | outputs/phase-5/file-change-scope.md   | 対象ファイルと除外ファイル    |

## 完了条件

- [ ] 実装順序と file ownership が定義されている
- [ ] 禁止事項と rollback risk が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-5/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md)
