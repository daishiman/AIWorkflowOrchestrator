# Phase 10: ドキュメント更新 - Repository パターン実装

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 10                    |
| Phase名    | ドキュメント更新      |
| 前提Phase  | Phase 9（手動テスト） |
| 後続Phase  | Phase 11（PR作成）    |
| ステータス | 未実施                |
| 作成日     | 2026-01-05            |
| 機能名     | repository-pattern    |
| タスクID   | CONV-04-06            |

---

## 目的

実装した内容をドキュメント化し、未タスクを検出する。
実装ガイドの作成と技術的負債の可視化を行う。

## 背景

Phase 10では以下の3つの作業を実施する:

1. **ドキュメント更新**: JSDocコメント追加、APIドキュメント整備
2. **未タスク検出**: 技術的負債の可視化と継続的改善
3. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
4. **スキルフィードバック記録**: 使用スキルへのフィードバックとLOGS.md更新
5. **システム仕様更新**: aiworkflow-requirements への変更反映（該当時）

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: api-documentation-best-practices

**パス**: `.claude/skills/api-documentation-best-practices/SKILL.md`

**Trigger条件**:
APIドキュメント、DX設計、自己完結型ドキュメント

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を出力

**期待される成果物**:

- `outputs/phase-10/documentation-update-log.md` - ドキュメント更新記録
- `outputs/phase-10/implementation-guide.md` - 実装ガイド

### スキル2: skill-creator（フィードバック記録用）

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**:
スキルフィードバック記録、LOGS.md更新、スキル改善提案

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「フィードバック記録」セクションに従って実行
3. 各使用スキルのLOGS.mdを更新

---

## 参照資料

| 参照資料           | パス                                         | 内容           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | 機能要件       |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Repository設計 |
| Repositoryコード   | `packages/shared/src/db/repositories/`       | 実装           |
| 手動テスト結果     | `outputs/phase-9/manual-test-result.md`      | テスト結果     |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | Phase 3指摘    |
| 最終レビュー結果   | `outputs/phase-8/final-review-result.md`     | Phase 8指摘    |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                              | 内容                         |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------- |
| DBアーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/database.md`   | データベース設計ガイドライン |
| API設計仕様            | `.claude/skills/aiworkflow-requirements/references/api-design.md` | API設計原則                  |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/errors.md`     | Result型パターン             |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "Repository"`

---

## 成果物

| 成果物               | パス                                           | 必須 | 内容               |
| -------------------- | ---------------------------------------------- | ---- | ------------------ |
| ドキュメント更新記録 | `outputs/phase-10/documentation-update-log.md` | ✅   | 更新内容の記録     |
| 実装ガイド           | `outputs/phase-10/implementation-guide.md`     | ✅   | 概念的・技術的説明 |
| 未タスクレポート     | `outputs/phase-10/unassigned-task-report.md`   | ✅   | 検出された未タスク |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/`           | 条件 | 該当時のみ         |

---

## 完了条件

- [ ] JSDocコメントがすべてのpublic APIに追加されている
- [ ] 実装ガイドが作成されている
- [ ] 未タスク検出が完了している
- [ ] 検出された未タスクが指示書として出力されている（該当時）
- [ ] 成果物が `outputs/phase-10/` に出力されている
- [ ] `artifacts.json` の Phase 10 が更新されている
- [ ] **スキルフィードバックが各スキルのLOGS.mdに記録されている**【必須】
- [ ] **システム仕様（aiworkflow-requirements）の更新が完了している**（該当時）

---

## Phase 10-1: ドキュメント更新

### JSDocコメント追加

```typescript
/**
 * 基底Repositoryクラス
 * @template TTable - Drizzleテーブル型
 * @template TSelect - SELECT結果型
 * @template TInsert - INSERT入力型
 * @template TId - ID型（Branded）
 */
export abstract class BaseRepository<...> {
  /**
   * IDでエンティティを取得
   * @param id - 検索対象のID
   * @returns Result<TSelect | null, RAGError> - 成功時はエンティティまたはnull
   */
  async findById(id: TId): Promise<Result<TSelect | null, RAGError>> {}
}
```

---

## Phase 10-2: 未タスク検出【必須】

### 検出ソース

| ソース                | 確認項目                      | Grepパターン例                                      |
| --------------------- | ----------------------------- | --------------------------------------------------- |
| Phase 3レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-3/`                                  |
| Phase 8レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-8/`                                  |
| Phase 9手動テスト結果 | スコープ外の発見事項          | `outputs/phase-9/`                                  |
| 各Phase成果物         | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`          |
| コードベース          | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |
| **スキルLOGS.md**     | **partial/failure記録**       | 各使用スキルのLOGS.md                               |

### 実行手順

```bash
# 1. コードベースのTODO/FIXMEを検出
grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/db/repositories/

# 2. Phase成果物の未完了項目を検出
grep -r "TODO\|FIXME\|将来対応\|scope外" outputs/

