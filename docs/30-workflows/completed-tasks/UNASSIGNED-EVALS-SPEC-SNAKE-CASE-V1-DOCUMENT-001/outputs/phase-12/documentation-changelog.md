# documentation-changelog.md — ドキュメント変更履歴

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21

---

## local 更新

| ファイル                                                                                      | 変更種別   | 内容                                                          |
| --------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                      | 修正・追記 | §3 `levels` 行誤記修正・§3.3 新設・§3.4 新設・§8 変更履歴追記 |
| `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md`                      | 同期       | 上記と同一内容（mirror 自動同期）                             |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                 | 再生成     | `evals-schema-spec.md` の見出し行番号を current facts へ同期  |
| `.agents/skills/aiworkflow-requirements/indexes/topic-map.md`                                 | 同期       | 上記と同一内容（mirror 同期）                                 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                              | 追記       | current facts sync を記録                                     |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                             | 追記       | 変更履歴へ same-wave sync を記録                              |
| `.claude/skills/aiworkflow-requirements/SKILL-changelog.md`                                   | 追記       | バージョン履歴へ same-wave sync を記録                        |
| `docs/30-workflows/UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001/index.md`                 | 修正       | 4条件評価、Phase 4 成果物名、status を completed 化           |
| `docs/30-workflows/UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001/phase-4-test-creation.md` | 修正       | completed-tasks 配下への canonical path に補正                |
| `docs/30-workflows/UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001/outputs/phase-12/*.md`    | 修正       | NON_VISUAL 固定文言、same-wave sync、自己評価の stale を是正  |

## global sync 判定

- `LOGS.md`: 更新あり（aiworkflow-requirements current facts sync を追記）
- `topic-map.md`: 更新あり（`generate-index.js` 実行で行番号表を同期）
- `keywords.json`: 再生成判定のみ、内容差分なし
- `resource-map.md`: 更新不要（参照パスに変更なし）

## Phase 10 MINOR 追跡

MINOR 判定なし。追跡テーブル不要。
