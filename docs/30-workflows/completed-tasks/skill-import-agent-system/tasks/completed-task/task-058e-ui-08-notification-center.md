# TASK-UI-08-NOTIFICATION-CENTER: お知らせ

## 1. メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-UI-08-NOTIFICATION-CENTER              |
| ティア     | 4 (UI刷新)                                  |
| 依存       | TASK-UI-00, TASK-UI-01, TASK-UI-02          |
| 並列可     | TASK-UI-07（UI-09は対象外）                 |
| 複雑度     | low                                         |
| ステータス | pending                                     |
| 優先度     | medium                                      |
| タグ       | frontend, renderer, main, ipc, notification |

## 2. 目的

GlobalNavStripのBellアイコンから展開する**お知らせポップオーバー**を実装する。スキル実行結果やシステムイベントをシンプルな時系列リストで表示し、未読管理と左スワイプ削除のみを提供する。フィルター・グルーピング・詳細テキストは一切設けず、「タップして発見する」体験に徹する。

### 2.1 UX言語マッピング（5D準拠）

| 技術用語            | やさしい日本語 | 表示箇所                |
| ------------------- | -------------- | ----------------------- |
| Notification Center | お知らせ       | ポップオーバータイトル  |
| Mark all as read    | すべて既読     | ヘッダー右上ボタン      |
| Delete              | 削除           | 左スワイプアクション    |
| Notification        | お知らせ       | EmptyState / バッジ文脈 |

## 2.2 システム仕様（aiworkflow-requirements）

今回の実装は `aiworkflow-requirements` の参照仕様に基づき、UI/UX・アクセシビリティ・品質観点を仕様へ反映する。

| 観点             | 抽出した必須要件                                          | 主参照                                                                                                                                                         |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX            | Notification UI の責務分離、Atomic Design 境界を維持する  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                        |
| アクセシビリティ | キーボード操作、フォーカストラップ、ARIA の整合を担保する | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                                                                   |
| 品質保証         | happy-dom 前提のテスト実装と Vitest 品質ゲートを満たす    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

## 2.3 実行タスク

- NotificationPopover実装: リスト表示、既読管理、展開UIを実装する
- 操作体験実装: 左スワイプ削除、すべて既読、バッジ更新を実装する
- IPC/Store連携: 通知配信と state 管理を実装する
- 品質実装: コンポーネント/Storeテストを追加し、P31/P39/P40対策を適用する

## 3. 設計哲学: Tap & Discover

### Level 1: お知らせリスト（日時順）

- 時系列の1次元リスト。フィルタータブなし、グルーピングなし
- 種別はアイコンの色で視覚的に区別するのみ
- 100件以下ではフィルタリングは認知負荷を増やすだけで価値がない
- ヘッダー右端に「すべて既読」ボタンを常時配置

### Level 2: 各お知らせタップでインライン展開

- タップした項目が展開し、追加の詳細情報（ソース、実行結果サマリ）をインラインで表示
- 展開と同時に未読ドットが消失（既読化）
- 再タップで折りたたみ（トグル動作）
- 同時に1件のみ展開可能（アコーディオン方式）

### Level 3: 全操作にフィードバック

- タップ、スワイプ、既読化、削除の全操作にアニメーションフィードバック
- 操作結果が視覚的に即座に確認できる

## 4. 画面構成図（ASCII）

