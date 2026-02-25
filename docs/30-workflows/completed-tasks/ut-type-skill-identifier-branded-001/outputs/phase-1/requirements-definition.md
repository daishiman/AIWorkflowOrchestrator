# Phase 1 要件定義

## 概要

Issue #867 の再発防止として、`skill.id` と `skill.name` の意味差を型で固定し、コンパイル時に取り違えを検出可能にする。

## 機能要件（FR）

- FR-1: `SkillId` と `SkillName` を `packages/shared/src/types/skill.ts` に定義する。
- FR-2: `Skill.id` は `SkillId`、`Skill.name` は `SkillName` にする。
- FR-3: 型変換関数 `toSkillId(value)` / `toSkillName(value)` を提供する。
- FR-4: Renderer 境界で `selectedIds(Set<SkillId>) -> skillNames(SkillName[])` 変換を明示する。
- FR-5: IPC `skill:import` は `SkillName` 文脈で統一する（実行時は既存バリデーション維持）。

## 非機能要件（NFR）

- NFR-1: 既存の実行時挙動を変更しない（ランタイムオーバーヘッドゼロ）。
- NFR-2: `pnpm --filter @repo/shared build` / `pnpm typecheck` / `pnpm --filter @repo/desktop test:run` を通過可能な変更にする。
- NFR-3: 既存のIPCセキュリティ要件（sender検証、trim検証）を保持する。

## 受け入れ基準

- AC-1: `SkillId` を `SkillName` 引数に渡すコードが型エラーになる。
- AC-2: `SkillName` を `SkillId` 引数に渡すコードが型エラーになる。
- AC-3: `SkillImportDialog` の `onImport` は `SkillName[]` を受け渡す。
- AC-4: `importedSkillIds` は `SkillId[]` 文脈で扱われる。
- AC-5: 既存テストと型チェックがGreenになる。

## 依存タスク境界

- 本タスクで対応: Branded Type導入、Renderer/Store/Mainの型適用。
- 本タスクで対応しない: IPC引数命名統一（UT-FIX-SKILL-IPC-NAMING-P45-001）。
- 本タスクで対応しない: `as unknown as Skill[]` 解消（UT-FIX-5-1-001）。
