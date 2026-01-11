# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| Phase名    | テスト作成              |
| 前提Phase  | Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）         |
| ステータス | 未実施                  |
| 作成日     | 2026-01-10              |
| 機能名     | community-summarization |

---

## 目的

TDDのRed段階として、期待される動作を検証するテストを実装より先に作成する。

## 背景

テストファーストにより、要件と設計を具体化し、実装の正確性を保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト仕様書の作成

**目的**: テストケースの設計と文書化

**実行手順**:

1. 受け入れ基準（`outputs/phase-1/acceptance-criteria.md`）を確認
2. 各受け入れ基準に対応するテストケースを設計:
   - AC-01: 単一コミュニティの要約生成
   - AC-02: 子コミュニティの要約を使用した親コミュニティの要約生成
   - AC-03: 全コミュニティの一括要約生成（階層順）
   - AC-04: 要約の埋め込み生成とセマンティック検索
   - AC-05: レベル指定検索
   - AC-06: 要約の更新
   - AC-07: 部分失敗時の継続処理
3. 境界値テストケースを設計:
   - 空のコミュニティ
   - 単一エンティティのコミュニティ
   - 大量エンティティのコミュニティ

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク2: 統合テストシナリオの作成（統合テスト連携）

**目的**: 全カテゴリの統合テストシナリオを設計

**実行手順**:

1. ILLMProvider統合テストを設計:
   - generate()呼び出しと正常レスポンス
   - generate()エラー時のハンドリング
2. IEmbeddingProvider統合テストを設計:
   - embedSingle()呼び出しと正常レスポンス
   - embedSingle()エラー時のハンドリング（埋め込みなしで保存）
3. IKnowledgeGraphStore統合テストを設計:
   - findEntities(), getRelations()の呼び出し
4. ICommunityRepository統合テストを設計:
   - getSummary(), updateSummary()の呼び出し
5. E2Eフローテストを設計:
   - コミュニティ検出 → 要約生成 → 検索

**期待される成果物**:

- `outputs/phase-4/test-cases.md`（統合テストセクション）

---

### タスク3: ユニットテストの作成（Red）

**目的**: 失敗するユニットテストを作成

**実行手順**:

1. テストファイルを作成:
   - `packages/shared/src/services/graph/__tests__/community-summarizer.test.ts`
2. モックを準備:
   ```typescript
   const mockLLM = {
     generate: vi.fn(),
   };
   const mockEmbedding = {
     embedSingle: vi.fn(),
   };
   const mockGraphStore = {
     findEntities: vi.fn(),
     getRelations: vi.fn(),
   };
   const mockCommunityRepo = {
     getSummary: vi.fn(),
     updateSummary: vi.fn(),
     findById: vi.fn(),
   };
   ```
3. テストケースを実装:
   ```typescript
   describe("CommunitySummarizer", () => {
     it("コミュニティの要約を生成できる", async () => {
       // ...
     });
     it("子コミュニティの要約を使用できる", async () => {
       // ...
     });
     it("全コミュニティの要約を生成できる", async () => {
       // ...
     });
     it("要約をセマンティック検索できる", async () => {
       // ...
     });
     it("特定レベルのコミュニティのみ検索できる", async () => {
       // ...
     });
   });
   ```
4. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `packages/shared/src/services/graph/__tests__/community-summarizer.test.ts`（プロジェクト配置）

---

### タスク4: プロンプトテストの作成

**目的**: buildCommunitySummaryPromptのテストを作成

**実行手順**:

1. プロンプト生成関数のテストを作成:
   ```typescript
   describe("buildCommunitySummaryPrompt", () => {
     it("エンティティリストを含むプロンプトを生成する", () => {
       // ...
     });
     it("関係リストを含むプロンプトを生成する", () => {
       // ...
     });
     it("子コミュニティの要約を含むプロンプトを生成する", () => {
       // ...
     });
     it("スタイルに応じたガイドを含む", () => {
       // ...
     });
   });
   ```
2. テストが失敗することを確認

**期待される成果物**:

- `packages/shared/src/services/graph/__tests__/community-summary-prompt.test.ts`（プロジェクト配置）

---

## 参照資料

| 参照資料      | パス                                                                      | 内容             |
| ------------- | ------------------------------------------------------------------------- | ---------------- |
| Phase 1成果物 | `outputs/phase-1/`                                                        | 受け入れ基準     |
| Phase 2成果物 | `outputs/phase-2/`                                                        | API仕様、型定義  |
| Phase 3成果物 | `outputs/phase-3/`                                                        | 設計レビュー結果 |
| タスク指示書  | `docs/30-workflows/unassigned-task/task-08-03-community-summarization.md` | テストケース参考 |

---

## 成果物

| 成果物           | パス                                                                            | 内容                  |
| ---------------- | ------------------------------------------------------------------------------- | --------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`                                         | テストケース設計      |
| テストケース     | `outputs/phase-4/test-cases.md`                                                 | 統合テストシナリオ    |
| ユニットテスト   | `packages/shared/src/services/graph/__tests__/community-summarizer.test.ts`     | 失敗するテスト（Red） |
| プロンプトテスト | `packages/shared/src/services/graph/__tests__/community-summary-prompt.test.ts` | プロンプト生成テスト  |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4での統合テスト連携アクション**:

統合テストシナリオを全カテゴリで作成する。

- API接続テスト: ILLMProvider, IEmbeddingProviderとの接続
- データフローテスト: Community → 要約 → DB保存
- エラーハンドリング: LLM障害時、Embedding障害時
- 状態同期テスト: 要約更新後のDB状態確認

---

## 完了条件

- [ ] テスト仕様書が作成されている
- [ ] 統合テストシナリオが全カテゴリで設計されている
- [ ] ユニットテストファイルが作成されている
- [ ] プロンプトテストファイルが作成されている
- [ ] 全てのテストが失敗状態（Red）である
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 4ステータスを更新

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- community-summarizer
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビュー）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-summarization/phase-5-implementation.md`
