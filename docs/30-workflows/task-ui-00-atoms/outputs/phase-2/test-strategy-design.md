# テスト戦略設計 — Phase 2 成果物

## 概要

7コンポーネント合計139テストケースの設計戦略。テストカテゴリ、テーマテスト方式、テスト環境ルール（既知の落とし穴対策）、テスト数見積もりを定義する。

## 1. テストカテゴリ設計

### 9カテゴリ一覧

| #   | カテゴリ              | 内容                                  | 対象コンポーネント                                 |
| --- | --------------------- | ------------------------------------- | -------------------------------------------------- |
| 1   | レンダリング          | 基本描画、props による出力変化        | 全7コンポーネント                                  |
| 2   | バリアント/ステータス | variant / status / format の切替検証  | StatusIndicator, Badge, SkeletonCard, RelativeTime |
| 3   | サイズ                | size props によるサイズ変更           | StatusIndicator, Badge, SuggestionBubble           |
| 4   | インタラクション      | onClick, disabled, キーボード操作     | FilterChip, SuggestionBubble                       |
| 5   | アニメーション        | pulse, success-bounce, skeleton-pulse | StatusIndicator, SuggestionBubble, SkeletonCard    |
| 6   | アクセシビリティ      | ARIA 属性、role、tabIndex             | 全7コンポーネント                                  |
| 7   | タイマー              | setInterval, clearInterval            | RelativeTime                                       |
| 8   | 後方互換性            | 既存テストの PASS 維持                | Badge, EmptyState                                  |
| 9   | テーマ横断            | 3テーマでのレンダリング               | 全7コンポーネント                                  |

### カテゴリ詳細

#### 1. レンダリング

- デフォルト props での基本描画を確認
- 各 props の変化による出力の変化を検証
- children / content の優先順位（Badge）
- suggestions / compact / mood の描画（EmptyState）

#### 2. バリアント/ステータス

- StatusIndicator: 6種のステータスに対応するカラークラスの適用を検証
- Badge: 6種の variant に対応する `data-variant` 属性の検証
- SkeletonCard: 3種の variant に対応する内部構造の検証
- RelativeTime: 3種のフォーマット（auto / short / long）の出力検証

#### 3. サイズ

- StatusIndicator: sm / md / lg の Tailwind サイズクラス適用を検証
- Badge: sm / md のサイズクラス適用を検証
- SuggestionBubble: sm / md / lg の高さクラス適用を検証

#### 4. インタラクション

- FilterChip: onClick 発火、disabled 時の onClick 無効化
- SuggestionBubble: onClick 発火、disabled 時の onClick 無効化、disabled 時の tabIndex 変更
- キーボード操作: Enter / Space で onClick 発火（SuggestionBubble）

#### 5. アニメーション

- StatusIndicator: running 時のデフォルト pulse、pulse props 明示制御
- SuggestionBubble: クリック後の success-bounce クラス適用
- SkeletonCard: animate={true} でアニメーションクラス適用、animate={false} で非適用

#### 6. アクセシビリティ

- role 属性の検証（status / checkbox / button）
- aria-label の自動設定と上書きの検証
- aria-checked（FilterChip）
- aria-busy（SkeletonCard）
- aria-disabled（FilterChip, SuggestionBubble）
- tabIndex（SuggestionBubble）
- datetime 属性（RelativeTime）

#### 7. タイマー

- RelativeTime: refreshInterval に基づく自動更新の検証
- アンマウント時の clearInterval 実行の検証
- 無効タイムスタンプのフォールバック検証

#### 8. 後方互換性

- Badge: 既存17テスト（カラートークン移行による6件の修正含む）の PASS 維持
- EmptyState: 既存6テストの PASS 維持（DOM 構造・テキスト内容のアサーション）

#### 9. テーマ横断

- 3テーマ（kanagawa-dragon / light / dark）でのレンダリングエラー非発生を検証
- `describe.each` パターンで共通化

---

## 2. テーマテスト戦略

### 実装パターン

