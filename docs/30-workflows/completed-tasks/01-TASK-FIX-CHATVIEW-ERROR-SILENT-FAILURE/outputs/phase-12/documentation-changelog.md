# ドキュメント変更ログ

## 変更ファイル一覧

### Phase 11 / Phase 12 の workflow-local 成果物

| ファイル                                                 | 変更内容                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| `phase-11-manual-test.md`                                | TC-11-01 〜 TC-11-05 の証跡ファイル名と PNG 実在前提へ更新       |
| `outputs/phase-11/manual-test-result.md`                 | 5 件の screenshot 参照を固定した結果表を維持                     |
| `outputs/phase-11/screenshot-plan.md`                    | 実取得済みコマンドと証跡配置前提へ更新                           |
| `outputs/phase-11/screenshot-coverage.md`                | 画面カバレッジを維持                                             |
| `outputs/phase-11/manual-test-report.md`                 | 旧参照名の互換ノートを実績ベースへ更新                           |
| `phase-12-documentation.md`                              | canonical sync / mirror parity / 未タスク formalize の前提を明記 |
| `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 を validator 準拠に再構成                        |
| `outputs/phase-12/system-spec-update-summary.md`         | canonical 更新実績と workflow-local 同期を整理                   |
| `outputs/phase-12/documentation-changelog.md`            | 本ファイル                                                       |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク 2 件を UT ID + formalize 先付きで記録                   |
| `outputs/phase-12/skill-feedback-report.md`              | 2 スキル + 三層同期の改善点を記録                                |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了確認と未解決事項を整理                                       |

### 未タスク formalize

| ファイル                                                                        | 役割                                |
| ------------------------------------------------------------------------------- | ----------------------------------- |
| `docs/30-workflows/unassigned-task/task-ut-chatview-error-banner-i18n-001.md`   | ChatView エラーメッセージ i18n 対応 |
| `docs/30-workflows/unassigned-task/task-ut-ai-chat-error-code-inventory-001.md` | ai.chat エラーコード一覧整備        |

### canonical system spec / logs

| ファイル                                                                                                       | 変更内容                                                                                   |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix.md`                    | Task 01 root canonical path と再監査結果を同期                                             |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md` | current canonical set、artifact inventory、legacy compatibility、validation chain を新設   |
| `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                           | `AIChatResponse.error` の code/message drift を明文化                                      |
| `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                                     | raw message fallback と Renderer 正規化責務を追記                                          |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                                      | Task 01 の関連導線参照を是正                                                               |
| `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                                           | ChatView と Workspace stream error の責務境界を追記                                        |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                              | `chatError` / selector の責務表を追加                                                      |
| `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`                          | old path / old filename から current semantic filename への互換行を追加                    |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                               | AI Chat family の quick lookup を拡張                                                      |
| `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                            | 4タスク導線と Task 01 canonical root を追加                                                |
| `.claude/skills/aiworkflow-requirements/references/task-workflow*.md`                                          | workflow 導線 / completed / backlog を同期                                                 |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                 | 今回の再監査教訓を追記                                                                     |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`                     | code/message drift の教訓を追記                                                            |
| `.claude/skills/*/LOGS.md`                                                                                     | re-audit 実績を記録                                                                        |
| `.claude/skills/skill-creator/references/update-process.md`                                                    | Phase 12 retrospective の same-wave sync 手順を強化                                        |
| `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`                            | artifact inventory / legacy register / validate-structure / mirror sync を template へ追加 |

### index / artifacts / verification

| ファイル                         | 変更内容                                 |
| -------------------------------- | ---------------------------------------- |
| `index.md`                       | Phase 12完了 / Phase 13保留 の状態へ更新 |
| `artifacts.json`                 | phase 状態と成果物一覧の同期             |
| `outputs/verification-report.md` | validator 実行結果を参照                 |

## Validator 結果

| 項目                                    | 結果 | 備考                                                                |
| --------------------------------------- | ---- | ------------------------------------------------------------------- |
| `validate-phase12-implementation-guide` | PASS | Part 1 / Part 2 の構造を検証済み                                    |
| `validate-phase11-screenshot-coverage`  | PASS | 5 件の screenshot 実体を確認済み                                    |
| `validate-phase-output`                 | PASS | index / phase file は同期済み                                       |
| `verify-all-specs --workflow`           | PASS | 13/13 Phase, 0 error, 0 warning                                     |
| `audit-unassigned-tasks --target-file`  | PASS | 2 件とも currentViolations=0                                        |
| `generate-index.js`                     | PASS | index / topic-map / keywords を再生成                               |
| `validate-structure.js`                 | WARN | 既存 3 ファイルが 500 行超過。今回 wave の追加ファイルは 500 行未満 |
| `diff -qr`                              | PASS | `.claude` / `.agents` mirror parity を確認                          |
| `vitest` targeted suite                 | PASS | `chatSlice.test.ts` 57件 + `ChatView.test.tsx` 38件 = 95件 PASS     |

## 差分要約

ChatView の silent failure 修正を、スクリーンショット証跡と Phase 12 の文書群へ落とし込んだ。今回の中心は「バナーを見える化する」だけではなく、「証跡名を固定し、未タスクを formalize し、canonical spec と backlog まで同じ波で同期する」ことだった。

## 該当なし

- 画像実体の PNG はワークツリー内に配置済みで、参照名と実体の一致を確認した。
