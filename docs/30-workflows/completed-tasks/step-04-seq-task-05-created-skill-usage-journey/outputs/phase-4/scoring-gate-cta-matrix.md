# Phase 4 ScoringGate × CTA 制御マトリクステスト仕様

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05    |
| タスク名 | 作成済みスキルを使う主導線 |
| Phase    | 4                          |
| 作成日   | 2026-03-15                 |

---

## 概要

`ScoringGate` の4段階と CTA（Call To Action）4種の組み合わせ 16 パターンを網羅する。
各パターンについて DOM 状態（disabled / primary / secondary / hidden / visible）を検証し、
ユーザーが誤った操作を実行できない安全性と、適切な誘導が行われることを確認する。

---

## ScoringGate 定義

| 段階 | スコア範囲 | 識別子              | 保存可否 | 利用可否   |
| ---- | ---------- | ------------------- | -------- | ---------- |
| 1    | 0 〜 59    | `NEEDS_IMPROVEMENT` | 不可     | 不可       |
| 2    | 60 〜 79   | `SAVE_ALLOWED`      | 可       | 不可       |
| 3    | 80 〜 99   | `USE_ALLOWED`       | 可       | 可         |
| 4    | 100        | `RECOMMENDED`       | 可       | 可（推奨） |

## CTA 定義

| 識別子                    | ラベル           | 役割                                       |
| ------------------------- | ---------------- | ------------------------------------------ |
| `CTA_USE_NOW`             | 今すぐ使う       | スキルを即時実行する                       |
| `CTA_SAVE_LATER`          | 保存して後で使う | スキルを保存し、後から利用できる状態にする |
| `CTA_IMPROVE_FIRST`       | 改善してから使う | 評価・修正フローへ戻る                     |
| `CTA_IMPROVE_RECOMMENDED` | 改善を推奨       | 推奨改善を促すテキストリンク（非破壊的）   |

---

## 16 パターン マトリクス

### TC-MATRIX-01

| 項目        | 値                                  |
| ----------- | ----------------------------------- |
| TC ID       | TC-MATRIX-01                        |
| ScoringGate | `NEEDS_IMPROVEMENT`（score: 0〜59） |
| CTA         | 今すぐ使う（`CTA_USE_NOW`）         |
| 期待状態    | `disabled`                          |

**前提条件**

- `canUse = false`、`canSave = false`
- score は 0〜59 の任意値（代表値: 45）

**検証手順**

1. `canUse={false}` を prop として渡してコンポーネントをレンダリングする
2. 「今すぐ使う」ボタンの DOM 要素を取得する
3. `disabled` 属性が存在することを確認する
4. ボタン上にホバーしてツールチップが表示されることを確認する
5. ツールチップのテキストが期待メッセージと一致することを確認する

**ツールチップメッセージ（disabled 時）**

```
スコアが80点以上になると利用できます（現在: 45点）
```

**合否基準**

- PASS: `button[disabled]` または `aria-disabled="true"` が確認できる
- PASS: ツールチップに「80点以上」と現在スコアが表示される
- FAIL: ボタンがクリック可能な状態になっている
- FAIL: クリック時にスキル実行が呼ばれる

---

### TC-MATRIX-02

| 項目        | 値                                   |
| ----------- | ------------------------------------ |
| TC ID       | TC-MATRIX-02                         |
| ScoringGate | `NEEDS_IMPROVEMENT`（score: 0〜59）  |
| CTA         | 保存して後で使う（`CTA_SAVE_LATER`） |
| 期待状態    | `disabled`                           |

**前提条件**

- `canUse = false`、`canSave = false`
- score は 0〜59 の任意値（代表値: 45）

**検証手順**

1. `canSave={false}` を prop として渡してコンポーネントをレンダリングする
2. 「保存して後で使う」ボタンの DOM 要素を取得する
3. `disabled` 属性が存在することを確認する
4. ボタン上にホバーしてツールチップが表示されることを確認する
5. ツールチップのテキストが期待メッセージと一致することを確認する

**ツールチップメッセージ（disabled 時）**

```
スコアが60点以上になると保存できます（現在: 45点）
```

**合否基準**

- PASS: `button[disabled]` または `aria-disabled="true"` が確認できる
- PASS: ツールチップに「60点以上」と現在スコアが表示される
- FAIL: ボタンがクリック可能な状態になっている
- FAIL: クリック時に保存処理が呼ばれる

