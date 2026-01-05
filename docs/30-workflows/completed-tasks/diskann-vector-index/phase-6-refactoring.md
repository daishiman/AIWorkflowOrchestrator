# Phase 6: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 6                    |
| Phase名    | リファクタリング     |
| 前提Phase  | Phase 5              |
| 後続Phase  | Phase 7              |
| ステータス | 完了                 |
| 作成日     | 2026-01-04           |
| 完了日     | 2026-01-04           |
| 機能名     | diskann-vector-index |

---

## 目的

TDDの「Refactor」フェーズとして、テストをパスさせたままコード品質を改善する。

## 背景

Phase 5で作成した「動くコード」を、保守性・可読性・パフォーマンスの観点で改善する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: refactoring-patterns

**パス**: `.claude/skills/refactoring-patterns/SKILL.md`

**Trigger条件**: コードリファクタリングが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- リファクタリング後のコード

---

### スキル2: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**: コード品質改善が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行

**期待される成果物**:

- クリーンコード

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> リファクタリング時に以下のシステム仕様との整合性を確認してください。

| 参照資料               | パス                                                                           | 内容                    |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| データベース実装       | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM実装パターン |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | 設計パターン・命名規則  |

### Phase成果物・コード

| 参照資料       | パス                                                         | 内容         |
| -------------- | ------------------------------------------------------------ | ------------ |
| Phase 5 成果物 | `outputs/phase-5/`                                           | 実装サマリー |
| 実装コード     | `packages/shared/src/db/schema/embeddings.ts`                | 現在の実装   |
| テストコード   | `packages/shared/src/db/schema/__tests__/embeddings.test.ts` | テスト       |

---

## 成果物

| 成果物               | パス                                 | 内容                       |
| -------------------- | ------------------------------------ | -------------------------- |
| リファクタリング記録 | `outputs/phase-6/refactoring-log.md` | 変更内容の記録             |
| 改善コード           | 各実装ファイル                       | リファクタリング後のコード |

---

## 完了条件

- [x] コードの重複が排除されている
- [x] 関数が適切なサイズに分割されている
- [x] 命名が明確で一貫している
- [x] コメントが適切に記述されている
- [x] JSDocコメントが全パブリック関数に記述されている
- [x] 型定義が最適化されている
- [x] エラーハンドリングが適切に実装されている
- [x] リファクタリング後もテストがパスする

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run -- --grep "embeddings"
```

**確認項目**:

- [x] リファクタリング後もテストが成功することを確認

**実行結果**:

```
✓ src/db/schema/__tests__/embeddings.test.ts (145 tests) 223ms

Test Files  62 passed (62)
     Tests  2717 passed | 6 todo (2723)
```

---

## リファクタリング観点

### 1. コード品質

- [x] 不要なコードの削除
- [x] 重複コードの抽出・共通化（buildWhereClause関数）
- [x] マジックナンバーの定数化（DEFAULT_SEARCH_LIMIT, DEFAULT_BATCH_SIZE, FLOAT32_BYTES）
- [x] 適切なエラーメッセージ

### 2. 型安全性

- [x] 型推論の活用
- [x] 型ガードの適切な使用
- [x] ジェネリクスの活用（RawDotProductResult型追加）

### 3. パフォーマンス

- [x] 不要な計算の排除
- [x] メモリ効率の改善
- [x] バッチ処理の最適化

### 4. ドキュメント

- [x] JSDocコメントの追加
- [x] 複雑なロジックへのコメント
- [x] 型定義へのコメント

### 5. テスト改善

- [x] テストコードのリファクタリング（Phase 5で実施済み）
- [x] テストヘルパーの抽出（Phase 5で実施済み）
- [x] テストデータの共通化（Phase 5で実施済み）

---

## スキルフィードバック記録

Phase完了後、使用したスキルへのフィードバックを記録してください:

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill refactoring-patterns --result {{success|failure|partial}} --phase 6

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill clean-code-practices --result {{success|failure|partial}} --phase 6
```

### 記録内容

| スキル               | 結果    | 備考                           |
| -------------------- | ------- | ------------------------------ |
| refactoring-patterns | success | 重複排除パターンを適用         |
| clean-code-practices | success | 定数化、ヘルパー関数抽出を実施 |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/diskann-vector-index/phase-7-quality-assurance.md`
