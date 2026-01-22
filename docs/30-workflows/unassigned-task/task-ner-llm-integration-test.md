# NER LLM実環境統合テスト - タスク指示書

## メタ情報

```yaml
issue_number: 405
```

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | task-ner-llm-integration-test                       |
| タスク名     | NERサービス LLM実環境統合テスト                     |
| 分類         | 改善                                                |
| 対象機能     | エンティティ抽出サービス（NER）- LLMEntityExtractor |
| 優先度       | 低                                                  |
| 見積もり規模 | 中規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | CONV-06-04 Phase 12（未タスク検出レポート）         |
| 発見日       | 2026-01-18                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-06-04（エンティティ抽出サービス NER）が Phase 12 まで完了し、以下の品質指標を達成した:

- **224テストケース**（単体 + 統合 + E2E）
- **97.1% Line Coverage**
- **96.8% Quality Score**

現在のテストスイートでは、LLM呼び出しはMSW（Mock Service Worker）でモック化されており、実際のLLM API（Claude API等）との統合テストは未実施である。本番環境での動作確認を行うため、実LLM APIを使用した統合テストの追加が推奨される。

### 1.2 問題点・課題

| 問題項目                   | 詳細                                                        | 影響範囲           |
| -------------------------- | ----------------------------------------------------------- | ------------------ |
| モック依存のテスト         | LLM応答はモック固定、実際のAPI挙動差異が検出できない        | 本番環境での信頼性 |
| プロンプト変更時の検証不足 | プロンプト改善後、実LLMでの出力品質を定量的に計測できない   | 抽出精度           |
| レート制限・エラー処理検証 | 実環境でのAPIレート制限、タイムアウト、リトライ動作が未検証 | 運用安定性         |

### 1.3 放置した場合の影響

| 影響                         | 深刻度 |
| ---------------------------- | ------ |
| 本番環境での予期しない挙動   | 中     |
| プロンプト改善効果の測定困難 | 中     |
| 障害時の原因特定遅延         | 低     |

---

## 2. 何を達成するか（What）

### 2.1 目的

LLMEntityExtractorを実際のLLM API（Claude API）と接続し、エンドツーエンドでの動作検証・品質計測を可能にする。

### 2.2 最終ゴール

- 実LLM APIを使用した統合テストスイートの作成
- 抽出精度のベンチマーク（正解データとの比較）
- レート制限・エラー処理の実環境検証
- プロンプト改善前後の定量比較基盤

### 2.3 スコープ

#### 含むもの

- 実LLM API呼び出しを含む統合テストファイル作成
- テスト用の正解データセット（ゴールデンデータ）作成
- 抽出精度メトリクス（Precision/Recall/F1）の計測
- 環境変数による実行切り替え（CI/ローカル）
- テストコスト見積もり・制限機構

#### 含まないもの

- MSWモックテストの置き換え（並行運用）
- 複数LLMプロバイダーの比較
- 本番環境へのデプロイ
- 新機能の追加

### 2.4 成果物

