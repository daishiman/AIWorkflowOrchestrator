# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 6                              |
| Phase名    | テスト拡充                     |
| 前提Phase  | Phase 5                        |
| 後続Phase  | Phase 7                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-07                     |
| 機能名     | CONV-06-05-relation-extraction |

---

## 目的

Phase 5の実装完了後、テストカバレッジ目標達成に向けた追加テストを作成し、統合テストを拡充する。

## 背景

Phase 4で作成した基本テストに加え、エッジケース、境界値、エラーパス、統合テストを追加することで、品質を担保する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**Trigger条件**: 境界値テストの設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 信頼度（0.0, 0.5, 1.0）、最大関係数などの境界値を特定
3. 境界値テストケースを作成

**期待される成果物**:

- 境界値テストがテストファイルに追加される

---

### スキル2: flaky-test-prevention

**パス**: `.claude/skills/flaky-test-prevention/SKILL.md`

**Trigger条件**: テストの安定性確保が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. LLMモックの安定性を確認
3. 非決定的要素の排除

**期待される成果物**:

- 安定したテストスイート

---

## 参照資料

| 参照資料      | パス                                                                           | 内容       |
| ------------- | ------------------------------------------------------------------------------ | ---------- |
| Phase 4成果物 | `packages/shared/src/services/extraction/__tests__/relation-extractor.test.ts` | 既存テスト |
| Phase 5成果物 | `packages/shared/src/services/extraction/relation-extractor.ts`                | 実装コード |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                          | 内容                       |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| エンティティ・関係スキーマ | `.claude/skills/aiworkflow-requirements/references/entity-relation-schema.md` | エンティティと関係の型定義 |

---

## 成果物

| 成果物             | パス                                  | 内容               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | カバレッジ測定結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | 統合テスト実行結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

Phase 6では以下の統合テスト連携アクションを実施:

- [ ] 統合テストの拡充（全カテゴリのカバレッジ向上）
- [ ] API接続テスト: LLMプロバイダーとの通信
- [ ] データフローテスト: チャンク→エンティティ→関係の流れ
- [ ] エラーハンドリング: LLM障害時の振る舞い
- [ ] 状態同期テスト: マージ時のエビデンス統合

---

## テストカバレッジ基準

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テストカバレッジ

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 追加テストケース

### 境界値テスト

```typescript
describe("境界値テスト", () => {
  describe("信頼度フィルタリング", () => {
    it("信頼度0.0の関係は含まれない（minConfidence=0.5）", async () => {
      // 境界値: 0.0
    });

    it("信頼度0.5の関係は含まれる（minConfidence=0.5）", async () => {
      // 境界値: 0.5（境界上）
    });

    it("信頼度1.0の関係は含まれる", async () => {
      // 境界値: 1.0
    });

    it("信頼度0.49の関係は含まれない（minConfidence=0.5）", async () => {
      // 境界値: 0.49（境界直下）
    });
  });

  describe("最大関係数", () => {
    it("maxRelationsPerChunk=30の場合、30個まで返る", async () => {
      // 境界値: 30
    });

    it("maxRelationsPerChunk=0の場合、空リストを返す", async () => {
      // 境界値: 0
    });
  });

  describe("エンティティ数", () => {
    it("エンティティ0個の場合は空を返す", async () => {
      // 境界値: 0
    });

    it("エンティティ1個の場合は空を返す", async () => {
      // 境界値: 1
    });

    it("エンティティ2個の場合は関係抽出を試みる", async () => {
      // 境界値: 2（最小有効値）
    });
  });
});
```

### エラーパステスト

```typescript
describe("エラーパステスト", () => {
  it("LLMプロバイダーがエラーを返した場合", async () => {
    // LLMエラー時のハンドリング
  });

  it("LLMレスポンスが不正なJSON形式の場合", async () => {
    // パースエラーのハンドリング
  });

  it("LLMレスポンスにrelationsフィールドがない場合", async () => {
    // 必須フィールド欠損時のハンドリング
  });

  it("タイムアウトが発生した場合", async () => {
    // タイムアウト時のハンドリング
  });
});
```

### 統合テスト

```typescript
describe("ExtractionPipeline統合テスト", () => {
  describe("正常系", () => {
    it("エンティティと関係を一括抽出できる", async () => {
      // パイプライン全体の動作確認
    });

    it("抽出結果がリポジトリに保存される", async () => {
      // 永続化の確認
    });
  });

  describe("異常系", () => {
    it("エンティティ抽出失敗時は関係抽出をスキップ", async () => {
      // エンティティ抽出エラー時
    });

    it("関係抽出失敗時もエンティティは保存される", async () => {
      // 関係抽出エラー時
    });
  });
});
```

---

## 実行コマンド

```bash
# ユニットテストカバレッジ確認
pnpm --filter @repo/shared test:coverage

# 統合テスト実行
pnpm --filter @repo/shared test:run -- --grep "統合"

# 全テスト実行
pnpm --filter @repo/shared test:run
```

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] 統合テストの追加が完了している
- [ ] 境界値テストが追加されている
- [ ] エラーパステストが追加されている
- [ ] カバレッジレポートが出力されている
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

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/CONV-06-05-relation-extraction --phase 6
```

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 使用スキル

- boundary-value-analysis: [success/failure/partial]
- flaky-test-prevention: [success/failure/partial]

### カバレッジ結果

- Line Coverage: [数値]%
- Branch Coverage: [数値]%
- Function Coverage: [数値]%

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

`docs/30-workflows/CONV-06-05-relation-extraction/phase-7-coverage-verification.md`
