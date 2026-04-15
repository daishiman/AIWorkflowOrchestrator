# Phase 4: テスト作成（TDD RED）

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | テスト作成（TDD RED）           |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 3: 設計レビュー           |
| 次Phase    | Phase 5: 実装（TDD GREEN）      |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

TDDのRed段階として、`VisualCronPicker` の direct input / custom cron モードに対する
月次バリデーションテストを実装前に作成する。
CV-01〜CV-12の全テストケースが失敗することを確認し、期待値を明確化する。

## 実行タスク

- Task 1: 事前確認 — 既存テストファイル・バリデーション関数の重複検出
- Task 2: テストマトリクス定義 — CV-01〜CV-12のテストケース定義（AC↔テスト名対応）
- Task 3: テストコード作成 — `VisualCronPicker.customValidation.test.tsx` にテストケース実装
- Task 4: RED確認 — テストが失敗することを確認してから実装フェーズへ進む

## 参照資料

| 資料名                   | パス                                                                                  | 用途                   |
| ------------------------ | ------------------------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計書           | `outputs/phase-2/design.md`                                                           | バリデーション仕様参照 |
| Phase 3 レビュー         | `outputs/phase-3/gate-decision.md`                                                    | 指摘事項確認           |
| VisualCronPicker.tsx     | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                  | 実装対象ファイル確認   |
| 既存バリデーションテスト | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` | 既存テスト確認         |

## 実行手順

### 0. 事前確認: 既存バリデーション重複検出【必須】

```bash
# validateCronSyntax / validateCronDayOfMonth の重複実装確認
grep -rn "validateCronSyntax\|validateCronDayOfMonth" apps/desktop/src/

# 既存テストファイルの現状確認
ls apps/desktop/src/__tests__/components/schedule/VisualCronPicker*.test.tsx

# 既存バリデーションテストの内容確認
head -30 apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx
```

### 1. テストマトリクス定義

| TC番号 | AC対応 | テスト名                                   | 入力                       | 期待結果                               |
| ------ | ------ | ------------------------------------------ | -------------------------- | -------------------------------------- |
| CV-01  | AC-1   | 空文字入力時にエラー表示                   | `""`                       | エラー表示 + onValidationChange(false) |
| CV-02  | AC-2   | フィールド数不足時にエラー表示             | `"0 9 * *"`（4フィールド） | エラー表示 + onValidationChange(false) |
| CV-03  | AC-3   | day-of-month=0でエラー表示                 | `"0 9 0 * *"`              | エラー表示 + onValidationChange(false) |
| CV-04  | AC-4   | day-of-month=32でエラー表示                | `"0 9 32 * *"`             | エラー表示 + onValidationChange(false) |
| CV-05  | AC-5   | 有効なcron式でエラーなし                   | `"0 9 15 * *"`             | エラーなし + onValidationChange(true)  |
| CV-06  | AC-5   | every-minuteで有効                         | `"* * * * *"`              | エラーなし + onValidationChange(true)  |
| CV-07  | AC-6   | dom=\*/2でエラーなし                       | `"0 9 */2 * *"`            | エラーなし + onValidationChange(true)  |
| CV-08  | AC-6   | dom=1-15区間でエラーなし                   | `"0 9 1-15 * *"`           | エラーなし + onValidationChange(true)  |
| CV-09  | AC-7   | visual→direct切り替え（初期値有効）        | モード切替                 | onValidationChange(true)               |
| CV-10  | AC-7   | visual(weeklyError=true)→direct切り替え    | モード切替                 | バリデーション再計算                   |
| CV-11  | AC-8   | onValidationChange=undefinedでレンダリング | props省略                  | エラーなく動作                         |
| CV-12  | AC-1   | 半角スペースのみ入力時にエラー表示         | `"   "`                    | エラー表示 + onValidationChange(false) |

### 2. テストコードスケルトン

テストファイル: `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx`

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VisualCronPicker } from "@/renderer/components/schedule/VisualCronPicker";

describe("VisualCronPicker - Custom Cron Validation", () => {
  const renderWithDirectInput = (
    directInput: string,
    onValidationChange?: (valid: boolean) => void,
  ) => {
    const utils = render(
      <VisualCronPicker
        value={directInput}
        onValidationChange={onValidationChange}
        onChange={() => {}}
      />,
    );
    const toggleButton = screen.queryByRole("button", { name: "高度な設定" });
    if (toggleButton) {
      fireEvent.click(toggleButton);
    }
    return utils;
  };

  const getDirectInputTextbox = () =>
    screen.getByRole("textbox", { name: "カスタムcron式" });

  const changeDirectInput = (value: string) => {
    fireEvent.change(getDirectInputTextbox(), { target: { value } });
  };

  const expectDirectInputError = (message: string) => {
    expect(screen.getByRole("alert")).toHaveTextContent(message);
  };

  const expectDirectInputValid = () => {
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  };

  describe("CV-01: 空文字入力", () => {
    it("should show error and call onValidationChange(false) for empty input", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("", onValidationChange);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  describe("CV-02: フィールド数不足", () => {
    it("should show error for 4-field cron expression", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 * *", onValidationChange);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  describe("CV-03: day-of-month=0", () => {
    it("should show error for day-of-month value of 0", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 0 * *", onValidationChange);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  describe("CV-04: day-of-month=32", () => {
    it("should show error for day-of-month value of 32", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 32 * *", onValidationChange);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  describe("CV-05: 有効なcron式", () => {
    it("should not show error for valid cron expression", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 15 * *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CV-06: every-minute", () => {
    it("should not show error for every-minute cron", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("* * * * *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CV-07: dom=*/2", () => {
    it("should not show error for step value in day-of-month", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 */2 * *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CV-08: dom=1-15 区間", () => {
    it("should not show error for range in day-of-month", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 1-15 * *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CV-09: visual→direct切り替え（初期値有効）", () => {
    it("should call onValidationChange(true) when switching to direct with valid initial value", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 15 * *", onValidationChange);
      expect(getDirectInputTextbox()).toHaveValue("0 9 15 * *");
      expectDirectInputValid();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("CV-10: visual(weeklyError)→direct切り替え", () => {
    it("should recalculate validation when switching from visual with error to direct", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 15 * *", onValidationChange);
      changeDirectInput("0 9 * *");
      expectDirectInputError(
        "cron式は5つのフィールドが必要です（分 時 日 月 曜日）",
      );
      expect(onValidationChange).toHaveBeenLastCalledWith(false);
    });
  });

  describe("CV-11: onValidationChange=undefined", () => {
    it("should render without error when onValidationChange is undefined", () => {
      expect(() => {
        renderWithDirectInput("0 9 15 * *", undefined);
      }).not.toThrow();
    });
  });

  describe("CV-12: 半角スペースのみ", () => {
    it("should show error for whitespace-only input", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("   ", onValidationChange);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });
});
```

