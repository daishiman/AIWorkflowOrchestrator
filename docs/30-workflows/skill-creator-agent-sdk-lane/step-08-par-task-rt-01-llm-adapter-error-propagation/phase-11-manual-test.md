# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 11                            |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

API キー未設定状態、正常設定状態、初期化中状態の各シナリオでスキル作成を実行し、エラーレスポンスとステータス伝播が期待通りであることを人手で確認する。

## 実行タスク

- API キー未設定状態での plan() 呼び出し確認
- API キー正常設定状態での plan() 呼び出し確認
- エラーレスポンスの内容と actionability 確認
- IPC レスポンスの adapterStatus フィールド確認

## テストケース

| テストケース | 観点                 | 手順                                                                                           | 期待結果                                                                                   |
| ------------ | -------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `TC-11-01`   | API キー未設定       | `ANTHROPIC_API_KEY` を未設定にしてアプリを起動し、スキル作成の plan を実行する                 | `success: false`, `errorCode: "LLM_ADAPTER_FAILED"`, error に「APIキーを設定してください」 |
| `TC-11-02`   | API キー正常設定     | `ANTHROPIC_API_KEY` を正しく設定してアプリを起動し、スキル作成の plan を実行する               | `success: true`, `adapterStatus: "ready"`, 正常な plan 結果                                |
| `TC-11-03`   | ステータス確認       | アプリ起動後、Facade の `llmAdapterStatus` を確認する                                          | API キー設定時は `"ready"`, 未設定時は `"failed"`                                          |
| `TC-11-04`   | エラーメッセージ確認 | API キー未設定で plan() を呼び、返却されたエラーメッセージがユーザーにとって理解可能か確認する | actionable なメッセージ（「APIキーを設定してください」等）が含まれる                       |

## 画面カバレッジマトリクス

| テストケース | 対象                     | 画面/証跡                                      | 実施方針                   |
| ------------ | ------------------------ | ---------------------------------------------- | -------------------------- |
| `TC-11-01`   | エラーレスポンス確認     | `outputs/phase-11/screenshots/placeholder.png` | IPC レスポンスのログ出力   |
| `TC-11-02`   | 正常レスポンス確認       | `outputs/phase-11/screenshots/placeholder.png` | IPC レスポンスのログ出力   |
| `TC-11-03`   | ステータスプロパティ     | `outputs/phase-11/screenshots/placeholder.png` | デバッグコンソール出力     |
| `TC-11-04`   | メッセージ actionability | `outputs/phase-11/screenshots/placeholder.png` | エラーメッセージの目視確認 |

## 参照資料

| 資料名                 | パス                             | 説明           |
| ---------------------- | -------------------------------- | -------------- |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md` | baseline suite |
| Phase 5 実装           | `phase-5-implementation.md`      | 実装対象       |
| Phase 6 test expansion | `phase-6-test-expansion.md`      | edge case      |
| Phase 9 QA             | `phase-9-quality-assurance.md`   | quality gate   |
| Phase 10 final review  | `phase-10-final-review.md`       | AC matrix      |

## 実行手順

### ステップ1: API キー未設定状態で検証する

- `ANTHROPIC_API_KEY` 環境変数を unset した状態でアプリを起動する
- `console.warn("[IPC] LLMAdapter initialization failed...")` がログに出力されることを確認する
- Facade の `llmAdapterStatus` が `"failed"` であることを確認する
- Facade の `llmAdapterFailureReason` に具体的な理由が含まれることを確認する

### ステップ2: 未設定状態で plan() を実行する

- スキル作成画面から plan を実行する（または IPC 直接呼び出し）
- レスポンスが `success: false` であることを確認する
- `errorCode` が `"LLM_ADAPTER_FAILED"` であることを確認する
- `error` に「APIキーを設定してください」が含まれることを確認する
- `adapterStatus` が `"failed"` であることを確認する
- 空の stub データが返されないことを確認する

### ステップ3: API キー正常設定状態で検証する

- `ANTHROPIC_API_KEY` を正しく設定してアプリを起動する
- Facade の `llmAdapterStatus` が `"ready"` であることを確認する
- plan() が正常な結果を返すことを確認する
- 発見事項は `Blocker / Note / Info` へ分類する

## 統合テスト連携

- Phase 12 に walkthrough 結果を反映する
- 発見された Blocker は Phase 13 の blocked 条件に追加する

## 成果物

| 成果物            | パス                                        | 説明                       |
| ----------------- | ------------------------------------------- | -------------------------- |
| manual checklist  | `outputs/phase-11/manual-test-checklist.md` | 人手確認項目               |
| manual result     | `outputs/phase-11/manual-test-result.md`    | 実施結果                   |
| manual report     | `outputs/phase-11/manual-test-report.md`    | walkthrough 所見           |
| discovered issues | `outputs/phase-11/discovered-issues.md`     | Blocker / Note / Info 分類 |

## 完了条件

- [ ] API キー未設定時にエラーレスポンスが返ることを確認した
- [ ] API キー正常設定時に正常レスポンスが返ることを確認した
- [ ] エラーメッセージが actionable であることを確認した
- [ ] IPC レスポンスに adapterStatus が含まれることを確認した
- [ ] **本Phase内の全タスクを100%実行完了**
