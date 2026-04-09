# Phase 2: NON_VISUAL 計装ポイント定義

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日     | 2026-04-08                                 |
| ステータス | completed                                  |

---

## trackEvent スタブ定義

```typescript
// TODO(Wave3): trackEvent 本実装に差し替え（W3-seq-04）
const trackEvent = (event: string, data?: unknown) => {
  console.log(event, data);
};
```

Wave 3（W3-seq-04）で `trackEvent` 本実装（実際の計装ライブラリ呼び出し）に差し替える。

---

## 計装ポイント 5 つ

| ポイント | 発生タイミング                      | イベント名                    | 実装場所               |
| -------- | ----------------------------------- | ----------------------------- | ---------------------- |
| 計装1    | ウィザード表示時（useEffect mount） | `wizard:start`                | `useEffect([], [])` 内 |
| 計装2    | Step 0 完了・次へ遷移時             | `wizard:step0:complete`       | `handleStep0Next()` 内 |
| 計装3    | `inferSmartDefaults` 呼び出し結果   | `wizard:smartDefaults:result` | `handleStep0Next()` 内 |
| 計装4    | Step 1 完了・生成開始時             | `wizard:step1:complete`       | `handleGenerate()` 内  |
| 計装5    | ウィザード完了（Step 2 到達）時     | `wizard:complete`             | `goToStep(2)` 後       |

---

## Wave 2 実装での対応状況

Wave 2 実装（`SkillCreateWizard.tsx` W2-seq-03a）では以下のように実装される:

- `handleStep0Next()`: `inferSmartDefaults` を呼び出し `smartDefaults` を設定（計装2・3相当）
- `handleGenerate()`: Step 1 の完了として `createSkill` を実行し、成功時に `goToStep(2)`（計装4・5相当）
- `handleQualityFeedback()`: `TODO(W3-seq-04)` コメント付きで Wave 3 待ち

Wave 3 で `trackEvent` を導入し、各ポイントに明示的なイベント発行を追加する。

---

## テスト方針

```typescript
// 計装ポイントのテスト例
const consoleSpy = vi.spyOn(console, "log");

// 計装2の確認
expect(consoleSpy).toHaveBeenCalledWith(
  "wizard:step0:complete",
  expect.any(Object),
);
```

`vi.spyOn(console, 'log')` でスタブ呼び出しを検証する。Wave 3 移行後は `trackEvent` mock に切り替える。
