# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 4                                                  |
| Phase 名   | テスト作成                                         |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 3                                            |
| 後続 Phase | Phase 5（実装）                                    |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix を future implementation で破綻なく実行できる test design を作る。

## 実行タスク

- 契約テスト設計: Settings / App shell mainline access matrix の state / action / DTO 契約テストを設計する
- 統合シナリオ設計: surface 横断または IPC 連携の統合シナリオを定義する
- モック戦略: store / IPC / service dependency の mock 境界を決める

## 参照資料

| 参照資料               | パス                                                                                                                                       | 内容                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                                 | 依存順・並列可否・設計ゲート                      |
| Task index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                | phase-1-requirements.md                                                                                                                    | 要件定義の確定内容                                |
| Phase 2                | phase-2-design.md                                                                                                                          | 設計内容と validation matrix                      |
| Phase 3                | phase-3-design-review.md                                                                                                                   | review gate の判定                                |
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

### ステップ1: Phase 3 設計レビュー結果と DTO 契約を固定する

1. `phase-3-design-review.md` の gate 判定（PASS / MINOR）を確認し、MINOR 指摘があれば反映済みか検証する
2. 以下の DTO 型を test fixture の基盤として確定する
   - `AccessMatrixProps`: `capability`, `uiState`, `blockedInfo?`, `health`, `selectedProvider?`, `selectedModel?`, `isAuthenticated`
   - `TerminalLauncherProps`: `capability`, `isDisabled`, `disabledReason?`
3. Phase 2 の validation matrix から Concern 1/2/3 のスコープ境界を再確認する

### ステップ2: Concern 1 — Settings Access Matrix Section の契約テストを設計する

**CapabilityCard テスト（TC-C01〜TC-C06）:**

| TC-ID  | シナリオ                          | 入力 Props                                           | 期待出力                                   |
| ------ | --------------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| TC-C01 | capability=full, uiState=ready    | `{ capability: "full", uiState: "ready", ... }`      | CTA ボタン活性、全機能カード表示           |
| TC-C02 | capability=limited, uiState=ready | `{ capability: "limited", uiState: "ready", ... }`   | 制限カード表示、blockedInfo メッセージ表示 |
| TC-C03 | capability=blocked, uiState=ready | `{ capability: "blocked", blockedInfo: "...", ... }` | エラー状態カード、CTA 非活性               |
| TC-C04 | capability=none, uiState=ready    | `{ capability: "none", ... }`                        | 空状態メッセージ表示                       |
| TC-C05 | isAuthenticated=false             | `{ isAuthenticated: false, ... }`                    | guidance-only 表示、操作 CTA 非表示        |
| TC-C06 | uiState=loading                   | `{ uiState: "loading", ... }`                        | スケルトン / スピナー表示                  |

**HealthStatusRow テスト（TC-H01〜TC-H04）:**

| TC-ID  | シナリオ       | health 値        | 期待出力                           |
| ------ | -------------- | ---------------- | ---------------------------------- |
| TC-H01 | connected      | `"connected"`    | 緑インジケーター、provider 名表示  |
| TC-H02 | disconnected   | `"disconnected"` | 灰インジケーター、再接続 CTA       |
| TC-H03 | error          | `"error"`        | 赤インジケーター、エラーメッセージ |
| TC-H04 | null（未選択） | `null`           | 未選択状態メッセージ、選択導線 CTA |

**ProviderSummaryCard テスト（TC-P01〜TC-P03）:**

| TC-ID  | シナリオ             | 入力                                            | 期待出力                  |
| ------ | -------------------- | ----------------------------------------------- | ------------------------- |
| TC-P01 | provider+model選択済 | `{ selectedProvider: "X", selectedModel: "Y" }` | provider/model 名表示     |
| TC-P02 | provider未選択       | `{ selectedProvider: undefined }`               | 未選択ガイダンス表示      |
| TC-P03 | provider変更後       | provider を A→B に変更                          | health 再取得トリガー確認 |

**モック戦略:**

- Store mock: `useAppStore` を `vi.mock` で差し替え、個別セレクタ（P31 準拠）を返す
- IPC mock: `window.electronAPI` の health 取得を `vi.fn()` でスタブ化
- Props 直接注入: 各コンポーネントは Props ベースで設計されるため、DTO を直接渡す方式を優先する

### ステップ3: Concern 2 — Persistent Launcher の契約テストを設計する

**TerminalLauncher テスト（TC-L01〜TC-L03）:**

| TC-ID  | シナリオ           | 入力                                             | 期待出力                                       |
| ------ | ------------------ | ------------------------------------------------ | ---------------------------------------------- |
| TC-L01 | capability=full    | `{ capability: "full", isDisabled: false }`      | ランチャーボタン活性、クリックで terminal 起動 |
| TC-L02 | isDisabled=true    | `{ isDisabled: true, disabledReason: "未認証" }` | ボタン非活性、disabledReason ツールチップ      |
| TC-L03 | AppLayout 配置確認 | AppLayout 内にマウント                           | persistent 領域に常時表示されている            |

**モック戦略:**

- terminal 起動は IPC チャンネル呼び出しを `vi.fn()` でスタブ化し、呼び出し引数を検証する
- AppLayout テストでは TerminalLauncher の存在確認のみ行い、内部ロジックは単体テストに委譲する

### ステップ4: 統合シナリオ定義とテストマトリクスを成果物に出力する

1. 統合シナリオ SC-01〜SC-06 を `outputs/phase-4/test-matrix.md` に記録する
   - SC-01: 認証済み → Settings 遷移 → capability card が full 表示
   - SC-02: 未認証 → Settings 遷移 → guidance-only 表示
   - SC-03: launcher クリック → terminal 起動
   - SC-04: provider 変更 → health 再取得 → HealthStatusRow 更新
   - SC-05: blocked 状態 → CTA 非活性 → blockedInfo 表示
   - SC-06: loading → skeleton → ready 遷移
2. モック戦略を `outputs/phase-4/mock-strategy.md` に記録する
3. 完了条件チェックリストを検証し、次 Phase handoff 条件を確認する

## 統合テスト連携（Phase 1〜11は必須）

unit / integration / manual の test type ごとに対象シナリオを切り分ける。

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

| 成果物           | パス                             | 内容                                              |
| ---------------- | -------------------------------- | ------------------------------------------------- |
| テストマトリクス | outputs/phase-4/test-matrix.md   | unit / integration / contract / manual の観点整理 |
| モック戦略       | outputs/phase-4/mock-strategy.md | dependency / IPC / store mock 方針                |

## 完了条件

- [ ] テストタイプごとの責務分離が定義されている
- [ ] contract / integration / manual の対象シナリオが網羅されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-4/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