```
┌─ GlobalNavStrip ──────────────────────────────────────────────┐
│  ... [🔔 3] ...                                               │
│         │                                                     │
│         ▼ クリックで展開                                      │
│  ┌─ NotificationPopover (360px * max 480px) ──────────────┐  │
│  │ ┌─ Header ──────────────────────────────────────────┐  │  │
│  │ │ "お知らせ"                     すべて既読    [×]  │  │  │
│  │ └───────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │ ┌─ NotificationList (スクロール可能) ───────────────┐  │  │
│  │ │ ┌─ NotificationItem ──────────────────────────┐  │  │  │
│  │ │ │ [●] ✅ スキル「data-analyzer」実行完了  2分前│  │  │  │
│  │ │ │     └─ 展開: 実行時間 1.2s / 出力 3ファイル │  │  │  │
│  │ │ │ ← 左スワイプで赤い「削除」ボタン露出        │  │  │  │
│  │ │ └────────────────────────────────────────────┘  │  │  │
│  │ │ ┌─ NotificationItem ──────────────────────────┐  │  │  │
│  │ │ │ [○] ⚠️ ストレージ使用量が80%超       15分前 │  │  │  │
│  │ │ └────────────────────────────────────────────┘  │  │  │
│  │ │ ┌─ NotificationItem ──────────────────────────┐  │  │  │
│  │ │ │ [○] ❌ スキル「code-gen」実行失敗     1時間前│  │  │  │
│  │ │ └────────────────────────────────────────────┘  │  │  │
│  │ └───────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │ ┌─ EmptyState（0件時）────────────────────────────┐  │  │
│  │ │ EmptyState mood="celebrating"                    │  │  │
│  │ │ 「お知らせはありません」                         │  │  │
│  │ └───────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## 5. コンポーネント構成

### 5.1 コンポーネントツリー

```
NotificationPopover (organisms/NotificationPopover/index.tsx) [新規]
├── NotificationHeader (molecules/NotificationHeader/index.tsx) [新規]
│   ├── タイトル「お知らせ」
│   ├── MarkAllReadButton (テキストボタン、ヘッダー右端)
│   └── CloseButton (atoms) [lucide: X]
├── NotificationList (organisms/NotificationList/index.tsx) [新規]
│   └── NotificationItem (molecules/NotificationItem/index.tsx) [新規]
│       ├── ReadIndicator (atoms) [未読ドット: var(--accent), 8px]
│       ├── NotificationIcon (atoms) [種別に応じたlucide icon + 色]
│       ├── タイトル (1行、ellipsis)
│       ├── 相対時刻 (右端)
│       ├── InlineDetail (展開時のみ表示) [Level 2]
│       └── SwipeDeleteAction (左スワイプで露出する赤い「削除」ボタン)
├── NotificationEmptyState (atoms/NotificationEmptyState/index.tsx) [新規]
│   └── EmptyState mood="celebrating"「お知らせはありません」
└── NotificationBadge (atoms/NotificationBadge/index.tsx) [新規]
    └── GlobalNavStripのBellアイコン上に配置（未読数バッジ）
```

### 5.2 コンポーネント詳細

#### NotificationPopover

```typescript
interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}
```

- 幅: 360px（固定）
- 最大高さ: 480px（スクロール可能）
- 位置: Bellアイコンの下、右寄せ
- 外側クリックで閉じる
- Escapeキーで閉じる
- フォーカストラップ対応（アクセシビリティ）

#### NotificationItem

```typescript
interface NotificationItemProps {
  notification: Notification;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  detail?: string; // Level 2展開時に表示する追加情報
  timestamp: string; // ISO 8601
  isRead: boolean;
  source: NotificationSource;
}

type NotificationType = "info" | "success" | "warning" | "error";

type NotificationSource =
  | { kind: "skill_execution"; skillName: string }
  | { kind: "file_operation"; fileName: string; operation: string }
  | { kind: "system"; eventType: string };
```

**折りたたみ状態（デフォルト）:**

- 各項目の高さ: 56px（5C.2リスト項目準拠）
- 未読: 左端に未読ドット（8px、`var(--accent)`）
- 既読: ドットなし、テキスト `opacity: 0.6`
- 右端に相対時刻（「2分前」「1時間前」）
- タイトルは1行のみ（溢れはellipsis）

**展開状態（Level 2）:**

- タップでインライン展開、高さが自動拡張
- `detail` フィールドの内容を表示（実行結果サマリ、ファイル名など）
- 展開アニメーション: `max-height: 0 → auto` + `opacity: 0 → 1` 200ms ease-out
- 同時に1件のみ展開可能（他の展開中アイテムは自動折りたたみ）

#### 左スワイプ削除（iOSスタイル）

- 左スワイプで赤い「削除」ボタンが右側から露出（translateX）
- 削除ボタンの幅: 80px、背景: `var(--error)` / `#FF3B30`
- 削除ボタンタップで該当項目を削除
- 完全スワイプ（閾値: 50%超え）で即削除
- 途中リリースで元に戻る（スプリングアニメーション、300ms ease-out）

