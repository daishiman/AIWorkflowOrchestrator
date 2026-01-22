# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| Phase名    | 実装（TDD: Green）               |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-18                       |
| 機能名     | CONV-06-04-entity-extraction-ner |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通す最小限の実装を行う。

## 背景

テストを通すことに集中し、コードの品質改善は後のリファクタリングフェーズで行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の実装

**目的**: NERサービスに必要な型を定義する

**実行手順**:

1. ExtractionOptions型を実装
2. ExtractedEntity型を実装
3. ExtractionResult型を実装
4. BatchExtractionResult型を実装
5. EntityExtractionError型を実装

**期待される成果物**:

- `packages/shared/src/services/extraction/types.ts`

---

### タスク2: IEntityExtractorインターフェースの実装

**目的**: エンティティ抽出器の共通インターフェースを定義する

**実行手順**:

1. IEntityExtractorインターフェースを定義
2. extract()メソッドのシグネチャを定義
3. extractBatch()メソッドのシグネチャを定義
4. mergeEntities()メソッドのシグネチャを定義

**期待される成果物**:

- `packages/shared/src/services/extraction/interfaces.ts`

---

### タスク3: RuleBasedEntityExtractorの実装

**目的**: ルールベースのエンティティ抽出器を実装する

**実行手順**:

1. 各エンティティタイプの正規表現パターンを定義
2. extract()メソッドを実装
3. extractBatch()メソッドを実装
4. mergeEntities()メソッドを実装
5. 正規化処理（normalizedName生成）を実装

**期待される成果物**:

- `packages/shared/src/services/extraction/rule-based-extractor.ts`

---

### タスク4: LLMEntityExtractorの実装

**目的**: LLMベースのエンティティ抽出器を実装する

**実行手順**:

1. プロンプトテンプレートを作成
2. LLMプロバイダーとの連携を実装
3. extract()メソッドを実装
4. extractBatch()メソッドを実装
5. mergeEntities()メソッドを実装
6. レスポンスパースを実装

**期待される成果物**:

- `packages/shared/src/services/extraction/entity-extractor.ts`
- `packages/shared/src/services/extraction/prompts/entity-extraction.ts`

---

### タスク5: エクスポート設定

**目的**: モジュールのエクスポートを設定する

**実行手順**:

1. index.tsで全エクスポートを設定
2. 型エクスポートを設定

**期待される成果物**:

- `packages/shared/src/services/extraction/index.ts`

---

## 参照資料

| 参照資料      | パス               | 内容             |
| ------------- | ------------------ | ---------------- |
| Phase 2成果物 | `outputs/phase-2/` | 設計ドキュメント |
| Phase 4成果物 | テストファイル     | テストケース     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                    | 内容                |
| ------------------- | ----------------------------------------------------------------------- | ------------------- |
| architecture-rag.md | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | NERサービス位置づけ |
| api-endpoints.md    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`    | NER API仕様         |

---

## 成果物

| 成果物             | パス                                                                   | 内容                   |
| ------------------ | ---------------------------------------------------------------------- | ---------------------- |
| 型定義             | `packages/shared/src/services/extraction/types.ts`                     | 型定義                 |
| インターフェース   | `packages/shared/src/services/extraction/interfaces.ts`                | インターフェース定義   |
| ルールベース抽出器 | `packages/shared/src/services/extraction/rule-based-extractor.ts`      | ルールベース実装       |
| LLM抽出器          | `packages/shared/src/services/extraction/entity-extractor.ts`          | LLM実装                |
| プロンプト         | `packages/shared/src/services/extraction/prompts/entity-extraction.ts` | プロンプトテンプレート |
| エクスポート       | `packages/shared/src/services/extraction/index.ts`                     | モジュールエクスポート |

---

## 統合テスト連携

- LLM呼び出しの統合実装
- Result型によるエラーハンドリング実装
- バッチ処理の並列実行実装

---

## 完了条件

- [ ] 全ての型定義が実装されている
- [ ] IEntityExtractorインターフェースが定義されている
- [ ] RuleBasedEntityExtractorが実装されている
- [ ] LLMEntityExtractorが実装されている
- [ ] Phase 4のテストが全て成功する（Green状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --testPathPattern="extraction"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-06-04-entity-extraction-ner/phase-6-test-expansion.md`
