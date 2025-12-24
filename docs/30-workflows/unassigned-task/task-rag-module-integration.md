# RAGモジュール統合タスク

## タスク情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | RAG-INT-001                             |
| タスク名   | RAGモジュールバレルエクスポート作成     |
| 優先度     | 低                                      |
| 発見元     | CONV-03-02 最終レビュー（.claude/agents/arch-police.md） |
| 発見日     | 2025-12-16                              |
| ステータス | 未着手                                  |

---

## 概要

### 背景

CONV-03-02（ファイル・変換スキーマ定義）の実装完了に伴い、RAGドメイン全体のモジュール統合が必要。

### 目的

`packages/shared/src/types/rag/` ディレクトリに、各サブモジュール（file, chunk, embedding等）を統合するバレルエクスポートファイルを作成する。

---

## タスク詳細

### 作成ファイル

**パス**: `packages/shared/src/types/rag/index.ts`

### 期待される内容

```typescript
/**
 * RAGドメインモジュール
 *
 * @description RAGパイプラインに関するすべての型定義を統合エクスポート
 */

// ファイル・変換ドメイン
export * from "./file";

// 今後追加予定
// export * from './chunk';      // CONV-03-03
// export * from './embedding';  // CONV-03-03
// export * from './entity';     // CONV-03-04
// export * from './search';     // CONV-03-05
```

---

## 依存関係

### 前提タスク

- [x] CONV-03-02: ファイル・変換スキーマ定義（完了）

### 後続タスク

- CONV-03-03: チャンク・埋め込みスキーマ定義
- CONV-03-04: エンティティ・関係スキーマ定義
- CONV-03-05: 検索クエリ・結果スキーマ定義

---

## 実装方針

### アプローチ

1. **段階的追加**: 各サブモジュール実装時にエクスポートを追加
2. **コメント残置**: 未実装モジュールはコメントで予告

### 完了条件

- [ ] `packages/shared/src/types/rag/index.ts` が作成されている
- [ ] `@repo/shared/types/rag` でインポート可能
- [ ] 型チェックが成功

---

## 備考

### 優先度が低い理由

- 現時点では `@repo/shared/types/rag/file` で直接インポート可能
- 複数のRAGサブモジュールが実装された後に統合する方が効率的

### 推奨実施タイミング

- CONV-03-03（チャンク・埋め込みスキーマ）実装時に併せて作成

---

## 関連ドキュメント

- `docs/30-workflows/file-conversion-schemas/task-step07-final-review.md`
- `docs/00-requirements/04-directory-structure.md`
