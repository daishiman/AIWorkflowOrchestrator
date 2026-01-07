# Phase 1: 要件定義 - Repository パターン実装

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 前提Phase  | -                  |
| 後続Phase  | Phase 2（設計）    |
| ステータス | 未実施             |
| 作成日     | 2026-01-05         |
| 機能名     | repository-pattern |
| タスクID   | CONV-04-06         |

---

## 目的

Repository パターン実装に必要な要件を定義し、受け入れ基準を明確化する。
BaseRepository、各テーブル固有Repository、ファクトリ関数の機能要件・非機能要件を特定する。

## 背景

CONV-04-02〜05で実装したDBテーブル群（files, chunks, entities等）に対して、
データアクセス層を抽象化するRepositoryパターンを導入する。
これにより、ビジネスロジック層とデータアクセス層の分離、テスタビリティの向上を実現する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: requirements-engineering

**パス**: `.claude/skills/requirements-engineering/SKILL.md`

**Trigger条件**:
要件抽出、仕様化、品質検証、合意形成

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md` - 要件定義書
- `outputs/phase-1/scope-definition.md` - スコープ定義

---

### スキル2: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**:
受け入れ基準、テスト可能性、完了条件

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` - 受け入れ基準

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                 | 内容                           |
| -------------- | -------------------------------------------------------------------- | ------------------------------ |
| 未タスク指示書 | `docs/30-workflows/unassigned-task/task-04-06-repository-pattern.md` | タスク定義・成果物仕様         |
| RAG型定義      | `packages/shared/src/types/rag/`                                     | Result型、RAGError、Branded ID |
| DBスキーマ     | `packages/shared/src/db/schema/`                                     | テーブル定義                   |
| DBクライアント | `packages/shared/src/db/client.ts`                                   | Database型定義                 |

---

## 成果物

| 成果物       | パス                                         | 内容                      |
| ------------ | -------------------------------------------- | ------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件      |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 含む/含まない、前提・制約 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件      |

---

## 完了条件

- [ ] BaseRepositoryの機能要件が定義されている
- [ ] FileRepository/ChunkRepository/EntityRepositoryの機能要件が定義されている
- [ ] `Result<T, RAGError>`を返すエラーハンドリング要件が定義されている
- [ ] ページネーション要件が定義されている
- [ ] ファクトリ関数の要件が定義されている
- [ ] 受け入れ基準がすべて検証可能な形式で記述されている
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] 成果物が `outputs/phase-1/` に出力されている
- [ ] `artifacts.json` の Phase 1 が更新されている

---

## 要件定義の指針

### 機能要件

以下の機能要件を定義すること:

1. **BaseRepository（基底クラス）**
   - `findById(id)`: IDで1件取得
   - `findAll(params)`: ページネーション付き全件取得
   - `create(data)`: 1件作成
   - `createMany(data[])`: バッチ作成
   - `update(id, data)`: 更新
   - `delete(id)`: 削除
   - `exists(id)`: 存在確認
   - `count()`: 件数取得

2. **FileRepository（ファイルメタデータ）**
   - `findByHash(hash)`: ハッシュで検索（重複検出用）
   - `findByPath(path)`: パスで検索
   - `findByCategory(category)`: カテゴリで検索
   - `softDelete(id)`: 論理削除
   - `findByIds(ids[])`: 複数ID一括取得

3. **ChunkRepository（チャンク）**
   - `findByFileId(fileId)`: ファイルIDで検索
   - `deleteByFileId(fileId)`: ファイルIDで一括削除
   - `findByHash(hash)`: ハッシュで検索
   - `findByIds(ids[])`: 複数ID一括取得
   - `findAdjacent(chunkId)`: 隣接チャンク取得

4. **EntityRepository（エンティティ）**
   - `findByNormalizedNameAndType(name, type)`: 正規化名＋タイプで検索
   - `findByType(type)`: タイプで検索
   - `searchByName(query)`: 名前で部分一致検索
   - `findTopByImportance(limit)`: 重要度上位取得
   - `upsert(data)`: Upsert処理

5. **Repositoryファクトリ**
   - `createRepositories(db)`: 全Repositoryインスタンスを一括生成

### 非機能要件

- 全メソッドは `Result<T, RAGError>` を返す
- エラーコードは `ErrorCodes` から選択
- ページネーションパラメータは `PaginationParams` 型を使用
- ページネーション結果は `PaginatedResult<T>` 型を返す

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- requirements-engineering: {{result}}
- acceptance-criteria-writing: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/repository-pattern/phase-2-design.md`
