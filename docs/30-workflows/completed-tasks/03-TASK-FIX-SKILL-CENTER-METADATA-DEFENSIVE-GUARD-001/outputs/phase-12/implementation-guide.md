# Phase 12 実装ガイド（再監査版）

更新日: 2026-03-04

## Part 1（中学生向け）

### 何を直したの？

この修正は「情報が足りないカードが混ざっていても画面が止まらないようにする」作業です。

例えば、名簿の一部に説明文が空欄でも、名簿アプリ全体が落ちないようにするイメージです。
空欄は空欄のまま見せて、アプリ自体は使い続けられるようにしました。

### できるようになったこと

| できること             | 説明                           |
| ---------------------- | ------------------------------ |
| 検索が止まらない       | 説明文が空でも検索できる       |
| 詳細画面が落ちない     | 参照データが欠けていても開ける |
| おすすめ表示が壊れない | 配列が空や欠損でも計算できる   |

## Part 2（技術者向け）

### 防御実装

- Hook
  - `normalizeSearchText(value: unknown)`
  - `safeLength(value: unknown)`
- Component
  - `String(skill.description ?? "")`
  - `safeSubResources` / `safeOtherFiles`

### 実行結果（再監査）

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__
# 10 files / 132 tests PASS

pnpm --filter @repo/desktop exec vitest run --coverage '--coverage.include=src/renderer/views/SkillCenterView/**' src/renderer/views/SkillCenterView/__tests__
# Line 96.9 / Branch 91.85 / Function 100
```

### 画面検証

- 4スクリーンショットを 2026-03-04 16:50 JST に再撮影
- `validate-phase11-screenshot-coverage` PASS（4/4）

### 追補: 「ツールを削除」が実行されない不具合の修正（2026-03-04）

- 症状:
  - SkillCenter 詳細パネルで「ツールを削除」を押下しても削除されない。
- 原因:
  - `handleRequestDelete` は呼ばれていたが、`isDeleteConfirmOpen` を表示する確認ダイアログが `SkillCenterView` で未描画だった。
- 修正:
  - `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` に削除確認ダイアログを追加。
  - `handleConfirmDelete` / `handleCancelDelete` を接続。
  - `Escape` キーでキャンセルできるように導線を追加。
- テスト:
  - `SkillCenterView.delete-confirm.test.tsx` を追加（表示/確認/キャンセルの3ケース）。
  - `useSkillCenter.test.ts` / `useFeaturedSkills.test.ts` と合わせて 30テスト PASS。
- カバレッジ:
  - Hotfix 対象範囲で `Stmts/Lines 86.89`, `Branch 84.61`, `Functions 88.88`（いずれも 80% 以上）。
