# Phase 1: 受け入れ基準

## AC-001: 定数一元化

- `packages/shared/src/constants/skillName.ts` が存在し、`SKILL_NAME_PATTERN: RegExp` をエクスポートしている
- `SKILL_NAME_PATTERN` の値は `/^[a-z0-9]+(-[a-z0-9]+)*$/` と等価である
- `packages/shared/src/constants/index.ts` から `SKILL_NAME_PATTERN` が再エクスポートされている

## AC-002: 参照更新

- `SkillScanner.ts` が `@repo/shared/constants` から `SKILL_NAME_PATTERN` をインポートしている
- `init_skill.js` のインラインリテラル `/^[a-z0-9]+(-[a-z0-9]+)*$/` が削除され、`SKILL_NAME_PATTERN` 参照に置き換わっている

## AC-003: ビルド成功

- `pnpm --filter @repo/shared build` が成功する
- `packages/shared/dist/src/constants/index.cjs` が存在する
- `packages/shared/dist/src/constants/index.js` が存在する

## AC-004: テスト全通過

- `pnpm --filter @repo/shared vitest run src/constants/skillName.test.ts` が全件通過する
- 既存の SkillScanner テストが全件通過する（回帰なし）

## AC-005: NON_VISUAL 確認

- UI変更なし・画面変更なしが実装後に確認されている
