# Phase 3: 設計レビュー -- OpenAICompatibleAdapter 統一アーキテクチャ実装

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 3                         |
| 機能名     | openai-compatible-adapter |
| タスクID   | TASK-LLM-MOD-06           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 2（設計）           |

## 目的

Phase 2 の設計内容を要件との整合性・アーキテクチャ品質・セキュリティ・テスタビリティの観点から検証し、Phase 4 進行の可否を判定する。

## 実行タスク

### Task 3-1: 要件充足性チェック

Phase 1 の受入基準（AC-01 から AC-08）と Phase 2 の設計を対照する。

| AC ID | 受入基準                                            | 設計での対応                                                       | 判定 |
| ----- | --------------------------------------------------- | ------------------------------------------------------------------ | ---- |
| AC-01 | sendChat が Chat Completions API レスポンスを返す   | Task 2-3 で fetchWithRetry + レスポンスパースを設計                | OK   |
| AC-02 | streamChat が SSE ストリームチャンクを yield する   | Task 2-3 で fetchSSE + StreamChunkResponse パースを設計            | OK   |
| AC-03 | checkHealth が GET /models でヘルスチェック         | Task 2-3 でリトライなし GET /models を設計                         | OK   |
| AC-04 | LLMAdapterFactory が設定駆動で 3 プロバイダーを生成 | Task 2-4, 2-5 で OPENAI_COMPATIBLE_CONFIGS + ループ登録を設計      | OK   |
| AC-05 | OpenRouter の extraHeaders がリクエストに含まれる   | Task 2-4 で extraHeaders フィールドに HTTP-Referer, X-Title を設定 | OK   |
| AC-06 | TypeScript コンパイルエラーが 0 件                  | 新規クラスは BaseLLMAdapter 継承、既存型のみ使用                   | OK   |
| AC-07 | 既存テストが引き続き PASS                           | ILLMAdapter インターフェース変更なし、ファクトリ API 変更なし      | OK   |
| AC-08 | ILLMAdapter インターフェースへの変更がない          | types.ts は変更対象外                                              | OK   |

### Task 3-2: 設計品質チェック

#### 2-A: 単一責務原則（SRP）

`OpenAICompatibleAdapter` は OpenAI Chat Completions API 互換の HTTP 通信のみを担う。プロバイダー固有の設定（URL、ヘッダー）は `OpenAICompatibleProviderConfig` で分離されている。問題なし。

#### 2-B: 依存性逆転原則（DIP）

`LLMAdapterFactory` は `ILLMAdapter` インターフェースを介してアダプターを管理する。`OpenAICompatibleAdapter` は `ILLMAdapter` を実装（BaseLLMAdapter 経由）しているため、DIP に準拠している。問題なし。

#### 2-C: 開放閉鎖原則（OCP）

新しい OpenAI 互換プロバイダーを追加する場合、`OPENAI_COMPATIBLE_CONFIGS` マップに 1 エントリ追加するだけで対応可能。既存のクラスやファクトリロジックを変更する必要がない。問題なし。

#### 2-D: 型安全性

- `OPENAI_COMPATIBLE_CONFIGS` のキーは `string` 型で、ループ内で `as LLMProviderId` にキャストしている。マップのキーと `providerId` の値が一致しない場合にランタイムエラーが発生する可能性がある
- 影響度: 低（開発者が定数を直接定義するため、CI で検出可能）
- 対策: テストでマップのキーと providerId の一致を検証する（Phase 4 で追加）

#### 2-E: セキュリティ（04-electron-security.md 準拠）

- API キーは `Authorization: Bearer ${apiKey}` ヘッダーで送信される。ログ出力には含まれない
- `extraHeaders` は静的定数から注入される。外部入力に依存しない
- `baseUrl` は `config?.baseUrl` でオーバーライド可能だが、これは既存の BaseLLMAdapter の設計と同一。追加リスクはない
- 問題なし

#### 2-F: テスタビリティ

- `OpenAICompatibleAdapter` はコンストラクタ DI（providerConfig, apiKey, config）で初期化されるため、テストで任意の設定を注入可能
- `fetchWithRetry` / `fetchSSE` は BaseLLMAdapter のメソッドであり、モック可能
- 問題なし

### Task 3-3: リスク評価

| リスク                                                   | 可能性 | 影響 | 対策                                  |
| -------------------------------------------------------- | ------ | ---- | ------------------------------------- |
| OpenAI API レスポンス形式の変更                          | 低     | 高   | ChatCompletionResponse 型で静的型検証 |
| extraHeaders の値が不正な場合の HTTP エラー              | 低     | 低   | 静的定数のため開発時に検出可能        |
| OPENAI_COMPATIBLE_CONFIGS キーと providerId の不一致     | 低     | 中   | テストで一致検証                      |
| 旧 OpenAIAdapter / xAIAdapter との共存時のインポート混乱 | 中     | 低   | index.ts で明示的にエクスポートを管理 |

### Task 3-4: 未解決事項の記録

| ID   | 事項                                                       | 種別       | 対応方針                 |
| ---- | ---------------------------------------------------------- | ---------- | ------------------------ |
| U-01 | 旧 OpenAIAdapter / xAIAdapter の削除タイミング             | スコープ外 | 別タスクとして分離       |
| U-02 | OPENAI_COMPATIBLE_CONFIGS キーの型安全化（string -> enum） | 改善候補   | Phase 4 テストで代替検証 |

### Task 3-5: レビュー判定

**判定: PASS**

以下の根拠で Phase 4 への進行を承認する:

1. 受入基準 AC-01 から AC-08 が設計で全て満たされている
2. SRP / DIP / OCP の設計原則に準拠している
3. 新規プロバイダー追加が設定 5 行の追加で完結する拡張性がある
4. セキュリティリスクの増加がない
5. 既存テストへの影響がない（ILLMAdapter / ファクトリ API 変更なし）

MINOR 指摘事項:

- U-02: OPENAI_COMPATIBLE_CONFIGS のキーが string 型であり、providerId との一致が型レベルで保証されない。Phase 4 テストで検証すること

## 参照資料

| 資料名               | パス                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義     | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-1-requirements.md` |
| Phase 2 設計         | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-2-design.md`       |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                                                               |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                                                                          |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                                                               |

## 成果物

| 成果物                       | パス                                                                                                                              | 形式     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 設計レビュー書（本ファイル） | `docs/30-workflows/llm-provider-model-modernization/tasks/step-05-seq-task-06-openai-compatible-adapter/phase-3-design-review.md` | Markdown |

## 完了条件

- [x] AC-01 から AC-08 の全受入基準と設計の対応を確認した
- [x] SRP / DIP / OCP の設計原則への準拠を確認した
- [x] extraHeaders の静的定数注入によるセキュリティ安全性を確認した
- [x] テスタビリティ（DI ベースのコンストラクタ設計）を確認した
- [x] リスク評価テーブルを完成させた
- [x] 未解決事項（U-01, U-02）を記録した
- [x] レビュー判定（PASS）を明記した

## 次の Phase

Phase 4: テスト作成（`phase-4-test-creation.md`）
