# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 6                               |
| 機能名 | TASK-3-2-C-timestamp-autoupdate |
| 作成日 | 2026-01-28                      |

---

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

---

## 実行タスク

- **Task 1**: カバレッジ分析 - 現在のカバレッジ測定と不足領域の特定
- **Task 2**: エッジケーステスト追加 - 境界値・異常系のテスト追加
- **Task 3**: 統合テスト追加 - コンポーネント間連携テストの追加

---

## 参照資料

| 資料名       | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 実行手順

### Task 1: カバレッジ分析

```bash
# カバレッジ測定コマンド
pnpm --filter @repo/desktop test:coverage

# 対象ファイル
# - apps/desktop/src/renderer/hooks/useInterval.ts
# - apps/desktop/src/renderer/hooks/usePageVisibility.ts
# - apps/desktop/src/renderer/contexts/TimestampContext.tsx
# - apps/desktop/src/renderer/utils/formatTime.ts
# - apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx
```

### Task 2: エッジケーステスト追加

#### useInterval追加テスト

```typescript
describe("useInterval - エッジケース", () => {
  it("delayが0の場合も正常に動作する", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 0));

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalled();
  });

  it("delayが負の値の場合はインターバルが設定されない", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, -1000));

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // 実装依存: 負の値をどう扱うか
  });

  it("callbackがundefinedでもエラーにならない", () => {
    expect(() => {
      renderHook(() => useInterval(undefined as unknown as () => void, 1000));
    }).not.toThrow();
  });
});
```

#### calculateUpdateInterval追加テスト

```typescript
describe("calculateUpdateInterval - エッジケース", () => {
  it("timestampが未来の場合は1秒を返す", () => {
    const now = Date.now();
    const future = now + 10000;
    expect(calculateUpdateInterval(future, now)).toBe(1000);
  });

  it("timestampとnowが同じ場合は1秒を返す", () => {
    const now = Date.now();
    expect(calculateUpdateInterval(now, now)).toBe(1000);
  });

  it("境界値: ちょうど1分の場合は1分間隔", () => {
    const now = Date.now();
    expect(calculateUpdateInterval(now - 60000, now)).toBe(60000);
  });

  it("境界値: ちょうど1時間の場合は1時間間隔", () => {
    const now = Date.now();
    expect(calculateUpdateInterval(now - 3600000, now)).toBe(3600000);
  });
});
```

#### TimestampContext追加テスト

```typescript
describe('TimestampContext - エッジケース', () => {
  it('Providerなしでデフォルト値が使用される', () => {
    function TestComponent() {
      const currentTime = useTimestampContext();
      return <div>{typeof currentTime}</div>;
    }

    render(<TestComponent />);
    expect(screen.getByText('number')).toBeInTheDocument();
  });

  it('複数のProviderがネストしても動作する', () => {
    render(
      <TimestampProvider>
        <TimestampProvider>
          <TestComponent />
        </TimestampProvider>
      </TimestampProvider>
    );
    // 内側のProviderの値が使用される
  });

  it('カスタムupdateIntervalが反映される', () => {
    render(
      <TimestampProvider updateInterval={500}>
        <TestComponent />
      </TimestampProvider>
    );

    const initialTime = screen.getByTestId('current-time').textContent;

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId('current-time').textContent).not.toBe(initialTime);
  });
});
```

### Task 3: 統合テスト追加

```typescript
describe('MessageTimestamp統合テスト', () => {
  it('複数のMessageTimestampが同時に更新される', () => {
    const now = Date.now();

    render(
      <TimestampProvider>
        <MessageTimestamp timestamp={now - 10000} messageId="1" />
        <MessageTimestamp timestamp={now - 20000} messageId="2" />
        <MessageTimestamp timestamp={now - 30000} messageId="3" />
      </TimestampProvider>
    );

    const ts1Before = screen.getByTestId('message-timestamp-1').textContent;
    const ts2Before = screen.getByTestId('message-timestamp-2').textContent;
    const ts3Before = screen.getByTestId('message-timestamp-3').textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const ts1After = screen.getByTestId('message-timestamp-1').textContent;
    const ts2After = screen.getByTestId('message-timestamp-2').textContent;
    const ts3After = screen.getByTestId('message-timestamp-3').textContent;

    // 全てが更新される
    expect(ts1After).not.toBe(ts1Before);
    expect(ts2After).not.toBe(ts2Before);
    expect(ts3After).not.toBe(ts3Before);
  });

  it('SkillStreamDisplay内でMessageTimestampが正しく動作する', () => {
    // SkillStreamDisplayの統合テスト
  });
});
```

---

## 成果物

| 成果物             | パス                                 | 説明               |
| ------------------ | ------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md` | カバレッジ分析結果 |
| 追加テストファイル | 各テストファイル                     | 追加テストコード   |

---

## 完了条件

- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上
- [ ] useIntervalエッジケーステストが追加されている
- [ ] calculateUpdateIntervalエッジケーステストが追加されている
- [ ] TimestampContextエッジケーステストが追加されている
- [ ] 統合テストが追加されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 7: テストカバレッジ確認
