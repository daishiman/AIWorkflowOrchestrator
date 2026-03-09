# TASK-10A-F スキルフィードバックレポート

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-10A-F                 |
| Phase    | 12（スキルフィードバック） |
| 作成日   | 2026-03-09                 |

## 改善提案

### 改善 1: task-specification-creator に Phase 11 placeholder 検知を追加する

| 項目       | 内容                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 対象スキル | task-specification-creator                                                                                                             |
| 問題       | `verify-all-specs` と `validate-phase-output` が PASS でも、`manual-test-result.md` が P53 placeholder のまま残るケースを止められない  |
| 発生状況   | current workflow の Phase 11 が `スクリーンショット不可` と記載したまま completed 扱いになっていた                                     |
| 改善案     | Phase 11 validator に `P53` / `代替` / `スクリーンショット不可` の検知ルールを追加し、実 screenshot が必要な workflow では fail させる |
| 優先度     | 高                                                                                                                                     |

### 改善 2: task-specification-creator に implementation-guide validator の必須節をテンプレート化する

| 項目       | 内容                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 対象スキル | task-specification-creator                                                                                                                             |
| 問題       | 実装ガイドが見た目上は十分でも、`APIシグネチャ` / `使用例` / `エラーハンドリング` / `エッジケース` / `設定項目` の literal が無いと validator で落ちる |
| 発生状況   | current workflow の `implementation-guide.md` が 5/10 で fail した                                                                                     |
| 改善案     | Phase 12 テンプレートに validator 対応見出しを初期配置し、空欄でも埋める前提にする                                                                     |
| 優先度     | 中                                                                                                                                                     |

### 改善 3: aiworkflow-requirements と workflow outputs の同期判定を分離表示する

| 項目     | 内容                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 対象     | aiworkflow-requirements / workflow outputs                                                                                         |
| 問題     | 正本が更新済みでも current workflow outputs が stale の場合、`更新なし` とだけ書くと何が正しく何が古いか分からない                 |
| 発生状況 | `spec-update-summary.md` と `documentation-changelog.md` が branch 上の system spec 差分を反映せず、「更新不要」と読める状態だった |
| 改善案   | `更新済みを確認` と `今回更新` を明確に分ける書式へ統一する                                                                        |
| 優先度   | 中                                                                                                                                 |

## 今回反映した改善

| 対象                                                                 | 反映内容                                                                                              |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `task-specification-creator/assets/implementation-guide-template.md` | validator 最小骨格を追加し、`Part 1/2` と必須見出しをテンプレートへ固定                               |
| `task-specification-creator/references/phase-11-12-guide.md`         | screenshot 必須時の placeholder 禁止と legacy baseline 二軸報告を追記                                 |
| `skill-creator/references/patterns.md`                               | current workflow placeholder 排除 + legacy baseline 二軸報告パターンを追加                            |
| `aiworkflow-requirements` 正本                                       | `arch-state-management.md` / `task-workflow.md` / `lessons-learned.md` に今回実装内容と苦戦箇所を追記 |

## 再発防止の教訓

| 教訓                                                                       | カテゴリ |
| -------------------------------------------------------------------------- | -------- |
| `verify-all-specs` PASS だけでは Phase 11/12 完了と言えない                | 検証順序 |
| screenshot 証跡は `テストケース` と `証跡` の validator 互換表で固定すべき | 証跡同期 |
| 正本更新済みと outputs stale は別問題として扱うべき                        | 仕様同期 |
