# Phase 5: 設計変更記録

## 変更内容

### 1. apps/desktop/tsconfig.json -- paths マッピング追加

27個の `@repo/shared` サブパスマッピングを `compilerOptions.paths` に追加。

| 設定前                       | 設定後                        |
| ---------------------------- | ----------------------------- |
| 2エントリ (@renderer/_, @/_) | 29エントリ (+27 @repo/shared) |

### 2. packages/shared/package.json -- typesVersions 追加

`typesVersions` フィールドを新規追加。全26サブパス（ルートエントリ `.` を除く）のソースファイル参照を定義。

### 3. apps/desktop/vitest.config.ts -- 不足 alias 追加

以下の3エントリを追加し、TypeScript paths との完全一致を達成:

- `@repo/shared/core` -> `../../packages/shared/core/index.ts`
- `@repo/shared/infrastructure` -> `../../packages/shared/infrastructure/index.ts`
- `@repo/shared/infrastructure/database` -> `../../packages/shared/infrastructure/database/index.ts`

## 設計判断

- **Approach B（tsconfig paths）を主軸**: TypeScript の型チェック時に直接ソースファイルを参照。ビルド前でも型解決が可能。
- **Approach A（typesVersions）をフォールバック**: package.json レベルでの型解決バックアップ。IDE のオートコンプリート改善にも寄与。
- **Vitest alias との整合性**: 3つの不足エントリを発見・追加し、paths/alias/exports の三重整合を達成。
