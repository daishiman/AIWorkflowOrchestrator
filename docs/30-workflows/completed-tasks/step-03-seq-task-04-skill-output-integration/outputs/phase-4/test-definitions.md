# Phase 4 成果物: テスト定義書 — TASK-SDK-SC-04

## テストファイル

| テストファイル                                                                                  | 対象                        |
| ----------------------------------------------------------------------------------------------- | --------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorOutputHandler.test.ts`            | `SkillCreatorOutputHandler` |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx` | `SkillCreatorResultPanel`   |

## テストケース一覧

| ID    | 説明                                                                      |
| ----- | ------------------------------------------------------------------------- |
| T-01  | マーカーで囲まれた内容を正しく抽出する                                    |
| T-01b | マーカーが存在しない場合はフォールバックで抽出し、`name:` が無ければ null |
| T-02  | `{projectRoot}/.claude/skills/{dirName}/SKILL.md` に保存する              |
| T-03  | `SkillRegistry.registerFromPath()` が正しいパスで呼ばれる                 |
| T-04  | 既存スキルが存在する場合 `requiresOverwriteConfirm: true` が設定される    |
| T-04b | ユーザー承認後に `handleOverwriteApproved()` が保存・登録を続行する       |
| T-05  | `webContents.send()` で `SKILL_CREATOR_OUTPUT_READY` チャネルに送信する   |
| T-06  | スキル名と SKILL.md 内容プレビューを表示する                              |
| T-06b | payload が null の場合は何も表示しない                                    |
| T-06c | `requiresOverwriteConfirm` が true の場合は上書きして保存ボタンを表示する |
| T-06d | スキルを開くボタンをクリックすると `onOpenSkill` が呼ばれる               |
| T-07a | SKILL_END マーカーがない場合はフォールバックを適用する                    |
| T-07b | マーカーなしで name フィールドがない場合は null を返す                    |
| T-07c | スキル名にスペースがある場合は dirName をスラッグ化する                   |
| T-07d | パース失敗時は何も実行しない                                              |
| T-08a | mkdir 失敗時は Error をスローする                                         |
| T-08b | writeFile 失敗時は Error をスローする                                     |
| T-09a | Registry 登録失敗でも IPC 通知は送信される                                |
| T-09b | 同名スキルを 2 回登録できる                                               |
