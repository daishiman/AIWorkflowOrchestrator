# Phase 2: 実行計画

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 2                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Lead-Sync                                       |

---

## 1. Phase 4-9 実装順序

### Phase 4: テスト作成（Red テスト）

| 順序 | タスク                                            | 成果物                                             | 担当          |
| ---- | ------------------------------------------------- | -------------------------------------------------- | ------------- |
| 4-1  | settings-test-harness.ts のスケルトン作成         | `__tests__/settings-test-harness.ts`（空の型定義） | Codex         |
| 4-2  | INT-01: settings shell mount テスト               | `SettingsView.integration.test.tsx` に Red テスト  | Codex         |
| 4-3  | INT-02: auth-mode 切替 flow テスト                | 同上                                               | Codex         |
| 4-4  | INT-03: apiKey malformed response fallback テスト | 同上                                               | Codex         |
| 4-5  | INT-04: apiKey list success テスト                | 同上                                               | Codex         |
| 4-6  | INT-05: auth-mode invalid state recovery テスト   | 同上                                               | Codex         |
| 4-7  | 回帰行列ドキュメント作成                          | `outputs/phase-4/regression-matrix.md`             | SubAgent-Lead |

**Phase 4 のゲート条件**: 全 5 テストケースが定義されており、全て Red（失敗）状態であること。

### Phase 5: 実装

| 順序 | タスク                                   | 成果物                                            | 担当  |
| ---- | ---------------------------------------- | ------------------------------------------------- | ----- |
| 5-1  | settings-test-harness.ts の完全実装      | store mock + electronAPI mock の harness          | Codex |
| 5-2  | vi.mock("../../store") の harness 経由化 | 統合テスト内の store mock が harness を使用       | Codex |
| 5-3  | window.electronAPI の harness 経由化     | 統合テスト内の electronAPI mock が harness を使用 | Codex |
| 5-4  | INT-01 を Green にする                   | settings shell mount テストが PASS                | Codex |
| 5-5  | INT-02 を Green にする                   | auth-mode 切替テストが PASS                       | Codex |
| 5-6  | INT-03 を Green にする                   | apiKey malformed response テストが PASS           | Codex |
| 5-7  | INT-04 を Green にする                   | apiKey list success テストが PASS                 | Codex |
| 5-8  | INT-05 を Green にする                   | auth-mode invalid state テストが PASS             | Codex |

**Phase 5 のゲート条件**: 全 5 テストケースが Green（成功）状態であること。

### Phase 6: テスト拡充

| 順序 | タスク                                              | 成果物                                      | 担当  |
| ---- | --------------------------------------------------- | ------------------------------------------- | ----- |
| 6-1  | INT-03 派生: apiKey.list() 未定義ケース             | ApiKeysSection の「機能利用不可」表示テスト | Codex |
| 6-2  | INT-03 派生: apiKey.list() ネットワークエラーケース | ApiKeysSection のエラー表示 + 再試行テスト  | Codex |
| 6-3  | INT-01 拡張: AccountSection 未認証状態テスト        | 未認証時のログインボタン表示テスト          | Codex |
| 6-4  | INT-01 拡張: AccountSection 認証済み状態テスト      | 認証済み時のプロフィール表示テスト          | Codex |
| 6-5  | INT-02 拡張: disabled 状態テスト                    | authModeLoading 時の操作無効化テスト        | Codex |

### Phase 7: カバレッジ確認

| 順序 | タスク                             | 成果物                                | 担当          |
| ---- | ---------------------------------- | ------------------------------------- | ------------- |
| 7-1  | カバレッジレポート取得             | `vitest --coverage` の出力            | Codex         |
| 7-2  | カバレッジギャップ分析             | `outputs/phase-7/coverage-gap-log.md` | SubAgent-Lead |
| 7-3  | 不足箇所のテスト追加（必要な場合） | Phase 6 へ戻るか判断                  | SubAgent-Lead |

