# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                            |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | completed                                                     |
| 作成日     | 2026-03-13                                                    |
| 更新日     | 2026-03-16                                                    |
| 機能名     | skill-docs-runtime-integration                                |

## 目的

Skill Docs 生成の AI runtime 統合に必要なテストケースを TDD（Red フェーズ）として設計・実装する。LLMDocQueryAdapter、queryFn DI、IPC ハンドラの DocOperationResult、SkillDocsCapabilityResolver の 4 領域について、成功系・異常系・回帰系テストを網羅的に定義する。

## 実行タスク

- T-4-1: LLMDocQueryAdapter の成功系/異常系ユニットテストを定義する
- T-4-2: queryFn DI 注入の経路差し替えテストを定義する
- T-4-3: IPC 4チャンネルのレスポンス契約テストを定義する
- T-4-4: SkillDocsCapabilityResolver の3 path 判定テストを定義する

### T-4-1: LLMDocQueryAdapter ユニットテスト定義

LLMDocQueryAdapter の公開インターフェース（`query(prompt)` / `isAvailable()` / `getProviderName()`）に対するユニットテストを定義する。

| テストケースID | カテゴリ | テスト内容                                                | 期待結果                                                           |
| -------------- | -------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| T-4-1-01       | 成功系   | `query(prompt)` が正常レスポンスを返す                    | DocOperationResult の `success: true` と `data` にレスポンス文字列 |
| T-4-1-02       | 成功系   | `isAvailable()` が API key 設定済みで `true` を返す       | `true`                                                             |
| T-4-1-03       | 成功系   | `getProviderName()` がプロバイダ名を返す                  | 設定されたプロバイダ名の文字列                                     |
| T-4-1-04       | 異常系   | `isAvailable()` が API key 未設定で `false` を返す        | `false`                                                            |
| T-4-1-05       | 異常系   | `query(prompt)` が LLM timeout（3001）で失敗する          | `success: false`, `error.code: 3001`, `error.retryable: true`      |
| T-4-1-06       | 異常系   | `query(prompt)` が rate limit 429（3002）で失敗する       | `success: false`, `error.code: 3002`, `error.retryable: true`      |
| T-4-1-07       | 異常系   | `query(prompt)` が LLM server error 5xx（3003）で失敗する | `success: false`, `error.code: 3003`, `error.retryable: true`      |
| T-4-1-08       | 異常系   | `query(prompt)` が API key 無効（2002）で失敗する         | `success: false`, `error.code: 2002`, `error.retryable: false`     |

### T-4-2: queryFn DI 注入テスト定義

SkillDocGenerator の queryFn を stub から LLMDocQueryAdapter へ差し替える DI メカニズムのテストを定義する。

| テストケースID | カテゴリ | テスト内容                                                     | 期待結果                                        |
| -------------- | -------- | -------------------------------------------------------------- | ----------------------------------------------- |
| T-4-2-01       | 成功系   | stub queryFn 注入時に固定レスポンスを返す                      | stub のレスポンス文字列が返る                   |
| T-4-2-02       | 成功系   | adapter.query bind 注入時に LLM レスポンスを返す               | LLM のレスポンス文字列が返る                    |
| T-4-2-03       | 回帰系   | queryFn 未注入時にデフォルト stub が使用される                 | デフォルト stub のレスポンスが返る              |
| T-4-2-04       | 異常系   | adapter 注入後に `await adapter.isAvailable()` が false の場合 | DocOperationResult の `error.code: 2001` が返る |

### T-4-3: IPC ハンドラ DocOperationResult テスト定義

registerSkillDocsHandlers で登録される 4 チャンネル（generate / preview / export / templates）の DocOperationResult レスポンスを 7 エラー種別でテストする。

| テストケースID | カテゴリ | テスト内容                                                      | 期待結果                                                            |
| -------------- | -------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| T-4-3-01       | 成功系   | `skill:docs:generate` が正常に DocOperationResult を返す        | `success: true`, `data` に GeneratedDoc                             |
| T-4-3-02       | 異常系   | API key 未設定（2001）で guidance レスポンスを返す              | `success: false`, `error.code: 2001`, `error.guidance` に設定手順   |
| T-4-3-03       | 異常系   | API key 無効（2002）で guidance レスポンスを返す                | `success: false`, `error.code: 2002`, `error.guidance` に再設定手順 |
| T-4-3-04       | 異常系   | LLM timeout（3001）で retryable レスポンスを返す                | `success: false`, `error.code: 3001`, `error.retryable: true`       |
| T-4-3-05       | 異常系   | LLM rate limit（3002）で retryable + guidance を返す            | `success: false`, `error.code: 3002`, `error.guidance` に待機指示   |
| T-4-3-06       | 異常系   | LLM server error（3003）で retryable レスポンスを返す           | `success: false`, `error.code: 3003`, `error.retryable: true`       |
| T-4-3-07       | 異常系   | IPC 通信エラー（4001）で retryable レスポンスを返す             | `success: false`, `error.code: 4001`, `error.retryable: true`       |
| T-4-3-08       | 異常系   | 内部エラー（5001）で non-retryable レスポンスを返す             | `success: false`, `error.code: 5001`, `error.retryable: false`      |
| T-4-3-09       | 回帰系   | sender 検証失敗で拒否される                                     | IPC 呼び出しが拒否される                                            |
| T-4-3-10       | 回帰系   | P42 3段バリデーション（型チェック / 空文字列 / トリム空文字列） | バリデーションエラーが返る                                          |

### T-4-4: SkillDocsCapabilityResolver テスト定義

