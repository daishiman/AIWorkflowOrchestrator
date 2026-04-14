# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 6                                       |
| 機能名 | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| 作成日 | 2026-04-13                              |

## 目的

Phase 5 で GREEN となった基本テスト（VAL-W-01〜VAL-CB-01）を維持しながら、
以下の観点でテストを拡充し、`VisualCronPicker` バリデーション実装の堅牢性を高める。

- **境界値テスト**: `dayOfMonth` の有効範囲境界（1・31）と無効範囲境界（0・32）
- **複合ケーステスト**: 週次で月曜日を解除した場合の再エラー表示
- **アクセシビリティテスト**: エラー要素の `role="alert"` 属性確認
- **コールバック呼び出し回数テスト**: 不要な再呼び出しがないこと

---

## 実行タスク

- **タスク1**: 事前確認 — Phase 5 GREEN 状態の確認・拡充対象テストシナリオの設計
- **タスク2**: 境界値テスト（EXP-B-01〜EXP-B-04）の追加
- **タスク3**: 複合ケーステスト（EXP-C-01）の追加
- **タスク4**: アクセシビリティテスト（EXP-A-01〜EXP-A-02）の追加
- **タスク5**: コールバック呼び出し回数テスト（EXP-CB-01〜EXP-CB-02）の追加
- **タスク6**: 拡充後の全テスト PASS 確認と結果記録

---

## 拡充対象テストシナリオ

### 境界値テスト（EXP-B-01〜EXP-B-04）

| テストID | テスト名                          | 入力                 | 期待結果                            |
| -------- | --------------------------------- | -------------------- | ----------------------------------- |
| EXP-B-01 | monthly + 最小有効値（1）         | `value="0 9 1 * *"`  | エラーメッセージが DOM に存在しない |
| EXP-B-02 | monthly + 最大有効値（31）        | `value="0 9 31 * *"` | エラーメッセージが DOM に存在しない |
| EXP-B-03 | monthly + 最小有効値の1つ下（0）  | `value="0 9 0 * *"`  | エラーメッセージが DOM に存在する   |
| EXP-B-04 | monthly + 最大有効値の1つ上（32） | `value="0 9 32 * *"` | エラーメッセージが DOM に存在する   |

> EXP-B-03・EXP-B-04 は VAL-M-01・VAL-M-02 と重複するが、境界値の意図を明示するために独立したテストとして追加する。

### 複合ケーステスト（EXP-C-01）

| テストID | テスト名                                  | 入力・操作                     | 期待結果                                                   |
| -------- | ----------------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| EXP-C-01 | weekly + 月曜日解除で空曜日エラーが再表示 | 月曜日ボタンをクリックして解除 | エラーメッセージが再び DOM に現れる + `false` コールバック |

### アクセシビリティテスト（EXP-A-01〜EXP-A-02）

| テストID | テスト名                                             | 入力                                   | 期待結果                                |
| -------- | ---------------------------------------------------- | -------------------------------------- | --------------------------------------- |
| EXP-A-01 | weekly エラー要素に `role="alert"` が付与されている  | 月曜日ボタンをクリックして空曜日にする | `getByRole("alert")` で要素が取得できる |
| EXP-A-02 | monthly エラー要素に `role="alert"` が付与されている | `value="0 9 0 * *"`                    | `getByRole("alert")` で要素が取得できる |

### コールバック呼び出し回数テスト（EXP-CB-01〜EXP-CB-02）

| テストID  | テスト名                                                    | 入力・操作           | 期待結果                                                  |
| --------- | ----------------------------------------------------------- | -------------------- | --------------------------------------------------------- |
| EXP-CB-01 | 初回レンダリングで `onValidationChange` が1回だけ呼ばれる   | `value="0 9 0 * *"`  | `toHaveBeenCalledTimes(1)` かつ `false` で呼ばれる        |
| EXP-CB-02 | 毎週へ切り替えると `onValidationChange` が追加で1回呼ばれる | 毎週ボタンをクリック | クリック後の合計呼び出しが 2 回で最後は `true` で呼ばれる |

---

## 参照資料

| 資料名                      | パス                                                                                                   | 説明                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Phase 4 テストコード        | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`                  | 拡充対象ファイル（追記する）                 |
| Phase 5 GREEN 確認結果      | `outputs/phase-5/green-confirmation.md`                                                                | GREEN 状態の前提確認                         |
| Phase 5 実装結果            | `outputs/phase-5/implementation-result.md`                                                             | `role="alert"` 付与状況の確認                |
| VisualCronPicker 実装       | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                                   | 実装詳細確認（useEffect・エラー表示）        |
| WEEKDAYS-GUARD Phase 6 参照 | `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/phase-6-test-expansion.md` | テスト拡充フェーズの構造参考（存在する場合） |

---

## 実行手順

### ステップ0: Phase 6 事前確認【必須】

```bash
# 1. Phase 5 GREEN 状態の確認
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"

