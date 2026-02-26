# 実装ガイド

## Part 1: 中学生向け説明

### まず何を直したのか

この修正は「IDと名前の取り違え」を防ぐためのものです。

### どんな問題だったか

- スキルには2種類の文字列があります。
- `skill.id` は機械向けの識別子。
- `skill.name` は人が読む名前。
- どちらもただの文字列だと、間違って入れ替えてもコンピュータが気づけません。

### たとえ話

- 学校の出席番号（ID）と名前（Name）を考える。
- 出席番号の欄に名前を書いても意味は通じない。
- 今回は「出席番号用」「名前用」と型でラベルを付けて、入れ間違いを自動で止めるようにした。

### 何が良くなったか

- 実行前（コンパイル時）に取り違えを見つけられる。
- 同じバグの再発が起きにくくなる。

## Part 2: 開発者向け説明

### 追加した型定義

- `SkillBrand<B extends string>`
- `SkillId = SkillBrand<"SkillId">`
- `SkillName = SkillBrand<"SkillName">`
- `toSkillId(value: string): SkillId`
- `toSkillName(value: string): SkillName`

### 主要適用箇所

- `packages/shared/src/types/skill.ts`
  - `Skill.id: SkillId`
  - `Skill.name: SkillName`
  - `SkillExecutionRequest.skillName: SkillName`
- `SkillImportDialog`
  - `selectedIds: Set<SkillId>`
  - `onImport: (skillNames: SkillName[]) => void`
- `agentSlice`
  - `importedSkillIds: SkillId[]`
  - `importSkill/removeSkill/selectSkillByName` に `SkillName` 適用
- `preload skillAPI` / `main skillHandlers`
  - import/remove の受け口を `SkillName` へ統一

### APIシグネチャ影響

- `skillAPI.import(skillName: SkillName)`
- `skillAPI.remove(skillName: SkillName)`
- `skill:import` / `skill:remove` handler 引数: `SkillName`

### エッジケース

- 生文字列互換は維持（段階移行のため）。
- `SkillId` と `SkillName` 相互代入は型エラー。
- runtimeバリデーション（trim/空文字拒否）は従来維持。

### 設定値・運用

- coverage閾値は既存global設定に依存。
- `@repo/shared build` は現環境のesbuild不整合に注意（Host/Binary mismatch）。
