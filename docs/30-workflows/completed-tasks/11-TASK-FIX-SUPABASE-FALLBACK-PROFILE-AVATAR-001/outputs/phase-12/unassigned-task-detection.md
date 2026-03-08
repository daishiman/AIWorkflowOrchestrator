# Phase 12: 未タスク検出記録

## 新規未タスク検出件数

| 区分     | 件数 | 内容                                                                     |
| -------- | ---- | ------------------------------------------------------------------------ |
| current  | 1    | Settings の Profile / Avatar fallback error が英語のまま表示される       |
| baseline | 0    | `task-workflow.md` の broken link は今回修正し、既存未解決は残していない |

## 未タスク監査結果

| 監査                                                                                                                                                                                                                                                                                                                                             | 結果                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `audit-unassigned-tasks --json --diff-from HEAD --unassigned-dir docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/unassigned-task --target-file docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/unassigned-task/task-imp-profile-avatar-fallback-error-localization-001.md` | `currentViolations=0`                           |
| `audit-unassigned-tasks --json --diff-from HEAD`                                                                                                                                                                                                                                                                                                 | `currentViolations=0`, `baselineViolations=127` |

## 検出根拠

### 1. Phase 11 スクリーンショット

| 証跡                                     | 観測内容                                            |
| ---------------------------------------- | --------------------------------------------------- |
| `TC-11-UI-02-profile-fallback-error.png` | `Profile service is not configured...` が英語で表示 |
| `TC-11-UI-03-avatar-fallback-error.png`  | `Avatar service is not configured...` が英語で表示  |

### 2. Renderer コード確認

| ファイル                                                                  | 根拠                                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/views/SettingsView/ProfileSection/index.tsx`   | `result.error?.message` をそのまま `setError()` している            |
| `apps/desktop/src/renderer/store/slices/authSlice.ts`                     | avatar 系で `response.error?.message` を `authError` に保存している |
| `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` | `authError` をそのまま banner 表示している                          |

## 4ステップ完了状況

| ステップ | 内容                    | 状態 |
| -------- | ----------------------- | ---- |
| 1        | 指示書作成              | 完了 |
| 2        | 物理ファイル存在確認    | 完了 |
| 3        | `task-workflow.md` 登録 | 完了 |
| 4        | 関連仕様書テーブル登録  | 完了 |

## 登録先

| 種別           | パス                                                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 未タスク指示書 | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/unassigned-task/task-imp-profile-avatar-fallback-error-localization-001.md` |
| 台帳           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                            |
| 関連仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                                                                          |

## 結論

- 新規未タスクは 1 件
- 未タスク指示書は 9 セクション準拠へ整備済みで、今回差分の監査違反は 0 件
- repo 全体 baseline には既存違反 127 件が残るが、今回差分とは分離して記録できている
