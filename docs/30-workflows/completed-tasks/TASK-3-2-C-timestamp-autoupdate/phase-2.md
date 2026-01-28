# Phase 2: 設計

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 機能名 | TASK-3-2-C-timestamp-autoupdate |
| 作成日 | 2026-01-28                      |

---

## 目的

Phase 1で定義した要件を実現可能なコンポーネント設計・フック設計に落とし込む。

---

## 実行タスク

- **Task 1**: コンポーネント設計 - MessageTimestampの改善設計
- **Task 2**: カスタムフック設計 - useInterval、usePageVisibility、useTimestampContextの設計
- **Task 3**: パフォーマンス設計 - バッチ更新・メモ化戦略の設計

---

## 参照資料

| 資料名     | パス                                         | 説明          |
| ---------- | -------------------------------------------- | ------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 説明                   |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------- |
| UI/UXコンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | UIコンポーネント設計   |
| 機能別コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillStreamDisplay仕様 |
| デザイン原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | UI/UX設計原則          |

---

## 実行手順

### Task 1: コンポーネント設計

#### 現在のMessageTimestampコンポーネント

```typescript
// 現在の実装（静的）
const MessageTimestamp = React.memo(function MessageTimestamp({
  timestamp,
  messageId,
}: {
  timestamp: number;
  messageId: string;
}) {
  return (
    <span data-testid={`message-timestamp-${messageId}`}>
      {formatRelativeTime(timestamp)}
    </span>
  );
});
```

#### 改善後のMessageTimestampコンポーネント設計

```typescript
// 改善後の実装（自動更新対応）
const MessageTimestamp = React.memo(function MessageTimestamp({
  timestamp,
  messageId,
}: {
  timestamp: number;
  messageId: string;
}) {
  // TimestampContextから現在時刻を取得（バッチ更新用）
  const currentTime = useTimestampContext();

  return (
    <span data-testid={`message-timestamp-${messageId}`}>
      {formatRelativeTime(timestamp, currentTime)}
    </span>
  );
});
```

#### コンポーネント階層

```
SkillStreamDisplay
├── TimestampProvider          ← 新規追加
│   ├── LoadingSpinner
│   ├── MessageList
│   │   └── MessageItem
│   │       ├── MessageTimestamp  ← 改善（useTimestampContext使用）
│   │       └── CopyButton
│   └── ...
```

### Task 2: カスタムフック設計

#### useInterval フック

```typescript
/**
 * 動的な間隔で関数を実行するカスタムフック
 *
 * @param callback - 実行する関数
 * @param delay - 実行間隔（ミリ秒）。nullの場合は停止
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>();

  // コールバックを保存
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // インターバルを設定
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

#### usePageVisibility フック

```typescript
/**
 * ページの可視状態を監視するカスタムフック
 *
 * @returns isVisible - ページが可視状態かどうか
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true,
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
```

#### TimestampContext 設計

```typescript
/**
 * タイムスタンプ更新用コンテキスト
 * 全MessageTimestampコンポーネントが単一タイマーで更新される
 */
interface TimestampContextValue {
  currentTime: number;
}

const TimestampContext = createContext<TimestampContextValue>({
  currentTime: Date.now(),
});

export function useTimestampContext(): number {
  return useContext(TimestampContext).currentTime;
}

export function TimestampProvider({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isVisible = usePageVisibility();

  // 更新間隔を決定（最短の間隔を使用）
  // 実際の実装では、メッセージリストから最短間隔を計算
  const updateInterval = isVisible ? 1000 : null;

  useInterval(() => {
    setCurrentTime(Date.now());
  }, updateInterval);

  return (
    <TimestampContext.Provider value={{ currentTime }}>
      {children}
    </TimestampContext.Provider>
  );
}
```

### Task 3: パフォーマンス設計

#### バッチ更新戦略

| 戦略              | 説明                                         |
| ----------------- | -------------------------------------------- |
| 単一タイマー      | TimestampProviderで1つのタイマーのみ使用     |
| Context経由の更新 | currentTimeの変更でContext消費者が再レンダー |
| React.memo維持    | MessageTimestampのメモ化は維持               |
| 可視状態での停止  | タブ非表示時はタイマーを完全停止             |

#### 更新間隔の動的計算

```typescript
/**
 * タイムスタンプに基づいて適切な更新間隔を計算
 *
 * @param timestamp - メッセージのタイムスタンプ
 * @param now - 現在時刻
 * @returns 更新間隔（ミリ秒）
 */
export function calculateUpdateInterval(
  timestamp: number,
  now: number,
): number {
  const diff = now - timestamp;
  const minutes = diff / (1000 * 60);
  const hours = minutes / 60;

  if (hours >= 1) {
    return 60 * 60 * 1000; // 1時間
  }
  if (minutes >= 1) {
    return 60 * 1000; // 1分
  }
  return 1000; // 1秒
}

/**
 * メッセージリストから最短の更新間隔を計算
 *
 * @param timestamps - メッセージのタイムスタンプ配列
 * @param now - 現在時刻
 * @returns 最短の更新間隔（ミリ秒）
 */
export function calculateMinUpdateInterval(
  timestamps: number[],
  now: number,
): number {
  if (timestamps.length === 0) {
    return 60 * 1000; // デフォルト1分
  }

  return Math.min(...timestamps.map((ts) => calculateUpdateInterval(ts, now)));
}
```

---

## アーキテクチャ層別設計

このタスクはフロントエンド（Renderer Process）のみに影響する。

| 層       | 設計内容                                            | ファイル                                        |
| -------- | --------------------------------------------------- | ----------------------------------------------- |
| Renderer | TimestampProvider、useInterval、usePageVisibility   | `apps/desktop/src/renderer/`                    |
| Hooks    | useInterval、usePageVisibility、useTimestampContext | `apps/desktop/src/renderer/hooks/`              |
| Contexts | TimestampContext                                    | `apps/desktop/src/renderer/contexts/`           |
| Utils    | calculateUpdateInterval                             | `apps/desktop/src/renderer/utils/formatTime.ts` |

---

## ファイル配置

| ファイル                          | パス                                                                    |
| --------------------------------- | ----------------------------------------------------------------------- |
| useInterval.ts                    | `apps/desktop/src/renderer/hooks/useInterval.ts`                        |
| usePageVisibility.ts              | `apps/desktop/src/renderer/hooks/usePageVisibility.ts`                  |
| TimestampContext.tsx              | `apps/desktop/src/renderer/contexts/TimestampContext.tsx`               |
| SkillStreamDisplay.tsx            | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |
| formatTime.ts（更新間隔計算追加） | `apps/desktop/src/renderer/utils/formatTime.ts`                         |

---

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | コンポーネント設計 |
| フック設計     | `outputs/phase-2/hooks-design.md`        | カスタムフック設計 |
| シーケンス図   | `outputs/phase-2/sequence-diagram.md`    | 更新フローの可視化 |

---

## 完了条件

- [ ] MessageTimestampコンポーネントの改善設計が完了している
- [ ] useIntervalフックの設計が完了している
- [ ] usePageVisibilityフックの設計が完了している
- [ ] TimestampContextの設計が完了している
- [ ] パフォーマンス設計（バッチ更新戦略）が完了している
- [ ] 更新間隔計算ロジックが設計されている
- [ ] ファイル配置が決定している
- [ ] Phase 1要件との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビューゲート
