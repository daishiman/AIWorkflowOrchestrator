# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 4                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 3 PASS または MINOR                   |
| 後続Phase  | Phase 5                                     |
| 作成日     | 2026-04-17                                  |
| ステータス | completed                                   |

## 目的

TDD Red を確立する。実装前にテストを作成し、全テストが FAIL（Red）状態であることを確認する。

## 前提確認

```bash
# 依存関係整合確認
pnpm install
pnpm --filter @repo/shared build

# 既存テストがグリーンであることを確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillDocGenerator.test.ts
```

## 実行タスク

1. LLMClient ユニットテストを作成する
2. skillHandlers.docs 統合テストを作成する（エラーパス含む）
3. TDD Red の確認（全テスト FAIL）
4. テスト命名規則が Phase 2 設計と一致しているか確認する

## テスト仕様

### テスト1: LLMClient ユニットテスト

**ファイルパス**: `apps/desktop/src/main/services/llm/__tests__/LLMClient.test.ts`

| テストケース | 入力                     | 期待結果                                                             |
| ------------ | ------------------------ | -------------------------------------------------------------------- |
| TC-01        | 正常なプロンプト         | `{ success: true, content: "<生成コンテンツ>" }`                     |
| TC-02        | APIキー未設定            | `{ success: false, errorCode: "API_KEY_MISSING", retryable: false }` |
| TC-03        | APIキー無効（403）       | `{ success: false, errorCode: "API_KEY_INVALID", retryable: false }` |
| TC-04        | レート制限（429）        | `{ success: false, errorCode: "RATE_LIMIT", retryable: true }`       |
| TC-05        | サーバーエラー（500）    | `{ success: false, errorCode: "SERVER_ERROR", retryable: true }`     |
| TC-06        | タイムアウト（30秒超過） | `{ success: false, errorCode: "TIMEOUT", retryable: true }`          |
| TC-07        | ネットワークエラー       | `{ success: false, errorCode: "NETWORK_ERROR", retryable: true }`    |

### テスト2: skillHandlers.docs 統合テスト

**ファイルパス**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.docs.test.ts`

| テストケース | シナリオ                                                | 期待する IPC 返却                                                                                     |
| ------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| TC-08        | docs 生成成功（ja）                                     | `{ success: true, data: { ... } }`                                                                    |
| TC-09        | APIキー未設定でのdocs生成                               | `{ success: false, error: "APIキーが...", errorCode: "API_KEY_MISSING" }`                             |
| TC-10        | タイムアウトでのdocs生成                                | `{ success: false, error: "タイムアウト...", errorCode: "TIMEOUT", retryable: true }`                 |
| TC-11        | LLMDocQueryAdapter の stub が使用されていないことの確認 | `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` に `Generated content for:` が存在しない |

### テスト3: 既存テストの回帰確認

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillDocGenerator.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
```

## TDD 実行手順

```bash
# Step 1: テストファイル作成後、Red確認
pnpm --filter @repo/desktop exec vitest run src/main/services/llm/__tests__/LLMClient.test.ts
# 期待: FAIL（LLMClient.ts が存在しないため）

pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.docs.test.ts
# 期待: FAIL（LLMDocQueryAdapter の委譲がまだ stub のため）

# Step 2: 既存テストがグリーンであることを確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: PASS（既存テストを壊していないことを確認）
```

## テスト命名規則確認

- camelCase: `describe('LLMClient', () => { it('should return content on success', ...)`
- エラーパス: `it('should return RATE_LIMIT errorCode when 429 received', ...)`
- Phase 2 設計の `LLMQueryResult` 型と一致しているか確認する

## Private method テスト方針

`LLMClient` の内部メソッド（リトライロジック等）は public インターフェース経由でテストする。
直接 private method をテストする場合は `(client as unknown as LLMClientPrivate)` キャストを使用する。

## 統合テスト連携

- SubAgent-A: TC-01〜TC-07 の LLMClient テストを作成する
- SubAgent-B: TC-08〜TC-11 の IPC 統合テストを作成する

## 参照資料

- `phase-2-design.md`: LLMClient / IPC 契約 / エラー分類の設計根拠
- `phase-3-design-review.md`: Gate 判定と MINOR 指摘
- `outputs/phase-1/error-classification-table.md`: 期待する `DocErrorCode`

## 多角的チェック観点（AIが判断）

| 観点       | チェック内容                                            |
| ---------- | ------------------------------------------------------- |
| TDD準拠    | 全テストが FAIL（Red）状態であることを確認したか        |
| 命名規則   | テストメソッド名が Phase 2 設計書の型名と一致しているか |
| モック設計 | `@anthropic-ai/sdk` がモック可能な設計になっているか    |
| 既存回帰   | 既存 `SkillDocGenerator.test.ts` が引き続きグリーンか   |

## 成果物

- `apps/desktop/src/main/services/llm/__tests__/LLMClient.test.ts`（コード成果物: outputs 外）
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.docs.test.ts`（コード成果物: outputs 外）
- `outputs/phase-4/test-spec.md`: テスト仕様書（TC-01〜TC-11）
- `outputs/phase-4/tdd-red-results.md`: TDD Red 確認結果ログ

## 完了条件

- [ ] `LLMClient.test.ts` が作成されている
- [ ] `skillHandlers.docs.test.ts` が作成されている
- [ ] 全テストが FAIL（Red）状態であることを確認した
- [ ] 既存テストが引き続きグリーンである
- [ ] テスト仕様書（TC-01〜TC-11）が出力されている

## タスク100%実行確認【必須】

- [ ] 依存関係整合確認完了（pnpm install / shared build）
- [ ] `LLMClient.test.ts` 作成完了（TC-01〜TC-07）
- [ ] `skillHandlers.docs.test.ts` 作成完了（TC-08〜TC-11）
- [ ] TDD Red 確認完了
- [ ] 既存テストの回帰確認完了
- [ ] テスト仕様書・Red結果ログ出力完了

## 次Phase

Phase 5（実装）へ進む。
