# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 6                                     |
| Phase名    | テスト拡充                            |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 前提Phase  | Phase 5（実装）                       |
| 後続Phase  | Phase 7（カバレッジ確認）             |
| ステータス | not_started                           |
| 作成日     | 2026-03-17                            |
| 機能名     | skillcenter-create-route              |

## 目的

Phase 4 で作成した基本テストを拡充し、カバレッジ基準（Line 80%+ / Branch 60%+ / Function 80%+）を達成する。アクセシビリティ・異常系・スナップショットテストを追加し、実装の堅牢性と仕様適合性を高める。

## 実行タスク

- アクセシビリティテスト追加: `aria-label` 確認・キーボードフォーカス（Tab キーでのアクセス）・アイコンの `aria-hidden` 属性を検証するテストを追加する
- 異常系テスト追加: `navigateToSkillCreate` が `undefined` の場合にヘッダーCTA がレンダリングされないまたはエラーが発生しないことを確認するテストを追加する
- JourneyPanel 条件分岐テスト追加: `ctaLabel` のみ存在・`onAction` のみ存在・両方 `undefined` の場合にボタンが描画されないことを確認するテストを追加する
- スナップショットテスト追加: ヘッダーCTA と JourneyPanel CTA のスナップショットを取得し、意図しない UI 変更を検出できるようにする
- カバレッジ計測: `pnpm --filter @repo/desktop exec vitest run --coverage` を実行し、カバレッジ基準の充足を確認する

## 参照資料

| 参照資料                  | パス                                                         | 内容                                                   |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| Phase 4（テストファイル） | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/` | 既存テストの構造を確認し、重複しない拡充を行う         |
| Phase 5（実装）           | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`  | 実装済みコードの分岐条件を把握し、テスト対象を特定する |
| P39 対策                  | `.claude/rules/06-known-pitfalls.md#P39`                     | happy-dom 環境では fireEvent を使用する                |
| P41 対策                  | `.claude/rules/06-known-pitfalls.md#P41`                     | インライン関数のカバレッジカウントに注意する           |

## 実行手順

### ステップ1: カバレッジの現状を計測する

Phase 5 実装後のカバレッジを計測し、不足箇所を特定する。

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillCenterView/
```

カバレッジ結果を `outputs/phase-6/coverage-before.md` に記録する。

### ステップ2: アクセシビリティテストを追加する

```typescript
describe("SkillCenterView - アクセシビリティ (AC-7)", () => {
  it("ヘッダーCTA に aria-label='新しいツールを作る' が設定されている", () => {
    const { getByRole } = render(<SkillCenterView />);
    const button = getByRole("button", { name: "新しいツールを作る" });
    expect(button).toBeInTheDocument();
  });

  it("PlusIcon に aria-hidden='true' が設定されている", () => {
    const { getByRole } = render(<SkillCenterView />);
    const button = getByRole("button", { name: "新しいツールを作る" });
    const icon = button.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("ヘッダーCTA が Tab キーでフォーカス可能である", () => {
    const { getByRole } = render(<SkillCenterView />);
    const button = getByRole("button", { name: "新しいツールを作る" });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("JourneyPanel CTA に aria-label が設定されている", () => {
    // CTA ボタンの aria-label を確認
  });
});
```

### ステップ3: 異常系テストを追加する

```typescript
describe("SkillCenterView - 異常系", () => {
  it("navigateToSkillCreate が undefined でもコンポーネントがクラッシュしない", () => {
    // navigateToSkillCreate を undefined でモック
    // エラーなくレンダリングされることを確認
  });
});

describe("SkillLifecycleJourneyPanel - 異常系", () => {
  it("ctaLabel のみ存在し onAction が undefined の場合にボタンが描画されない", () => {
    // 条件分岐: ctaLabel && onAction の両方が必要
  });

  it("onAction のみ存在し ctaLabel が undefined の場合にボタンが描画されない", () => {
    // 条件分岐確認
  });

  it("ctaLabel と onAction が両方 undefined の場合にボタンが描画されない", () => {
    // 標準のカード（CTA なし）のレンダリング確認
  });
});
```

### ステップ4: スナップショットテストを追加する

```typescript
describe("SkillCenterView - スナップショット", () => {
  it("ヘッダーCTA 付きでスナップショットが一致する", () => {
    const { container } = render(<SkillCenterView />);
    expect(container.querySelector("header")).toMatchSnapshot();
  });
});

describe("SkillLifecycleJourneyPanel - スナップショット", () => {
  it("CTA ボタン付きのステップカードでスナップショットが一致する", () => {
    // CTA を含む JourneyPanel のスナップショット
  });

  it("CTA ボタンなしのステップカードでスナップショットが一致する", () => {
    // CTA を含まない標準カードのスナップショット
  });
});
```

### ステップ5: カバレッジ再計測と基準確認

テスト追加後にカバレッジを再計測し、基準を満たすことを確認する。

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillCenterView/
```

| 指標              | 最低基準 | 充足状態   |
| ----------------- | -------- | ---------- |
| Line Coverage     | 80%      | 計測後確認 |
| Branch Coverage   | 60%      | 計測後確認 |
| Function Coverage | 80%      | 計測後確認 |

基準未達の場合は Phase 6 に戻り追加テストを作成する。

### ステップ6: 成果物と完了条件を確認する

カバレッジレポート・追加テストファイルの確認を行い、Phase 7 への handoff を記録する。

## 統合テスト連携

- アクセシビリティテストが AC-7（Apple HIG 準拠）の検証を補完する
- 異常系テストが実装の堅牢性を証明する
- スナップショットテストが Phase 8 リファクタリング後の UI 変更を検出するセーフティネットになる

## 成果物

| 成果物                     | パス                                                                                          | 内容                                          |
| -------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| アクセシビリティテスト追加 | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.a11y.test.tsx`     | aria-label / focus / aria-hidden 検証テスト   |
| 異常系テスト追加           | 既存テストファイルへの追記                                                                    | undefined ハンドリング・条件分岐テスト        |
| スナップショットテスト追加 | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.snapshot.test.tsx` | ヘッダー・JourneyPanel の UI スナップショット |
| カバレッジ計測前           | `outputs/phase-6/coverage-before.md`                                                          | Phase 5 完了直後のカバレッジ状態              |
| カバレッジ計測後           | `outputs/phase-6/coverage-after.md`                                                           | Phase 6 テスト追加後のカバレッジ状態          |

## 完了条件

- [ ] アクセシビリティテスト（aria-label / focus / aria-hidden）が追加されている
- [ ] 異常系テスト（undefined ハンドリング・条件分岐カバー）が追加されている
- [ ] JourneyPanel の ctaLabel/onAction 条件分岐（4パターン）がテストでカバーされている
- [ ] スナップショットテストが追加されている
- [ ] Line Coverage 80%+ が達成されている
- [ ] Branch Coverage 60%+ が達成されている
- [ ] Function Coverage 80%+ が達成されている
- [ ] カバレッジ計測前後のレポートが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