---

### TC-MATRIX-03

| 項目        | 値                                      |
| ----------- | --------------------------------------- |
| TC ID       | TC-MATRIX-03                            |
| ScoringGate | `NEEDS_IMPROVEMENT`（score: 0〜59）     |
| CTA         | 改善してから使う（`CTA_IMPROVE_FIRST`） |
| 期待状態    | `primary`（主要アクション）             |

**前提条件**

- `canUse = false`、`canSave = false`
- score は 0〜59 の任意値（代表値: 45）

**検証手順**

1. `scoringGate="NEEDS_IMPROVEMENT"` を prop として渡してレンダリングする
2. 「改善してから使う」ボタンを取得する
3. `primary` スタイルクラスが適用されていることを確認する
4. `disabled` 属性が存在しないことを確認する
5. クリック時に改善フローへの遷移ハンドラが呼ばれることを確認する

**合否基準**

- PASS: primary スタイル（`variant="primary"` 相当）が適用されている
- PASS: `disabled` 属性が存在しない
- PASS: クリック時にコールバックが呼ばれる
- FAIL: ボタンが hidden または disabled になっている

---

### TC-MATRIX-04

| 項目        | 値                                      |
| ----------- | --------------------------------------- |
| TC ID       | TC-MATRIX-04                            |
| ScoringGate | `NEEDS_IMPROVEMENT`（score: 0〜59）     |
| CTA         | 改善を推奨（`CTA_IMPROVE_RECOMMENDED`） |
| 期待状態    | `hidden`                                |

**前提条件**

- `canUse = false`、`canSave = false`
- score は 0〜59

**検証手順**

1. `scoringGate="NEEDS_IMPROVEMENT"` を prop として渡してレンダリングする
2. 「改善を推奨」要素が DOM に存在しないことを確認する（`queryByText` が null）

**合否基準**

- PASS: 「改善を推奨」テキストを持つ要素が DOM に存在しない
- FAIL: 要素が hidden CSS で非表示になっているがDOMには存在する（`display: none` は FAIL）

---

### TC-MATRIX-05

| 項目        | 値                              |
| ----------- | ------------------------------- |
| TC ID       | TC-MATRIX-05                    |
| ScoringGate | `SAVE_ALLOWED`（score: 60〜79） |
| CTA         | 今すぐ使う（`CTA_USE_NOW`）     |
| 期待状態    | `disabled`                      |

**前提条件**

- `canUse = false`、`canSave = true`
- score は 60〜79 の任意値（代表値: 70）

**検証手順**

1. `canUse={false}` を prop として渡してレンダリングする
2. 「今すぐ使う」ボタンに `disabled` 属性があることを確認する
3. ツールチップに「80点以上」と「現在: 70点」が表示されることを確認する

**ツールチップメッセージ（disabled 時）**

```
スコアが80点以上になると利用できます（現在: 70点）
```

**合否基準**

- PASS: `disabled` 属性が存在する
- PASS: ツールチップに正しいスコアが表示される
- FAIL: ボタンがクリック可能

---

### TC-MATRIX-06

| 項目        | 値                                   |
| ----------- | ------------------------------------ |
| TC ID       | TC-MATRIX-06                         |
| ScoringGate | `SAVE_ALLOWED`（score: 60〜79）      |
| CTA         | 保存して後で使う（`CTA_SAVE_LATER`） |
| 期待状態    | `primary`（主要アクション）          |

**前提条件**

- `canUse = false`、`canSave = true`
- score は 60〜79

**検証手順**

1. `canSave={true}` かつ `canUse={false}` を prop として渡してレンダリングする
2. 「保存して後で使う」ボタンが primary スタイルであることを確認する
3. `disabled` 属性が存在しないことを確認する
4. クリック時に保存ハンドラが呼ばれることを確認する

**合否基準**

- PASS: primary スタイルが適用されている
- PASS: クリック時に保存処理が呼ばれる
- FAIL: `disabled` 属性が存在する

---

### TC-MATRIX-07

| 項目        | 値                                      |
| ----------- | --------------------------------------- |
| TC ID       | TC-MATRIX-07                            |
| ScoringGate | `SAVE_ALLOWED`（score: 60〜79）         |
| CTA         | 改善してから使う（`CTA_IMPROVE_FIRST`） |
| 期待状態    | `secondary`（サブアクション）           |