# 3. 使用したスキルのLOGS.mdでpartial/failure記録を確認
cat .claude/skills/repository-pattern/LOGS.md 2>/dev/null | grep -E "partial|failure"
cat .claude/skills/tdd-principles/LOGS.md 2>/dev/null | grep -E "partial|failure"
cat .claude/skills/error-handling-patterns/LOGS.md 2>/dev/null | grep -E "partial|failure"
```

### 未タスク例

- RelationRepository実装
- CommunityRepository実装
- EmbeddingRepository実装
- ConversionRepository実装

---

## Phase 10-3: 実装ガイド作成【必須】

### ドキュメント要件

| セクション         | 必須 | 内容                                 |
| ------------------ | ---- | ------------------------------------ |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話         |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造          |
| データベース設計   | 条件 | テーブル定義 + なぜこの設計にしたか  |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明            |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト |

### 記述原則

1. **Why-first**: 「なぜそうしたか」を重視
2. **対比説明**: 「❌ 悪い例」と「✅ 良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・関係性を可視化
4. **コード注釈**: コードスニペットには日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

**テンプレート**: `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`

---

## Phase 10-4: スキルフィードバック記録【必須】

### フィードバック記録コマンド

各Phase完了時に使用したスキルへのフィードバックを**必ず**記録する。

```bash
# 1. フィードバック記録（各スキルごとに実行）
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill repository-pattern --result success --phase 10

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill tdd-principles --result success --phase 4

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill error-handling-patterns --result success --phase 5

# 2. Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/repository-pattern --phase 10 \
  --artifacts "outputs/phase-10/implementation-guide.md,outputs/phase-10/unassigned-task-report.md"

# 3. スキル仕様準拠チェック（skill-creatorに委譲）
node .claude/skills/skill-creator/scripts/quick_validate.mjs .claude/skills/repository-pattern
```

### LOGS.md更新手順

使用した各スキルのLOGS.mdに以下の形式で記録を追加:

```markdown
## 2026-01-05 - CONV-04-06 Repository Pattern Implementation

| Phase | Result  | Notes                                   |
| ----- | ------- | --------------------------------------- |
| 4     | success | TDD Red phase completed                 |
| 5     | success | Implementation completed, coverage 80%+ |
| 10    | success | Documentation and feedback recorded     |
```

---

## Phase 10-5: システム仕様更新（該当時）

### 更新が必要なケース

- 新しいAPIインターフェースを追加した場合
- 既存の設計パターンを変更した場合
- エラーハンドリングのパターンを追加した場合
- データベーススキーマに影響を与える変更をした場合

### 更新手順

```bash
# 1. システム仕様の検索
node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "Repository"

# 2. 該当する仕様ファイルを更新
# 例: .claude/skills/aiworkflow-requirements/references/database.md

# 3. 変更履歴を追記
# 各仕様ファイルの末尾に変更履歴セクションがある場合は更新
```

**詳細フロー**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 今回の更新対象（該当時）

| 仕様ファイル               | 更新内容                                                                        | 必要性  |
| -------------------------- | ------------------------------------------------------------------------------- | ------- |
| `interfaces-rag.md`        | BaseRepository仕様、FileRepository/ChunkRepository/EntityRepository仕様追加     | ✅ 必須 |
| `interfaces-core.md`       | IRepositoryとResult<T, RAGError>の統合パターン追記（現状はPromise<Entity>のみ） | ✅ 必須 |
| `directory-structure.md`   | packages/shared/src/db/repositories/ 構造追記（L125-149に記載なし）             | ✅ 必須 |
| `database-architecture.md` | repositories/ディレクトリの詳細仕様、各Repositoryの役割追記                     | ✅ 必須 |
| `glossary.md`              | BaseRepository用語追加（データベース用語セクション L90）                        | 検討    |
| `error-handling.md`        | Repository層のエラーハンドリングパターン追記                                    | 検討    |

### 具体的な更新内容

#### interfaces-rag.md への追記

現状 L127-131 に簡潔な記載のみ。以下を追記：

```markdown
### Repository パターン詳細

#### BaseRepository<TTable, TSelect, TInsert, TId>

| メソッド          | 戻り値                            | 説明                   |
| ----------------- | --------------------------------- | ---------------------- |
| findById(id)      | Result<TSelect \| null, RAGError> | IDでエンティティを取得 |
| findAll(options?) | Result<TSelect[], RAGError>       | 全エンティティを取得   |
| create(data)      | Result<TSelect, RAGError>         | 新規エンティティを作成 |
| update(id, data)  | Result<TSelect, RAGError>         | エンティティを更新     |
| delete(id)        | Result<boolean, RAGError>         | エンティティを削除     |

#### 具体Repository

| Repository       | 対象テーブル | Branded Type |
| ---------------- | ------------ | ------------ |
| FileRepository   | files        | FileId       |
| ChunkRepository  | chunks       | ChunkId      |
| EntityRepository | entities     | EntityId     |
```

#### interfaces-core.md への追記

L39 のトランザクション対応セクションの後に以下を追記：

```markdown
### Result型統合パターン（RAG Repository）