| 成果物                 | 配置先                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| LLM統合テストファイル  | `packages/shared/src/services/extraction/__tests__/llm-integration.test.ts`                               |
| ゴールデンデータセット | `packages/shared/src/services/extraction/__tests__/fixtures/golden-data/`                                 |
| 精度計測ユーティリティ | `packages/shared/src/services/extraction/__tests__/utils/metrics.ts`                                      |
| ベンチマークレポート   | `docs/30-workflows/completed-tasks/CONV-06-04-entity-extraction-ner/outputs/llm-integration-benchmark.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 前提条件                                         | 必須 |
| ------------------------------------------------ | ---- |
| CONV-06-04が完了していること                     | ✅   |
| Claude API キーが利用可能であること              | ✅   |
| packages/shared のテスト環境が構築済みであること | ✅   |

### 3.2 依存タスク

| タスクID   | タスク名                       | 依存種別 |
| ---------- | ------------------------------ | -------- |
| CONV-06-04 | エンティティ抽出サービス (NER) | 完了必須 |

### 3.3 必要な知識

| 技術       | 必要レベル | 備考                            |
| ---------- | ---------- | ------------------------------- |
| TypeScript | 中級       | テストコード実装                |
| Vitest     | 中級       | テストフレームワーク            |
| Claude API | 基礎       | API呼び出し・レスポンス解析     |
| NER概念    | 基礎       | Precision/Recall/F1スコアの理解 |

### 3.4 推奨アプローチ

1. **ゴールデンデータ作成**: 人手でアノテーションした正解データを用意
2. **テスト設計**: 環境変数で実行モード切り替え（mock/real）
3. **精度計測**: 正解データとの比較でメトリクス算出
4. **コスト制御**: API呼び出し回数の上限設定

---

## 4. 実行手順

### Phase構成

標準13Phase構成を簡略化して適用（3Phase構成）。

### Phase 1: 準備・設計

#### 目的

テスト設計とゴールデンデータの準備。

#### 手順

1. ゴールデンデータ用の入力テキストを10-20件選定

   ```bash
   # 多様なドメインのテキストを選定
   # - 技術文書（TypeScript、React関連）
   # - 一般ビジネス文書
   # - ニュース記事
   ```

2. 各テキストに正解エンティティをアノテーション

   ```json
   {
     "input": "MicrosoftはTypeScriptを開発しました...",
     "expected": [
       { "name": "Microsoft", "type": "organization", "confidence": 0.95 },
       {
         "name": "TypeScript",
         "type": "programming_language",
         "confidence": 0.9
       }
     ]
   }
   ```

3. テスト設計書の作成

#### 成果物

- ゴールデンデータセット（JSON形式）
- テスト設計書

#### 完了条件

- [ ] 10件以上のゴールデンデータが作成されている
- [ ] 各データに正解エンティティがアノテーションされている

### Phase 2: 実装・テスト

#### 目的

LLM統合テストの実装と精度計測。

#### 手順

1. 環境変数切り替え機構の実装

   ```typescript
   const USE_REAL_LLM = process.env.NER_INTEGRATION_TEST === "real";

   describe.skipIf(!USE_REAL_LLM)("LLM Integration Tests", () => {
     // 実LLMを使用したテスト
   });
   ```

2. 精度計測ユーティリティの実装

   ```typescript
   interface MetricsResult {
     precision: number;
     recall: number;
     f1Score: number;
   }

   function calculateMetrics(
     predicted: ExtractedEntity[],
     expected: ExtractedEntity[],
   ): MetricsResult;
   ```

3. 統合テストの実装

   ```typescript
   it("should extract entities with >= 80% F1 score", async () => {
     const result = await extractor.extract(goldenData.input);
     const metrics = calculateMetrics(
       result.value.entities,
       goldenData.expected,
     );
     expect(metrics.f1Score).toBeGreaterThanOrEqual(0.8);
   });
   ```

4. テスト実行（実LLM使用）

   ```bash
   NER_INTEGRATION_TEST=real pnpm --filter @repo/shared test -- --testPathPattern="llm-integration"
   ```

#### 成果物

- LLM統合テストファイル
- 精度計測ユーティリティ

#### 完了条件

- [ ] 統合テストが実行可能
- [ ] 精度メトリクスが計測できる
- [ ] F1スコア80%以上を達成（推奨）

### Phase 3: ドキュメント・PR

#### 目的

結果のドキュメント化とPR作成。

#### 手順

1. ベンチマークレポートの作成

   ```markdown
   ## LLM統合テスト結果

   | メトリクス | スコア |
   | ---------- | ------ |
   | Precision  | 85%    |
   | Recall     | 82%    |
   | F1 Score   | 83.5%  |
   ```

2. PR作成

#### 成果物

- ベンチマークレポート
- GitHub Pull Request

#### 完了条件

- [ ] ベンチマークレポートが作成されている
- [ ] PRがマージされている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 実LLM APIを使用した統合テストが実行可能
- [ ] ゴールデンデータとの比較でメトリクスが計測できる
- [ ] 環境変数でmock/real切り替えが可能

### 品質要件

- [ ] 既存テストが全てパス
- [ ] 統合テストでF1スコア70%以上（最低基準）
- [ ] ESLint/TypeScriptエラー0件

### ドキュメント要件

- [ ] ベンチマークレポートが作成されている
- [ ] テスト実行手順がドキュメント化されている

---

## 6. 検証方法

### テストケース

| #   | テスト                       | 期待結果                      |
| --- | ---------------------------- | ----------------------------- |
| 1   | ゴールデンデータ全件での精度 | F1スコア70%以上               |
| 2   | 技術文書での抽出精度         | 技術エンティティ検出率80%以上 |
| 3   | レート制限時の挙動           | リトライ後に正常完了          |
| 4   | タイムアウト時の挙動         | フォールバック実行            |

### 検証手順

```bash
# 実LLM統合テスト実行
export ANTHROPIC_API_KEY="your-api-key"
NER_INTEGRATION_TEST=real pnpm --filter @repo/shared test -- --testPathPattern="llm-integration"

# カバレッジ確認（モックテストと合わせて）
pnpm --filter @repo/shared test:coverage
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                              |
| -------------------------- | ------ | -------- | --------------------------------- |
| APIコスト増加              | 中     | 高       | テスト回数制限、CI頻度調整        |
| レート制限によるテスト失敗 | 低     | 中       | 待機・リトライロジック実装        |
| 精度未達成                 | 中     | 低       | プロンプト改善→再テストのサイクル |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| CONV-06-04 タスク仕様書         | `docs/30-workflows/CONV-06-04-entity-extraction-ner/index.md`                                   |
| CONV-06-04 未タスク検出レポート | `docs/30-workflows/CONV-06-04-entity-extraction-ner/outputs/phase-12/unassigned-task-report.md` |
| Phase 12 実装ガイド             | `docs/30-workflows/CONV-06-04-entity-extraction-ner/outputs/phase-12/implementation-guide.md`   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                                    | 内容                                 |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| NERインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | IEntityExtractor、型定義、エラー処理 |
| RAGアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | NERサービス設計、フォールバック戦略  |
| テスト戦略              | `.claude/skills/aiworkflow-requirements/references/testing.md`                          | テスト品質基準、カバレッジ目標       |

### 参考資料

| 資料                    | URL                                                                      |
| ----------------------- | ------------------------------------------------------------------------ |
| Vitest公式ドキュメント  | https://vitest.dev/                                                      |
| Claude API リファレンス | https://docs.anthropic.com/claude/reference/getting-started-with-the-api |

---

## 9. 備考

### CONV-06-04 未タスク検出レポートからの引用

```
### 3.2 改善提案（任意・将来対応）

Phase 10で提案された任意の改善項目：

| 項目                         | 優先度 | 対応時期 |
| ---------------------------- | ------ | -------- |
| LLM実環境統合テスト追加      | 低     | 将来検討 |
```

### 補足事項

- 優先度は「低」だが、プロンプト改善サイクルの品質向上に貢献
- APIコストを考慮し、CI実行は週次または手動トリガーを推奨
- 精度目標は段階的に引き上げ可能（70% → 80% → 85%）
