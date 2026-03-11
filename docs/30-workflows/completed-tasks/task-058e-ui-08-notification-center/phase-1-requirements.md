# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 1                                   |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| モード | P50 検証・補完                      |

## 目的

`task-058e` 正本、`TASK-UI-01-C` の既存通知ドメイン、現行 `NotificationCenter` 実装の差分を要件として固定する。Phase 2 以降が「何を残し」「何を補完し」「何を削るか」を同一理解で進められる状態を作る。

## 実行タスク

- P50棚卸し: 現行 UI、store、preload、main IPC の実装状態を記録する。
- 要件抽出: `task-058e` 原本から FR と NFR を抽出する。
- 差分固定: 現行実装と正本仕様のギャップを受け入れ基準へ変換する。
- スコープ分離: 058e が担う責務と 056c 既存ドメインが担う責務を分離する。
- SubAgent分担: UI、IPC、テスト、文書同期の担当境界を固定する。

## 参照資料

| 参照資料                | パス                                                                                                      | 内容                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------- |
| 元タスク仕様            | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058e-ui-08-notification-center.md` | 058e の正本                |
| 既存 workflow           | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md`                        | 通知ドメイン既存仕様       |
| 現行 NotificationCenter | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx`                             | P50 実体                   |
| 現行 notificationSlice  | `apps/desktop/src/renderer/store/slices/notificationSlice.ts`                                             | 状態契約                   |
| 現行 preload API        | `apps/desktop/src/preload/api/notification-api.ts`                                                        | renderer 公開 API          |
| 現行 handler            | `apps/desktop/src/main/ipc/notificationHandlers.ts`                                                       | main 側 IPC 契約           |
| GlobalNavStrip 正本     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                   | Bell 導線                  |
| UI component 正本       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                   | Atomic Design と責務境界   |
| Notification 実装同期   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                           | 056c 契約と証跡            |
| 状態管理正本            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                              | P31、100件保持、persist    |
| Portal 正本             | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`                              | overlay と focus           |
| IPC セキュリティ正本    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                              | sender 検証                |
| テスト正本              | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                         | happy-dom 制約             |
| a11y 正本               | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                              | Escape / ARIA / focus trap |

## システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                            | このPhaseで固定する内容                             |
| ---------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| UI/UX      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | Notification UI は molecule / organism に分割する   |
| UI feature | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 056c 既存契約を壊さず 058e を上乗せする             |
| Navigation | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | Bell 導線、モバイル表示名、`aria-label` を固定する  |
| State      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | `notificationSlice` 再利用、個別セレクタ、100件保持 |
| Security   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | sender 検証、allowlist、cleanup                     |
| Testing    | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`    | Escape、dialog 属性、live region 観点               |

## 実行手順

### ステップ1: P50実体の固定

| 観点                         | 現行実体 | 判定   |
| ---------------------------- | -------- | ------ |
| Bell 導線                    | 実装済み | 再利用 |
| getHistory + onNew           | 実装済み | 再利用 |
| 未読バッジ                   | 実装済み | 再利用 |
| 相対時刻                     | 未実装   | 補完   |
| 左スワイプ削除               | 未実装   | 補完   |
| 個別 delete IPC              | 未実装   | 補完   |
| title「お知らせ」            | 未一致   | 補完   |
| clear all 非表示             | 未一致   | 補完   |
| focus trap / Escape / Portal | 未充足   | 補完   |

### ステップ2: 機能要件の固定

| 要件ID | 要件                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| FR-01  | Bell アイコン押下で `NotificationPopover` が開閉する                          |
| FR-02  | ヘッダー文言は「お知らせ」、右側操作は「すべて既読」と閉じる操作に限定する    |
| FR-03  | 通知一覧は時系列降順で表示し、filter / grouping / 種別集計 UI を持たない      |
| FR-04  | 未読項目は 8px ドット、既読項目はドット非表示かつ減衰表示にする               |
| FR-05  | 項目押下で既読化し、同時に 1 件のみインライン展開する                         |
| FR-06  | 左スワイプで個別削除アクションを表示し、確定操作で削除する                    |
| FR-07  | `notificationSlice` の 100 件保持、重複排除、ISO 正規化契約を維持する         |
| FR-08  | `notification:get-history` と `notification:new` は既存契約を再利用する       |
| FR-09  | 個別削除用に `notification:delete` を追加する                                 |
| FR-10  | 0 件時は `EmptyState mood="celebrating"` で「お知らせはありません」を表示する |

### ステップ3: 非機能要件の固定

| 要件ID | 要件                                                                    |
| ------ | ----------------------------------------------------------------------- |
| NFR-01 | GlobalNavStrip 直下で desktop / tablet / mobile の 3 幅で表示破綻しない |
| NFR-02 | icon-only ボタンは `aria-label` を持つ                                  |
| NFR-03 | Popover は Escape close、outside click close、focus trap を持つ         |
| NFR-04 | P31 対策として個別セレクタのみを使用する                                |
| NFR-05 | P39 対策として UI test は `fireEvent` を使用する                        |
| NFR-06 | P40 対策として `apps/desktop` 起点でテストを実行する                    |
| NFR-07 | Bell 新着、既読化、展開、削除に task-058e 指定の motion を持つ          |
| NFR-08 | light / dark / kanagawa-dragon の 3 theme でコントラストを維持する      |

### ステップ4: スコープ固定

| 区分               | 内容                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| 本タスクに含む     | Popover UI、個別削除、文言統一、相対時刻、motion、a11y、delete IPC    |
| 本タスクに含まない | HistorySearchView、本体通知生成ロジックの種類追加、OS 通知配信        |
| 再利用前提         | `notificationSlice`、`getHistory`、`onNew`、`markRead`、`markAllRead` |
| 是正対象           | `clear all` UI、単一 component 集約、日時表示、不足する a11y          |

## 統合テスト連携

| 観点               | 内容                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| Renderer → Store   | `notificationSlice` の同期結果が badge / list / expanded state に反映される |
| Renderer → Preload | `getHistory` / `markRead` / `markAllRead` / `delete` / `onNew` を使用する   |
| Preload → Main     | allowlist と sender 検証のあるチャネルだけを公開する                        |
| Main → Renderer    | push payload は ISO timestamp 正規化済みで流す                              |

## 成果物

| 成果物         | パス                                         | 説明          |
| -------------- | -------------------------------------------- | ------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | FR / NFR 一覧 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | 検証条件      |
| スコープ定義   | `outputs/phase-1/scope-definition.md`        | 対象範囲      |
| SubAgent責務表 | `outputs/phase-1/subagent-ownership.md`      | 関心分離表    |

## 完了条件

- [ ] P50 実体と 058e 正本の差分を表で固定している
- [ ] FR-01 から FR-10 を定義している
- [ ] NFR-01 から NFR-08 を定義している
- [ ] 本タスクの対象と対象外を分離している
- [ ] SubAgent-A から D の責務境界を定義している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50 実体の棚卸し
2. FR / NFR の固定
3. スコープと差分方針の固定
4. SubAgent 分担の確定
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-1/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 1 と整合している

## 次のPhase

[Phase 2: 設計](./phase-2-design.md)
