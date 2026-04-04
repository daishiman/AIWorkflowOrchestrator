# Phase 4: テスト作成

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 4                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

ステータス遷移の全パターン、plan() エラーレスポンス、IPC レスポンスのステータス付与、既存テスト互換性の test matrix を定義する。

## 実行タスク

- ステータス遷移 test case を定義する
- plan() エラーレスポンス test case を定義する
- IPC レスポンス test case を定義する
- 既存テスト互換性 test case を定義する

## 参照資料

| 資料名                 | パス                                        | 説明                             |
| ---------------------- | ------------------------------------------- | -------------------------------- |
| Phase 1 要件           | `phase-1-requirements.md`                   | ステータス・エラーレスポンス要件 |
| Phase 2 設計           | `phase-2-design.md`                         | Facade / IPC 設計                |
| error response catalog | `outputs/phase-2/error-response-catalog.md` | エラーコード一覧                 |
| Phase 3 review         | `phase-3-design-review.md`                  | gate 判定結果                    |

## 実行手順

### ステップ1: ステータス遷移テストケースを定義する

| テストケース | シナリオ                                            | 期待結果                                                 |
| ------------ | --------------------------------------------------- | -------------------------------------------------------- |
| `T-ST-01`    | Facade 生成直後                                     | `llmAdapterStatus === "initializing"`                    |
| `T-ST-02`    | `setLLMAdapter()` 呼び出し後                        | `llmAdapterStatus === "ready"`                           |
| `T-ST-03`    | `setLLMAdapterFailed("API key not set")` 呼び出し後 | `llmAdapterStatus === "failed"`                          |
| `T-ST-04`    | `setLLMAdapterFailed()` 後の failureReason 取得     | `llmAdapterFailureReason === "API key not set"`          |
| `T-ST-05`    | `setLLMAdapter()` 後の failureReason 取得           | `llmAdapterFailureReason === null`                       |
| `T-ST-06`    | `setLLMAdapterFailed()` 後に `setLLMAdapter()` 呼出 | `llmAdapterStatus === "ready"`, `failureReason === null` |

### ステップ2: plan() エラーレスポンステストケースを定義する

| テストケース | シナリオ                                     | 期待結果                                                                    |
| ------------ | -------------------------------------------- | --------------------------------------------------------------------------- |
| `T-PL-01`    | status === "failed" で plan() 呼び出し       | `success: false`, `errorCode: "LLM_ADAPTER_FAILED"`, error に失敗理由を含む |
| `T-PL-02`    | status === "initializing" で plan() 呼び出し | `success: false`, `errorCode: "LLM_ADAPTER_INITIALIZING"`                   |
| `T-PL-03`    | status === "ready" で plan() 呼び出し        | 既存の正常レスポンス（`success: true`）                                     |
| `T-PL-04`    | API key 未設定エラーで failed 時の plan()    | error に「APIキーを設定してください」を含む                                 |
| `T-PL-05`    | ネットワークエラーで failed 時の plan()      | error に具体的な失敗理由を含む                                              |
| `T-PL-06`    | エラーレスポンスに adapterStatus を含む      | `adapterStatus` フィールドが存在し、現在のステータスと一致                  |

### ステップ3: IPC レスポンステストケースを定義する

| テストケース | シナリオ                                  | 期待結果                                                                                                |
| ------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `T-IPC-01`   | plan IPC 呼び出し（adapter ready）        | outer は `success: true`、inner `data.adapterStatus: "ready"` を含む                                    |
| `T-IPC-02`   | plan IPC 呼び出し（adapter failed）       | outer は `success: true`、inner `data.success: false` + `adapterStatus: "failed"` と error を含む       |
| `T-IPC-03`   | plan IPC 呼び出し（adapter initializing） | outer は `success: true`、inner `data.success: false` + `adapterStatus: "initializing"` と error を含む |

### ステップ4: 既存テスト互換性テストケースを定義する

| テストケース  | シナリオ                                            | 期待結果                                                                              |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `T-COMPAT-01` | 既存 `setLLMAdapter()` テストパターン               | ステータスが自動的に "ready" に遷移しテスト pass                                      |
| `T-COMPAT-02` | llmAdapter を設定せずに他の Facade メソッド呼び出し | 既存動作と同等（plan 以外は影響なし）                                                 |
| `T-COMPAT-03` | 型拡張後の既存レスポンス型互換性                    | `RuntimeSkillCreatorPlanErrorResponse` union 追加後も既存呼び出しが型エラーにならない |

## 統合テスト連携

- Phase 6 で `setLLMAdapterFailed()` の連続呼び出し、タイミング競合等の edge case を追加する
- Phase 7 で AC-1〜AC-6 の全項目の test coverage を集計する

## 成果物

| 成果物      | パス                             | 説明                         |
| ----------- | -------------------------------- | ---------------------------- |
| test matrix | `outputs/phase-4/test-matrix.md` | pass/fail シナリオと期待結果 |

## 完了条件

- [ ] ステータス遷移の全パターンの test case が定義されている
- [ ] plan() エラーレスポンスの全パターンの test case が定義されている
- [ ] IPC レスポンスの test case が定義されている
- [ ] 既存テスト互換性の test case が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
