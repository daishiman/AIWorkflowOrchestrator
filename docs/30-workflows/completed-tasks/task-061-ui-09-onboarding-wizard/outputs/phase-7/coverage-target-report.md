# Phase 7 カバレッジ目標レポート

## task scope coverage gate（Phase 6 境界テスト追加後）

| 指標       | 目標   | 実測（Phase 6 後） | 判定 |
| ---------- | ------ | ------------------ | ---- |
| Statements | 85.00% | 97.72%             | PASS |
| Branches   | 75.00% | 93.44%             | PASS |
| Functions  | 85.00% | 92.85%             | PASS |
| Lines      | 85.00% | 97.72%             | PASS |

## ファイル単位実測（OnboardingWizard のみ）

| ファイル                     | Statements | Branches | Functions | Lines  | 未カバー行                 |
| ---------------------------- | ---------- | -------- | --------- | ------ | -------------------------- |
| `OnboardingWizard/index.tsx` | 97.72%     | 93.44%   | 92.85%    | 97.72% | 310, 351-352, 363-364, 792 |

## Phase 5 時点との比較

| 指標       | Phase 5 | Phase 6 | 変化     |
| ---------- | ------- | ------- | -------- |
| Statements | 97.15%  | 97.72%  | +0.57%   |
| Branches   | 90.51%  | 93.44%  | +2.93%   |
| Functions  | 92.85%  | 92.85%  | 変化なし |
| Lines      | 97.15%  | 97.72%  | +0.57%   |

## 残存未カバー行の説明

| 行       | 内容                                     | 理由                                                                          |
| -------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| L310     | `getFocusableElements` の 0件早期 return | happy-dom 環境では常に最低1つの要素が存在するため到達不可                     |
| L351-352 | `handleNext` の早期 return               | disabled ボタンは React が click を遮断するため `handleNext` 自体が呼ばれない |
| L363-364 | `handleComplete` の早期 return           | 前ステップの disabled 制約で null の状態では完了ボタンに到達できない          |
| L792     | theme label フォールバック `"Kanagawa"`  | THEME_OPTIONS 外の mode 値は型システムで排除されており通常到達不可            |

## 測定コマンド

```bash
cd apps/desktop && CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm vitest run \
  src/renderer/components/organisms/OnboardingWizard/OnboardingWizard.test.tsx \
  --coverage.enabled=true \
  --coverage.reporter=text \
  --coverage.include='src/renderer/components/organisms/OnboardingWizard/index.tsx'
```

## 補足

- `App.tsx` と `store/index.ts` は test 側で強い mock を使うため、file 単位一覧には現れない。
- overlay 表示条件と fallback 分岐自体は `App.onboarding.test.tsx` と `DashboardView.test.tsx` で回帰防止している。
- Funcs 92.85% の残りは `ThemePreviewCard` コンポーネント内の小さな arrow function で、v8 が独立カウントするもの（P41 パターン）。
