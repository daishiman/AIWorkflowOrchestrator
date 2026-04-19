# Phase 12 成果物: 実装ガイド

## Part 1: 中学生向け説明

### describe.skip とは何か？

`describe` は、テストをまとめる箱です。  
たとえば学校のプリントで「数学」「英語」と見出しを分ける感覚に近いです。

その箱に `.skip` を付けると、その箱の中身を丸ごと実行しません。

```ts
describe.skip("算数テスト", () => {
  it("たし算", () => {});
  it("ひき算", () => {});
});
```

### なぜ問題になるのか？

掃除当番の表に名前があるのに、毎回「今日はやらなくていい」と書かれたままだと、本当に掃除できているか分からなくなります。  
テストも同じで、「ある」のに「動かない」状態が続くと、バグを見つける力が落ちます。

### 今回やったこと

- 今の画面ではもう使えない古い skip テストを削除した
- 今でも意味がある `U-20b` だけ通常のテストに戻した
- 対象テストファイルから `planSkill` / `detectMode` 参照をなくした

これで、見せかけのテストではなく、今の画面で本当に動くテストだけが残りました。

## Part 2: 技術者向け詳細

### 変更概要

| 項目                                           | 変更前  | 変更後  |
| ---------------------------------------------- | ------- | ------- |
| テストファイル行数                             | 1887 行 | 1548 行 |
| `describe.skip` 件数                           | 12      | 0       |
| 対象ファイル内 `planSkill` / `detectMode` 参照 | あり    | なし    |
| `U-20b`                                        | skip    | active  |

### 実施内容

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
  - `mockDetectMode` / `mockPlanSkill` を削除
  - `skill-lifecycle-prepare-button` 前提の skip suite を削除
  - `U-20b` を active test に昇格

### 削除判断基準

1. 旧 `planSkill` / `detectMode` モックに依存している
2. 現行 renderer に存在しない `skill-lifecycle-prepare-button` を前提にしている
3. 現行フロー `executePlan` の検証に置き換え済みである

### 検証結果

```bash
grep -c "describe\.skip\|it\.skip\|test\.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# 0

grep -c "planSkill\|detectMode" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# 0

pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# Test Files 1 passed / Tests 30 passed

pnpm exec eslint src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
# PASS
```

### 注意点

- `SkillLifecyclePanel.tsx` や preload 層には `detectMode` / `planSkill` 型がまだ存在する。今回の cleanup は「対象テストファイルの stale dependency 解消」であり、public surface の削除ではない。
- desktop package 全体の `tsc --noEmit` はこのレビュー実行では 30 秒 timeout し、フル型検証は未再確認。

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。  
`outputs/phase-11/screenshots/` は validator 互換ディレクトリとしてのみ保持し、画像ファイルは生成しない。
