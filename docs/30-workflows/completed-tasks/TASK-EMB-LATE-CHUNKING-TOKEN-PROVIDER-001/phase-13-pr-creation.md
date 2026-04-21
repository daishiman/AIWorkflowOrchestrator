# Phase 13: PR 作成 - タスク仕様書

## メタ情報

| 項目                | 内容                                                 |
| ------------------- | ---------------------------------------------------- |
| Phase               | 13                                                   |
| タスクID            | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001            |
| タスク名            | Late Chunking トークンレベル隠れ状態プロバイダー実装 |
| タスク種別          | NON_VISUAL                                           |
| implementation_mode | new                                                  |
| ステータス          | blocked                                              |
| 作成日              | 2026-04-20                                           |
| 前Phase             | 12: ドキュメント更新                                 |
| 次Phase             | 完了                                                 |

## 目的

Phase 1〜12 で実装・検証・ドキュメント化した変更を PR として main ブランチへマージする。

## 実行タスク

### Step 1: ローカル確認依頼

- `pnpm --filter @repo/shared test`
- `pnpm --filter @repo/shared typecheck`

### Step 2: 変更サマリー提示

- `IEmbeddingClient` に `getTokenEmbeddings?()` を追加
- `TokenEmbeddingsResult` 型を追加
- `ChunkingService` に token provider 分岐を追加
- `MockTokenEmbeddingClient` と関連テストを追加

### Step 3: 承認後に `/ai:diff-to-pr`

### Step 4: CI 確認

```bash
gh pr checks <PR番号> --watch
```

## 参照資料

| 参照資料                 | パス                                       | 内容           |
| ------------------------ | ------------------------------------------ | -------------- |
| Phase 2 設計             | `outputs/phase-2/design.md`                | 契約要約       |
| Phase 5 実装             | `outputs/phase-5/implementation-notes.md`  | 実装差分       |
| Phase 6 テスト拡充       | `outputs/phase-6/test-expansion-result.md` | 追加検証       |
| Phase 7 カバレッジ       | `outputs/phase-7/coverage-report.md`       | 分岐網羅       |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-summary.md`   | 整理結果       |
| Phase 9 品質保証         | `outputs/phase-9/quality-gate-report.md`   | quality gate   |
| Phase 12 成果物          | `outputs/phase-12/`                        | close-out 証跡 |
| Phase 10 結果            | `outputs/phase-10/final-review-result.md`  | 最終判定       |
| Phase 11 結果            | `outputs/phase-11/manual-test-result.md`   | 代替証跡       |

## 成果物

| 成果物               | パス                                     | 内容                             |
| -------------------- | ---------------------------------------- | -------------------------------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | 事前確認要約                     |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | 変更概要                         |
| PR 情報              | `outputs/phase-13/pr-info.md`            | 想定タイトル・本文・blocked 理由 |
| PR 作成結果          | `outputs/phase-13/pr-creation-result.md` | 未作成または PR URL              |

## 完了条件

- [ ] ユーザーの明示承認を得た
- [ ] Phase 10 / 11 / 12 が完了している
- [ ] PR が作成されている
- [ ] CI が全て PASS している