```typescript
const themes = ["kanagawa-dragon", "light", "dark"] as const;

describe.each(themes)("テーマ: %s", (theme) => {
  it("レンダリングエラーが発生しない", () => {
    const { container } = render(
      <div data-theme={theme}>
        <TargetComponent {...defaultProps} />
      </div>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

### テーマテスト適用方針

| コンポーネント   | テーマテスト数 | 追加検証                            |
| ---------------- | -------------- | ----------------------------------- |
| StatusIndicator  | 3              | 各テーマでの6ステータスレンダリング |
| FilterChip       | 3              | 各テーマでの選択/非選択レンダリング |
| Badge            | 3              | 各テーマでの6 variant レンダリング  |
| SkeletonCard     | 3              | 各テーマでの3 variant レンダリング  |
| SuggestionBubble | 3              | 各テーマでの3サイズレンダリング     |
| EmptyState       | 3              | 各テーマでの3 mood レンダリング     |
| RelativeTime     | 3              | 各テーマでの基本レンダリング        |

---

## 3. テスト環境ルール

### 既知の落とし穴（Pitfall）対策

| ルール                     | 根拠           | 適用箇所                       | 具体的な対策                                                                                                                           |
| -------------------------- | -------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `fireEvent` 使用           | P39            | 全インタラクションテスト       | happy-dom 環境では `userEvent` を使用せず `fireEvent` を使用。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む |
| `beforeEach` リセット      | P9             | 全テストファイル               | テスト間で状態を共有しない。モジュールスコープ変数のリセットを `beforeEach` で実行                                                     |
| `vi.advanceTimersByTime()` | P13            | RelativeTime タイマーテスト    | `runAllTimers` は使用禁止（無限ループリスク）。`advanceTimersByTime` で1ステップずつ進める                                             |
| `vi.useFakeTimers()`       | タイマー制御   | RelativeTime テスト全体        | テスト開始時にフェイクタイマーを有効化                                                                                                 |
| `vi.useRealTimers()`       | クリーンアップ | afterEach                      | テスト終了時にリアルタイマーに戻す                                                                                                     |
| Store 直接参照禁止         | P31            | 全コンポーネント（props 駆動） | Zustand Store を直接参照せず、props 経由で全データを受け取る設計                                                                       |

### テスト環境設定

```typescript
// テストファイル共通パターン
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// タイマーテスト（RelativeTime 用）
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

### テスト実行ディレクトリ（P40 対策）

テストは必ず `apps/desktop` ディレクトリから実行する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/
```

または:

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/atoms/
```

---

## 4. テスト数見積もり

### コンポーネント別内訳

#### StatusIndicator（20件）

| カテゴリ       | テスト内容                                                  | 件数 |
| -------------- | ----------------------------------------------------------- | ---- |
| レンダリング   | デフォルト描画、className 適用                              | 2    |
| ステータス     | 6種のステータスカラー適用                                   | 6    |
| サイズ         | sm / md / lg のサイズクラス                                 | 3    |
| アニメーション | running pulse デフォルト、pulse=true 明示、pulse=false 明示 | 3    |
| ARIA           | role="status"、aria-label デフォルト、aria-label 上書き     | 3    |
| テーマ         | 3テーマでのレンダリング                                     | 3    |

#### FilterChip（15件）

| カテゴリ         | テスト内容                                                | 件数 |
| ---------------- | --------------------------------------------------------- | ---- |
| レンダリング     | デフォルト描画、label 表示                                | 2    |
| スタイル         | 選択時スタイル、非選択時スタイル                          | 2    |
| インタラクション | onClick 発火、disabled 時 onClick 無効、disabled スタイル | 3    |
| count/icon       | count 表示、icon 表示                                     | 2    |
| ARIA             | role="checkbox"、aria-checked、aria-disabled              | 3    |
| テーマ           | 3テーマでのレンダリング                                   | 3    |

#### Badge（27件）

| カテゴリ   | テスト内容                                  | 件数 |
| ---------- | ------------------------------------------- | ---- |
| 既存維持   | 既存17テスト（カラートークン修正6件含む）   | 17   |
| primary    | primary variant 描画、primary data-variant  | 2    |
| content    | content 文字列、content 数値、children 優先 | 3    |
| aria-label | number 時の自動設定、明示上書き             | 2    |
| テーマ     | 3テーマでのレンダリング                     | 3    |

#### SkeletonCard（13件）

| カテゴリ       | テスト内容                                    | 件数 |
| -------------- | --------------------------------------------- | ---- |
| バリエーション | default / stat / list-item 内部構造           | 3    |
| アニメーション | animate=true クラス適用、animate=false 非適用 | 2    |
| カスタム値     | height 適用、borderRadius 適用                | 2    |
| ARIA           | role="status"、aria-label、aria-busy          | 3    |
| テーマ         | 3テーマでのレンダリング                       | 3    |

#### SuggestionBubble（21件）

