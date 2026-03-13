# アーキテクチャ総論 / detail specification

> 親仕様書: [architecture-overview.md](architecture-overview.md)
> 役割: detail specification

## 機能追加パターン

### Web機能追加（apps/web/features/）

| ステップ | 内容 | 成果物 |
|---------|-----|-------|
| 1 | Zodスキーマ定義 | `schema.ts` |
| 2 | Executor実装 | `executor.ts` |
| 3 | テスト作成 | `executor.test.ts` |
| 4 | API Route追加 | `app/api/...` |

### Desktop機能追加

| ステップ | 内容 | 成果物 |
|---------|-----|-------|
| 1 | 型定義 | `packages/shared/src/types/` |
| 2 | Main Processサービス | `main/services/{name}/` |
| 3 | IPCハンドラ | `main/ipc/{name}Handlers.ts` |
| 4 | Preload API公開 | `preload/index.ts` |
| 5 | Renderer UI | `renderer/features/{name}/` |
| 6 | Zustand Slice | `renderer/store/slices/` |

### 新規Slice追加手順

| ステップ | 内容 |
|---------|-----|
| 1 | `store/slices/{name}Slice.ts` 作成 |
| 2 | State, Actions, Slice インターフェース定義 |
| 3 | `store/index.ts` でSliceをimport・統合 |
| 4 | テスト作成 |

📖 詳細: [arch-feature-addition.md](./arch-feature-addition.md)

---

## 技術スタック

| カテゴリ | ドキュメント | 内容 |
|---------|------------|-----|
| コア | [technology-core.md](./technology-core.md) | Next.js, TypeScript, Electron |
| フロントエンド | [technology-frontend.md](./technology-frontend.md) | React, Tailwind, Zustand |
| バックエンド | [technology-backend.md](./technology-backend.md) | Drizzle, Turso, AI統合 |
| デスクトップ | [technology-desktop.md](./technology-desktop.md) | Electron, better-sqlite3 |
| DevOps | [technology-devops.md](./technology-devops.md) | CI/CD, テスト |

---