# 2. エラーメッセージに role="alert" が付与されているか確認
grep -n 'role="alert"\|role={' \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# 3. useEffect の依存配列確認（不要な再呼び出しリスクの把握）
grep -n -A 5 "useEffect.*onValidationChange\|useEffect.*isFormValid" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

### ステップ1: 境界値テストコード（EXP-B-01〜EXP-B-04）の追加

```typescript
// apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx への追記

describe("月次（monthly）dayOfMonth 境界値テスト", () => {
  it("EXP-B-01: 最小有効値（1）でエラーメッセージが存在しない", () => {
    render(<VisualCronPicker value="0 9 1 * *" onChange={() => {}} />);
    expect(
      screen.queryByText(/日付は1〜31の範囲で入力してください/),
    ).not.toBeInTheDocument();
  });

  it("EXP-B-02: 最大有効値（31）でエラーメッセージが存在しない", () => {
    render(<VisualCronPicker value="0 9 31 * *" onChange={() => {}} />);
    expect(
      screen.queryByText(/日付は1〜31の範囲で入力してください/),
    ).not.toBeInTheDocument();
  });

  it("EXP-B-03: 最小有効値の1つ下（0）でエラーメッセージが存在する", () => {
    render(<VisualCronPicker value="0 9 0 * *" onChange={() => {}} />);
    expect(
      screen.getByText(/日付は1〜31の範囲で入力してください/),
    ).toBeInTheDocument();
  });

  it("EXP-B-04: 最大有効値の1つ上（32）でエラーメッセージが存在する", () => {
    render(<VisualCronPicker value="0 9 32 * *" onChange={() => {}} />);
    expect(
      screen.getByText(/日付は1〜31の範囲で入力してください/),
    ).toBeInTheDocument();
  });
});
```

### ステップ2: 複合ケーステスト（EXP-C-01）の追加

```typescript
describe("週次（weekly）複合ケース", () => {
  it("EXP-C-01: 月曜日を解除して空曜日にするとエラーメッセージが再表示される", () => {
    const onValidationChange = vi.fn();
    render(
      <VisualCronPicker
        value="0 9 * * 1"
        onChange={() => {}}
        onValidationChange={onValidationChange}
      />,
    );
    const mondayButton = screen.getByRole("button", { name: "月曜日" });
    fireEvent.click(mondayButton);
    expect(
      screen.getByText(/曜日を1つ以上選択してください/),
    ).toBeInTheDocument();
    expect(onValidationChange).toHaveBeenLastCalledWith(false);
  });
});
```

### ステップ3: アクセシビリティテスト（EXP-A-01〜EXP-A-02）の追加

```typescript
describe("アクセシビリティ: role=\"alert\" 属性", () => {
  it("EXP-A-01: weekly エラー要素に role=\"alert\" が付与されている", () => {
    render(
      <VisualCronPicker value="0 9 * * 1" onChange={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "月曜日" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("EXP-A-02: monthly エラー要素に role=\"alert\" が付与されている", () => {
    render(<VisualCronPicker value="0 9 0 * *" onChange={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
```

### ステップ4: コールバック呼び出し回数テスト（EXP-CB-01〜EXP-CB-02）の追加

```typescript
describe("onValidationChange コールバック呼び出し回数", () => {
  it("EXP-CB-01: 初回レンダリングで onValidationChange が1回だけ呼ばれる", () => {
    const onValidationChange = vi.fn();
    render(
      <VisualCronPicker
        value="0 9 0 * *"
        onChange={() => {}}
        onValidationChange={onValidationChange}
      />,
    );
    expect(onValidationChange).toHaveBeenCalledTimes(1);
    expect(onValidationChange).toHaveBeenCalledWith(false);
  });

  it("EXP-CB-02: 毎週へ切り替えると合計2回呼ばれ、最後は true で呼ばれる", () => {
    const onValidationChange = vi.fn();
    render(
      <VisualCronPicker
        value="0 9 * * *"
        onChange={() => {}}
        onValidationChange={onValidationChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "毎週" }));
    expect(onValidationChange).toHaveBeenCalledTimes(2);
    expect(onValidationChange).toHaveBeenLastCalledWith(true);
  });
});
```

### ステップ5: 拡充後の全テスト PASS 確認