**Phase 7 のゲート条件**: Line 80%+, Branch 60%+, Function 80%+ を達成していること。未達の場合は Phase 6 へ戻る。

### Phase 8: リファクタリング

| 順序 | タスク                 | 成果物                             | 担当  |
| ---- | ---------------------- | ---------------------------------- | ----- |
| 8-1  | テストコードの重複排除 | harness ヘルパーへの共通処理集約   | Codex |
| 8-2  | テストケース名の統一   | 日本語テストケース名の命名規約統一 | Codex |
| 8-3  | import 整理            | 未使用 import の削除               | Codex |

**Phase 8 のゲート条件**: リファクタリング後に全テストが PASS すること。

### Phase 9: 品質検証

| 順序 | タスク                      | 成果物                   | 担当          |
| ---- | --------------------------- | ------------------------ | ------------- |
| 9-1  | `pnpm lint` 実行            | lint エラー 0 件         | Codex         |
| 9-2  | `pnpm typecheck` 実行       | 型エラー 0 件            | Codex         |
| 9-3  | 全テスト実行（既存 + 新規） | 全 PASS                  | Codex         |
| 9-4  | テスト実行時間の計測        | NFR-01（10秒以内）の確認 | SubAgent-Lead |

---

## 2. SubAgent / Codex 委譲境界まとめ

```
Phase 1-3:  SubAgent-Lead-Sync が直列で実行（要件 → 設計 → レビュー）
            ↓
Phase 4:    SubAgent-Lead が AC・テストケース ID を固定
            Codex がテストコードを実装（Red テスト）
            ↓
Phase 5:    SubAgent-Test-Harness が harness 設計を確認
            Codex が harness + テスト実装（Green 化）
            ↓
Phase 6-7:  SubAgent-Component-Scope がカバレッジ不足を分析
            Codex が追加テストを実装
            ↓
Phase 8-9:  Codex がリファクタリングと品質検証を実行
            SubAgent-Lead が結果を確認
            ↓
Phase 10:   SubAgent-Lead-Sync が最終レビュー（4観点チェック）
            ↓
Phase 11:   SubAgent-Manual-Evidence が手動テスト実行・証跡収集
            ↓
Phase 12:   SubAgent-Lead-Sync が仕様同期・未タスク検出
            ↓
Phase 13:   SubAgent-Lead-Sync が PR 準備（ユーザー指示後に実行）
```

---

## 3. リスク対応計画

| リスク                                                            | 発生可能性 | 対応計画                                                                                                   |
| ----------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| AccountSection の store mock が複雑で harness が肥大化する        | 高         | AccountSection は `isAuthenticated: false` の未認証状態をデフォルトとし、認証済みテストは1ケースに限定する |
| ApiKeysSection の mount 時 IPC 呼び出しが非同期で不安定になる     | 中         | `waitFor` + `findByText` パターンで非同期レンダリングを待機する                                            |
| 既存 unit test と integration test の実行時間合算が 10 秒を超える | 低         | integration test を別ファイルに分離しているため、単体実行で計測可能                                        |
| task-05/06/07 の実装変更により INT-02/03/05 が破綻する            | 低         | AC レベルで追跡し、実装詳細に依存しない設計にする                                                          |

---

## 4. 成果物一覧（Phase 4-9）

| Phase | 主要成果物                           | ファイルパス                                                    |
| ----- | ------------------------------------ | --------------------------------------------------------------- |
| 4     | Red テスト + 回帰行列                | `SettingsView.integration.test.tsx`, `regression-matrix.md`     |
| 5     | settings-test-harness + Green テスト | `settings-test-harness.ts`, `SettingsView.integration.test.tsx` |
| 6     | 拡充テスト                           | `SettingsView.integration.test.tsx`                             |
| 7     | カバレッジレポート + ギャップログ    | `coverage-gap-log.md`                                           |
| 8     | リファクタリング済みテスト           | `SettingsView.integration.test.tsx`, `settings-test-harness.ts` |
| 9     | 品質検証結果                         | `quality-assurance-result.md`                                   |
