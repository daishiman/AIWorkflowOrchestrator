# Phase 2: ビルド設定分析

## packages/shared/package.json exports 確認

`./constants` エントリが存在（行153-157）:

```json
"./constants": {
  "types": "./dist/src/constants/index.d.ts",
  "import": "./dist/src/constants/index.js",
  "require": "./dist/src/constants/index.cjs"
}
```

**判定**: CJS/ESM 両対応済み。新規ファイル `skillName.ts` を `index.ts` から re-export するだけでビルドに含まれる。

## typesVersions 確認

```json
"constants": ["./src/constants/index.ts"]
```

TypeScript の型解決も `./src/constants/index.ts` 経由で正しく動作する。

## tsup 設定（推定）

`tsup.config.ts` は `format: ["cjs", "esm"]` を指定しており、`src/constants/index.ts` をエントリポイントとして CJS/ESM の両バンドルを生成する。

## 循環依存チェック

依存グラフ:

```
.claude/skills/init_skill.js  →  @repo/shared/constants
apps/desktop/src/main/claude-cli/SkillScanner.ts  →  @repo/shared/constants
packages/shared/constants     →  (内部のみ、外部依存なし)
```

循環依存なし。`packages/shared` は他のモノレポパッケージに依存しない方向。