**前提条件**

- `canUse = false`、`canSave = true`
- score は 60〜79

**検証手順**

1. `scoringGate="SAVE_ALLOWED"` を prop として渡してレンダリングする
2. 「改善してから使う」ボタンが secondary スタイルであることを確認する
3. `disabled` 属性が存在しないことを確認する

**合否基準**

- PASS: secondary スタイル（`variant="secondary"` 相当）が適用されている
- PASS: `disabled` 属性が存在しない
- FAIL: primary スタイルになっている（primary は TC-MATRIX-06 の「保存して後で使う」に割り当て済み）

---

### TC-MATRIX-08

| 項目        | 値                                      |
| ----------- | --------------------------------------- |
| TC ID       | TC-MATRIX-08                            |
| ScoringGate | `SAVE_ALLOWED`（score: 60〜79）         |
| CTA         | 改善を推奨（`CTA_IMPROVE_RECOMMENDED`） |
| 期待状態    | `visible`（テキストリンク）             |

**前提条件**

- `canUse = false`、`canSave = true`
- score は 60〜79

**検証手順**

1. `scoringGate="SAVE_ALLOWED"` を prop として渡してレンダリングする
2. 「改善を推奨」テキストリンクが DOM に存在することを確認する
3. ボタン形式ではなくテキストリンク形式（`<a>` または `role="link"` など）であることを確認する
4. `disabled` 属性が存在しないことを確認する

**合否基準**

- PASS: テキストリンク要素が DOM に存在する
- PASS: ボタン形式ではなくリンク形式（非破壊的な表現）
- FAIL: 要素が DOM に存在しない
- FAIL: primary ボタンとして表示される

---

### TC-MATRIX-09

| 項目        | 値                             |
| ----------- | ------------------------------ |
| TC ID       | TC-MATRIX-09                   |
| ScoringGate | `USE_ALLOWED`（score: 80〜99） |
| CTA         | 今すぐ使う（`CTA_USE_NOW`）    |
| 期待状態    | `primary`（主要アクション）    |

**前提条件**

- `canUse = true`、`canSave = true`
- score は 80〜99 の任意値（代表値: 85）

**検証手順**

1. `canUse={true}` を prop として渡してレンダリングする
2. 「今すぐ使う」ボタンが primary スタイルであることを確認する
3. `disabled` 属性が存在しないことを確認する
4. クリック時にスキル実行ハンドラが呼ばれることを確認する

**合否基準**

- PASS: primary スタイルが適用されている
- PASS: `disabled` 属性が存在しない
- PASS: クリック時に実行処理が呼ばれる
- FAIL: disabled になっている

---

### TC-MATRIX-10

| 項目        | 値                                   |
| ----------- | ------------------------------------ |
| TC ID       | TC-MATRIX-10                         |
| ScoringGate | `USE_ALLOWED`（score: 80〜99）       |
| CTA         | 保存して後で使う（`CTA_SAVE_LATER`） |
| 期待状態    | `secondary`（サブアクション）        |

**前提条件**

- `canUse = true`、`canSave = true`
- score は 80〜99

**検証手順**

1. `canSave={true}` かつ `canUse={true}` を prop として渡してレンダリングする
2. 「保存して後で使う」ボタンが secondary スタイルであることを確認する
3. クリック時に保存ハンドラが呼ばれることを確認する

**合否基準**

- PASS: secondary スタイルが適用されている
- PASS: クリック時に保存処理が呼ばれる
- FAIL: primary スタイルになっている（primary は TC-MATRIX-09 の「今すぐ使う」に割り当て済み）

---

### TC-MATRIX-11

| 項目        | 値                                      |
| ----------- | --------------------------------------- |
| TC ID       | TC-MATRIX-11                            |
| ScoringGate | `USE_ALLOWED`（score: 80〜99）          |
| CTA         | 改善してから使う（`CTA_IMPROVE_FIRST`） |
| 期待状態    | `hidden`                                |

**前提条件**

- `canUse = true`、`canSave = true`
- score は 80〜99

**検証手順**

1. `scoringGate="USE_ALLOWED"` を prop として渡してレンダリングする
2. 「改善してから使う」要素が DOM に存在しないことを確認する

**合否基準**

- PASS: 「改善してから使う」テキストを持つ要素が DOM に存在しない
- FAIL: CSS で非表示になっているがDOMには存在する

