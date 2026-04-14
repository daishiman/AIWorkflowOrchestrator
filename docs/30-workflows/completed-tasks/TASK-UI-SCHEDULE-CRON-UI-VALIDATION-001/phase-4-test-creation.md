# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 4                                       |
| 機能名 | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| 作成日 | 2026-04-13                              |

## 目的

TDD の Red 段階として、実装前にテストを先行作成する。
`VisualCronPicker` の UIバリデーション（週次空曜日エラー・月次日付エラー・`onValidationChange` コールバック）に関するテストを作成し、
現時点で RED（失敗）することを確認する。
これにより「バリデーション未実装の証明」としてのテストが機能することを事前検証する。

> **TDD パターンの明確化**:
>
> 1. まずテストコードを書く（本 Phase 4）
> 2. テストが FAIL することを確認する（RED 確認）
> 3. テストが PASS するように実装する（Phase 5: GREEN）
> 4. リファクタリングする（Phase 6 以降）

---

## 実行タスク

- **タスク1**: 事前確認 — 既存テスト構造・コンポーネント現状・副作用チェック
- **タスク2**: テストシナリオテーブル（VAL-W-01〜VAL-CB-01）の設計
- **タスク3**: `VisualCronPicker.validation.test.tsx` の新規作成（先行作成）
- **タスク4**: RED 確認（実装前の FAIL 確認）
- **タスク5**: テストマトリクスと RED 確認結果の記録

---

## テストシナリオ

### テストシナリオテーブル（VAL-W-01〜VAL-CB-01）

| テストID  | テスト名                                               | 入力・操作                              | 期待結果                                       |
| --------- | ------------------------------------------------------ | --------------------------------------- | ---------------------------------------------- |
| VAL-W-01  | weekly + 月曜日選択済みでレンダリング                  | `value="0 9 * * 1"`                     | エラーメッセージが DOM に存在しない            |
| VAL-W-02  | weekly + 月曜日を解除して空曜日にする                  | 月曜日ボタンをクリック                  | `false` で呼ばれる                             |
| VAL-W-03  | weekly + 空曜日から月曜日を再選択する                  | 月曜日ボタンを再クリック                | エラーメッセージが消える + `true` コールバック |
| VAL-M-01  | monthly + 最小範囲外（0）でレンダリング                | `value="0 9 0 * *"`                     | エラーメッセージが DOM に存在する              |
| VAL-M-02  | monthly + 最大範囲外（32）でレンダリング               | `value="0 9 32 * *"`                    | エラーメッセージが DOM に存在する              |
| VAL-M-03  | monthly + 有効な日付（15）でレンダリング               | `value="0 9 15 * *"`                    | エラーメッセージが DOM に存在しない            |
| VAL-M-04  | monthly + 無効日付で `onValidationChange` コールバック | `value="0 9 0 * *"`                     | `false` で呼ばれる                             |
| VAL-CB-01 | `onValidationChange` なしでレンダリング                | `onValidationChange` プロップを渡さない | エラーなく動作する                             |

---

## 参照資料

| 資料名                      | パス                                                                                                  | 説明                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1 要件定義            | `phase-1-requirements.md`                                                                             | バリデーション要件・AC・実装戦略の前提     |
| Phase 2 設計                | `phase-2-design.md`                                                                                   | コンポーネント設計・プロップ設計           |
| Phase 3 レビュー結果        | `outputs/phase-3/design-review-result.md`                                                             | PASS 判定確認・採用アプローチ確認          |
| VisualCronPicker 実装       | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                                  | 現状実装確認（バリデーション未実装の確認） |
| WEEKDAYS-GUARD Phase 4 参照 | `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/phase-4-test-creation.md` | テスト作成フェーズの構造参考               |

---

## 実行手順

### ステップ0: Phase 4 事前確認【必須】

```bash
# 1. VisualCronPicker の現状実装確認（バリデーション未実装の確認）
grep -n "onValidationChange\|monthlyError\|weeklyError\|isFormValid" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# 2. 既存テストファイルの存在確認
ls apps/desktop/src/__tests__/components/schedule/ 2>/dev/null || echo "ディレクトリ未作成"

# 3. VisualCronPickerProps の現状型定義確認
grep -n "interface.*Props\|type.*Props\|onValidation" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# 4. @testing-library/react のインポートパターン確認（既存テストから）
grep -rn "import.*testing-library/react\|import.*fireEvent" \
  apps/desktop/src/__tests__/components/ | head -10
```

