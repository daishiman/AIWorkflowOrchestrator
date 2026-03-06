# aiworkflow-requirements 抽出マトリクス

## メタ情報

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| タスクID | UT-TASK-10A-B-008                                                             |
| タスク名 | 未タスク件数再計算同期ガード                                                  |
| 作成日   | 2026-03-06                                                                    |
| 用途     | 今回の実装で本当に必要な aiworkflow 仕様だけを採用 / 非採用理由付きで固定する |

## 抽出方針

1. `indexes/resource-map.md` を起点に、今回のタスクが「新規機能実装」ではなく「台帳同期・運用ガード・ドキュメント更新」であることを先に固定する。
2. `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md` の3台帳と、それを支える運用・設計・品質資料を優先採用する。
3. API / interface / security / testing の詳細仕様は、今回のタスクが契約変更やコード実装を伴わないため非採用とする。ただし非採用理由は明記する。

## 情報源3層と採用境界

| 区分            | 資料                                                                                        | 採用理由                                                       | 主な反映先         |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------ |
| canonical       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 最新 active set と完了 / 未完了の実効状態を保持する            | Phase 1, 2, 10, 12 |
| derived         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillAnalysisView 関連未タスク表の派生台帳を保持する           | Phase 1, 2, 10, 12 |
| canonical rule  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | `current` / `baseline` 分離、配置3分類、再発パターンを保持する | Phase 1, 2, 10, 12 |
| design support  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 3台帳同期の責務境界を定義する                                  | Phase 2, 12        |
| design support  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 直列 / 並列の同期パターンを定義する                            | Phase 2, 12        |
| process support | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                 | Phase責務とドキュメント粒度を定義する                          | Phase 1, 2, 10, 12 |
| process support | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 未タスク配置と完了移管のルールを定義する                       | Phase 1, 2, 10, 12 |
| process support | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`                      | 仕様書記述の粒度と命名を固定する                               | Phase 12           |
| process support | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 変更順序と証跡粒度を固定する                                   | Phase 2, 10, 12    |
| process support | `.claude/skills/aiworkflow-requirements/references/patterns.md`                             | Phase 12 成功 / 失敗パターンを固定する                         | Phase 1, 2, 10, 12 |
| product context | `.claude/skills/aiworkflow-requirements/references/overview.md`                             | 今回のガードを仕様全体の目的へ位置づける                       | Phase 1, 2, 12     |
| product context | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI仕様台帳の派生側文脈を確認する                               | Phase 2, 12        |
| quality         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 完了条件とレビュー判定軸を固定する                             | Phase 1, 2, 10, 12 |
| index           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止の起点とする                                       | Phase 1, 12        |

## 採用仕様一覧

| 観点     | 採用仕様                                  | 役割                                    |
| -------- | ----------------------------------------- | --------------------------------------- |
| 概要     | `overview.md`                             | 目的と成功条件の文脈付け                |
| 設計     | `architecture-overview.md`                | 台帳責務境界の定義                      |
| 設計     | `architecture-implementation-patterns.md` | 同期順・再利用ガードの定義              |
| 運用     | `task-workflow.md`                        | active set と完了 / 未完了の正本        |
| 運用     | `task-workflow-phases.md`                 | Phase責務の定義                         |
| 運用     | `task-workflow-rules.md`                  | 配置ルールの定義                        |
| UI台帳   | `ui-ux-feature-components.md`             | derived ledger の同期対象               |
| UI台帳   | `ui-ux-components.md`                     | 派生UI文脈の確認                        |
| 教訓     | `lessons-learned.md`                      | current / baseline、配置3分類、再発防止 |
| 品質     | `quality-requirements.md`                 | 完了条件とレビュー基準                  |
| 記述規約 | `spec-guidelines.md`                      | 仕様書の粒度・命名                      |
| 開発規約 | `development-guidelines.md`               | 変更順と証跡粒度                        |
| パターン | `patterns.md`                             | Phase 12 成功 / 失敗パターン            |
| 索引     | `resource-map.md`                         | 抽出漏れ防止                            |

## 非採用仕様一覧

| カテゴリ         | 非採用対象                  | 判定   | 理由                                                           |
| ---------------- | --------------------------- | ------ | -------------------------------------------------------------- |
| API契約          | `api-*.md`                  | 非採用 | 今回は IPC / HTTP 契約変更がない                               |
| インターフェース | `interfaces-*.md`           | 非採用 | 新規型・既存型境界変更がない                                   |
| セキュリティ     | `security-*.md`             | 非採用 | 認可・入力検証・Preload 公開境界の変更がない                   |
| テスト詳細       | `testing-*.md`              | 非採用 | テスト実装や証跡仕様自体を追加しない                           |
| DB / RAG         | `database-*.md`, `rag-*.md` | 非採用 | 今回の対象がドキュメント同期ガードでありデータ構造変更ではない |

## 抽出実施ログ

| キーワード                        | 主なヒット                               | 採用判断                            |
| --------------------------------- | ---------------------------------------- | ----------------------------------- |
| `UT-TASK-10A-B-008`               | `task-workflow.md`, `lessons-learned.md` | active set と教訓の正本として採用   |
| `SkillAnalysisView`               | `ui-ux-feature-components.md`            | derived ledger の同期対象として採用 |
| `current` / `baseline`            | `lessons-learned.md`                     | 監査判定軸として採用                |
| `completed-tasks/unassigned-task` | `lessons-learned.md`                     | 配置3分類ルールとして採用           |
| `Phase 12`                        | `task-workflow-phases.md`, `patterns.md` | 文書化責務と失敗パターンとして採用  |

## 再現コマンド

```bash
rg -n 'UT-TASK-10A-B-00[1-9]|task-10a-b-' .claude/skills/aiworkflow-requirements/references/task-workflow.md
rg -n 'UT-TASK-10A-B-00[1-9]|task-10a-b-' .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md
rg -n 'UT-TASK-10A-B-00[1-9]|task-10a-b-|current|baseline|completed-tasks/unassigned-task|legacy' .claude/skills/aiworkflow-requirements/references/lessons-learned.md
sed -n '1,240p' .claude/skills/aiworkflow-requirements/references/task-workflow-phases.md
sed -n '1,260p' .claude/skills/aiworkflow-requirements/references/patterns.md
```

## 結論

- 今回必要な aiworkflow 仕様は、実装系ではなく「運用正本」「派生台帳」「教訓」「Phase運用」「記述規約」に集中している。
- 以前の不足は、`task-workflow.md` と `lessons-learned.md` を読んでも `ui-ux-feature-components.md` の stale 性質を明示していなかった点にある。
- 本 workflow では、canonical / derived / historical の3層分類を採用することで、Issue #996 の historical な固定レンジ要件で現行 active set を誤上書きしない設計へ改善した。