---

### TC-MATRIX-12

| 項目        | 値                                      |
| ----------- | --------------------------------------- |
| TC ID       | TC-MATRIX-12                            |
| ScoringGate | `USE_ALLOWED`（score: 80〜99）          |
| CTA         | 改善を推奨（`CTA_IMPROVE_RECOMMENDED`） |
| 期待状態    | `visible`（テキストリンク）             |

**前提条件**

- `canUse = true`、`canSave = true`
- score は 80〜99

**検証手順**

1. `scoringGate="USE_ALLOWED"` を prop として渡してレンダリングする
2. 「改善を推奨」テキストリンクが DOM に存在することを確認する
3. テキストリンク形式であることを確認する

**合否基準**

- PASS: テキストリンク要素が DOM に存在する
- FAIL: 要素が存在しない
- FAIL: ボタン形式で表示される

---

### TC-MATRIX-13

| 項目        | 値                          |
| ----------- | --------------------------- |
| TC ID       | TC-MATRIX-13                |
| ScoringGate | `RECOMMENDED`（score: 100） |
| CTA         | 今すぐ使う（`CTA_USE_NOW`） |
| 期待状態    | `primary`（ハイライト付き） |

**前提条件**

- `canUse = true`、`canSave = true`
- score = 100

**検証手順**

1. `scoringGate="RECOMMENDED"` かつ `score={100}` を prop として渡してレンダリングする
2. 「今すぐ使う」ボタンが primary スタイルであることを確認する
3. `RECOMMENDED` 専用のハイライトスタイル（推奨バッジ、強調色など）が適用されていることを確認する
4. `disabled` 属性が存在しないことを確認する
5. クリック時にスキル実行ハンドラが呼ばれることを確認する

**合否基準**

- PASS: primary スタイル + `RECOMMENDED` ハイライトクラスが両方適用されている
- PASS: `disabled` 属性が存在しない
- PASS: クリック時に実行処理が呼ばれる
- FAIL: 通常の primary スタイルのみで RECOMMENDED ハイライトがない（USE_ALLOWED と区別できない）

---

### TC-MATRIX-14

| 項目        | 値                                   |
| ----------- | ------------------------------------ |
| TC ID       | TC-MATRIX-14                         |
| ScoringGate | `RECOMMENDED`（score: 100）          |
| CTA         | 保存して後で使う（`CTA_SAVE_LATER`） |
| 期待状態    | `secondary`（サブアクション）        |

**前提条件**

- `canUse = true`、`canSave = true`
- score = 100

**検証手順**

1. `scoringGate="RECOMMENDED"` を prop として渡してレンダリングする
2. 「保存して後で使う」ボタンが secondary スタイルであることを確認する

**合否基準**

- PASS: secondary スタイルが適用されている
- FAIL: primary スタイルになっている

---

### TC-MATRIX-15

| 項目        | 値                                      |
| ----------- | --------------------------------------- |
| TC ID       | TC-MATRIX-15                            |
| ScoringGate | `RECOMMENDED`（score: 100）             |
| CTA         | 改善してから使う（`CTA_IMPROVE_FIRST`） |
| 期待状態    | `hidden`                                |

**前提条件**

- `canUse = true`、`canSave = true`
- score = 100

**検証手順**

1. `scoringGate="RECOMMENDED"` を prop として渡してレンダリングする
2. 「改善してから使う」要素が DOM に存在しないことを確認する

**合否基準**

- PASS: 要素が DOM に存在しない
- FAIL: 要素が存在する（100点でありながら改善を促す表示は誤誘導）

---

### TC-MATRIX-16

| 項目        | 値                                      |
| ----------- | --------------------------------------- |
| TC ID       | TC-MATRIX-16                            |
| ScoringGate | `RECOMMENDED`（score: 100）             |
| CTA         | 改善を推奨（`CTA_IMPROVE_RECOMMENDED`） |
| 期待状態    | `hidden`                                |

**前提条件**

- `canUse = true`、`canSave = true`
- score = 100

**検証手順**

1. `scoringGate="RECOMMENDED"` を prop として渡してレンダリングする
2. 「改善を推奨」要素が DOM に存在しないことを確認する

**合否基準**

- PASS: 要素が DOM に存在しない
- FAIL: 要素が存在する（100点で改善を推奨するのは矛盾）

---

## getCTAVisibility() 関数テスト設計

