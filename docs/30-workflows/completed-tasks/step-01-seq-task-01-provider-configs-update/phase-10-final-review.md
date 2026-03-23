# Phase 10: 最終レビュー — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 10                      |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 9（品質保証）     |

## 目的

Phase 1〜9 の成果物を多角的に検証し、Phase 11（手動テスト）への進行可否を PASS/MINOR/MAJOR/CRITICAL で判定する。

## 実行タスク

### Task 10-1: 要件充足性の最終確認

Phase 1 の受入基準（AC-01〜AC-11）を全て検証する。

| AC ID | 受入基準                                                  | 検証方法                                                                                      | 結果      |
| ----- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------- |
| AC-01 | OpenAI: `gpt-5.4` が `isDefault: true`                    | `llm.ts` の PROVIDER_CONFIGS を Read で確認                                                   | PASS/FAIL |
| AC-02 | Anthropic: `claude-sonnet-4-6` が `isDefault: true`       | `llm.ts` の PROVIDER_CONFIGS を Read で確認                                                   | PASS/FAIL |
| AC-03 | Google: `gemini-3-flash-preview` が `isDefault: true`     | `llm.ts` の PROVIDER_CONFIGS を Read で確認                                                   | PASS/FAIL |
| AC-04 | xAI: `grok-4-1-fast-non-reasoning` が `isDefault: true`   | `llm.ts` の PROVIDER_CONFIGS を Read で確認                                                   | PASS/FAIL |
| AC-05 | 旧モデルIDが PROVIDER_CONFIGS に存在しない                | `grep -n "gpt-4o\|claude-3-5-sonnet\|gemini-1\.5\|grok-beta" llm.ts` の結果が 0 件            | PASS/FAIL |
| AC-06 | `inferProviderId("o3")` → `"openai"`                      | `llm.ts` の inferProviderId を Read で確認（o3 プレフィックスパターン）                       | PASS/FAIL |
| AC-07 | `inferProviderId("o4-mini")` → `"openai"`                 | `llm.ts` の inferProviderId を Read で確認（o4 プレフィックスパターン）                       | PASS/FAIL |
| AC-08 | `inferProviderId("gpt-5.4")` → `"openai"`                 | `llm.ts` の inferProviderId を Read で確認（`gpt-` プレフィックスパターン）                   | PASS/FAIL |
| AC-09 | 各モデルに `description` フィールドが存在（空文字列不可） | `llm.ts` を Read し、全モデルの description を目視確認                                        | PASS/FAIL |
| AC-10 | TypeScript コンパイルエラーが 0 件                        | Phase 9 の typecheck 結果を参照                                                               | PASS/FAIL |
| AC-11 | 既存の `inferProviderId` 返り値が変更されない             | `llm.ts` の inferProviderId を Read で確認（claude-, gemini-, grok-, `/` パターンが変更なし） | PASS/FAIL |

### Task 10-2: 実装内容の多角的検証

#### 2-A: コードの正確性検証

`apps/desktop/src/main/handlers/llm.ts` を Read し、以下を確認する：

1. `PROVIDER_CONFIGS` の型定義に `description?: string` が追加されている
2. OpenAI: 6モデル（gpt-5.4, gpt-5.4-mini, gpt-5.4-nano, gpt-5.4-pro, o3, o4-mini）が正確に定義されている
3. Anthropic: 3モデル（claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5）が正確に定義されている
4. Google: 3モデル（gemini-3.1-flash-lite-preview, gemini-3-flash-preview, gemini-3.1-pro-preview）が正確に定義されている
5. xAI: 3モデル（grok-3-mini, grok-4-1-fast-non-reasoning, grok-4-1-fast-reasoning）が正確に定義されている
6. OpenRouter: 4モデルが変更されていない

#### 2-B: テストの正確性検証

`apps/desktop/src/main/handlers/__tests__/llm.test.ts` を Read し、以下を確認する：

1. Phase 4 で追加した T-01〜T-08 テストケースが存在する
2. Phase 6 で追加した T-09〜T-13 テストケースが存在する
3. 追加テストが既存テストと重複していない

#### 2-C: スコープ外ファイルの変更なし確認

以下のファイルが変更されていないことを確認する：

- `packages/shared/src/types/llm/schemas.ts`
- `apps/desktop/src/preload/types.ts`
- `apps/desktop/src/renderer/store/slices/` 配下の llmSlice 関連ファイル

#### 2-D: セキュリティ確認（04-electron-security.md 準拠）

`PROVIDER_CONFIGS` が外部入力に依存しない静的定数であることを確認する。IPC バリデーション（`isValidProviderId`）が変更されていないことを確認する。

### Task 10-3: Phase 9 品質保証結果の確認

Phase 9 の qa-results.md（または実行結果）から以下を確認する：

- ESLint: PASS
- TypeScript 型チェック: PASS
- ハンドラーテスト全実行: PASS
- shared パッケージビルド: PASS

### Task 10-4: レビュー判定

**判定基準**:

| 判定     | 条件                                                                   |
| -------- | ---------------------------------------------------------------------- |
| PASS     | AC-01〜AC-11 が全て PASS、Phase 9 が全て PASS                          |
| MINOR    | 機能に影響しない軽微な問題（コメント漏れ、description の表記揺れ等）   |
| MAJOR    | いずれかの AC が FAIL、または旧モデルIDの残存                          |
| CRITICAL | `inferProviderId` の動作異常、または OpenRouter モデルの意図しない変更 |

**想定される MINOR 指摘**:

- description の文末句点の統一（「。」あり・なし混在）
- PROVIDER_CONFIGS コメントの日付フォーマット

MINOR 指摘は未タスク仕様書に変換し、本タスクのスコープ外として Phase 11 前に記録する。

## 参照資料

| 資料名           | パス                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-1-requirements.md`      |
| Phase 9 品質保証 | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-9-quality-assurance.md` |
| 実装ファイル     | `apps/desktop/src/main/handlers/llm.ts`                                                      |
| テストファイル   | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                                       |
| タスク実行ルール | `.claude/rules/05-task-execution.md`（Phase 10 ゲート判定）                                  |

## 成果物

| 成果物                       | パス                                                                                             | 形式     |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| 最終レビュー書（本ファイル） | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-10/final-review.md` | Markdown |

## 完了条件

- [ ] AC-01〜AC-11 の全受入基準を検証し、判定を記録した
- [ ] `apps/desktop/src/main/handlers/llm.ts` を Read し、実装内容の正確性を確認した
- [ ] スコープ外ファイル（shared/types, preload/types 等）が変更されていないことを確認した
- [ ] Phase 9 の全品質チェックが PASS していることを確認した
- [ ] レビュー判定（PASS/MINOR/MAJOR/CRITICAL）を明記した
- [ ] MINOR 指摘がある場合は未タスク仕様書を作成した

## 統合テスト連携

Phase 10 での最終確認として、変更を含む全テストを一括実行する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/
```

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                       | 仕様参照先                                   |
| -------------- | ------------------------------ | -------------------------------------------- |
| アーキテクチャ | Main Process のデータ定義変更  | `aiworkflow-requirements: architecture-*.md` |
| API設計        | IPC レスポンス形式への影響確認 | `aiworkflow-requirements: api-*.md`          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次の Phase

PASS / MINOR → Phase 11（`phase-11-manual-testing.md`）
MAJOR → 影響範囲に応じて Phase 1〜5 に戻る
CRITICAL → Phase 1 に戻り要件再確認
