# Phase 12 成果物: スキルフィードバック

## 良かった点

- `aiworkflow-requirements` の UI/UX 正本が Settings / Search / lessons / task-workflow に分かれており、必要な仕様だけを段階的に読めた
- `task-specification-creator` の Phase 11/12 guide に screenshot coverage validator と implementation-guide 要件が定義されていたため、成果物の抜け漏れを抑えられた

## 改善提案

| 対象スキル                   | 提案                                                                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task-specification-creator` | worktree path に `#` を含む場合は、preview より先に static build + server fallback を候補として明示したい                                                                                    |
| `task-specification-creator` | Phase 2 テンプレートへ「light theme migration の UI 状態マトリクス」を前倒しで持たせると、Phase 11 screenshot plan が早く固まる                                                              |
| `task-specification-creator` | user が `.claude` のような canonical root を明示した場合、`screenshot-plan.json` / `spec-update-summary.md` / `skill-feedback-report.md` まで mirror root 参照が残っていないか機械確認したい |
| `task-specification-creator` | `quick_validate` が拾う 500行上限を change history 追記時に先回り検知したい。今回 `SKILL.md` は 505行まで増え、再監査中に 497行へ圧縮して回復した                                            |
| `task-specification-creator` | `phase12-task-spec-compliance-check.md` のテンプレートに「今回差分の品質」「ディレクトリ全体legacy」「format/naming/misplaced」を標準欄として持たせたい                                      |
| `aiworkflow-requirements`    | light theme contrast migration のような横断 UI 修正では、feature spec へ「変更した component」と「参照だけで済んだ surface」を分けて残せるテンプレートがあるとよい                           |
| `aiworkflow-requirements`    | source scan ベースの contract test を UI quality 要件へ接続するガイドがあると、hardcoded color 再混入を早く検知できる                                                                        |
| `aiworkflow-requirements`    | shared component と surface-specific domain spec（Settings / Forms / Search Panel）を同時に更新すべき UI タスクを判別する導線を強化したい                                                    |
| `skill-creator`              | index 起点で仕様を読む大型 skill では、`SKILL.md` に全 reference を直リンクしない運用を warning 扱いで許容できるよう、`quick_validate` の warning 分類を調整したい                           |
| `skill-creator`              | ユーザーの「指定ディレクトリに置けているか」という質問に対し、current diff / quality / directory legacy の三分割回答を即座に返せる pattern を標準にしたい                                    |

## 今回反映する内容

- `.claude/skills/task-specification-creator/SKILL.md` と `LOGS.md` に worktree fallback / screenshot validation / canonical root drift guard の知見を追加する
- `.claude/skills/task-specification-creator/SKILL.md` は quick_validate の 500行制約に収まるよう履歴余白を圧縮し、mirror root にも同期する
- `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` に `current diff / quality / directory legacy` と `format / naming / misplaced` の欄を追加する
- `.claude/skills/aiworkflow-requirements/SKILL.md` と `LOGS.md` に light theme shared color migration の再利用知見と surface-specific domain sync ルールを追加する
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` / `ui-ux-forms.md` / `ui-ux-search-panel.md` に今回の機能内容と苦戦箇所を反映する
- `.claude/skills/skill-creator/SKILL.md` / `LOGS.md` / `references/patterns.md` に、指定ディレクトリ確認を三分割報告する Phase 12 パターンを追加する
- `.agents/skills/**` は mirror root として同内容を同期する
