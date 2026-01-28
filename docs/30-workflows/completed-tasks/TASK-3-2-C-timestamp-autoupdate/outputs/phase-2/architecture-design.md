# アーキテクチャ設計: TASK-3-2-C タイムスタンプ自動更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| タスク | TASK-3-2-C-timestamp-autoupdate |
| Phase  | 2                               |
| 作成日 | 2026-01-28                      |

---

## 1. コンポーネント階層設計

### 1.1 改善前の構造

```
SkillStreamDisplay
├── LoadingSpinner
├── MessageList
│   └── MessageItem
│       ├── MessageTimestamp  ← 静的表示（更新なし）
│       └── CopyButton
└── ...
```

### 1.2 改善後の構造

```
SkillStreamDisplay
├── TimestampProvider          ← 新規追加（コンテキストプロバイダー）
│   ├── LoadingSpinner
│   ├── MessageList
│   │   └── MessageItem
│   │       ├── MessageTimestamp  ← 改善（useTimestampContext使用）
│   │       └── CopyButton
│   └── ...
```

---

## 2. コンポーネント設計

### 2.1 TimestampProvider

**責務**: 現在時刻の管理と全MessageTimestampへの配信

```typescript
interface TimestampProviderProps {
  children: React.ReactNode;
  timestamps?: number[]; // メッセージのタイムスタンプ配列（最適化用）
}

// 機能
// - 現在時刻の状態管理（useState）
// - 可視状態の監視（usePageVisibility）
// - 適応的な更新間隔の計算（calculateMinUpdateInterval）
// - タイマーによる定期更新（useInterval）
```

### 2.2 MessageTimestamp（改善）

**責務**: 単一メッセージの相対時刻表示

```typescript
interface MessageTimestampProps {
  timestamp: number;
  messageId: string;
}

// 改善点
// - TimestampContextから現在時刻を取得
// - React.memoによるメモ化維持
// - formatRelativeTime(timestamp, currentTime)で表示計算
```

---

## 3. データフロー

### 3.1 状態管理フロー

```
[TimestampProvider]
    │
    ├── state: currentTime = Date.now()
    │
    ├── usePageVisibility() → isVisible
    │
    ├── calculateMinUpdateInterval(timestamps, currentTime) → interval
    │
    └── useInterval(() => setCurrentTime(Date.now()), isVisible ? interval : null)
            │
            ▼
    [TimestampContext.Provider value={{ currentTime }}]
            │
            ▼
    [MessageTimestamp]
        │
        └── const currentTime = useTimestampContext()
            │
            └── formatRelativeTime(timestamp, currentTime)
```

### 3.2 更新トリガーフロー

```
setInterval tick
    │
    ▼
setCurrentTime(Date.now())
    │
    ▼
TimestampContext value変更
    │
    ▼
全MessageTimestamp再レンダー
    │
    ▼
formatRelativeTime再計算
    │
    ▼
UI更新
```

---

## 4. ファイル配置

### 4.1 新規作成ファイル

| ファイル                  | パス                                            | 説明                       |
| ------------------------- | ----------------------------------------------- | -------------------------- |
| useInterval.ts            | `apps/desktop/src/renderer/hooks/`              | タイマーフック             |
| usePageVisibility.ts      | `apps/desktop/src/renderer/hooks/`              | 可視状態検知フック         |
| TimestampContext.tsx      | `apps/desktop/src/renderer/contexts/`           | タイムスタンプコンテキスト |
| useInterval.test.ts       | `apps/desktop/src/renderer/hooks/__tests__/`    | useIntervalテスト          |
| usePageVisibility.test.ts | `apps/desktop/src/renderer/hooks/__tests__/`    | usePageVisibilityテスト    |
| TimestampContext.test.tsx | `apps/desktop/src/renderer/contexts/__tests__/` | Contextテスト              |

### 4.2 修正ファイル

| ファイル               | パス                                              | 変更内容         |
| ---------------------- | ------------------------------------------------- | ---------------- |
| SkillStreamDisplay.tsx | `apps/desktop/src/renderer/components/AgentView/` | Provider統合     |
| formatTime.ts          | `apps/desktop/src/renderer/utils/`                | 更新間隔計算追加 |

---

## 5. インターフェース定義

### 5.1 TimestampContext

```typescript
interface TimestampContextValue {
  currentTime: number;
}
```

### 5.2 Hook インターフェース

```typescript
// useInterval
function useInterval(callback: () => void, delay: number | null): void;

// usePageVisibility
function usePageVisibility(): boolean;

// useTimestampContext
function useTimestampContext(): number;
```

### 5.3 ユーティリティ関数

```typescript
// 単一タイムスタンプの更新間隔計算
function calculateUpdateInterval(timestamp: number, now: number): number;

// 複数タイムスタンプから最短間隔を計算
function calculateMinUpdateInterval(timestamps: number[], now: number): number;
```

---

## 6. パフォーマンス設計

### 6.1 最適化戦略

| 戦略             | 説明                                    | 効果                 |
| ---------------- | --------------------------------------- | -------------------- |
| 単一タイマー     | Provider内で1つのsetIntervalのみ使用    | CPU負荷削減          |
| バッチ更新       | Context経由で全コンポーネントを一括更新 | 再レンダリング最小化 |
| React.memo維持   | MessageTimestampのメモ化を維持          | 不要なレンダー防止   |
| 可視状態での停止 | タブ非表示時はタイマー完全停止          | バッテリー節約       |
| 適応的更新間隔   | 経過時間に応じて更新頻度を動的調整      | リソース最適化       |

### 6.2 メモリ管理

| 対策                 | 説明                                     |
| -------------------- | ---------------------------------------- |
| useEffect cleanup    | アンマウント時のinterval解除             |
| useRef活用           | コールバック保存でクロージャーリーク防止 |
| イベントリスナー解除 | visibilitychange解除を確実に実行         |

---

## 7. エラーハンドリング

### 7.1 SSR対応

```typescript
// document未定義時の対応
const [isVisible, setIsVisible] = useState(
  typeof document !== "undefined" ? !document.hidden : true,
);
```

### 7.2 タイマー安全性

```typescript
// delay=nullでタイマー停止
if (delay === null) {
  return; // early return
}
```

---

## 変更履歴

| 日付       | 変更内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-28 | 初版作成 | AI   |