### 3. Red確認コマンド（実装前にテストが失敗することを確認）

```bash
# テスト実行（全テストがFAILすることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.customValidation"
# 期待: FAIL（バリデーション関数未実装・role="alert"要素未出力）

# 既存テストへの悪影響がないことを確認
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"
# 期待: 既存テストは全PASS
```

## 統合テスト連携

| 判定項目       | 基準                       | 結果    |
| -------------- | -------------------------- | ------- |
| Red確認        | CV-01〜CV-12がFAILすること | pending |
| 既存テスト確認 | 既存テストが全てPASS       | pending |

## 多角的チェック観点

| チェック観点     | 確認内容                                                      | 結果    |
| ---------------- | ------------------------------------------------------------- | ------- |
| AC網羅性         | AC-1〜AC-8が全てテストケースにマッピングされているか          | pending |
| エッジケース     | 空文字・スペースのみ・境界値(0,32)がカバーされているか        | pending |
| モード切替テスト | visual→direct切替時のバリデーション再計算がテストされているか | pending |
| props省略テスト  | onValidationChange=undefinedのケースがテストされているか      | pending |
| テスト独立性     | 各テストケースが互いに独立して実行可能か                      | pending |

## 成果物

| 成果物       | パス                                                                                        | 説明                          |
| ------------ | ------------------------------------------------------------------------------------------- | ----------------------------- |
| テストコード | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | CV-01〜CV-12のテストケース    |
| テスト仕様書 | `outputs/phase-4/test-specifications.md`                                                    | テストマトリクス・RED確認証跡 |

## 完了条件

- [ ] 既存バリデーション重複検出（重複なし確認）
- [ ] テストマトリクス（CV-01〜CV-12）が定義済み
- [ ] AC-1〜AC-8と各テストケースの対応が明確化済み
- [ ] テストコードが `VisualCronPicker.customValidation.test.tsx` に作成されている
- [ ] Red確認（実装前にテストがFAILすること）が確認済み
- [ ] 既存テスト（VisualCronPicker.validation.test.tsx）への悪影響なし
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 5: 実装（TDD GREEN）](./phase-5-implementation.md)