| カテゴリ         | テスト内容                                                                      | 件数 |
| ---------------- | ------------------------------------------------------------------------------- | ---- |
| レンダリング     | デフォルト描画、icon 表示                                                       | 2    |
| サイズ           | sm / md / lg のサイズクラス                                                     | 3    |
| インタラクション | onClick 発火、disabled 時 onClick 無効、disabled 時 tabIndex、disabled スタイル | 4    |
| disabled         | opacity-50 適用、cursor-not-allowed 適用                                        | 2    |
| キーボード       | Enter で onClick、Space で onClick                                              | 2    |
| アニメーション   | クリック後 bounce クラス、300ms 後 bounce 解除                                  | 2    |
| ARIA             | role="button"、tabIndex=0、aria-disabled                                        | 3    |
| テーマ           | 3テーマでのレンダリング                                                         | 3    |

#### EmptyState（18件）

| カテゴリ    | テスト内容                                       | 件数 |
| ----------- | ------------------------------------------------ | ---- |
| 既存維持    | 既存6テスト                                      | 6    |
| suggestions | suggestions 描画、SuggestionBubble size="sm"     | 2    |
| compact     | compact パディング、compact フォントサイズ       | 2    |
| mood        | welcoming / encouraging / celebrating のスタイル | 3    |
| action-obj  | オブジェクト形式 action 描画、variant 適用       | 2    |
| テーマ      | 3テーマでのレンダリング                          | 3    |

#### RelativeTime（25件）

| カテゴリ       | テスト内容                                                                | 件数 |
| -------------- | ------------------------------------------------------------------------- | ---- |
| フォーマット   | auto 5境界値 + short 5境界値 + long 5境界値                               | 15   |
| タイマー       | refreshInterval での更新、アンマウント時 clearInterval、カスタム interval | 3    |
| ツールチップ   | title 属性表示、showAbsoluteOnHover=false                                 | 2    |
| datetime       | datetime 属性の設定                                                       | 1    |
| フォールバック | 無効タイムスタンプ時の "--" 表示                                          | 1    |
| テーマ         | 3テーマでのレンダリング                                                   | 3    |

### 合計

| コンポーネント   | テスト数 |
| ---------------- | -------- |
| StatusIndicator  | 20       |
| FilterChip       | 15       |
| Badge            | 27       |
| SkeletonCard     | 13       |
| SuggestionBubble | 21       |
| EmptyState       | 18       |
| RelativeTime     | 25       |
| **合計**         | **139**  |

---

## 5. テストファイル構成

### ファイル一覧

| コンポーネント   | テストファイルパス                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| StatusIndicator  | `apps/desktop/src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx`             |
| FilterChip       | `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`                       |
| Badge            | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`（既存ファイルに追加）           |
| SkeletonCard     | `apps/desktop/src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx`                   |
| SuggestionBubble | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx`           |
| EmptyState       | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`（既存ファイルに追加） |
| RelativeTime     | `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx`                   |

### テストファイル構造テンプレート

```typescript
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ComponentName } from "./index";

const defaultProps: ComponentNameProps = {
  // デフォルト props
};

describe("ComponentName", () => {
  beforeEach(() => {
    // 状態リセット（P9 対策）
  });

  describe("レンダリング", () => {
    it("デフォルト props で描画される", () => {
      // ...
    });
  });

  describe("バリアント/ステータス", () => {
    // ...
  });

  describe("インタラクション", () => {
    // fireEvent 使用（P39 対策）
  });

  describe("アクセシビリティ", () => {
    // ARIA 属性検証
  });

  const themes = ["kanagawa-dragon", "light", "dark"] as const;
  describe.each(themes)("テーマ: %s", (theme) => {
    it("レンダリングエラーが発生しない", () => {
      // ...
    });
  });
});
```

---

## 6. 後方互換性テスト戦略

### Badge 既存テスト修正方針（6件）

| テスト名                                | 修正内容                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| defaultバリアントのスタイルを適用する   | `toHaveClass("bg-gray-600")` を `toHaveAttribute("data-variant", "default")` に変更   |
| successバリアントのスタイルを適用する   | `toHaveClass("bg-green-500")` を `toHaveAttribute("data-variant", "success")` に変更  |
| warningバリアントのスタイルを適用する   | `toHaveClass("bg-orange-400")` を `toHaveAttribute("data-variant", "warning")` に変更 |
| errorバリアントのスタイルを適用する     | `toHaveClass("bg-red-500")` を `toHaveAttribute("data-variant", "error")` に変更      |
| infoバリアントのスタイルを適用する      | `toHaveClass("bg-blue-500")` を `toHaveAttribute("data-variant", "info")` に変更      |
| デフォルトでdefaultバリアントを使用する | `toHaveClass("bg-gray-600")` を `toHaveAttribute("data-variant", "default")` に変更   |

### EmptyState 既存テスト影響

既存6テストへの影響なし（テキスト内容・DOM 構造のアサーションのみで、クラス名アサーションなし）。