#### NotificationBadge

```typescript
interface NotificationBadgeProps {
  count: number; // 未読件数のみ
  maxDisplay?: number; // デフォルト: 99（100以上は "99+"）
}
```

- 0件: バッジ非表示
- 1〜99件: 数字表示（赤丸バッジ）
- 100件以上: "99+" 表示

## 6. マイクロインタラクション

| 操作                 | アニメーション                                                  | 時間           |
| -------------------- | --------------------------------------------------------------- | -------------- |
| 新着お知らせ出現     | `opacity: 0 → 1` + `translateY(-8px → 0)` 上からスライドイン    | 200ms          |
| 左スワイプ           | `translateX` に追従 → 赤い「削除」ボタン露出                    | ジェスチャ追従 |
| スワイプ削除実行     | `fadeOut` + `height: auto → 0` で消滅                           | 250ms          |
| 「すべて既読」       | 未読ドットが一斉に `fadeOut`（各ドット100ms間隔でスタガー適用） | 100ms \* N     |
| 項目タップ（既読化） | 未読ドットが `scale(1 → 0)` で収縮消失                          | 200ms          |
| 項目タップ（展開）   | `max-height: 0 → auto` + `opacity: 0 → 1` でインライン展開      | 200ms          |
| 項目タップ（折畳み） | `max-height → 0` + `opacity: 1 → 0` で折りたたみ                | 150ms          |
| Bellアイコン新着     | `swing`（振り子）アニメーション 1回                             | 400ms          |
| ポップオーバー開閉   | `opacity: 0 → 1` + `scale(0.95 → 1)` / 逆                       | 200ms          |

### Bellアイコン swing 定義

```css
@keyframes bell-swing {
  0% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(15deg);
  }
  40% {
    transform: rotate(-10deg);
  }
  60% {
    transform: rotate(5deg);
  }
  80% {
    transform: rotate(-3deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
```

### 「すべて既読」スタガー実装方針

```typescript
// 各NotificationItemにindex * 100msの遅延を付与
notifications.forEach((n, index) => {
  if (!n.isRead) {
    setTimeout(() => markAsRead(n.id), index * 100);
  }
});
```

## 7. 状態管理

### 7.1 notificationSlice（簡素化版）

TASK-UI-01のアーキテクチャに従い、新規Sliceとして作成する。フィルター・グルーピング・カウント集計は全て削除。

```typescript
// apps/desktop/src/renderer/store/slices/notificationSlice.ts

interface NotificationSlice {
  // State
  notifications: Notification[];
  unreadCount: number;
  isPopoverOpen: boolean;
  expandedNotificationId: string | null; // Level 2: 現在展開中の項目ID

  // Actions
  addNotification: (notification: Omit<Notification, "id" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setPopoverOpen: (isOpen: boolean) => void;
  setExpandedNotificationId: (id: string | null) => void;
  clearAllNotifications: () => void;
}
```

**削除した要素**（Before → After で完全削除）:

- `activeFilter` フィールド → 削除（フィルター機能そのものを廃止）
- `setActiveFilter` アクション → 削除
- `counts` フィールド（種別ごとの件数） → 削除（未読数のみバッジで表示）
- `useFilteredNotifications` セレクタ → 削除
- `useNotificationCounts` セレクタ → 削除
- `useSetNotificationFilter` セレクタ → 削除
- `groupNotifications` ユーティリティ関数 → 削除（時系列リストのみ）
- `NotificationFilterTabs` コンポーネント → 削除
- `NotificationGroup` コンポーネント → 削除