```bash
# 拡充後の全バリデーションテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"

# 既存テスト全件への影響確認
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 統合テスト連携

- `VisualCronPicker` は UI コンポーネントのため IPC 統合テスト不要
- テスト追記は既存の `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` に行う（新規ファイル不要）
- 拡充結果を `outputs/phase-6/test-expansion-result.md` に記録する

---

## 多角的チェック観点

| 観点                     | 確認内容                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| 境界値網羅性             | 有効範囲の下限（1）・上限（31）と、その外側（0・32）を全てカバーしていること                  |
| 複合ケースの現実性       | 実際のユーザー操作（解除・切り替え）を `fireEvent` でシミュレートしていること                 |
| アクセシビリティ標準準拠 | WAI-ARIA の `role="alert"` が付与され、スクリーンリーダーで読み上げられる構造になっていること |
| コールバック過剰呼び出し | `useEffect` の依存配列が適切で、同じ `isFormValid` 値での再呼び出しが発生しないこと           |
| テスト追記の安全性       | 既存の describe/it ブロックを変更せず、新規 describe ブロックとして追記すること               |
| Phase 5 GREEN の維持     | 拡充後も VAL-W-01〜VAL-CB-01 が全て PASS のままであること                                     |
| モック状態の分離         | 各テストで `vi.fn()` を新規生成し、テスト間でモック状態が汚染されないこと                     |

---

## サブタスク管理

| ID     | タスク名                                                     | ステータス |
| ------ | ------------------------------------------------------------ | ---------- |
| T-06-1 | 事前確認（Phase 5 GREEN 確認・`role="alert"` 付与確認）      | 完了       |
| T-06-2 | 境界値テスト（EXP-B-01〜EXP-B-04）の追加                     | 完了       |
| T-06-3 | 複合ケーステスト（EXP-C-01）の追加                           | 完了       |
| T-06-4 | アクセシビリティテスト（EXP-A-01〜EXP-A-02）の追加           | 完了       |
| T-06-5 | コールバック呼び出し回数テスト（EXP-CB-01〜EXP-CB-02）の追加 | 完了       |
| T-06-6 | 拡充後の全テスト PASS 確認・型チェック                       | 完了       |
| T-06-7 | 拡充結果ドキュメントの記録                                   | 完了       |

---

## 成果物

### ドキュメント成果物

| 成果物         | 配置先                                     | 形式     |
| -------------- | ------------------------------------------ | -------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | Markdown |

### コード成果物（codeArtifacts）

| 成果物                                | 配置先                                                                                        | 形式       |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | ---------- |
| VisualCronPicker バリデーションテスト | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`（追記） | TypeScript |

---

## 完了条件

- [x] 事前確認（Phase 5 GREEN 確認・`role="alert"` 付与確認）が完了していること
- [x] 境界値テスト（EXP-B-01〜EXP-B-04）が追加され、全 PASS であること
- [x] 複合ケーステスト（EXP-C-01）が追加され、PASS であること
- [x] アクセシビリティテスト（EXP-A-01〜EXP-A-02）が追加され、全 PASS であること
- [x] コールバック呼び出し回数テスト（EXP-CB-01〜EXP-CB-02）が追加され、全 PASS であること
- [x] Phase 5 の基本テスト（VAL-W-01〜VAL-CB-01）が引き続き全 PASS であること
- [x] 型チェックがエラーなく通過すること
- [x] `outputs/phase-6/test-expansion-result.md` に全拡充結果が記録されていること

---

## タスク100%実行確認【必須】

- [x] T-06-1: 事前確認（Phase 5 GREEN 確認・`role="alert"` 付与確認）を実行済み
- [x] T-06-2: 境界値テスト（EXP-B-01〜EXP-B-04）の追加完了
- [x] T-06-3: 複合ケーステスト（EXP-C-01）の追加完了
- [x] T-06-4: アクセシビリティテスト（EXP-A-01〜EXP-A-02）の追加完了
- [x] T-06-5: コールバック呼び出し回数テスト（EXP-CB-01〜EXP-CB-02）の追加完了
- [x] T-06-6: 拡充後の全テスト PASS 確認・型チェック実行済み
- [x] T-06-7: `outputs/phase-6/test-expansion-result.md` に記録済み

---

## 次Phase

**Phase 7 以降**: リファクタリング・ドキュメント整備・タスク完了処理を行う。
バリデーションロジックの抽出（カスタムフック化）や、
エラーメッセージのi18n対応などの改善は Phase 7 以降で検討する。

**Phase 7 開始条件**: Phase 6 の全完了条件を満たし、拡充後の全テストが PASS であること。
