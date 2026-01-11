# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 前提Phase  | Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認） |
| ステータス | 未実施                    |
| 作成日     | 2026-01-10                |
| 機能名     | community-summarization   |

---

## 目的

カバレッジ目標を達成するための追加テストを作成し、フロントエンド・バックエンド統合テストを拡充する。

## 背景

Phase 5での基本実装完了後、テストカバレッジを目標値まで引き上げ、統合テストによりモジュール間接続の品質を保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ現状確認

**目的**: 現在のテストカバレッジを確認し、不足箇所を特定

**実行手順**:

1. カバレッジレポートを生成:
   ```bash
   pnpm --filter @repo/shared test:coverage -- community-summarizer
   ```
2. カバレッジ結果を分析:
   - Line Coverage: 現在値 / 目標 80%
   - Branch Coverage: 現在値 / 目標 60%
   - Function Coverage: 現在値 / 目標 80%
3. 未カバー箇所を特定

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`（現状セクション）

---

### タスク2: エッジケーステストの追加

**目的**: 境界値・異常系のテストを追加

**実行手順**:

1. 境界値テストを追加:
   ```typescript
   describe("エッジケース", () => {
     it("空のエンティティリストで要約を生成できる", async () => {
       // ...
     });
     it("単一エンティティで要約を生成できる", async () => {
       // ...
     });
     it("maxSummaryTokens制限が適用される", async () => {
       // ...
     });
     it("maxKeywords制限が適用される", async () => {
       // ...
     });
   });
   ```
2. 異常系テストを追加:
   ```typescript
   describe("エラーハンドリング", () => {
     it("LLM呼び出し失敗時にエラーを返す", async () => {
       // ...
     });
     it("埋め込み生成失敗時も要約は保存される", async () => {
       // ...
     });
     it("JSONパース失敗時にエラーを返す", async () => {
       // ...
     });
     it("存在しないコミュニティIDでエラーを返す", async () => {
       // ...
     });
   });
   ```

**期待される成果物**:

- `packages/shared/src/services/graph/__tests__/community-summarizer.test.ts`（更新）

---

### タスク3: 統合テストの拡充（統合テスト連携）

**目的**: 全カテゴリの統合テストを実装

**実行手順**:

1. API接続テストを実装:
   ```typescript
   describe("API接続テスト", () => {
     it("ILLMProviderとの接続が正常に動作する", async () => {
       // モックなしでの接続テスト
     });
     it("IEmbeddingProviderとの接続が正常に動作する", async () => {
       // ...
     });
   });
   ```
2. データフローテストを実装:
   ```typescript
   describe("データフローテスト", () => {
     it("Community → 要約生成 → DB保存 の流れが正常", async () => {
       // E2Eフロー
     });
     it("全コミュニティ一括処理が階層順で実行される", async () => {
       // ...
     });
   });
   ```
3. エラーハンドリングテストを実装:
   ```typescript
   describe("障害時ハンドリング", () => {
     it("LLM障害時にエラーが適切に伝播される", async () => {
       // ...
     });
     it("部分失敗時に失敗コミュニティIDが返される", async () => {
       // ...
     });
   });
   ```
4. 状態同期テストを実装:
   ```typescript
   describe("状態同期テスト", () => {
     it("要約更新後にDBの状態が正しい", async () => {
       // ...
     });
     it("一括処理後の全要約が取得可能", async () => {
       // ...
     });
   });
   ```

**期待される成果物**:

- `packages/shared/src/services/graph/__tests__/community-summarizer.integration.test.ts`

---

### タスク4: カバレッジ目標達成確認

**目的**: カバレッジ目標を達成していることを確認

**実行手順**:

1. カバレッジレポートを再生成:
   ```bash
   pnpm --filter @repo/shared test:coverage -- community-summarizer
   ```
2. 目標達成を確認:
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上
   - Function Coverage: 80%以上
3. 未達の場合は追加テストを作成

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`（最終セクション）

---

## 参照資料

| 参照資料      | パス                                                         | 内容         |
| ------------- | ------------------------------------------------------------ | ------------ |
| Phase 4成果物 | `outputs/phase-4/`                                           | テスト仕様   |
| Phase 5成果物 | `outputs/phase-5/`                                           | 実装サマリー |
| 実装コード    | `packages/shared/src/services/graph/community-summarizer.ts` | 対象コード   |

---

## 成果物

| 成果物             | パス                                                                                    | 内容               |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                                    | カバレッジ結果     |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                                                   | 統合テスト実行結果 |
| ユニットテスト     | `packages/shared/src/services/graph/__tests__/community-summarizer.test.ts`             | 拡充済みテスト     |
| 統合テスト         | `packages/shared/src/services/graph/__tests__/community-summarizer.integration.test.ts` | 統合テスト         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6での統合テスト連携アクション**:

統合テストの拡充（全カテゴリのカバレッジ向上）。

- API接続テスト: ILLMProvider, IEmbeddingProvider
- データフローテスト: Community → 要約 → DB保存
- エラーハンドリング: LLM障害時、部分失敗時
- 状態同期テスト: 要約更新後のDB状態

---

## テストカバレッジ基準

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テスト

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] エッジケーステストが追加されている
- [ ] 統合テストの追加が完了している
- [ ] 全テストが成功している
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 6ステータスを更新

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-summarization/phase-7-coverage-check.md`
