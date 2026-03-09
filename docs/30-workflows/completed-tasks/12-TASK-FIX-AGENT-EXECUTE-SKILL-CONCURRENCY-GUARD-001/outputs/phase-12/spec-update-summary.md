# 仕様更新要約

## 更新した仕様書

| ファイル                                                                             | 更新内容                                                                                                                                            |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | executeSkill ガードの現行状態、ChatPanel セレクタ移行完了、苦戦箇所の短縮手順、残未タスク 1 件を同期                                                |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 未タスク9セクション逸脱、Router 二重化、4ステップ解決手順を追加                                                                                     |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | workflow12 の判定を PASS へ更新し、`validate-phase-output` の実行方法を現行スクリプトに合わせて修正                                                 |
| `.claude/skills/task-specification-creator/references/patterns.md`                   | `validate-phase-output --phase` 誤用ドリフトの失敗パターンを追加                                                                                    |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | BrowserRouter 配下の harness で Router を入れ子にしない注意を追加                                                                                   |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 新規/全面更新した未タスク指示書は作成直後に `audit-unassigned-tasks --diff-from HEAD --target-file` で `currentViolations=0` を確認するルールを追加 |
| `.claude/skills/task-specification-creator/assets/main-task-template.md`             | `validate-phase-output` のコマンド例を修正                                                                                                          |
| `.claude/skills/task-specification-creator/assets/common-footer-template.md`         | `validate-phase-output` のコマンド例を修正                                                                                                          |
| `.claude/skills/task-specification-creator/agents/output-phase-files.md`             | `validate-phase-output` のコマンド例を修正                                                                                                          |
| `.claude/skills/skill-creator/references/patterns.md`                                | current workflow 再監査時の CLI drift / 未タスク9セクション / skill同期、および BrowserRouter descendant harness パターンを追加                     |

## 更新不要と判断した仕様書

| ファイル                        | 判断                                         |
| ------------------------------- | -------------------------------------------- |
| `interfaces-agent-sdk-skill.md` | Renderer/Main の API 契約変更なし            |
| `api-ipc-agent.md`              | IPC チャネル追加・変更なし                   |
| `ui-ux-agent-execution.md`      | 実装は既存仕様どおりで、今回は証跡追補が中心 |
| `ui-ux-feature-skill-stream.md` | ChatPanel の表示仕様自体は変更なし           |

## 変更理由

- 実装本体は小さいが、workflow 本文・Phase 11 証跡・Phase 12 実装ガイド・system spec の間にドリフトが残っていた
- `validate-phase-output --phase` は実スクリプトと食い違っていたため、今後の再監査で誤案内になる状態だった
- `ChatPanel` の個別セレクタ移行はすでにコードで完了していたため、未タスクから外す必要があった
- 新規未タスクが指定ディレクトリに存在しても、テンプレート非準拠なら再利用できないため、format 監査を別ゲートとして固定する必要があった
