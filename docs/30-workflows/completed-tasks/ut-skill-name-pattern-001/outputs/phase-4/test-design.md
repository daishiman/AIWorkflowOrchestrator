# Phase 4: テスト設計

## 実施日

2026-04-14

## 既存テスト評価

### TC-01: `SKILL_NAME_PATTERN` の正規表現 source

- **カバー**: `packages/shared/src/constants/skillName.test.ts`
- **期待値**: `^[a-z0-9]+(-[a-z0-9]+)*$`
- **状態**: ✅ テスト済み

### TC-02: `MAX_SKILL_NAME_LENGTH` の型

- **カバー**: `packages/shared/src/constants/skillName.test.ts`
- **期待値**: `number`（`Number.isInteger` で確認）
- **状態**: ✅ テスト済み

### TC-03: `MAX_SKILL_NAME_LENGTH` の値

- **カバー**: `packages/shared/src/constants/skillName.test.ts` / `manual-import.test.ts`
- **期待値**: `64`
- **状態**: ✅ テスト済み

### TC-04: 有効な kebab-case

- **カバー**: `skillName.test.ts`（`my-skill`, `myskill`, `my-skill-2`）
- **状態**: ✅ テスト済み

### TC-05: 無効な文字列

- **カバー**: `skillName.test.ts`（`my_skill`, `-my-skill`, `MY-SKILL`, 空文字, `スキル`）
- **状態**: ✅ テスト済み

### TC-06: 64/65 文字境界

- **カバー**: `skill-scanner.test.ts`（`a`.repeat(64) → true、`a`.repeat(65) → false）
- **状態**: ✅ テスト済み

## 判定

**新規テストの追加は不要。**

現行テストが TC-01〜TC-06 を全て網羅している。
drift が検出されなかったため、追加の Red テストは作成しない。

## 使用するテストファイル

| ファイル                                                           | 役割               |
| ------------------------------------------------------------------ | ------------------ |
| `packages/shared/src/constants/skillName.test.ts`                  | TC-01〜TC-05       |
| `packages/shared/src/constants/__tests__/manual-import.test.ts`    | barrel export 確認 |
| `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` | TC-06 境界値       |
