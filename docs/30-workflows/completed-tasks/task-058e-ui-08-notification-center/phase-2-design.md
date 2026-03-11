# Phase 2: 設計

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 2                                   |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| 前提   | Phase 1                             |

## 目的

Phase 1 の差分要件を、UI 構造、state / IPC 境界、a11y、motion、テスト対象へ分解する。Phase 4 以降が既存 `NotificationCenter` を安全に分割・補完できる設計書を作る。

## 実行タスク

- UI分割設計: organism / molecule / atom の責務境界を定義する。
- state設計: `notificationSlice`、local state、selector の責務を定義する。
- IPC設計: 既存 channel 再利用と `notification:delete` 追加方針を定義する。
- a11y設計: Portal、Escape、focus trap、`aria-*` を定義する。
- P50収束設計: 既存 `clear all` UI をどう置換するかを定義する。

## 参照資料

| 参照資料             | パス                                                                          | 説明                 |
| -------------------- | ----------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件         | `outputs/phase-1/requirements-definition.md`                                  | FR / NFR             |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                      | 検証条件             |
| Phase 1 スコープ     | `outputs/phase-1/scope-definition.md`                                         | 境界条件             |
| 現行 UI              | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx` | P50 実装             |
| 現行 slice           | `apps/desktop/src/renderer/store/slices/notificationSlice.ts`                 | 既存契約             |
| 現行 preload API     | `apps/desktop/src/preload/api/notification-api.ts`                            | 現行 API             |
| 現行 handler         | `apps/desktop/src/main/ipc/notificationHandlers.ts`                           | 現行 IPC             |
| 要求トレース         | `requirements-traceability-matrix.md`                                         | 元タスクとの対応     |
| system spec 抽出台帳 | `aiworkflow-requirements-extraction-matrix.md`                                | query 単位の抽出根拠 |
| SubAgent責務表       | `outputs/phase-1/subagent-ownership.md`                                       | Phase 1 成果物       |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | このPhaseで固定する内容                          |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| UI components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | organism / molecule / atom 境界                  |
| Feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 056c 通知契約と回帰観点                          |
| Portal             | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`    | `createPortal(document.body)` と `aria-haspopup` |
| State              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | selector 粒度、persist、100件保持                |
| IPC catalog        | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`            | Notification 系 channel 一覧の再確認             |
| IPC contract       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`           | invoke / on 契約、sender 検証、認証必須条件      |
| Security           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | allowlist、sender 検証、cleanup                  |
| Error handling     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | delete 失敗時の surfacing 契約                   |
| Accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`    | `role="dialog"`、`aria-live`、focus 戻し         |

## 実行手順

### ステップ1: コンポーネント設計

| 種別     | ファイル                           | 責務                                                   |
| -------- | ---------------------------------- | ------------------------------------------------------ |
| organism | `NotificationCenter/index.tsx`     | Bell trigger、history sync、subscription orchestration |
| organism | `NotificationPopover/index.tsx`    | Portal、focus trap、header + list layout               |
| organism | `NotificationList/index.tsx`       | 時系列 list と空状態切替                               |
| molecule | `NotificationHeader/index.tsx`     | title、すべて既読、close                               |
| molecule | `NotificationItem/index.tsx`       | unread dot、relative time、expand、swipe delete        |
| atom     | `NotificationBadge/index.tsx`      | unread badge 表示                                      |
| atom     | `NotificationEmptyState/index.tsx` | 0 件表示                                               |

### ステップ2: state / selector 設計

| state                                                      | 保持場所                    | 理由                          |
| ---------------------------------------------------------- | --------------------------- | ----------------------------- |
| `notifications` / `unreadCount` / `expandedNotificationId` | `notificationSlice`         | 056c 契約を再利用する         |
| `isPopoverOpen`                                            | `notificationSlice`         | trigger と popover で共有する |
| `swipingId` / gesture offset                               | local state                 | 一時 UI 状態のため            |
| focus trap active state                                    | local ref                   | render 再計算を増やさないため |
| history sync / subscription                                | `NotificationCenter` effect | renderer entry に閉じるため   |

### ステップ3: IPC 設計

| channel                      | 方向            | 方針                                              |
| ---------------------------- | --------------- | ------------------------------------------------- |
| `notification:get-history`   | Renderer → Main | 継続利用                                          |
| `notification:mark-read`     | Renderer → Main | 継続利用                                          |
| `notification:mark-all-read` | Renderer → Main | 継続利用                                          |
| `notification:new`           | Main → Renderer | 継続利用                                          |
| `notification:delete`        | Renderer → Main | 新規追加                                          |
| `notification:clear`         | Renderer → Main | UI からは未使用。互換性整理対象として残置判断する |

### ステップ4: a11y / motion 設計

| 項目        | 設計                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| Trigger     | `aria-label="お知らせを開く"`, `aria-haspopup="dialog"`, `aria-expanded` |
| Popover     | `role="dialog"`, `aria-modal="false"`, `aria-labelledby`                 |
| Focus       | open 時に header first control へ移動し、close 時に Bell へ戻す          |
| Keyboard    | Escape close、Tab wrap、Enter / Space で item expand                     |
| Live region | unread 変化は `role="status"` + `aria-live="polite"` で通知              |
| Motion      | bell swing 400ms、expand 200ms、delete 250ms、mark all stagger 100ms     |

### ステップ5: P50差分収束設計

| 現行                                    | 変更後                      |
| --------------------------------------- | --------------------------- |
| `NotificationCenter` 単体で全 UI を持つ | Shell と Popover 群へ分割   |
| 「通知履歴」                            | 「お知らせ」                |
| 「すべて削除」                          | 非表示                      |
| 固定日時表示                            | 相対時刻表示                |
| 既読ボタンのみ                          | 項目押下既読 + swipe delete |

## 統合テスト連携

| 観点         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Store 接続   | `ingestNotification` と `setNotificationHistory` で重複排除を維持する |
| Preload 接続 | `onNew` の購読解除を unmount で実行する                               |
| Main 接続    | `notification:delete` 追加後も sender 検証を通す                      |
| UI 接続      | GlobalNavStrip 配置、mobile overlay、Portal 描画が両立する            |

## 成果物

| 成果物             | パス                                                 | 説明                       |
| ------------------ | ---------------------------------------------------- | -------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`             | 全体構成                   |
| コンポーネント設計 | `outputs/phase-2/component-design.md`                | UI 分割                    |
| state / IPC 設計   | `outputs/phase-2/state-ipc-design.md`                | store と IPC 境界          |
| 正本仕様抽出       | `outputs/phase-2/aiworkflow-requirements-extract.md` | 仕様根拠                   |
| root 抽出台帳      | `aiworkflow-requirements-extraction-matrix.md`       | system spec 抽出の監査台帳 |

## 完了条件

- [ ] component 分割と責務を定義している
- [ ] `notificationSlice` 再利用方針を定義している
- [ ] `notification:delete` の追加方針を定義している
- [ ] Portal、Escape、focus trap を定義している
- [ ] `clear all` UI を置き換える方針を定義している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. UI 分割設計
2. state / selector 設計
3. IPC 差分設計
4. a11y / motion 設計
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-2/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 2 と整合している

## 次のPhase

[Phase 3: 設計レビューゲート](./phase-3-design-review.md)
