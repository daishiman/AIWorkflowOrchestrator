# 新規サブパスエクスポート追加ガイド

## 概要

`@repo/shared` に新しいサブパスエクスポートを追加する際の手順。4つの設定ファイルを同時に更新する必要がある。

## 手順

### Step 1: ソースファイル作成

```bash
mkdir -p packages/shared/src/new-module
cat > packages/shared/src/new-module/index.ts << 'EOF'
export interface NewType { ... }
export const NEW_CONSTANT = "value" as const;
EOF
```

### Step 2: package.json exports に追加

```json
"./new-module": {
  "types": "./dist/src/new-module/index.d.ts",
  "import": "./dist/src/new-module/index.js"
}
```

### Step 3: package.json typesVersions に追加

```json
"new-module": ["./src/new-module/index.ts"]
```

### Step 4: tsup.config.ts entry に追加

```typescript
entry: [
  // ...
  "src/new-module/index.ts",
];
```

### Step 5: apps/desktop/tsconfig.json paths に追加

```json
"@repo/shared/new-module": ["../../packages/shared/src/new-module/index.ts"]
```

### Step 6: apps/desktop/vitest.config.ts alias に追加

```typescript
"@repo/shared/new-module": resolve(
  __dirname,
  "../../packages/shared/src/new-module/index.ts",
),
```

### Step 7: 検証

```bash
pnpm --filter @repo/shared build
pnpm typecheck
pnpm --filter @repo/desktop exec vitest run src/__tests__/
```

## 注意事項

- Step 2-6 の4ファイルは**すべて同時に**更新すること
- パスパターンに注意: `src/` 配下は `dist/src/` になる
- ルートレベル（`core/`, `infrastructure/`）は `dist/` 直下になる
