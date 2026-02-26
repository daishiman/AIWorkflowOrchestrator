# Phase 2 型設計書

## 採用方針

`SkillId` / `SkillName` を Branded Type で定義し、`Skill` 系型へ適用する。

## 型定義案

```ts
declare const __skillBrand: unique symbol;
export type SkillBrand<B extends string> = string & {
  readonly [__skillBrand]?: B;
};

export type SkillId = SkillBrand<"SkillId">;
export type SkillName = SkillBrand<"SkillName">;

export const toSkillId = (value: string): SkillId => value as SkillId;
export const toSkillName = (value: string): SkillName => value as SkillName;
```

## 適用対象

- `Skill.id: SkillId`
- `Skill.name: SkillName`
- `SkillImportConfig.importedSkillIds: SkillId[]`
- `SkillExecutionRequest.skillName: SkillName`

## 設計意図

- `SkillId` と `SkillName` の相互代入は禁止。
- 生文字列は受け入れつつ、`Skill` オブジェクトから取り出した値同士の取り違えは型エラー化。
- 既存大量コードの段階移行を可能にする。
