# Community型エクスポート追加（Part 2: メインエクスポート） - タスク指示書

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | SHARED-TYPE-EXPORT-02                               |
| タスク名     | @repo/shared Community型エクスポート（メインindex） |
| 分類         | リファクタリング                                    |
| 対象機能     | @repo/shared パッケージ                             |
| 優先度       | 高                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | Phase 12 (CONV-08-05)                               |
| 発見日       | 2026-01-13                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Part 1で `services/graph/index.ts` からの型エクスポートを整理した後、パッケージのメインエントリポイント（`src/index.ts`）からも型をエクスポートする必要がある。

### 1.2 問題点・課題

`apps/desktop` では以下のようにインポートしている:

```typescript
import {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityId,
  EntityId,
} from "@repo/shared";
```

しかし、`@repo/shared` のメイン `index.ts` からこれらの型がエクスポートされていない。

### 1.3 放置した場合の影響

- Part 1だけでは問題が解決しない
- パッケージ利用者が深いパスでインポートする必要がある

---

## 2. 何を達成するか（What）

### 2.1 目的

`@repo/shared` のメインエントリポイントからCommunity関連型をエクスポートする。

### 2.2 最終ゴール

以下のインポートが機能する状態:

```typescript
import {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityId,
  EntityId,
} from "@repo/shared";
```

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/index.ts` の更新
- `types/rag/branded.ts` からの型エクスポート確認

#### 含まないもの

- 型定義自体の変更（Part 1で完了）
- デスクトップアプリ側の修正（Part 3で実施）

### 2.4 成果物

| 成果物                              | 内容               |
| ----------------------------------- | ------------------ |
| `packages/shared/src/index.ts` 更新 | 型エクスポート追加 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- SHARED-TYPE-EXPORT-01（Part 1）が完了している

### 3.2 依存タスク

| タスクID              | 内容             |
| --------------------- | ---------------- |
| SHARED-TYPE-EXPORT-01 | 型整理（Part 1） |

### 3.3 必要な知識

- パッケージのバレルファイル構造
- TypeScriptの型再エクスポート

### 3.4 推奨アプローチ

1. `src/index.ts` の現在のエクスポート構造を確認
2. `services/graph` からの型エクスポートを追加
3. `types/rag/branded` からの型エクスポートを確認・追加

---

## 4. 実行手順

### Phase 1: メインindex.tsの更新

#### 目的

パッケージのメインエントリポイントから型をエクスポートする。

#### 手順

1. `packages/shared/src/index.ts` を開く
2. 以下のエクスポートを追加:

```typescript
// Community関連型
export type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityStructure,
} from "./services/graph";

// Branded型（既にエクスポートされている可能性あり、確認）
export type { CommunityId, EntityId } from "./types/rag/branded";

// ヘルパー関数（必要に応じて）
export { createCommunityId, createEntityId } from "./types/rag/branded";
```

3. 既存のエクスポートと重複がないか確認

#### 成果物

更新された `packages/shared/src/index.ts`

#### 完了条件

- [ ] `Community` 型がパッケージからエクスポートされている
- [ ] `CommunitySummary` 型がパッケージからエクスポートされている
- [ ] `StoredEntity` 型がパッケージからエクスポートされている
- [ ] `CommunityId` 型がパッケージからエクスポートされている
- [ ] `EntityId` 型がパッケージからエクスポートされている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全ての必要な型がエクスポートされている
- [ ] `import { ... } from "@repo/shared"` で型がインポート可能

### 品質要件

- [ ] TypeScript型エラーがない
- [ ] 既存のエクスポートが壊れていない
- [ ] 循環参照がない

---

## 6. 検証方法

### 検証手順

```bash
# 1. パッケージの型チェック
cd packages/shared
pnpm typecheck

# 2. ビルド確認
pnpm build

# 3. エクスポート確認（手動）
# src/index.ts を確認し、エクスポートが追加されていることを確認
```

---

## 7. 参照情報

### 関連ファイル

| ファイル                              | 内容            |
| ------------------------------------- | --------------- |
| `packages/shared/src/index.ts`        | 更新対象        |
| `packages/shared/src/services/graph/` | 型ソース        |
| `packages/shared/src/types/rag/`      | Branded型ソース |

### 関連タスク

| タスクID              | 内容           |
| --------------------- | -------------- |
| SHARED-TYPE-EXPORT-01 | 型整理         |
| SHARED-TYPE-EXPORT-03 | 型チェック検証 |