**追加した要素**:

- `expandedNotificationId` フィールド（Level 2展開管理）
- `setExpandedNotificationId` アクション

### 7.2 最大保持数とLRU削除

```typescript
const MAX_NOTIFICATIONS = 100;

addNotification: (notification) => {
  set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      isRead: false,
    };
    const updated = [newNotification, ...state.notifications];
    // LRU: 100件を超えた場合、古い既読お知らせから削除
    if (updated.length > MAX_NOTIFICATIONS) {
      const readNotifications = updated.filter((n) => n.isRead);
      const unreadNotifications = updated.filter((n) => !n.isRead);
      // 未読を優先保持、既読を古い順に削除
      const trimmed = [
        ...unreadNotifications,
        ...readNotifications.slice(0, MAX_NOTIFICATIONS - unreadNotifications.length),
      ].slice(0, MAX_NOTIFICATIONS);
      return {
        notifications: trimmed,
        unreadCount: trimmed.filter((n) => !n.isRead).length,
      };
    }
    return {
      notifications: updated,
      unreadCount: updated.filter((n) => !n.isRead).length,
    };
  });
},
```

### 7.3 個別セレクタ（P31対策）

```typescript
// 状態セレクタ
export const useNotifications = () => useAppStore((s) => s.notifications);
export const useUnreadCount = () => useAppStore((s) => s.unreadCount);
export const useIsNotificationPopoverOpen = () =>
  useAppStore((s) => s.isPopoverOpen);
export const useExpandedNotificationId = () =>
  useAppStore((s) => s.expandedNotificationId);

// アクションセレクタ
export const useAddNotification = () => useAppStore((s) => s.addNotification);
export const useMarkAsRead = () => useAppStore((s) => s.markAsRead);
export const useMarkAllAsRead = () => useAppStore((s) => s.markAllAsRead);
export const useDeleteNotification = () =>
  useAppStore((s) => s.deleteNotification);
export const useSetPopoverOpen = () => useAppStore((s) => s.setPopoverOpen);
export const useSetExpandedNotificationId = () =>
  useAppStore((s) => s.setExpandedNotificationId);
```

## 8. IPC設計（バックエンド連携）

### 8.1 お知らせ生成元

| 生成元           | イベント               | NotificationType | 例                                |
| ---------------- | ---------------------- | ---------------- | --------------------------------- |
| スキル実行       | 実行完了               | success          | 「data-analyzer」実行完了         |
| スキル実行       | 実行失敗               | error            | 「code-gen」実行失敗              |
| ファイル操作     | ファイル作成/更新/削除 | info             | 「report.md」を更新しました       |
| システムイベント | ストレージ警告         | warning          | ストレージ使用量が80%を超えました |
| システムイベント | アップデート通知       | info             | 新バージョンが利用可能です        |

### 8.2 IPCチャンネル設計

```typescript
// packages/shared/src/ipc/channels.ts に追加

export const NOTIFICATION_CHANNELS = {
  // Main → Renderer（イベント配信）
  NOTIFICATION_NEW: "notification:new",

  // Renderer → Main（操作）— kebab-case統一（01-architecture準拠）
  NOTIFICATION_GET_ALL: "notification:get-all",
  NOTIFICATION_MARK_READ: "notification:mark-read",
  NOTIFICATION_DELETE: "notification:delete",
  NOTIFICATION_CLEAR: "notification:clear-all",
} as const;
```

### 8.3 Main → Renderer お知らせ配信フロー

