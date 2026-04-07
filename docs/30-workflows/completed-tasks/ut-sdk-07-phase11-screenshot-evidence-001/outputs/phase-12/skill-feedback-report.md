# Skill Feedback Report - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## 実施日

2026-04-06

## フィードバック観点

### テンプレート改善: docs-only / screenshot evidence 型タスクの適合性

| 観点                               | 評価                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Phase 4〜8 の N/A 処理             | 仕様書テンプレートが N/A を適切にサポートしている                                       |
| Phase 11 VISUAL タスクの成果物定義 | checklist / result / report / coverage / review / metadata の 6種が明確に定義されている |
| artifact 命名 canonical 一覧       | Phase 1 で先に定義することでドリフトを防止できた                                        |

### ワークフロー改善: Phase 4〜8 N/A 処理の効率化

- docs-only タスクでは Phase 4〜8 を一括 N/A と記録するため、検証スクリプトが Phase 4〜8 の outputs を要求しない設計であることを確認できた
- 改善提案: docs-only タスクテンプレートで Phase 4〜8 を最初から N/A として事前設定できると実施者の混乱を減らせる

### ドキュメント改善: manual-test-result.md / phase11-capture-metadata.json の再利用性

- `manual-test-result.md` に evidence bundle 全体（テストケース / 画面カバレッジ / 視覚レビュー / 発見事項 / capture metadata）を統合する形式は再利用性が高い
- `phase11-capture-metadata.json` の JSON 形式（capture_id / tc_id / file_name / state / pass / notes）は他のタスクでも流用可能

### スキル改善提案

| スキル                     | 改善提案                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| task-specification-creator | docs-only タスク用テンプレートで Phase 4〜8 を自動 N/A 設定するオプションを追加            |
| aiworkflow-requirements    | screenshot evidence タスクの追跡パターン（spec_created）を台帳テンプレートに明記する       |
| task-specification-creator | `SKILL.md` を 500 行以内に収めるため、古い changelog / archive を references 側へ退避する  |
| aiworkflow-requirements    | `SKILL.md` の frontmatter description を 1024 文字以内へ圧縮し、長い列挙は body へ分離する |

## 改善実施状況

上記の改善提案は、将来のタスクテンプレート更新時に反映することを推奨する。本タスクの完了をもって即時適用はしない。
