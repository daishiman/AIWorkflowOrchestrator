# Community型エクスポート追加（Part 1: 型整理） - タスク指示書

## メタ情報

```yaml
issue_number: 371
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | SHARED-TYPE-EXPORT-01                          |
| タスク名     | @repo/shared Community型エクスポート（型整理） |
| 分類         | リファクタリング                               |
| 対象機能     | @repo/shared パッケージ                        |
| 優先度       | 高                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | Phase 12 (CONV-08-05)                          |
| 発見日       | 2026-01-13                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-08-05（Community Visualization UI）の実装で、`apps/desktop` から `@repo/shared` の Community 関連型をインポートしようとしたが、型がエクスポートされていないためビルドエラーが発生した。

### 1.2 問題点・課題

以下の型が `@repo/shared` からエクスポートされていない:

- `Community` (services/graph/types.ts)
- `CommunitySummary` (services/graph/types.ts)
- `StoredEntity` (services/graph/types.ts)
- `CommunityId` (types/rag/branded.ts)
- `EntityId` (types/rag/branded.ts)

### 1.3 放置した場合の影響

- pre-push hookの型チェックが失敗し、PRをプッシュできない
- Community Visualization UIの実装がマージできない
- 他の機能でも同様の型を使用する際に同じ問題が発生

---

## 2. 何を達成するか（What）

### 2.1 目的

Community関連の型を適切にエクスポートできるよう、型定義の整理と再エクスポート構造を構築する。

### 2.2 最終ゴール

`services/graph/types.ts` からの型が `services/graph/index.ts` で再エクスポートされている状態。

### 2.3 スコープ

#### 含むもの

- `services/graph/types.ts` の確認
- `services/graph/index.ts` の作成または更新
- 必要に応じた型定義の移動・整理

#### 含まないもの

- メインの `index.ts` からのエクスポート（Part 2で実施）
- デスクトップアプリ側のインポート修正（Part 3で実施）

### 2.4 成果物

| 成果物                         | 内容                   |
| ------------------------------ | ---------------------- |
| `services/graph/index.ts` 更新 | 型の再エクスポート追加 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `@repo/shared` パッケージの構造を理解している
- TypeScriptの型エクスポート・再エクスポートを理解している

### 3.2 依存タスク

なし（このタスクが最初）

### 3.3 必要な知識

- TypeScript の `export type` 構文
- バレルファイル（index.ts）のパターン

### 3.4 推奨アプローチ

1. `services/graph/index.ts` を確認・作成
2. `types.ts` から必要な型を再エクスポート

---

## 4. 実行手順

### Phase 1: 型定義の確認と整理

#### 目的

既存の型定義を確認し、エクスポート構造を整理する。

#### 手順

1. `packages/shared/src/services/graph/types.ts` を確認
2. 以下の型が定義されていることを確認:
   - `Community`
   - `CommunitySummary`
   - `StoredEntity`
3. `packages/shared/src/services/graph/index.ts` を確認
4. 存在しない場合は作成、存在する場合は更新

#### 成果物

```typescript
// packages/shared/src/services/graph/index.ts に追加
export type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
} from "./types";
```

#### 完了条件

- [ ] `services/graph/index.ts` で型がエクスポートされている
- [ ] エクスポートが型のみ（実装は含まない）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `Community` 型がエクスポートされている
- [ ] `CommunitySummary` 型がエクスポートされている
- [ ] `StoredEntity` 型がエクスポートされている

### 品質要件

- [ ] TypeScript型エラーがない
- [ ] 既存のインポートが壊れていない

---

## 6. 検証方法

### 検証手順

```bash
cd packages/shared
pnpm typecheck
```

---

## 7. 参照情報

### 関連ファイル

| ファイル                                      | 内容     |
| --------------------------------------------- | -------- |
| `packages/shared/src/services/graph/types.ts` | 型定義元 |
| `packages/shared/src/services/graph/index.ts` | 更新対象 |

### 関連タスク

| タスクID              | 内容                       |
| --------------------- | -------------------------- |
| SHARED-TYPE-EXPORT-02 | メインindex.tsエクスポート |
| SHARED-TYPE-EXPORT-03 | 型チェック検証             |
