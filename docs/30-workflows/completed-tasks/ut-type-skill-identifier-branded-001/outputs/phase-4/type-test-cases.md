# Phase 4 型テスト一覧

## TC-TYPE-01

- 観点: `SkillId` の export 存在
- 判定: Red（未実装）

## TC-TYPE-02

- 観点: `SkillName` の export 存在
- 判定: Red（未実装）

## TC-TYPE-03

- 観点: `SkillId -> SkillName` 代入禁止
- 実装: `@ts-expect-error` で固定
- 判定: Red（現時点は未使用エラー）

## TC-TYPE-04

- 観点: `SkillName -> SkillId` 代入禁止
- 実装: `@ts-expect-error` で固定
- 判定: Red（現時点は未使用エラー）