### 概要

`getCTAVisibility(scoringGate, ctaType)` は上記マトリクスのロジックを純粋関数として実装する。
UI コンポーネントから分離することで、表示ロジックのユニットテストを容易にする。

### 関数シグネチャ

```typescript
type CTAState = "primary" | "secondary" | "disabled" | "visible" | "hidden";

type ScoringGate =
  | "NEEDS_IMPROVEMENT"
  | "SAVE_ALLOWED"
  | "USE_ALLOWED"
  | "RECOMMENDED";

type CTAType =
  | "USE_NOW"
  | "SAVE_LATER"
  | "IMPROVE_FIRST"
  | "IMPROVE_RECOMMENDED";

function getCTAVisibility(scoringGate: ScoringGate, ctaType: CTAType): CTAState;
```

### TC-GETCTAVIS-01: NEEDS_IMPROVEMENT の全 CTA

```typescript
// テストコード例
describe('getCTAVisibility', () => {
  describe('NEEDS_IMPROVEMENT', () => {
    it('USE_NOW は disabled を返す', () => {
      expect(getCTAVisibility('NEEDS_IMPROVEMENT', 'USE_NOW')).toBe('disabled');
    });
    it('SAVE_LATER は disabled を返す', () => {
      expect(getCTAVisibility('NEEDS_IMPROVEMENT', 'SAVE_LATER')).toBe('disabled');
    });
    it('IMPROVE_FIRST は primary を返す', () => {
      expect(getCTAVisibility('NEEDS_IMPROVEMENT', 'IMPROVE_FIRST')).toBe('primary');
    });
    it('IMPROVE_RECOMMENDED は hidden を返す', () => {
      expect(getCTAVisibility('NEEDS_IMPROVEMENT', 'IMPROVE_RECOMMENDED')).toBe('hidden');
    });
  });
```

### TC-GETCTAVIS-02: SAVE_ALLOWED の全 CTA

```typescript
describe("SAVE_ALLOWED", () => {
  it("USE_NOW は disabled を返す", () => {
    expect(getCTAVisibility("SAVE_ALLOWED", "USE_NOW")).toBe("disabled");
  });
  it("SAVE_LATER は primary を返す", () => {
    expect(getCTAVisibility("SAVE_ALLOWED", "SAVE_LATER")).toBe("primary");
  });
  it("IMPROVE_FIRST は secondary を返す", () => {
    expect(getCTAVisibility("SAVE_ALLOWED", "IMPROVE_FIRST")).toBe("secondary");
  });
  it("IMPROVE_RECOMMENDED は visible を返す", () => {
    expect(getCTAVisibility("SAVE_ALLOWED", "IMPROVE_RECOMMENDED")).toBe(
      "visible",
    );
  });
});
```

### TC-GETCTAVIS-03: USE_ALLOWED の全 CTA

```typescript
describe("USE_ALLOWED", () => {
  it("USE_NOW は primary を返す", () => {
    expect(getCTAVisibility("USE_ALLOWED", "USE_NOW")).toBe("primary");
  });
  it("SAVE_LATER は secondary を返す", () => {
    expect(getCTAVisibility("USE_ALLOWED", "SAVE_LATER")).toBe("secondary");
  });
  it("IMPROVE_FIRST は hidden を返す", () => {
    expect(getCTAVisibility("USE_ALLOWED", "IMPROVE_FIRST")).toBe("hidden");
  });
  it("IMPROVE_RECOMMENDED は visible を返す", () => {
    expect(getCTAVisibility("USE_ALLOWED", "IMPROVE_RECOMMENDED")).toBe(
      "visible",
    );
  });
});
```

### TC-GETCTAVIS-04: RECOMMENDED の全 CTA

```typescript
  describe('RECOMMENDED', () => {
    it('USE_NOW は primary を返す', () => {
      expect(getCTAVisibility('RECOMMENDED', 'USE_NOW')).toBe('primary');
    });
    it('SAVE_LATER は secondary を返す', () => {
      expect(getCTAVisibility('RECOMMENDED', 'SAVE_LATER')).toBe('secondary');
    });
    it('IMPROVE_FIRST は hidden を返す', () => {
      expect(getCTAVisibility('RECOMMENDED', 'IMPROVE_FIRST')).toBe('hidden');
    });
    it('IMPROVE_RECOMMENDED は hidden を返す', () => {
      expect(getCTAVisibility('RECOMMENDED', 'IMPROVE_RECOMMENDED')).toBe('hidden');
    });
  });
});
```

