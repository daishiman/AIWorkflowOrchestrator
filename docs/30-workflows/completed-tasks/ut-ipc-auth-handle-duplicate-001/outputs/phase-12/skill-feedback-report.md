# スキル改善フィードバック

## 対象

- `aiworkflow-requirements`
- `task-specification-creator`

## 改善提案

| 観点                 | 提案                                                                             | 効果                                                            |
| -------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Phase 12未タスク検出 | `detect-unassigned-tasks.js` に「変更ファイルのみ」フィルタオプションを追加      | 既存TODOノイズを減らせる                                        |
| artifacts同期        | `complete-phase.js` に `--sync-output-artifacts` オプション追加                  | `artifacts.json` と `outputs/artifacts.json` の二重管理漏れ防止 |
| 監査コマンド         | `verify-unassigned-links.js` と `audit-unassigned-tasks.js` の差分判定モード追加 | ベースライン違反と今回差分を分離しやすい                        |
| Skill品質保証        | `skill-creator` の `quick_validate.py` を Phase 12 完了条件に追加                | SKILL frontmatter破損を早期検出                                 |

## 今回の学び

- IPC重複解消タスクでは、通常経路とfallback経路を同時に扱う運用をテンプレート化した方が再発しにくい。
- スキル更新後は `skill-creator` の検証を通すことで、再監査での形式不整合を抑制できる。
