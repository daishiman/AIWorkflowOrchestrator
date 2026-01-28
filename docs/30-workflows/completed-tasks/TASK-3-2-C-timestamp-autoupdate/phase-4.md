# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 4                               |
| 機能名 | TASK-3-2-C-timestamp-autoupdate |
| 作成日 | 2026-01-28                      |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

---

## 実行タスク

- **Task 1**: useIntervalテスト作成 - カスタムフックのテスト
- **Task 2**: usePageVisibilityテスト作成 - 可視状態フックのテスト
- **Task 3**: TimestampContextテスト作成 - コンテキストのテスト
- **Task 4**: MessageTimestampテスト作成 - 自動更新機能のテスト
- **Task 5**: calculateUpdateIntervalテスト作成 - 更新間隔計算のテスト

---

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| レビュー結果 | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

---

## 実行手順

### Task 1: useIntervalテスト作成

ファイル: `apps/desktop/src/renderer/hooks/__tests__/useInterval.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterval } from "../useInterval";

describe("useInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("指定した間隔でコールバックが呼び出される", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("delayがnullの場合はコールバックが呼び出されない", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it("delayが変更されると新しい間隔で実行される", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 } },
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    rerender({ delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("アンマウント時にインターバルがクリアされる", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it("コールバックの参照が更新されても最新が呼び出される", () => {
    let count = 0;
    const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
      initialProps: {
        cb: () => {
          count = 1;
        },
      },
    });

    rerender({
      cb: () => {
        count = 2;
      },
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(count).toBe(2);
  });
});
```

### Task 2: usePageVisibilityテスト作成

ファイル: `apps/desktop/src/renderer/hooks/__tests__/usePageVisibility.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageVisibility } from "../usePageVisibility";

describe("usePageVisibility", () => {
  const originalDocument = global.document;

  beforeEach(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: false,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: originalDocument?.hidden,
    });
  });

  it("初期状態でページが可視の場合trueを返す", () => {
    Object.defineProperty(document, "hidden", { value: false });
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);
  });

  it("初期状態でページが非表示の場合falseを返す", () => {
    Object.defineProperty(document, "hidden", { value: true });
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(false);
  });

  it("visibilitychangeイベントで状態が更新される", () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(document, "hidden", { value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(document, "hidden", { value: false });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(true);
  });

  it("アンマウント時にイベントリスナーが削除される", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => usePageVisibility());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });
});
```

### Task 3: TimestampContextテスト作成

ファイル: `apps/desktop/src/renderer/contexts/__tests__/TimestampContext.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TimestampProvider, useTimestampContext } from '../TimestampContext';

// テスト用コンポーネント
function TestComponent() {
  const currentTime = useTimestampContext();
  return <div data-testid="current-time">{currentTime}</div>;
}

describe('TimestampContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-28T12:00:00Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期値として現在時刻を提供する', () => {
    render(
      <TimestampProvider>
        <TestComponent />
      </TimestampProvider>
    );

    expect(screen.getByTestId('current-time').textContent).toBe(
      String(new Date('2026-01-28T12:00:00Z').getTime())
    );
  });

  it('ページが可視の時、currentTimeが定期的に更新される', () => {
    render(
      <TimestampProvider>
        <TestComponent />
      </TimestampProvider>
    );

    const initialTime = screen.getByTestId('current-time').textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const updatedTime = screen.getByTestId('current-time').textContent;
    expect(Number(updatedTime)).toBeGreaterThan(Number(initialTime));
  });

  it('ページが非表示の時、更新が停止する', () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });

    render(
      <TimestampProvider>
        <TestComponent />
      </TimestampProvider>
    );

    const initialTime = screen.getByTestId('current-time').textContent;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const timeAfterDelay = screen.getByTestId('current-time').textContent;
    expect(timeAfterDelay).toBe(initialTime);
  });
});
```

### Task 4: MessageTimestampテスト作成