```
┌─ Main Process ────────────────────────────────────────────┐
│                                                           │
│  SkillExecutor.execute()                                  │
│      │ 完了/失敗                                          │
│      ▼                                                    │
│  NotificationService.emit({                               │
│    type: "success",                                       │
│    title: "スキル実行完了",                                │
│    detail: "実行時間 1.2s / 出力 3ファイル",               │
│    source: { kind: "skill_execution", skillName: "..." }  │
│  })                                                       │
│      │                                                    │
│      ▼                                                    │
│  mainWindow.webContents.send(                             │
│    "notification:new",                                    │
│    sanitizedNotification                                  │
│  )                                                        │
│                                                           │
└───────────────────────────────────────────────────────────┘
         │
         ▼ IPC (contextBridge)
┌─ Renderer Process ────────────────────────────────────────┐
│                                                           │
│  preload: safeOn("notification:new", callback)            │
│      │                                                    │
│      ▼                                                    │
│  notificationSlice.addNotification(data)                  │
│      │                                                    │
│      ├─→ NotificationBadge 更新（未読数バッジ）           │
│      ├─→ Bellアイコン swing アニメーション発火             │
│      └─→ ポップオーバー開中ならリスト先頭にスライドイン   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 8.4 リスナー登録（P5対策: 二重登録防止）

```typescript
// preload/notification-listener.ts

let isRegistered = false;

export function registerNotificationListener(
  callback: (notification: Notification) => void,
): void {
  if (isRegistered) return; // モジュールレベルガード
  isRegistered = true;

  window.electronAPI.notification.onNew(callback);
}
```

- React StrictMode での useEffect 二重実行を考慮
- リスナー登録はモジュールレベルのフラグでガード
- アプリ終了時のクリーンアップは不要（プロセス終了で解放）

### 8.5 セキュリティ考慮事項

| 項目                     | 対策                                                     |
| ------------------------ | -------------------------------------------------------- |
| 送信元検証               | `validateIpcSender()` で送信元ウィンドウを検証           |
| サニタイズ               | Main側で内部エラー情報をサニタイズしてからRendererに送信 |
| チャンネルホワイトリスト | `IPC_CHANNELS` 定数で管理。ハードコード文字列禁止        |
| お知らせ内容の安全性     | HTMLエスケープ不要（React がデフォルトでエスケープ）     |

## 9. レスポンシブ仕様

| ブレークポイント | NotificationPopover      | 配置                   |
| ---------------- | ------------------------ | ---------------------- |
| lg (1024px+)     | 360px幅、最大480px高さ   | Bellアイコン下、右寄せ |
| md (768-1023px)  | 360px幅、最大480px高さ   | Bellアイコン下、右寄せ |
| sm (<768px)      | 画面幅 - 32px、最大480px | 中央配置               |

- sm時はオーバーレイ（半透明背景）を表示
- ポップオーバー外クリックで閉じる動作はすべてのブレークポイントで共通

## 10. ゼロステート（お知らせ0件）

```
┌──────────────────────────────────────┐
│                                      │
│     EmptyState mood="celebrating"    │
│                                      │
│      「お知らせはありません」         │
│                                      │
└──────────────────────────────────────┘
```

- TASK-UI-00 の `EmptyState` 共通コンポーネントを使用
- `mood="celebrating"` でポジティブな表現
- サブテキストなし（シンプルに1行のみ）

## 11. テスト計画

### 11.1 単体テスト（Vitest + React Testing Library）

| テスト対象             | テスト内容                                            | P対策   |
| ---------------------- | ----------------------------------------------------- | ------- |
| notificationSlice      | addNotification / markAsRead / markAllAsRead / delete | P31, P9 |
| notificationSlice      | LRU削除（100件超過時の既読優先削除）                  | -       |
| notificationSlice      | expandedNotificationId のトグル動作                   | -       |
| NotificationItem       | 未読ドット表示 / 既読時の非表示                       | P39     |
| NotificationItem       | タップでonToggleExpand発火                            | P39     |
| NotificationItem       | 展開状態でdetail表示                                  | P39     |
| NotificationBadge      | 0件で非表示 / 1-99件で数字 / 100件以上で "99+"        | -       |
| NotificationPopover    | Escapeキーで閉じる / 外側クリックで閉じる             | P39     |
| NotificationHeader     | 「すべて既読」ボタンでmarkAllAsRead発火               | P39     |
| NotificationEmptyState | EmptyState mood="celebrating" で表示                  | -       |
| 個別セレクタ           | useNotifications / useUnreadCount 等が正しい値を返す  | P31     |

### 11.2 テスト実行時の注意事項

- **P39対策**: happy-dom環境では`fireEvent`を使用。`userEvent.setup()`は使用禁止
- **P40対策**: テスト実行は `cd apps/desktop && pnpm vitest run` で実行
- **P9対策**: `beforeEach`でStoreをリセット。テスト間で状態を共有しない

```typescript
// テスト例（P39準拠: fireEvent使用）
import { fireEvent, act } from "@testing-library/react";