RAGパイプラインのRepositoryでは、エラーハンドリングにResult型を使用する。

| パターン     | 戻り値型                   | 用途                   |
| ------------ | -------------------------- | ---------------------- |
| 従来パターン | `Promise<Entity>`          | シンプルな CRUD 操作   |
| RAGパターン  | `Result<Entity, RAGError>` | エラー伝播が重要な操作 |

**使い分け基準**:

- 単純なCRUD操作: 従来パターン（例外スロー）
- RAGパイプライン: Result型パターン（明示的エラーハンドリング）
```

#### directory-structure.md への追記

L149 の packages/shared/src/db/ セクションに以下を追記：

```markdown
| **Repository実装** | |
| repositories/base.repository.ts | 基底Repositoryクラス（抽象） |
| repositories/file.repository.ts | ファイルRepository（filesテーブル） |
| repositories/chunk.repository.ts | チャンクRepository（chunksテーブル） |
| repositories/entity.repository.ts | エンティティRepository（entitiesテーブル） |
| repositories/index.ts | バレルエクスポート |
```

#### database-architecture.md への追記

L97-104 のディレクトリ構造に以下を追記：

```markdown
│ ├── repositories/
│ │ ├── base.repository.ts # 基底Repositoryクラス
│ │ ├── file.repository.ts # ファイルRepository
│ │ ├── chunk.repository.ts # チャンクRepository
│ │ ├── entity.repository.ts # エンティティRepository
│ │ └── index.ts # エクスポート
```

### 更新後の必須手順

```bash
# 1. 仕様ファイルを更新した後、インデックスを再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs

# 2. 構造検証
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.mjs

# 3. 変更をコミット（Phase 11で実施）
```

---

## 依存関係

- **前提**: Phase 1, 2, 5 が完了していること
- **後続**: Phase 11（PR作成）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 使用スキル

| スキル                           | 結果    | 備考                              |
| -------------------------------- | ------- | --------------------------------- |
| api-documentation-best-practices | success | JSDocコメント追加、実装ガイド作成 |
| skill-creator                    | success | フィードバック記録、LOGS.md更新   |

### フィードバック記録状況【必須】

| スキル                  | LOGS.md更新 | 確認コマンド                                         |
| ----------------------- | ----------- | ---------------------------------------------------- |
| repository-pattern      | ✅          | `cat .claude/skills/repository-pattern/LOGS.md`      |
| tdd-principles          | ✅          | `cat .claude/skills/tdd-principles/LOGS.md`          |
| error-handling-patterns | ✅          | `cat .claude/skills/error-handling-patterns/LOGS.md` |

### ドキュメント更新内容

| 対象             | 更新内容           |
| ---------------- | ------------------ |
| JSDocコメント    | {{更新ファイル数}} |
| 実装ガイド       | 作成完了           |
| 未タスクレポート | 作成完了           |

### 検出された未タスク

| ID      | タスク名      | 優先度     | 指示書作成 |
| ------- | ------------- | ---------- | ---------- |
| {{ID1}} | {{タスク名1}} | {{優先度}} | ✅ / -     |
| {{ID2}} | {{タスク名2}} | {{優先度}} | ✅ / -     |

### システム仕様更新状況

| 仕様ファイル               | 更新内容                                  | 完了      |
| -------------------------- | ----------------------------------------- | --------- |
| `interfaces-rag.md`        | BaseRepository仕様、各Repository仕様追加  | ✅ / 不要 |
| `interfaces-core.md`       | IRepositoryとResult型の統合パターン追記   | ✅ / 不要 |
| `directory-structure.md`   | packages/shared/src/db/repositories/ 追記 | ✅ / 不要 |
| `database-architecture.md` | repositories/ディレクトリ構造追記         | ✅ / 不要 |
| `glossary.md`              | BaseRepository用語追加（該当時）          | ✅ / 不要 |
| `error-handling.md`        | Repository層エラーハンドリング（該当時）  | ✅ / 不要 |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## artifacts.json 更新【必須】

Phase完了時に `artifacts.json` を必ず更新する:

```json
{
  "phases": {
    "10": {
      "status": "completed",
      "completedAt": "2026-01-XX T00:00:00Z",
      "artifacts": [
        {
          "type": "document",
          "path": "outputs/phase-10/documentation-update-log.md",
          "description": "ドキュメント更新記録"
        },
        {
          "type": "document",
          "path": "outputs/phase-10/implementation-guide.md",
          "description": "実装ガイド（概念説明+技術詳細）"
        },
        {
          "type": "document",
          "path": "outputs/phase-10/unassigned-task-report.md",
          "description": "未タスク検出レポート"
        }
      ]
    }
  }
}
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/repository-pattern/phase-11-pr-creation.md`