ファイル: `apps/desktop/src/renderer/components/AgentView/__tests__/MessageTimestamp.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TimestampProvider } from '../../../contexts/TimestampContext';
import { MessageTimestamp } from '../SkillStreamDisplay';

describe('MessageTimestamp自動更新', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-28T12:00:00Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('タイムスタンプが自動更新される（AC-1）', () => {
    const timestamp = Date.now() - 30000; // 30秒前

    render(
      <TimestampProvider>
        <MessageTimestamp timestamp={timestamp} messageId="test-1" />
      </TimestampProvider>
    );

    expect(screen.getByTestId('message-timestamp-test-1')).toHaveTextContent('30秒前');

    act(() => {
      vi.advanceTimersByTime(10000); // 10秒経過
    });

    expect(screen.getByTestId('message-timestamp-test-1')).toHaveTextContent('40秒前');
  });

  it('1分未満は1秒間隔で更新される（AC-2）', () => {
    const timestamp = Date.now() - 55000; // 55秒前

    render(
      <TimestampProvider>
        <MessageTimestamp timestamp={timestamp} messageId="test-2" />
      </TimestampProvider>
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('message-timestamp-test-2')).toHaveTextContent('56秒前');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('message-timestamp-test-2')).toHaveTextContent('57秒前');
  });

  it('1分以上は1分間隔で更新される（AC-2）', () => {
    const timestamp = Date.now() - 60000; // 1分前

    render(
      <TimestampProvider>
        <MessageTimestamp timestamp={timestamp} messageId="test-3" />
      </TimestampProvider>
    );

    expect(screen.getByTestId('message-timestamp-test-3')).toHaveTextContent('1分前');

    act(() => {
      vi.advanceTimersByTime(60000); // 1分経過
    });
    expect(screen.getByTestId('message-timestamp-test-3')).toHaveTextContent('2分前');
  });

  it('表示形式が維持される（AC-5）', () => {
    render(
      <TimestampProvider>
        <MessageTimestamp timestamp={Date.now() - 30000} messageId="test-sec" />
        <MessageTimestamp timestamp={Date.now() - 300000} messageId="test-min" />
        <MessageTimestamp timestamp={Date.now() - 7200000} messageId="test-hour" />
        <MessageTimestamp timestamp={Date.now() - 86400000} messageId="test-day" />
      </TimestampProvider>
    );

    expect(screen.getByTestId('message-timestamp-test-sec')).toHaveTextContent('秒前');
    expect(screen.getByTestId('message-timestamp-test-min')).toHaveTextContent('分前');
    expect(screen.getByTestId('message-timestamp-test-hour')).toHaveTextContent('時間前');
    expect(screen.getByTestId('message-timestamp-test-day')).toHaveTextContent('日前');
  });
});
```

### Task 5: calculateUpdateIntervalテスト作成

ファイル: `apps/desktop/src/renderer/utils/__tests__/formatTime.test.ts`（追加）

```typescript
import { describe, it, expect } from "vitest";
import {
  calculateUpdateInterval,
  calculateMinUpdateInterval,
} from "../formatTime";

describe("calculateUpdateInterval", () => {
  const now = Date.now();

  it("1分未満の場合は1秒（1000ms）を返す", () => {
    expect(calculateUpdateInterval(now - 30000, now)).toBe(1000);
    expect(calculateUpdateInterval(now - 59000, now)).toBe(1000);
  });

  it("1分以上1時間未満の場合は1分（60000ms）を返す", () => {
    expect(calculateUpdateInterval(now - 60000, now)).toBe(60000);
    expect(calculateUpdateInterval(now - 1800000, now)).toBe(60000); // 30分
    expect(calculateUpdateInterval(now - 3599000, now)).toBe(60000); // 59分59秒
  });

  it("1時間以上の場合は1時間（3600000ms）を返す", () => {
    expect(calculateUpdateInterval(now - 3600000, now)).toBe(3600000);
    expect(calculateUpdateInterval(now - 86400000, now)).toBe(3600000); // 24時間
  });
});

describe("calculateMinUpdateInterval", () => {
  const now = Date.now();

  it("空配列の場合はデフォルト1分を返す", () => {
    expect(calculateMinUpdateInterval([], now)).toBe(60000);
  });

  it("最短の更新間隔を返す", () => {
    const timestamps = [
      now - 30000, // 30秒前 → 1秒間隔
      now - 300000, // 5分前 → 1分間隔
      now - 7200000, // 2時間前 → 1時間間隔
    ];
    expect(calculateMinUpdateInterval(timestamps, now)).toBe(1000);
  });

  it("全て1時間以上の場合は1時間を返す", () => {
    const timestamps = [
      now - 3600000, // 1時間前
      now - 7200000, // 2時間前
    ];
    expect(calculateMinUpdateInterval(timestamps, now)).toBe(3600000);
  });
});
```

---

## テストファイル配置

| テストファイル                   | パス                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| useInterval.test.ts              | `apps/desktop/src/renderer/hooks/__tests__/useInterval.test.ts`                      |
| usePageVisibility.test.ts        | `apps/desktop/src/renderer/hooks/__tests__/usePageVisibility.test.ts`                |
| TimestampContext.test.tsx        | `apps/desktop/src/renderer/contexts/__tests__/TimestampContext.test.tsx`             |
| MessageTimestamp.test.tsx        | `apps/desktop/src/renderer/components/AgentView/__tests__/MessageTimestamp.test.tsx` |
| formatTime.test.ts（追加テスト） | `apps/desktop/src/renderer/utils/__tests__/formatTime.test.ts`                       |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] useIntervalのテストが全てFAIL
# - [ ] usePageVisibilityのテストが全てFAIL
# - [ ] TimestampContextのテストが全てFAIL
# - [ ] MessageTimestamp自動更新のテストが全てFAIL
# - [ ] calculateUpdateIntervalのテストが全てFAIL
```

---

## 成果物

| 成果物           | パス                                    | 説明               |
| ---------------- | --------------------------------------- | ------------------ |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | テスト設計         |
| テストケース一覧 | `outputs/phase-4/test-cases.md`         | ケース一覧         |
| テストファイル   | 上記パス参照                            | 実際のテストコード |

---

## 完了条件

- [ ] useIntervalのテストが作成されている
- [ ] usePageVisibilityのテストが作成されている
- [ ] TimestampContextのテストが作成されている
- [ ] MessageTimestamp自動更新のテストが作成されている
- [ ] calculateUpdateIntervalのテストが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストがAC-1〜AC-8をカバーしている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 5: 実装（TDD: Green）
