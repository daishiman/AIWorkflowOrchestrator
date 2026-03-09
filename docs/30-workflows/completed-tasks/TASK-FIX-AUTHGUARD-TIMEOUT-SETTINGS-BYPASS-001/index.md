# TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## AuthGuard タイムアウトフォールバック + Settings認証除外

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| タスク種別 | fix                                            |
| 優先度     | Priority 3                                     |
| ステータス | completed                                      |

## 概要

AuthGuard が `isLoading` で停滞したときのフォールバック UI と、認証不能時でも Settings 公開シェルへ到達できる導線を追加した。再監査では、Settings bypass を成立させるために未認証 reset から `settings` を除外する必要があることを確認し、コードと仕様を合わせて是正した。Phase 13 では PR #1123 を作成し、実装ガイド全文コメントと screenshot コメントまで投稿した。

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | completed  |

## 主要成果物

| 成果物                  | パス                                                            |
| ----------------------- | --------------------------------------------------------------- |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                        |
| screenshot              | `outputs/phase-11/screenshots/`                                 |
| implementation guide    | `outputs/phase-12/implementation-guide.md`                      |
| spec update summary     | `outputs/phase-12/spec-update-summary.md`                       |
| changelog               | `outputs/phase-12/documentation-changelog.md`                   |
| unassigned detection    | `outputs/phase-12/unassigned-task-detection.md`                 |
| PR                      | `https://github.com/daishiman/AIWorkflowOrchestrator/pull/1123` |

## 実装の要点

1. `AuthGuard` に 10 秒 timeout の `AuthTimeoutFallback` を追加した。
2. `currentView === "settings"` を AuthGuard 外へ出した。
3. `shouldResetUnauthenticatedView` を追加し、未認証時 reset から `settings` を除外した。
4. Phase 11 は専用 harness で screenshot 4 件を取得し、Phase 12 は system spec を再同期した。
5. Phase 13 で PR #1123 を作成し、pre-push validation PASS と implementation-guide / screenshot コメント投稿まで完了した。