### TC-GETCTAVIS-05: primary の一意性検証

各 ScoringGate で `primary` を返す CTA は必ず 1 つのみであることを確認する。

```typescript
describe("primary の一意性", () => {
  const allGates: ScoringGate[] = [
    "NEEDS_IMPROVEMENT",
    "SAVE_ALLOWED",
    "USE_ALLOWED",
    "RECOMMENDED",
  ];
  const allCTAs: CTAType[] = [
    "USE_NOW",
    "SAVE_LATER",
    "IMPROVE_FIRST",
    "IMPROVE_RECOMMENDED",
  ];

  allGates.forEach((gate) => {
    it(`${gate} で primary になる CTA は 1 つのみ`, () => {
      const primaryCount = allCTAs.filter(
        (cta) => getCTAVisibility(gate, cta) === "primary",
      ).length;
      expect(primaryCount).toBe(1);
    });
  });
});
```

---

## disabled 時ツールチップメッセージ仕様

### getDisabledTooltip() 関数テスト設計

```typescript
function getDisabledTooltip(
  ctaType: CTAType,
  currentScore: number,
): string | null;
```

| CTA          | 条件              | 返却メッセージ                                            |
| ------------ | ----------------- | --------------------------------------------------------- |
| `USE_NOW`    | `canUse = false`  | `スコアが80点以上になると利用できます（現在: {score}点）` |
| `SAVE_LATER` | `canSave = false` | `スコアが60点以上になると保存できます（現在: {score}点）` |
| `USE_NOW`    | `canUse = true`   | `null`（ツールチップ非表示）                              |
| `SAVE_LATER` | `canSave = true`  | `null`（ツールチップ非表示）                              |

### TC-TOOLTIP-01: USE_NOW disabled 時のメッセージ

```typescript
it("USE_NOW disabled 時に正しいメッセージを返す", () => {
  expect(getDisabledTooltip("USE_NOW", 45)).toBe(
    "スコアが80点以上になると利用できます（現在: 45点）",
  );
  expect(getDisabledTooltip("USE_NOW", 0)).toBe(
    "スコアが80点以上になると利用できます（現在: 0点）",
  );
  expect(getDisabledTooltip("USE_NOW", 79)).toBe(
    "スコアが80点以上になると利用できます（現在: 79点）",
  );
});
```

### TC-TOOLTIP-02: SAVE_LATER disabled 時のメッセージ

```typescript
it("SAVE_LATER disabled 時に正しいメッセージを返す", () => {
  expect(getDisabledTooltip("SAVE_LATER", 45)).toBe(
    "スコアが60点以上になると保存できます（現在: 45点）",
  );
  expect(getDisabledTooltip("SAVE_LATER", 0)).toBe(
    "スコアが60点以上になると保存できます（現在: 0点）",
  );
  expect(getDisabledTooltip("SAVE_LATER", 59)).toBe(
    "スコアが60点以上になると保存できます（現在: 59点）",
  );
});
```

### TC-TOOLTIP-03: enabled 時は null

```typescript
it("enabled 時は null を返す", () => {
  expect(getDisabledTooltip("USE_NOW", 80)).toBeNull();
  expect(getDisabledTooltip("SAVE_LATER", 60)).toBeNull();
});
```

---

## 境界値テスト

| TC ID          | score | 期待 ScoringGate    | 検証観点                     |
| -------------- | ----- | ------------------- | ---------------------------- |
| TC-BOUNDARY-01 | 59    | `NEEDS_IMPROVEMENT` | 上限境界値、保存不可         |
| TC-BOUNDARY-02 | 60    | `SAVE_ALLOWED`      | 下限境界値、保存可・利用不可 |
| TC-BOUNDARY-03 | 79    | `SAVE_ALLOWED`      | 上限境界値、利用不可         |
| TC-BOUNDARY-04 | 80    | `USE_ALLOWED`       | 下限境界値、利用可           |
| TC-BOUNDARY-05 | 99    | `USE_ALLOWED`       | 上限境界値                   |
| TC-BOUNDARY-06 | 100   | `RECOMMENDED`       | 最大値、全機能解放           |
| TC-BOUNDARY-07 | 0     | `NEEDS_IMPROVEMENT` | 最小値                       |