**コンポーネントテスト方針の明記**:
`VisualCronPicker` は export された React コンポーネントのため、
RTL（`@testing-library/react`）の `render` + `screen` + `fireEvent` で直接テストする（既存テスト方針に合わせる）。

### ステップ1: テストディレクトリ作成確認

```bash
# テスト配置先ディレクトリの作成（存在しない場合）
mkdir -p apps/desktop/src/__tests__/components/schedule
```

### ステップ2: テストコード設計

```typescript
// apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { VisualCronPicker } from "@/renderer/components/schedule/VisualCronPicker";

describe("VisualCronPicker - UIバリデーション", () => {
  // --- weekly 空曜日バリデーション ---

  describe("週次（weekly）空曜日バリデーション", () => {
    it("VAL-W-01: weekly + 月曜日選択済みでレンダリングするとエラーメッセージが DOM に存在しない", () => {
      render(
        <VisualCronPicker
          value="0 9 * * 1"
          onChange={() => {}}
        />,
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("VAL-W-02: weekly + 月曜日を解除して空曜日にすると onValidationChange が false で呼ばれる", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 * * 1"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "月曜日" }));
      expect(onValidationChange).toHaveBeenLastCalledWith(false);
    });

    it("VAL-W-03: weekly + 空曜日から月曜日を再選択するとエラーメッセージが消え、true コールバックが呼ばれる", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 * * 1"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "月曜日" }));
      fireEvent.click(screen.getByRole("button", { name: "月曜日" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenLastCalledWith(true);
    });
  });

  // --- monthly 日付バリデーション ---

  describe("月次（monthly）日付バリデーション", () => {
    it("VAL-M-01: monthly + 最小範囲外（0）でレンダリングするとエラーメッセージが DOM に存在する", () => {
      render(
        <VisualCronPicker
          value="0 9 0 * *"
          onChange={() => {}}
        />,
      );
      expect(
        screen.getByText(/日付は1〜31の範囲で入力してください/),
      ).toBeInTheDocument();
    });

    it("VAL-M-02: monthly + 最大範囲外（32）でレンダリングするとエラーメッセージが DOM に存在する", () => {
      render(
        <VisualCronPicker
          value="0 9 32 * *"
          onChange={() => {}}
        />,
      );
      expect(
        screen.getByText(/日付は1〜31の範囲で入力してください/),
      ).toBeInTheDocument();
    });

    it("VAL-M-03: monthly + 有効な日付（15）でレンダリングするとエラーメッセージが存在しない", () => {
      render(
        <VisualCronPicker
          value="0 9 15 * *"
          onChange={() => {}}
        />,
      );
      expect(
        screen.queryByText(/日付は1〜31の範囲で入力してください/),
      ).not.toBeInTheDocument();
    });

    it("VAL-M-04: monthly + 無効日付で onValidationChange が false で呼ばれる", () => {
      const onValidationChange = vi.fn();
      render(
        <VisualCronPicker
          value="0 9 0 * *"
          onChange={() => {}}
          onValidationChange={onValidationChange}
        />,
      );
      expect(onValidationChange).toHaveBeenLastCalledWith(false);
    });
  });

  // --- コールバックなしの動作確認 ---

  describe("onValidationChange なし", () => {
    it("VAL-CB-01: onValidationChange を渡さなくてもエラーなく動作する", () => {
      expect(() => {
        render(
          <VisualCronPicker
            value="0 9 * * 1"
            onChange={() => {}}
          />,
        );
      }).not.toThrow();
    });
  });
});
```

### ステップ3: RED 確認

実装前（Phase 5 前）にテストを実行し、新規追加テストが RED（失敗）であることを確認する:

```bash
# テスト実行（新規追加テストが FAIL することを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"
```

**期待される RED 状態**:

- VAL-W-01: PASS の可能性あり（既存 weekly 表示はエラーなしで描画される）
- VAL-W-02: `onValidationChange` が呼ばれないため FAIL
  （理由: `onValidationChange` プロップ自体が未定義）
- VAL-W-03: 曜日クリック後のエラー消滅が FAIL
- VAL-M-01, VAL-M-02: `monthlyError` フラグ未実装のため FAIL
- VAL-M-03: PASS の可能性あり（有効な月次は既存実装でもエラーなし）
- VAL-M-04: `onValidationChange` が呼ばれないため FAIL
- VAL-CB-01: `onValidationChange` プロップ未定義でも動作するため PASS の可能性あり