// ❌ 禁止（happy-domで失敗）
const user = userEvent.setup();
await user.click(markAllReadButton);

// ✅ 正しい
await act(async () => {
  fireEvent.click(markAllReadButton);
});
```

## 11.3 実行手順（task-specification-creator準拠）

| Step | 内容                                                          | 実行方式 |
| ---- | ------------------------------------------------------------- | -------- |
| 1    | NotificationPopover/Item/List/Header/Badge を実装             | 直列     |
| 2    | notificationSlice と IPC 連携を実装                           | 直列     |
| 3    | 左スワイプ削除・既読化・展開UIを実装                          | 直列     |
| 4    | テストコード（Store + UI）を追加                              | 直列     |
| 5    | `cd apps/desktop && pnpm vitest run` で検証し、完了条件を確認 | 直列     |

## 12. 成果物（ファイルパス）

| 成果物                 | パス                                                                           | 種別 |
| ---------------------- | ------------------------------------------------------------------------------ | ---- |
| NotificationPopover    | `apps/desktop/src/renderer/components/organisms/NotificationPopover/index.tsx` | 新規 |
| NotificationHeader     | `apps/desktop/src/renderer/components/molecules/NotificationHeader/index.tsx`  | 新規 |
| NotificationList       | `apps/desktop/src/renderer/components/organisms/NotificationList/index.tsx`    | 新規 |
| NotificationItem       | `apps/desktop/src/renderer/components/molecules/NotificationItem/index.tsx`    | 新規 |
| NotificationEmptyState | `apps/desktop/src/renderer/components/atoms/NotificationEmptyState/index.tsx`  | 新規 |
| NotificationBadge      | `apps/desktop/src/renderer/components/atoms/NotificationBadge/index.tsx`       | 新規 |
| notificationSlice      | `apps/desktop/src/renderer/store/slices/notificationSlice.ts`                  | 新規 |
| Notification型定義     | `apps/desktop/src/renderer/store/types.ts`                                     | 改修 |
| IPCチャンネル定義      | `packages/shared/src/ipc/channels.ts`                                          | 改修 |
| NotificationService    | `apps/desktop/src/main/services/NotificationService.ts`                        | 新規 |
| notification-listener  | `apps/desktop/src/preload/notification-listener.ts`                            | 新規 |
| preload/types.ts       | `apps/desktop/src/preload/types.ts`                                            | 改修 |

## 13. 完了条件

- [ ] NotificationPopoverがBellアイコンクリックで開閉する
- [ ] NotificationItemが種別（info/success/warning/error）に応じたアイコン色で表示される
- [ ] 未読ドット（8px、`var(--accent)`）が未読項目に表示される
- [ ] 既読項目はドットなし、テキスト `opacity: 0.6`
- [ ] 項目タップで未読ドットが `scale(1 → 0)` で収縮消失し、既読化される
- [ ] 項目タップでインライン展開（Level 2）、再タップで折りたたみ
- [ ] 同時に1件のみ展開可能（アコーディオン方式）
- [ ] 「すべて既読」ボタンで全お知らせが既読になる（スタガーfadeOut、100ms間隔）
- [ ] 左スワイプで赤い「削除」ボタンが露出し、タップまたは完全スワイプで削除
- [ ] 削除時に `fadeOut` + `height: 0` アニメーション
- [ ] NotificationBadgeが未読件数を正しく表示（0件で非表示、100件以上で "99+"）
- [ ] Bellアイコンが新着時に swing アニメーション 1回
- [ ] 新着お知らせが `opacity: 0 → 1` + `translateY(-8px → 0)` でスライドイン（200ms）
- [ ] お知らせが100件を超えた場合、LRU方式で古い既読お知らせが削除される
- [ ] Main Process → Renderer へのお知らせ配信IPCが動作する
- [ ] スキル実行完了/失敗時にお知らせが生成される
- [ ] お知らせ0件時に EmptyState mood="celebrating"「お知らせはありません」が表示される
- [ ] リスナー二重登録が防止されている（P5対策）
- [ ] IPCチャンネルがホワイトリスト管理されている（ハードコード文字列なし）
- [ ] notificationSliceの個別セレクタが全て定義されている（P31対策）
- [ ] テストで `fireEvent` を使用している（`userEvent` 不使用、P39対策）
- [ ] テスト実行が `apps/desktop` ディレクトリから行われている（P40対策）
- [ ] 全テーマ（kanagawa-dragon/light/dark）で表示正常
- [ ] lucide-reactアイコンのみ使用（絵文字不使用）
- [ ] アクセシビリティ: Escapeキーで閉じる、フォーカストラップ、ARIAラベル
- [ ] 関連テストがPASS
- [ ] フィルタータブ・グルーピング・カウント集計が存在しないこと（削除確認）
- [ ] UIテキストが Task 5D（UX言語ガイドライン）に準拠していること

## 14. 既知の落とし穴・教訓

| Pitfall | 内容                                           | 対策                                                       |
| ------- | ---------------------------------------------- | ---------------------------------------------------------- |
| P5      | リスナー二重登録（Renderer / Main 両プロセス） | モジュールレベルのフラグでガード。StrictMode二重実行を考慮 |
| P9      | モジュールスコープ変数のテスト間リーク         | `beforeEach`でStoreリセット。テスト間で状態を共有しない    |
| P31     | Zustand合成Hook無限ループ                      | 個別セレクタのみ使用。合成Hookは使用禁止                   |
| P23     | API二重定義の型管理                            | 型定義は `store/types.ts` に集約。Preload型と同期          |
| P32     | 型定義の二箇所同時更新必須                     | `shared/types` と `preload/types.ts` を同時更新            |
| P39     | happy-dom環境でのuserEvent非互換               | テストでは`fireEvent`を使用。`userEvent`使用禁止           |
| P40     | テスト実行ディレクトリ依存（モノレポ）         | `cd apps/desktop && pnpm vitest run` で実行                |
| P42     | 文字列引数の.trim()バリデーション漏れ          | IPC引数に3段バリデーション適用                             |

## 15. 参照資料

| 資料                       | パス / 参照先                                                                     |
| -------------------------- | --------------------------------------------------------------------------------- |
| 共通基盤コンポーネント     | TASK-UI-00                                                                        |
| アーキテクチャ仕様         | TASK-UI-01                                                                        |
| GlobalNavStrip仕様         | TASK-UI-02                                                                        |
| UX言語ガイドライン（5D）   | TASK-UI-00 `00-ui-design-foundation.md` Task 5D                                   |
| UI/UXコンポーネント仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           |
| a11yテスト基準             | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |
| コンポーネントテスト基準   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       |
| 既存Store型定義            | `apps/desktop/src/renderer/store/types.ts`                                        |
| 既存NotificationSettings型 | `apps/desktop/src/renderer/store/types.ts:54`                                     |
| アーキテクチャルール       | `.claude/rules/01-architecture.md`                                                |
| Electronセキュリティルール | `.claude/rules/04-electron-security.md`                                           |
| 状態管理ルール             | `.claude/rules/03-state-management.md`                                            |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                              |
