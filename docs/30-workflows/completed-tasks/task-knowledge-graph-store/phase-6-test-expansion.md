# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 6                          |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

Phase 5で実装した各Store・Serviceに対してテストを拡充し、カバレッジ目標を達成する。統合テストを追加し、Store間連携・エラーハンドリング・パフォーマンスを検証する。

## 実行タスク

- **カバレッジ分析**: テストカバレッジの測定と不足領域の特定
- **ユニットテスト拡充**: 未カバーのコードパスへのテスト追加
- **統合テスト拡充**: Store間連携テストの追加
- **エラーケーステスト**: 異常系・境界値テストの追加
- **パフォーマンステスト**: バッチ操作の性能検証

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                               | パス                                                                                        | 内容                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Knowledge Graph Store インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | Store API仕様・データ構造 |

### 前Phase成果物

| 資料名       | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 実装コード   | `packages/shared/src/services/graph/`   | Phase 5成果物 |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                                              | 目標 |
| ------------------ | ----------------------------------------------------- | ---- |
| Store間連携テスト  | EntityStore ↔ RelationStore の参照整合性              | 100% |
| データフローテスト | エンティティ作成 → 関係作成 → グラフ探索 の一連フロー | 100% |
| エラーハンドリング | CASCADE削除時のデータ整合性、エラー伝播               | 80%+ |
| バッチ操作テスト   | 1000件バッチ処理の性能（1秒以内）                     | 100% |
| トランザクション   | 失敗時のロールバック動作確認                          | 100% |

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/shared test:coverage src/services/graph
```

### 2. ギャップ分析

カバレッジレポートから以下を特定:

- 未到達の行（Line Coverage未達）
- 未テストの分岐（Branch Coverage未達）
- 未呼び出しの関数（Function Coverage未達）

### 3. 追加テストケース

#### EntityStore追加テスト

```typescript
describe("EntityStore - 拡充テスト", () => {
  describe("境界値テスト", () => {
    it("空の名前の場合はエラーを返す");
    it("非常に長い名前（1000文字）でも正常に処理する");
    it("特殊文字を含む名前を正規化する");
    it("aliases配列が空の場合も正常に処理する");
  });

  describe("エラーケース", () => {
    it("データベース接続エラー時にDatabaseErrorを返す");
    it("不正なEntityId形式の場合はエラーを返す");
  });

  describe("パフォーマンス", () => {
    it("1000件のbulkUpsertが1秒以内に完了する");
    it("10000件のsearchEntitiesが2秒以内に完了する");
  });
});
```

#### RelationStore追加テスト

```typescript
describe("RelationStore - 拡充テスト", () => {
  describe("CASCADE削除", () => {
    it("エンティティ削除時に関連するrelationsが削除される");
    it("relation削除時に関連するevidenceが削除される");
    it("CASCADE削除後のデータ整合性が保たれる");
  });

  describe("証拠管理", () => {
    it("複数の証拠を持つ関係を正しく取得する");
    it("証拠の重複登録を防ぐ");
  });
});
```

#### GraphQueryService追加テスト

```typescript
describe("GraphQueryService - 拡充テスト", () => {
  describe("グラフアルゴリズム", () => {
    it("孤立ノードを含むグラフでも正常に動作する");
    it("非連結グラフでfindShortestPathがnullを返す");
    it("深度100のグラフでもスタックオーバーフローしない");
  });

  describe("大規模グラフ", () => {
    it("1000ノード、5000エッジのグラフでtraverseが5秒以内に完了する");
  });
});
```

### 4. 統合テスト拡充

```typescript
// store-integration.test.ts
describe("Store間統合テスト", () => {
  it("エンティティ作成 → 関係作成 → グラフ探索の一連フローが成功する");
  it("エンティティ削除時に関連データがCASCADE削除される");
  it("バッチ操作中のエラーでトランザクションがロールバックされる");
  it("複数Storeを跨いだ操作の整合性が保たれる");
});
```

### 5. カバレッジ再測定

```bash
pnpm --filter @repo/shared test:coverage src/services/graph
```

## 成果物

| 成果物             | パス                                                     | 説明               |
| ------------------ | -------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                     | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                    | 統合テスト実行結果 |
| テストファイル     | `packages/shared/src/services/graph/__tests__/*.test.ts` | 追加テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストの追加が完了している
- [ ] Store間連携テストが成功
- [ ] パフォーマンステスト（1000件バッチ1秒以内）が成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 初期カバレッジ測定
3. ギャップ分析
4. EntityStore追加テスト作成
5. RelationStore追加テスト作成
6. CommunityStore追加テスト作成
7. GraphQueryService追加テスト作成
8. 統合テスト拡充
9. パフォーマンステスト追加
10. カバレッジ再測定
11. 成果物の作成・配置
12. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
