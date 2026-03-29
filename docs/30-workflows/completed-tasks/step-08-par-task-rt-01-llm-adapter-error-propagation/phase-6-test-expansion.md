# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 6                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

ステータス再遷移、タイミング競合、エラーメッセージパターン、IPC レイヤーの edge case を補う。

## 実行タスク

- ステータス再遷移 edge case を追加する
- タイミング競合 edge case を追加する
- エラーメッセージパターン edge case を追加する
- IPC レイヤー edge case を追加する

## 参照資料

| 資料名              | パス                             | 説明           |
| ------------------- | -------------------------------- | -------------- |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md` | baseline suite |
| Phase 5 実装        | `phase-5-implementation.md`      | 実装対象       |
| Phase 2 設計        | `phase-2-design.md`              | 設計方針       |

## 実行手順

### ステップ1: ステータス再遷移 edge case を追加する

- `setLLMAdapterFailed()` → `setLLMAdapter()` 呼び出し（リカバリーシナリオ）
  - status が `"ready"` に遷移し、failureReason が `null` にクリアされること
- `setLLMAdapterFailed()` → `setLLMAdapterFailed()` 連続呼び出し
  - 最後の呼び出しの reason が保持されること
- `setLLMAdapter()` → `setLLMAdapterFailed()` 呼び出し（異常パターン）
  - status が `"failed"` に遷移すること

### ステップ2: タイミング競合 edge case を追加する

- Facade 生成直後（status === "initializing"）に plan() が呼ばれた場合
  - 初期化完了を待たず即座にエラーレスポンスを返すこと
- `setLLMAdapter()` と plan() が同期的に連続呼び出しされた場合
  - plan() は最新のステータスを参照すること
- fire-and-forget 初期化が長時間かかった場合のシミュレーション
  - plan() が "initializing" エラーを返し続けること

### ステップ3: エラーメッセージパターン edge case を追加する

- failureReason が空文字 `""` の場合 — デフォルトメッセージにフォールバック
- failureReason が非常に長い文字列の場合 — truncation なしで返すこと
- failureReason に "ANTHROPIC_API_KEY" を含む場合 — actionable メッセージに変換
- failureReason に "api_key" を含む場合 — actionable メッセージに変換
- failureReason に "network" を含む場合 — そのまま返すこと
- failureReason が `null` のまま `setLLMAdapterFailed()` に空文字が渡された場合

### ステップ4: IPC レイヤー edge case を追加する

- `LLMAdapterFactory.getAdapter()` が即座に throw した場合
  - `setLLMAdapterFailed()` が同期的に呼ばれること
- `LLMAdapterFactory.getAdapter()` が reject する Promise を返した場合
  - catch ブロックで正しく処理されること
- error が Error インスタンスでない場合（string throw）
  - `String(error)` でメッセージが取得できること
- error が undefined の場合
  - graceful に処理され crash しないこと

## 統合テスト連携

- Phase 7 で edge case の coverage を集計する
- Phase 9 で graceful error handling が crash を防げていることを確認する

## 成果物

| 成果物         | パス                        | 説明                 |
| -------------- | --------------------------- | -------------------- |
| test expansion | `phase-6-test-expansion.md` | edge case 方針と一覧 |

## 完了条件

- [ ] ステータス再遷移の edge case が定義されている
- [ ] タイミング競合の edge case が定義されている
- [ ] エラーメッセージパターンの edge case が定義されている
- [ ] IPC レイヤーの edge case が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