LLM プロバイダの利用可能状態に基づく 3 パス判定のテストを定義する。

| テストケースID | カテゴリ | テスト内容                                              | 期待結果                                           |
| -------------- | -------- | ------------------------------------------------------- | -------------------------------------------------- |
| T-4-4-01       | 成功系   | API key 設定済み + LLM 利用可能 → `full` capability     | `{ capability: "full", provider: "..." }`          |
| T-4-4-02       | 異常系   | API key 未設定 → `guidance-only` capability             | `{ capability: "guidance-only", guidance: "..." }` |
| T-4-4-03       | 異常系   | API key 設定済み + LLM 利用不可 → `degraded` capability | `{ capability: "degraded", reason: "..." }`        |

## テストマトリクス集計

| カテゴリ | ケース数 |
| -------- | -------- |
| 成功系   | 6        |
| 異常系   | 14       |
| 回帰系   | 3        |
| **合計** | **23**   |

## 参照資料

### Phase 依存

| 参照資料                | パス                       | 内容                         |
| ----------------------- | -------------------------- | ---------------------------- |
| Phase 1（要件定義）     | `phase-1-requirements.md`  | 依存する前提成果物を確認する |
| Phase 2（設計）         | `phase-2-design.md`        | 型定義・エラー分類の正本     |
| Phase 3（設計レビュー） | `phase-3-design-review.md` | レビュー指摘事項の反映確認   |

### ソースコード

| 参照資料          | パス                                                                                                              | 内容                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| SkillDocGenerator | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する               |
| ipc index         | `apps/desktop/src/main/ipc/index.ts`                                                                              | queryFn DI の current path を確認する |
| task UT-9I-001    | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクを確認する        |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                                              | 内容                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本                            |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の構成正本           |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | Skill Docs 関連未タスクと public contract 正本 |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | sender、path validation、error envelope の正本 |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I の完了履歴と未タスク正本               |

## 実行手順

### ステップ1: 参照資料の確認と対象範囲の固定

Phase 1-3 の成果物と system spec を確認し、テスト対象のインターフェース（LLMDocQueryAdapter / SkillDocGenerator queryFn / IPC ハンドラ / CapabilityResolver）の契約を固定する。

### ステップ2: テストファイルの作成（Red フェーズ）

T-4-1 から T-4-4 の各テストケースをテストファイルとして実装する。この時点では実装が存在しないため全テストが Red（失敗）となることを確認する。

想定テストファイル配置:

- `apps/desktop/src/main/services/skill/__tests__/LLMDocQueryAdapter.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillDocGenerator.queryFn.test.ts`
- `apps/desktop/src/main/ipc/__tests__/skill-docs-handlers.test.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillDocsCapabilityResolver.test.ts`

### ステップ3: system spec との整合確認

security-electron-ipc-advanced.md の sender 検証要件、P42 3段バリデーション要件がテストケースに含まれていることを確認する。

### ステップ4: 成果物と完了条件の確認

テストマトリクス（23ケース）が 7 エラー種別 + 3 capability パスを網羅していることを検証し、成果物を記録する。

## 統合テスト連携

- queryFn DI テスト（T-4-2）は Phase 5 の stub → adapter 切り替え実装と連動する
- IPC ハンドラテスト（T-4-3）は Phase 5 の registerSkillDocsHandlers 実装と連動する
- CapabilityResolver テスト（T-4-4）は Phase 5 の bootstrap 初期化実装と連動する
- 全テストが Red → Green になることを Phase 5 完了時に検証する

## 成果物

| 成果物             | パス                                                                                 | 内容                                         |
| ------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------- |
| テストマトリクス   | `outputs/phase-4/test-matrix.md`                                                     | 成功系・異常系・回帰系の 23 ケースを整理する |
| Adapter テスト     | `apps/desktop/src/main/services/skill/__tests__/LLMDocQueryAdapter.test.ts`          | T-4-1 の 8 テストケース                      |
| queryFn DI テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillDocGenerator.queryFn.test.ts`   | T-4-2 の 4 テストケース                      |
| IPC ハンドラテスト | `apps/desktop/src/main/ipc/__tests__/skill-docs-handlers.test.ts`                    | T-4-3 の 10 テストケース                     |
| Capability テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillDocsCapabilityResolver.test.ts` | T-4-4 の 3 テストケース                      |

## 完了条件

- [ ] テストケースが 7 エラー種別（2001, 2002, 3001, 3002, 3003, 4001, 5001）を全てカバーしている
- [ ] テストケースが 3 capability パス（full, guidance-only, degraded）を全てカバーしている
- [ ] テストマトリクスに成功系 6 件・異常系 14 件・回帰系 3 件の合計 23 ケースが定義されている
- [ ] P42 3段バリデーション（型チェック / 空文字列 / トリム空文字列）の回帰テストが含まれている
- [ ] 全テストが Red（未実装のため失敗）であることを確認済み

## 既知の落とし穴

| Pitfall | 内容                                    | 対策                                        |
| ------- | --------------------------------------- | ------------------------------------------- |
| P9      | モジュールスコープ変数のテスト間リーク  | beforeEach でモック・状態をリセットする     |
| P13     | タイマーテストの無限ループ              | advanceTimersByTime で 1 ステップずつ進める |
| P39     | happy-dom 環境での userEvent 非互換     | fireEvent を使用する                        |
| P40     | テスト実行ディレクトリ依存              | `cd apps/desktop` から実行する              |
| P42     | 文字列引数の .trim() バリデーション漏れ | 3段バリデーションをテストで検証する         |

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
