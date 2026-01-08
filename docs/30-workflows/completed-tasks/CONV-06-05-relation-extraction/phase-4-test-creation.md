# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 4                              |
| Phase名    | テスト作成                     |
| 前提Phase  | Phase 3                        |
| 後続Phase  | Phase 5                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-07                     |
| 機能名     | CONV-06-05-relation-extraction |

---

## 目的

TDDの「Red」フェーズとして、期待される動作を検証する失敗するテストを実装より先に作成する。

## 背景

テスト駆動開発（TDD）では、実装前にテストを作成することで、要件を明確化し、実装のガイドラインとする。関係抽出サービスは外部依存（LLMプロバイダー）があるため、適切なモック化が重要。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**: TDDのRedフェーズでテストを作成する

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 受け入れ基準に基づくテストケースを設計

**期待される成果物**:

- `packages/shared/src/services/extraction/__tests__/relation-extractor.test.ts`
- `outputs/phase-4/test-specification.md`

---

### スキル2: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**: 外部依存（LLMプロバイダー）のモック化が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. LLMプロバイダーのモック設計
3. テストフィクスチャの作成

**期待される成果物**:

- モックLLMプロバイダーがテストファイルに含まれる

---

## 参照資料

| 参照資料       | パス                                                                  | 内容                 |
| -------------- | --------------------------------------------------------------------- | -------------------- |
| Phase 1成果物  | `outputs/phase-1/acceptance-criteria.md`                              | 受け入れ基準         |
| Phase 2成果物  | `outputs/phase-2/architecture-design.md`                              | インターフェース設計 |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-06-05-relation-extraction.md` | テストケース例       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                          | 内容                       |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| エンティティ・関係スキーマ | `.claude/skills/aiworkflow-requirements/references/entity-relation-schema.md` | エンティティと関係の型定義 |

---

## 成果物

| 成果物             | パス                                                                           | 内容           |
| ------------------ | ------------------------------------------------------------------------------ | -------------- |
| テストコード       | `packages/shared/src/services/extraction/__tests__/relation-extractor.test.ts` | ユニットテスト |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                        | テスト設計     |
| テストケース       | `outputs/phase-4/test-cases.md`                                                | ケース一覧     |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                                   | 統合テスト設計 |

---

## 統合テスト連携（Phase 1〜11は必須）

Phase 4では以下の統合テスト連携アクションを実施:

- [ ] 統合テストシナリオを作成（API/データフロー/エラー/認証/状態同期）
- [ ] エンティティ抽出サービスとの連携テストを設計
- [ ] ExtractionPipelineとの統合テストを設計

---

## テストケース設計

### 単一チャンク関係抽出

```typescript
describe("LLMRelationExtractor", () => {
  describe("extract", () => {
    it("エンティティ間の関係を抽出できる", async () => {
      // Given: TypeScriptとMicrosoftのエンティティ
      // When: extractを呼び出す
      // Then: created_by関係が抽出される
    });

    it("エンティティが2つ未満の場合は空を返す", async () => {
      // Given: 1つのエンティティのみ
      // When: extractを呼び出す
      // Then: 空の関係リストが返る
    });

    it("指定タイプのみ抽出できる", async () => {
      // Given: types: ["uses", "depends_on"]オプション
      // When: extractを呼び出す
      // Then: 指定タイプの関係のみ返る
    });

    it("最小信頼度でフィルタリングできる", async () => {
      // Given: minConfidence: 0.7オプション
      // When: extractを呼び出す
      // Then: 0.7以上の信頼度の関係のみ返る
    });
  });
});
```

### バッチ抽出

```typescript
describe("extractBatch", () => {
  it("複数チャンクを一括処理できる", async () => {
    // Given: 3つのチャンクとそれぞれのエンティティ
    // When: extractBatchを呼び出す
    // Then: 全チャンクの関係が抽出される
  });

  it("部分的な失敗でも他のチャンクは処理される", async () => {
    // Given: 1つのチャンクでLLMエラー
    // When: extractBatchを呼び出す
    // Then: 他のチャンクの結果は返される
  });
});
```

### 関係マージ

```typescript
describe("mergeRelations", () => {
  it("重複関係をマージできる", async () => {
    // Given: 同じsource-target-typeの関係が2つ
    // When: mergeRelationsを呼び出す
    // Then: 1つの関係にエビデンスが統合される
  });

  it("信頼度は最大値を採用する", async () => {
    // Given: 信頼度0.8と0.9の同じ関係
    // When: mergeRelationsを呼び出す
    // Then: 信頼度0.9の関係が返る
  });

  it("双方向関係は正規化される", async () => {
    // Given: A-BとB-Aの双方向関係
    // When: mergeRelationsを呼び出す
    // Then: 1つの関係にマージされる
  });
});
```

### 統合テストシナリオ

```typescript
describe("ExtractionPipeline統合", () => {
  it("エンティティ抽出後に関係抽出が実行される", async () => {
    // Given: ContentChunksとExtractionPipeline
    // When: pipeline.processを呼び出す
    // Then: エンティティと関係が抽出される
  });

  it("抽出結果がリポジトリに保存される", async () => {
    // Given: 設定済みのリポジトリ
    // When: pipeline.processを呼び出す
    // Then: bulkUpsertが呼ばれる
  });
});
```

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run -- relation-extractor
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）
- [ ] 全てのテストケースが実装されている
- [ ] モックが適切に設定されている

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] LLMプロバイダーのモックが実装されている
- [ ] 統合テスト連携アクションが完了している
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1, 2, 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/CONV-06-05-relation-extraction --phase 4
```

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: [success/failure/partial]
- test-doubles: [success/failure/partial]

### TDD状態

- Red状態確認: [OK/NG]
- テストケース数: [数値]

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

`docs/30-workflows/CONV-06-05-relation-extraction/phase-5-implementation.md`
