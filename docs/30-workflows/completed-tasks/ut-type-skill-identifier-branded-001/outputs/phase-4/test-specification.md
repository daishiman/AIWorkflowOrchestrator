# Phase 4 テスト仕様

## 目的

実装前に、`SkillId` と `SkillName` の取り違えがコンパイル時に失敗する状態（Red）を固定する。

## Red化で実施した内容

- 型テストファイル追加:
  - `packages/shared/src/types/skill-identifier-branded.typecheck.ts`
- 実行コマンド:
  - `pnpm --filter @repo/shared typecheck`
- 結果:
  - 期待通り失敗（`SkillId`/`SkillName` 未定義、`@ts-expect-error` 未使用）
  - ログ: `outputs/phase-4/red-test-log.txt`

## Green条件（Phase 5）

- `SkillId`/`SkillName`/`toSkillId`/`toSkillName` が `skill.ts` に追加される。
- 型テストの `@ts-expect-error` が有効化される。
- `pnpm typecheck` と関連テストが成功する。
