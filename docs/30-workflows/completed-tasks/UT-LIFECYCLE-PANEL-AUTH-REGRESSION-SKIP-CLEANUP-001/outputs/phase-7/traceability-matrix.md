# Phase 7: トレーサビリティマトリクス

## AC-1〜AC-5 × テスト ID マッピング

| AC ID | 受け入れ条件（概要）                                                  | 対応テスト ID                | 処置結果        | カバレッジ確認 |
| ----- | --------------------------------------------------------------------- | ---------------------------- | --------------- | -------------- |
| AC-1  | describe.skip が 0件になること                                        | -（構造的条件）              | PASS（0件確認） | OK             |
| AC-2  | 全アクティブテストが PASS すること                                    | TC-01a/01b/01c/02/04a/04b/08 | PASS（7/7）     | OK             |
| AC-3  | auth:login 非発火テストが最低1件以上有効化されていること              | TC-01a/01b/01c/08            | PASS            | OK             |
| AC-4  | `pnpm --filter @repo/desktop test:run` 相当の対象検証が PASS すること | 対象 Vitest 実行             | PASS            | OK             |
| AC-5  | TypeScript 型エラーが 0件                                             | -（静的解析条件）            | PASS            | OK             |

## auth:login 非発火テスト × コードパス

| テスト ID | テスト名                                                           | auth:login 検証対象       | 有効化状態 |
| --------- | ------------------------------------------------------------------ | ------------------------- | ---------- |
| TC-01a    | SkillLifecyclePanel wizard flow does not call auth:login           | `onOpenSkillWizard`       | 有効       |
| TC-01b    | 詳細ウィザード導線でも auth:login が呼ばれないこと                 | `onOpenWizard`            | 有効       |
| TC-01c    | セッション削除後の新規開始でも auth:login が呼ばれないこと         | `handleSessionStartNew()` | 有効       |
| TC-02     | AccountSection triggers auth:login on demand                       | 正常系 login()            | 有効       |
| TC-04a    | authSlice.login thunk works correctly (no debug code) [TEMP DEBUG] | デバッグコード残存なし    | 有効       |
| TC-04b    | authSlice.login() が正常に IPC を呼び出すこと                      | IPC 正常呼び出し          | 有効       |
| TC-08     | authModeSlice state changes do not trigger unexpected auth:login   | authModeSlice 状態変化    | 有効       |

## 削除 TC の扱い

| 削除 TC ID | 旧観点                        | 処置 | 現在の扱い                                                   |
| ---------- | ----------------------------- | ---- | ------------------------------------------------------------ |
| TC-03      | prepare フロー完了時の非発火  | 削除 | 現行 UI では `onOpenSkillWizard` 導線へ置換                  |
| TC-05      | 未認証状態の旧 prepare フロー | 削除 | 現行 UI では `onOpenSkillWizard` / `onOpenWizard` 導線へ置換 |
| TC-06      | 連続押下時の多重発火抑制      | 削除 | follow-up として再設計                                       |
| TC-07      | 再レンダリング時の非発火      | 削除 | follow-up として再設計                                       |

## follow-up 必要観点

- rapid click / rerender に対する `auth:login` 非発火保証は、現行 UI の責務境界で再定義が必要
- 詳細は `outputs/phase-12/unassigned-task-detection.md` の follow-up 参照

## describe.skip 解消結果

| describe.skip 件数 | Phase 1 時点 | 現在    | 変化                       |
| ------------------ | ------------ | ------- | -------------------------- |
| TC-03              | skip         | 削除    | 現行 UI 非対応のため除去   |
| TC-05              | skip         | 削除    | 現行 UI 非対応のため除去   |
| TC-06              | skip         | 削除    | 現行 UI で別タスクへ再設計 |
| TC-07              | skip         | 削除    | 現行 UI で別タスクへ再設計 |
| TC-08              | skip         | active  | 有効化                     |
| **合計**           | **5件**      | **0件** | **-5件**                   |
