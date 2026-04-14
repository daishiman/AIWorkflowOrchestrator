# Phase 1: 要件定義書

## 調査結果

### 正規表現の同一性確認

| ファイル                                                 | 箇所                                | 正規表現                     |
| -------------------------------------------------------- | ----------------------------------- | ---------------------------- |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts:324`   | `validateSkillName()` JSDocコメント | `/^[a-z0-9]+(-[a-z0-9]+)*$/` |
| `.claude/skills/skill-creator/scripts/init_skill.js:109` | `validateSkillName()` 関数内        | `/^[a-z0-9]+(-[a-z0-9]+)*$/` |

**判定**: 2箇所の正規表現は完全に同一。一元化対象として確認済み。

### packages/shared ビルド設定確認

- `packages/shared/package.json` の `exports` フィールドに `./constants` エントリが存在（行153-157）
- CJS: `./dist/src/constants/index.cjs`
- ESM: `./dist/src/constants/index.js`
- 型定義: `./dist/src/constants/index.d.ts`
- **判定**: 新規ファイル `skillName.ts` を追加すればビルド時に自動的にバンドルされる

### init_skill.js の動作環境確認

- `#!/usr/bin/env node` + `"type": "module"` → Node.js ESM環境
- `import` 文を使用（例: `import { mkdirSync } from "fs"`）
- `@repo/shared/constants` からの ESM import が可能

## 機能要件

1. **FR-001**: `SKILL_NAME_PATTERN` 定数を `packages/shared/src/constants/skillName.ts` に一元定義する
2. **FR-002**: `packages/shared/src/constants/index.ts` から `SKILL_NAME_PATTERN` を再エクスポートする
3. **FR-003**: `SkillScanner.ts` が `@repo/shared/constants` から `SKILL_NAME_PATTERN` をインポートして使用する
4. **FR-004**: `init_skill.js` が `@repo/shared/constants` から `SKILL_NAME_PATTERN` をインポートして使用する

## 非機能要件

1. **NFR-001**: ビルド後に `pnpm --filter @repo/shared build` が成功すること
2. **NFR-002**: 既存の全テストが通過すること（回帰なし）
3. **NFR-003**: CJS/ESM 両方でエクスポートが解決できること

## NON_VISUAL タスク分類根拠

- ユーザー向け UI 変更なし
- 画面レイアウト・スタイル変更なし
- バリデーションルール自体は同一（`/^[a-z0-9]+(-[a-z0-9]+)*$/` に変更なし）
- 内部実装の整理・一元化のみ（リファクタリング）