### ステップ4: 既存テスト影響確認

```bash
# 既存テスト全件実行（RED に変化していないことを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"
```

**確認観点**:

- 追加テストファイルが既存テストケースを壊していないこと
- 既存の PASS ケースが引き続き PASS であること

---

## 統合テスト連携

- `VisualCronPicker` は UI コンポーネントのため IPC 統合テスト不要
- テストコードは `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` に配置（コード成果物の正しい配置）
- RED 確認結果を `outputs/phase-4/red-confirmation.md` に記録し、Phase 5 実装のインプットとする

---

## 多角的チェック観点

| 観点               | 確認内容                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 型安全性           | `VisualCronPickerProps` の型定義が存在し、必須プロップが正しく渡されること                                             |
| レンダリング安全性 | `onValidationChange` 未渡しでもクラッシュしないこと（VAL-CB-01）                                                       |
| ユーザーイベント   | `fireEvent.click()` で実際のボタン操作をシミュレートしていること                                                       |
| DOM クエリ安全性   | `role="alert"` の有無確認は `getByRole("alert")` / `queryByRole("alert")`、文言一致確認は `getByText` を使い分けること |
| コールバック検証   | `vi.fn()` でモックし `toHaveBeenCalledWith` で引数を厳密に検証すること                                                 |
| 既存テストへの影響 | 新規テストファイル追加のみで既存ファイルを変更しないこと                                                               |

---

## サブタスク管理

| ID     | タスク名                                                       | ステータス |
| ------ | -------------------------------------------------------------- | ---------- |
| T-04-1 | 事前確認（既存テスト構造・コンポーネント現状・副作用チェック） | 完了       |
| T-04-2 | テストシナリオテーブル（VAL-W-01〜VAL-CB-01）の設計            | 完了       |
| T-04-3 | `VisualCronPicker.validation.test.tsx` の新規作成              | 完了       |
| T-04-4 | RED 確認（新規追加テストが FAIL することを確認）               | 完了       |
| T-04-5 | テストマトリクスと RED 確認結果の記録                          | 完了       |

---

## 成果物

### ドキュメント成果物

| 成果物           | 配置先                                | 形式     |
| ---------------- | ------------------------------------- | -------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`      | Markdown |
| RED 確認結果     | `outputs/phase-4/red-confirmation.md` | Markdown |

### コード成果物（codeArtifacts）

| 成果物                                | 配置先                                                                                            | 形式       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| VisualCronPicker バリデーションテスト | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`（新規作成） | TypeScript |

---

## 完了条件

- [x] 事前確認（既存テスト構造・コンポーネント現状・副作用チェック）が完了していること
- [x] テストシナリオテーブル（VAL-W-01〜VAL-CB-01）が `outputs/phase-4/test-matrix.md` に記録されていること
- [x] `VisualCronPicker.validation.test.tsx` に VAL-W-01〜VAL-CB-01 全テストが記述されていること
- [x] 新規追加テストが RED（失敗）であることが `outputs/phase-4/red-confirmation.md` に記録されていること
- [x] 既存テストが RED に変化していないこと（新規ファイル追加のみで既存を壊していないこと）
- [x] `outputs/phase-4/` に全ドキュメント成果物が生成されていること

---

## タスク100%実行確認【必須】

- [x] T-04-1: 事前確認（コンポーネント現状・副作用チェック）を実行済み
- [x] T-04-2: テストシナリオ（VAL-W-01〜VAL-CB-01）を `outputs/phase-4/test-matrix.md` に記録済み
- [x] T-04-3: `VisualCronPicker.validation.test.tsx` の新規作成完了
- [x] T-04-4: RED 確認を実行し、結果を `outputs/phase-4/red-confirmation.md` に記録済み
- [x] T-04-5: 既存テスト全件が PASS のままであることを確認済み

---

## 次Phase

**Phase 5: 実装（GREEN）** — RED を GREEN に変えるための実装を行う。
`VisualCronPicker.tsx` に `onValidationChange` プロップと `monthlyError` フラグを追加し、
`useEffect` で `isFormValid` の変化を通知する実装を加える。

**Phase 5 開始条件**: Phase 4 の全完了条件を満たし、新規追加テストが RED 状態であることが確認済みであること。
