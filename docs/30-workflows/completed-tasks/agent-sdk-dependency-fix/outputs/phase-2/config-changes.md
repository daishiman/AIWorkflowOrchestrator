# 設定変更案 - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 2 - 設計                                |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

## 変更対象ファイル

### 変更が必要なファイル

| ファイル                       | 変更種別 | 説明                     |
| ------------------------------ | -------- | ------------------------ |
| `packages/shared/package.json` | 修正     | dependencies に SDK 追加 |

### 変更が不要なファイル

| ファイル                               | 理由                           |
| -------------------------------------- | ------------------------------ |
| `apps/desktop/package.json`            | 既に SDK が宣言済み            |
| `apps/desktop/electron.vite.config.ts` | externalizeDeps 設定は現状維持 |
| `.npmrc`                               | 設定変更不要                   |
| `pnpm-workspace.yaml`                  | 設定変更不要                   |

---

## 具体的な変更内容

### packages/shared/package.json

**変更前**:

```json
{
  "dependencies": {
    "@libsql/client": "^0.15.15",
    "@supabase/supabase-js": "^2.86.2",
    "better-sqlite3": "^12.5.0",
    "date-fns": "^4.1.0",
    "drizzle-orm": "^0.39.0",
    "fast-glob": "^3.3.3",
    "openai": "^6.15.0",
    "papaparse": "^5.5.3",
    "react-router-dom": "^7.11.0",
    "tiktoken": "^1.0.22",
    "turndown": "^7.2.0",
    "zod": "^4.1.13"
  }
}
```

**変更後**:

```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.5",
    "@libsql/client": "^0.15.15",
    "@supabase/supabase-js": "^2.86.2",
    "better-sqlite3": "^12.5.0",
    "date-fns": "^4.1.0",
    "drizzle-orm": "^0.39.0",
    "fast-glob": "^3.3.3",
    "openai": "^6.15.0",
    "papaparse": "^5.5.3",
    "react-router-dom": "^7.11.0",
    "tiktoken": "^1.0.22",
    "turndown": "^7.2.0",
    "zod": "^4.1.13"
  }
}
```

**変更点**:

- `"@anthropic-ai/claude-agent-sdk": "^0.2.5"` を dependencies の先頭に追加
- アルファベット順のソートを維持

---

## electron-vite 設定（変更なし）

### 現在の設定（維持）

```typescript
// apps/desktop/electron.vite.config.ts
main: {
  plugins: [externalizeDepsPlugin()],
  // ...
}
```

`externalizeDepsPlugin()` はデフォルト設定のまま維持。
SDKは引き続き外部依存として処理される。

### 設定を変更しない理由

| 項目                 | 説明                              |
| -------------------- | --------------------------------- |
| バンドルサイズ       | SDK（71.8MB）をバンドルしない     |
| ビルド時間           | 外部化により高速ビルドを維持      |
| ネイティブモジュール | SDKの依存関係の互換性リスクを回避 |

---

## pnpm 設定（変更なし）

### .npmrc（維持）

```ini
node-linker=isolated
```

`isolated` モードにより、各パッケージに完全なnode_modulesが作成される。
SDKも `packages/shared/node_modules` および `apps/desktop/node_modules` に配置される。

### pnpm-workspace.yaml（維持）

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

ワークスペース設定に変更は不要。

---

## バージョン管理

### SDK バージョンの統一

| パッケージ        | SDK バージョン |
| ----------------- | -------------- |
| `packages/shared` | `^0.2.5`       |
| `apps/desktop`    | `^0.2.5`       |

両パッケージで同一バージョンを使用。
pnpm の重複排除により、実際には1つのコピーのみがインストールされる。

### 将来のバージョン更新

SDKバージョンを更新する場合は、両方の `package.json` を同時に更新すること:

```bash
pnpm --filter @repo/shared add @anthropic-ai/claude-agent-sdk@^0.3.0
pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk@^0.3.0
```

---

## 実装手順

### Phase 5 での実装手順

1. `packages/shared/package.json` を編集
2. `pnpm install` を実行
3. 依存関係が正しく解決されたことを確認:
   ```bash
   ls node_modules/@anthropic-ai/claude-agent-sdk
   pnpm ls @anthropic-ai/claude-agent-sdk
   ```
4. ビルドを実行:
   ```bash
   pnpm --filter @repo/shared build
   pnpm --filter @repo/desktop build
   ```
5. アプリを起動して検証:
   ```bash
   pnpm --filter @repo/desktop dev
   ```

---

## リスク分析

| リスク               | 対策                                          |
| -------------------- | --------------------------------------------- |
| SDK バージョン不一致 | 両パッケージで同一バージョンを指定            |
| pnpm キャッシュ問題  | `pnpm store prune` で古いキャッシュをクリア   |
| ビルドエラー         | `pnpm --filter @repo/shared build` で事前検証 |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
