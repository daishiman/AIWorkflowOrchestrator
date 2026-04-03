# Phase 1: 要件定義 — requirements-spec

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 1                                        |
| タスクID | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| 作成日   | 2026-04-03                               |
| 担当     | 実装者                                   |

## P50 チェック（既実装確認）

- `apps/desktop/src/main/ipc/beforeQuitGuard.ts` が存在
- `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts` が存在（TC-B-01〜TC-B-03）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` に `hasRunningExecution()` 実装
- `apps/desktop/src/main/ipc/index.ts` で `registerBeforeQuitGuard` が登録済み
- `RuntimeSkillCreatorFacade.notification.test.ts` に TC-F-04〜TC-F-08 が存在

## 変更対象ファイルのインベントリ

| ファイル                                                                                                                        | 状態                            | 本タスクでの扱い     |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------- |
| `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                                                                                  | ✅ 実装済み                     | 検証のみ（変更なし） |
| `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                                                   | ✅ TC-B-01〜03                  | 検証のみ（変更なし） |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                           | ✅ hasRunningExecution 実装済み | 検証のみ             |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`                               | ✅ TC-F-04〜TC-F-08             | 検証のみ（既存）     |
| `docs/30-workflows/completed-tasks/skill-creator-before-quit-guard/unassigned-task/TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001.md` | ⚠️ チェックボックス未更新       | Phase 12 で更新      |

## 受入条件（AC）

| ID   | 受入条件                                                                             | 確認方法                      | 現在の状態        |
| ---- | ------------------------------------------------------------------------------------ | ----------------------------- | ----------------- |
| AC-1 | スキル生成実行中に `before-quit` が発火した場合 `event.preventDefault()` が呼ばれる  | UT (TC-B-01)                  | ✅ 実装済み       |
| AC-2 | スキル生成未実行時は `event.preventDefault()` が呼ばれず通常終了できる               | UT (TC-B-02)                  | ✅ 実装済み       |
| AC-3 | `registerBeforeQuitGuard` の戻り値（cleanup関数）でリスナーが解除される              | UT (TC-B-03)                  | ✅ 実装済み       |
| AC-4 | `hasRunningExecution()` は `execute()` 実行中に `true`、完了/失敗時に `false` を返す | UT (TC-F-04〜TC-F-05)         | ✅ 既存カバレッジ |
| AC-5 | 並行実行時（複数 planId）は全て完了するまで `hasRunningExecution()` が `true` を返す | UT (TC-F-06〜TC-F-08)         | ✅ 既存カバレッジ |
| AC-6 | ユーザーが「中断して終了」を選択した場合 `app.exit(0)` が呼ばれる                    | UT (Phase 6 追加)             | ⚠️ 追加テスト必要 |
| AC-7 | ダイアログ表示失敗時に `console.warn` で記録される                                   | UT (Phase 6 追加)             | ⚠️ 追加テスト必要 |
| AC-8 | TypeScript 型チェック PASS、ESLint エラーなし                                        | `pnpm typecheck && pnpm lint` | ⚠️ 未確認         |

## スコープ外

| 項目                                 | スコープ外の理由                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| graceful shutdown（LLM処理の待機）   | LLM API の中断は技術的に複雑であり別タスク化が適切                           |
| ファイルシステムのロールバック       | スキル生成の成果物は一時ディレクトリ管理のため影響軽微（Phase 2 で詳細設計） |
| TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001 | 別タスクとして管理中                                                         |
| TASK-CREATOR-HANDLERS-AUDIT-001      | 別タスクとして管理中                                                         |

## リスク評価

| リスク                                                               | 影響度 | 対応方針                                                              |
| -------------------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| `app.exit(0)` による突然終了でファイルシステムが中途半端な状態になる | MEDIUM | Phase 2 設計で「既知リスクとして受容するか、cleanup追加するか」を決定 |
| ダイアログが表示されない環境（headless）での動作                     | LOW    | `.catch` による `console.warn` が実装済み                             |
| 複数 planId の並行実行時のカウント整合性                             | HIGH   | Phase 4 でテスト追加して検証                                          |

## 成果物

| 成果物            | パス                                   | 説明                         |
| ----------------- | -------------------------------------- | ---------------------------- |
| requirements-spec | `outputs/phase-1/requirements-spec.md` | 要件定義と受入条件の確定記録 |
