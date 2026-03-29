# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 7                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

ステータス遷移、plan() エラーレスポンス、IPC レスポンス拡張、既存テスト互換性のテストカバレッジを確認する。

## 実行タスク

- ステータス遷移の coverage を確認する
- plan() エラーレスポンスの coverage を確認する
- IPC レスポンスの coverage を確認する
- edge case の coverage を確認する

## 参照資料

| 資料名                 | パス                             | 説明           |
| ---------------------- | -------------------------------- | -------------- |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md` | baseline suite |
| Phase 5 実装           | `phase-5-implementation.md`      | 実装対象       |
| Phase 6 test expansion | `phase-6-test-expansion.md`      | edge case 補完 |

## 実行手順

### ステップ1: ステータス遷移 coverage を集計する

| 遷移パターン                           | test case | edge case |
| -------------------------------------- | --------- | --------- |
| 初期値 → `"initializing"`              | T-ST-01   | —         |
| `initializing` → `"ready"`             | T-ST-02   | —         |
| `initializing` → `"failed"`            | T-ST-03   | —         |
| `"failed"` → `"ready"`（リカバリー）   | T-ST-06   | Phase 6   |
| `"failed"` → `"failed"`（連続失敗）    | —         | Phase 6   |
| `"ready"` → `"failed"`（異常パターン） | —         | Phase 6   |
| failureReason 取得（failed 時）        | T-ST-04   | —         |
| failureReason 取得（ready 時）         | T-ST-05   | —         |

### ステップ2: plan() エラーレスポンス coverage を集計する

| レスポンスパターン                 | test case | edge case |
| ---------------------------------- | --------- | --------- |
| status "failed" → エラーレスポンス | T-PL-01   | —         |
| status "initializing" → エラー     | T-PL-02   | Phase 6   |
| status "ready" → 正常レスポンス    | T-PL-03   | —         |
| API key エラー → actionable msg    | T-PL-04   | Phase 6   |
| network エラー → 具体的理由        | T-PL-05   | Phase 6   |
| adapterStatus フィールド存在       | T-PL-06   | —         |
| failureReason 空文字               | —         | Phase 6   |

### ステップ3: IPC レスポンス coverage を集計する

| IPC パターン                  | test case | edge case |
| ----------------------------- | --------- | --------- |
| adapter ready 時のレスポンス  | T-IPC-01  | —         |
| adapter failed 時のレスポンス | T-IPC-02  | —         |
| adapter initializing 時       | T-IPC-03  | Phase 6   |

### ステップ4: メソッド coverage を確認する

| メソッド                                  | テスト                 |
| ----------------------------------------- | ---------------------- |
| `Facade.llmAdapterStatus` (getter)        | T-ST-01〜06            |
| `Facade.llmAdapterFailureReason` (getter) | T-ST-04〜05            |
| `Facade.setLLMAdapter()`                  | T-ST-02, T-ST-06       |
| `Facade.setLLMAdapterFailed()`            | T-ST-03, T-ST-04       |
| `Facade.plan()` (エラー分岐)              | T-PL-01〜06            |
| `ipc/index.ts` catch block                | T-IPC-02, Phase 6 edge |

## 統合テスト連携

- Phase 9 で coverage gap が品質リスクを残していないか監査する
- Phase 10 で AC-1〜AC-6 のテスト網羅性を最終判定する

## 成果物

| 成果物         | パス                        | 説明              |
| -------------- | --------------------------- | ----------------- |
| coverage check | `phase-7-coverage-check.md` | coverage 観点本文 |

## 完了条件

- [ ] ステータス遷移の全パターンに test case がある
- [ ] plan() エラーレスポンスの全パターンに test case がある
- [ ] IPC レスポンスの全パターンに test case がある
- [ ] edge case の coverage が Phase 6 と整合している
- [ ] **本Phase内の全タスクを100%実行完了**
