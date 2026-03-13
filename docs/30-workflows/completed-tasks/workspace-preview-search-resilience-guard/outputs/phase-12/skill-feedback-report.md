# Phase 12 Output: Skill Feedback Report

## 総評

- `aiworkflow-requirements`: 必要 spec の絞り込みと 04C follow-up の同期先追加に有効で、SKILL.md の 500行制限も同ターンで正常化できた
- `task-specification-creator`: validator 群は有効で、再監査で出た completed spec 監査の穴も今回埋められた
- `skill-creator`: Phase 12 テンプレートの drift を current artifact 名と completed path へ再同期するのに有効だった

## 今回反映した改善

| ID    | 対象                                                     | 提案                                                                                                                                | 理由                                                                                                |
| ----- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| FB-01 | `task-specification-creator`                             | `audit-unassigned-tasks.js` が `completed/unassigned-task` の親を completed tasks root として推論できるようにした                   | standalone completed spec を `--target-file` 単独で current 監査できるようにするため                |
| FB-02 | `task-specification-creator`                             | Phase 12 手順に「move 直後の untracked completed file は `--diff-from HEAD` で拾えない」注意書きを追加した                          | current/baseline の誤読を防ぐため                                                                   |
| FB-03 | `task-specification-creator` / `skill-creator`           | `screenshot-plan.md`、`screenshots/phase11-capture-metadata.json`、`sourceKind=external-dev-server` を template / guide に反映した  | 実 artifact 名と運用手順の drift を止めるため                                                       |
| FB-04 | `aiworkflow-requirements`                                | `ui-ux-components.md` と `arch-state-management.md` に 04C follow-up を追加した                                                     | 一覧 spec と state spec のどちらからでも再利用できるようにするため                                  |
| FB-05 | `aiworkflow-requirements` / `skill-creator`              | `workflow-workspace-preview-search-resilience-guard.md` のような統合 workflow 正本を cross-cutting follow-up の標準形として追加した | 実装内容 / 苦戦箇所 / 5分カード / root evidence の入口を 1 ファイルへ集約するため                   |
| FB-06 | `skill-creator`                                          | `phase12-integrated-workflow-spec-template.md` を新設し、`workflow-<feature>.md` の標準構成を asset 化した                          | 次回は retrospective を分解読みに戻らず、統合正本を template 主導で再現できるようにするため         |
| FB-07 | `task-specification-creator` / `aiworkflow-requirements` | exact count cross-document validator を `UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001` として formalize した             | `summary / checklist / detection / report` の stale count を follow-up backlog として明示化するため |
| FB-08 | `aiworkflow-requirements`                                | `SKILL.md` の workflow direct-link 節を再整形し、quick_validate の 500行超過 error を解消した                                       | system spec skill 自体が validator で赤のまま残る状態を防ぐため                                     |

## 継続提案

- なし。継続課題は `UT-IMP-PHASE12-EXACT-COUNT-CROSS-DOCUMENT-VALIDATOR-001` として formalize 済み。

## 継続して良かった点

- `resource-map -> quick-reference -> topic spec` の段階参照で無駄な読み込みを避けられた
- `validate-phase-output.js` と `verify-all-specs.js` の二段チェックで workflow 側の incomplete を早期に止められた
- canonical `.claude` と mirror `.agents` を同一ターンで同期する運用は 3 skill root でも有効だった
