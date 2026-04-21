# 依存パッケージ・型境界・ESM/CJS 互換性

## 依存パッケージ

| パッケージ             | 種別                             | 追加コマンド                                          |
| ---------------------- | -------------------------------- | ----------------------------------------------------- |
| `@xenova/transformers` | `dependencies`（未インストール） | `pnpm --filter @repo/shared add @xenova/transformers` |

### 注意事項

- `@xenova/transformers` は **ESM-only** パッケージ
- `packages/shared` の `tsconfig.json` の `module` が `ESNext` または `NodeNext` である必要がある
- `devDependencies` ではなく `dependencies` に追加（ランタイム依存）

## 型境界設計

### import する型

```typescript
// 動的 import で型情報を取得（型アサーション用のみ）
// ランタイムでの import は loadModel() 内の動的 import() を使用
```

### 型境界の原則

| 境界                                     | 方針                                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `AutoTokenizer.from_pretrained` の戻り値 | `unknown` で保持、利用直前に `as { ... }` でアサーション                               |
| `AutoModel.from_pretrained` の戻り値     | `unknown` で保持、利用直前に `as { ... }` でアサーション                               |
| `model(inputs)` の戻り値                 | `unknown` で受け、`out.last_hidden_state` / `out.hidden_states` を `as` でアサーション |
| ヘルパ関数の入出力                       | 明示的な TypeScript 型で宣言（純関数で型安全）                                         |

### `any` 漏洩防止

- `unknown` を使用し、型アサーションを利用箇所の直前でローカルに行う
- `@ts-expect-error` は使用しない
- `any` は使用しない

## ESM/CJS 互換性

### 動的 import の採用理由

```typescript
const { AutoTokenizer, AutoModel } = await import("@xenova/transformers");
```

- `loadModel()` が呼ばれるまで `@xenova/transformers` のロードを遅延できる
- テスト環境では `vi.mock("@xenova/transformers")` で完全差し替え可能
- `XenovaTransformerEncoder` をインポートするだけではライブラリ本体がロードされない

### tsconfig 確認事項

`packages/shared/tsconfig.json` で以下を確認する（Phase 4 / Step 1 で実施）:

- `"module": "ESNext"` または `"NodeNext"`
- `"moduleResolution": "bundler"` または `"NodeNext"`

### Vite/バンドラー対応

動的 import が Vite でバンドルされる場合、`@xenova/transformers` を `optimizeDeps.exclude` に追加が必要な可能性がある。Phase 6 でビルドテストして判断する。

## スコープ外の明示事項

| 項目                                       | 根拠                                            |
| ------------------------------------------ | ----------------------------------------------- |
| Electron レンダラープロセスでの動作確認    | 別タスクで E2E 確認                             |
| モデルキャッシュパス設定（`env.cacheDir`） | 利用者責務（元仕様書 §6.2）                     |
| CJS 環境での動作保証                       | `@xenova/transformers` が ESM-only のため対象外 |
| `@xenova/transformers` 以外のバックエンド  | 別タスクで扱う                                  |

## index.ts エクスポート追加行（AC-7）

```typescript
// packages/shared/src/services/embedding/late-chunking/index.ts
// 末尾に1行追加
export { XenovaTransformerEncoder } from "./xenova-transformer-encoder";
```

- 既存4クラスのエクスポート行は変更しない
- 名前付きエクスポートのみ（default export 禁止）
