# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 5: 実装（TDD GREEN）      |
| 次Phase    | Phase 7: カバレッジ確認         |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

Phase 4 の基本テスト（CV-01〜CV-12）に加えて、境界値・空白バリエーション・
特殊フィールド・エッジケースのテストを追加し、テストスイートの堅牢性を高める。
カバレッジ目標80%に向けた追加テストを実装する。

## 実行タスク

- Task 1: Phase 4 テストのレビュー — CV-01〜CV-12の充足性確認
- Task 2: 境界値テスト追加 — day-of-month の境界値（day=1, day=31, day=0, day=32）
- Task 3: 空白文字バリエーションテスト追加 — 全角スペース・タブ・複数スペース
- Task 4: 特殊フィールドテスト追加 — `*`・`*/2`・`1-15`・`1,15`
- Task 5: エッジケーステスト追加 — onValidationChange=undefined・フィールド数超過
- Task 6: 全テスト実行確認

## 参照資料

| 資料名                   | パス                                                                                        | 用途           |
| ------------------------ | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 4 テスト           | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | 既存テスト確認 |
| Phase 5 実装             | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | 実装確認       |
| 既存バリデーションテスト | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`       | 回帰確認       |

## 実行手順

### 1. Phase 4 テスト充足性確認

| TC番号 | テスト内容                   | Phase 4での充足 |
| ------ | ---------------------------- | --------------- |
| CV-01  | 空文字エラー                 | OK              |
| CV-02  | フィールド数不足エラー       | OK              |
| CV-03  | dom=0 エラー                 | OK              |
| CV-04  | dom=32 エラー                | OK              |
| CV-05  | 有効なcron式                 | OK              |
| CV-06  | every-minute有効             | OK              |
| CV-07  | dom=\*/2 有効                | OK              |
| CV-08  | dom=1-15 有効                | OK              |
| CV-09  | visual→direct切替（有効値）  | OK              |
| CV-10  | visual(error)→direct切替     | OK              |
| CV-11  | onValidationChange=undefined | OK              |
| CV-12  | 半角スペースのみ             | OK              |

### 2. 追加テストケース定義

| TC番号 | カテゴリ           | テスト名                                          | 入力               | 期待結果                               |
| ------ | ------------------ | ------------------------------------------------- | ------------------ | -------------------------------------- |
| CV-13  | 境界値             | day-of-month=1（最小有効値）でエラーなし          | `"0 9 1 * *"`      | エラーなし + onValidationChange(true)  |
| CV-14  | 境界値             | day-of-month=31（最大有効値）でエラーなし         | `"0 9 31 * *"`     | エラーなし + onValidationChange(true)  |
| CV-15  | 空白バリエーション | タブ文字のみ入力時にエラー表示                    | `"\t"`             | エラー表示 + onValidationChange(false) |
| CV-16  | 空白バリエーション | 複数スペース区切りのcron式が有効                  | `"0  9  15  *  *"` | エラーなし + onValidationChange(true)  |
| CV-17  | 特殊フィールド     | dom=1,15（カンマリスト）でエラーなし              | `"0 9 1,15 * *"`   | エラーなし + onValidationChange(true)  |
| CV-18  | 特殊フィールド     | dom=L（月末指定）でエラーなし                     | `"0 9 L * *"`      | エラーなし + onValidationChange(true)  |
| CV-19  | エッジケース       | 6フィールドcron式（秒フィールド付き）でエラー表示 | `"0 0 9 15 * *"`   | エラー表示 + onValidationChange(false) |
| CV-20  | エッジケース       | 先頭・末尾に余分なスペースがある有効なcron式      | `" 0 9 15 * * "`   | エラーなし + onValidationChange(true)  |

### 3. 追加テストコード

```tsx
describe("VisualCronPicker - Custom Cron Validation (Extended)", () => {
  describe("境界値テスト", () => {
    it("CV-13: day-of-month=1（最小有効値）でエラーなし", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 1 * *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });

    it("CV-14: day-of-month=31（最大有効値）でエラーなし", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 31 * *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("空白文字バリエーション", () => {
    it("CV-15: タブ文字のみ入力時にエラー表示", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("\t", onValidationChange);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });

    it("CV-16: 複数スペース区切りでも有効なcron式として認識", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0  9  15  *  *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("特殊フィールド", () => {
    it("CV-17: dom=1,15（カンマリスト）でエラーなし", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 1,15 * *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });

    it("CV-18: dom=L（月末指定）でエラーなし", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 9 L * *", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe("エッジケース", () => {
    it("CV-19: 6フィールドcron式でエラー表示", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput("0 0 9 15 * *", onValidationChange);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });

    it("CV-20: 先頭・末尾スペースありの有効cron式", () => {
      const onValidationChange = vi.fn();
      renderWithDirectInput(" 0 9 15 * * ", onValidationChange);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });
});
```

### 4. 全テスト実行確認

```bash
# 全テスト（Phase 4 + Phase 6 追加分）実行
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.customValidation"

# 既存バリデーションテストの回帰確認
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"

# 型チェック（追加テストで型エラーがないことを確認）
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

| 判定項目           | 基準    | 結果    |
| ------------------ | ------- | ------- |
| CV-01〜CV-20全PASS | PASS    | pending |
| 既存テスト回帰なし | 全PASS  | pending |
| 型チェック         | PASS    | pending |
| lint               | 0 error | pending |

## 多角的チェック観点

| チェック観点               | 確認内容                                                                | 結果    |
| -------------------------- | ----------------------------------------------------------------------- | ------- |
| 境界値網羅                 | day-of-month の 0/1/31/32 が全てテストされているか                      | pending |
| 空白文字バリエーション     | 半角スペース・タブ・複数スペースがカバーされているか                    | pending |
| 特殊フィールド網羅         | `*`/`*/2`/`1-15`/`1,15`/`L` がカバーされているか                        | pending |
| フィールド数バリエーション | 4フィールド（不足）・5フィールド（正常）・6フィールド（過剰）がカバーか | pending |
| カバレッジ貢献             | 追加テストがカバレッジ80%目標に十分寄与するか                           | pending |

## 成果物

| 成果物           | パス                                                                                        | 説明                     |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| テストコード拡充 | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | CV-13〜CV-20を追加       |
| 拡充テスト記録   | `outputs/phase-6/extended-test-record.md`                                                   | 追加テスト一覧・実行結果 |

## 完了条件

- [ ] Phase 4 テスト（CV-01〜CV-12）の充足性確認済み
- [ ] 境界値テスト（CV-13〜CV-14）が追加済み
- [ ] 空白文字バリエーションテスト（CV-15〜CV-16）が追加済み
- [ ] 特殊フィールドテスト（CV-17〜CV-18）が追加済み
- [ ] エッジケーステスト（CV-19〜CV-20）が追加済み
- [ ] 全テスト（CV-01〜CV-20）がPASS
- [ ] 既存テスト（VisualCronPicker.validation.test.tsx）への悪影響なし
- [ ] 型チェックがPASS
- [ ] lint がエラーなし
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
