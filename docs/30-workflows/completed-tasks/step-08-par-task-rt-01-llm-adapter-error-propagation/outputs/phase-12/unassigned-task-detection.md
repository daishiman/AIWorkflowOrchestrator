# Unassigned Task Detection — TASK-RT-01

## Follow-up 候補

| #   | 候補                                                 | 優先度 | 備考                                                                               |
| --- | ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| 1   | LLMAdapter リトライロジック                          | Medium | `failed` → `ready` への復帰パスが未実装。ユーザー操作トリガーのリトライが望ましい  |
| 2   | actionable メッセージの i18n 対応                    | Low    | 現在は日本語ハードコード。多言語対応時に i18n キーへの置換が必要                   |
| 3   | `execute()` / `improve()` の同様のエラーチェック追加 | Medium | 現在は `plan()` のみ。execute/improve でも adapter 未設定時のガードが必要          |
| 4   | Discriminated union パターンへのリファクタリング     | Low    | `RuntimeSkillCreatorPlanResponse` を `success` ベースの discriminated union に整理 |
| 5   | API キー管理画面との連携 (TASK-RT-02)                | High   | UI 側で `adapterStatus` を参照してエラー表示を実装。次タスクで対応予定             |
| 6   | Phase 11 NON_VISUAL walkthrough 証跡の実採取         | Medium | `manual-test-result.md` が `not_run` のため、実機で outer/inner IPC 応答を採取する |
| 7   | worktree `esbuild` arch mismatch の再発防止          | Medium | 既存未タスク `task-fix-worktree-native-binary-guard-001.md` で追跡中               |

## 関連タスク

- TASK-RT-02: UI 側エラー表示実装（`adapterStatus` フィールドを利用）
- TASK-UT-RT-01-PHASE11-NONVISUAL-WALKTHROUGH-EVIDENCE-001: `not_run` 証跡の解消
- task-fix-worktree-native-binary-guard-001: `esbuild` 実行環境不一致の恒久対策
