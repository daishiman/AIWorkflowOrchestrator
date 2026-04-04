# Phase 12: ドキュメント更新 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| Phase     | 12                                                    |
| 機能名    | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日    | 2026-04-03                                            |
| 前提Phase | Phase 11                                              |
| 後続Phase | Phase 13                                              |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25/P29: LOGS.md/SKILL.md 更新漏れ

2. `outputs/artifacts.json` と各 `phase-*.md` に記載された artifact 名を1対1で突合する

## 実行タスク

| Task      | 内容                                                   | 主成果物                                                 |
| --------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | 準拠チェック（root evidence）                          | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 12-6: 準拠チェック（Task 12-1〜12-5 の完了証跡と検証結果の集約）

## SubAgent分担

| SubAgent | 担当             | 並列性 | 主な成果物                                                |
| -------- | ---------------- | ------ | --------------------------------------------------------- |
| A        | Task 12-1        | 可     | `implementation-guide.md`                                 |
| B        | Task 12-2        | 可     | `system-spec-update-summary.md`                           |
| C        | Task 12-3 / 12-5 | 可     | `documentation-changelog.md` / `skill-feedback-report.md` |
| D        | Task 12-4        | 可     | `unassigned-task-detection.md`                            |
| E        | Task 12-6        | 直列   | `phase12-task-spec-compliance-check.md` / validator 結果  |

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                      |
| ------ | ---------------- | ----------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）        |
| Part 2 | 開発者・技術者   | 技術的な詳細（型定義・state管理・使用例） |

**Part 1 必須要件**:

- 日常生活での例え話を**必ず**含める（`たとえば` を最低1回含む）
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- 専門用語は使わない（使う場合は即座に説明）

**Part 2 必須要件**:

- `SeverityFilterValue` 型定義
- `shouldShowCheck` フィルタ関数のシグネチャと使用例
- `filteredChecksByLayer` useMemo の動作説明
- セグメントコントロールの ARIA 属性仕様
- 作成後に `phase12-checklist-definition.md` と `validate-phase12-implementation-guide.js` で内容要件を確認する

### Task 2: システムドキュメント更新【必須】

#### Step 1: タスク完了記録【必須】

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.md にタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.md にタスク完了記録を追加（2ファイル両方必須 — P1, P25）
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新
- [ ] task-specification-creator/SKILL.md 変更履歴更新

##### Step 1-B: 実装状況テーブル更新

- [ ] 関連仕様書の実装ステータスを「完了」に更新

##### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001" references/` で関連仕様書を検索して更新
- [ ] `task-workflow.md` の未タスク一覧を更新する
- [ ] `task-workflow-backlog.md` の残課題一覧と表記を同期する
- [ ] 未タスク配置先判定を記録

##### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行

##### Step 1-E〜1-G の対応関係

- Step 1-E: Task 12-4 で検出した未タスクを `task-workflow.md` に formalize する
- Step 1-F: Task 12-5 で skill feedback を記録する
- Step 1-G: Task 12-6 で validator / artifact parity / 計画系 wording を集約する

#### Step 2: システム仕様更新【必須・UI contract 更新あり】

本タスクは shared interface/API/IPC の変更はないが、Renderer の visible surface を変えるため `ui-ux-feature-components-core.md` の更新が必要。`interfaces-agent-sdk-skill.md` / IPC / preload / shared type は no-op だが、その根拠を `system-spec-update-summary.md` に残す。

更新対象:

- `ui-ux-feature-components-core.md` - `SkillLifecyclePanel` の severity filter contract / 表示ラベル / ARIA 属性

更新不要:

- `interfaces-agent-sdk-skill.md`
- IPC / preload
- shared type

### Task 3: ドキュメント更新履歴作成【必須】

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/task-skill-creator-layer34-ui-display-severity-filter
```

### Task 4: 未タスク検出【必須・0件でも出力】

| #   | ソース                 | 確認項目                    |
| --- | ---------------------- | --------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項         |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項         |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項        |
| 4   | コードベース           | TODO/FIXME/HACK/XXXコメント |

- `task-workflow.md` の未タスク一覧へ formalize し、`task-workflow-backlog.md` と関連仕様書リンクを同期する

### Task 5: スキルフィードバックレポート作成【必須・改善点なしでも出力】

| セクション         | 記載内容                                      |
| ------------------ | --------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案 |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点          |
| スキル改善提案     | task-specification-creator への改善提案       |
| 新規Pitfall候補    | 06-known-pitfalls.md に追加すべき新規Pitfall  |

### Task 6: phase12-task-spec-compliance-check 作成【必須】

- Task 12-1〜12-5 の完了証跡と Step 1/2 parity を 1 ファイルへ集約する
- `validate-phase-output` / `verify-all-specs` / `validate-phase12-implementation-guide` / `verify-unassigned-links` / `diff -qr` を root evidence として記録する
- Task 12-6 は Task 12-1〜12-5 完了後に実施し、Phase 12 の最終確認とする

## 参照資料

| 資料名                       | パス                                                                                   | 説明               |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| Phase 11補助成果物           | `outputs/phase-11/manual-test-checklist.md`                                            | 手動テスト前提条件 |
| Phase 11成果物               | `outputs/phase-11/manual-test-result.md`                                               | 手動テスト結果     |
| Phase 12チェック定義         | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Phase 12 合否基準  |
| spec-update-workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | 仕様更新手順       |
| phase-12-documentation-guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Phase 12ガイド     |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                 | 内容                              |
| ----------------------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md` | Severity filter contract 更新対象 |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 未タスク / 完了タスク台帳         |

## アーキテクチャ層別ドキュメント

| 層               | ドキュメント内容                                      | 更新対象                           |
| ---------------- | ----------------------------------------------------- | ---------------------------------- |
| Renderer Process | severity filter state管理、セグメントコントロール設計 | `ui-ux-feature-components-core.md` |

## 成果物

| 成果物                       | パス                                                     | 必須 | 説明                                     |
| ---------------------------- | -------------------------------------------------------- | ---- | ---------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | ✅   | 概念的+技術的ドキュメント                |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | Step 1-A〜1-G + UI contract 判定         |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | ✅   | 更新履歴                                 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | 検出結果（0件でも出力）                  |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 改善点（0件でも出力必須）                |
| 準拠チェック                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | Task 12-1〜12-5 の集約 + Step 1/2 parity |

## 漏れやすいポイント

| ID  | ポイント                      | 対策                                                                |
| --- | ----------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ     | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ       | セクション変更時は必ず generate-index.js を実行                     |
| P29 | SKILL.md 変更履歴の更新漏れ   | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |
| P3  | 未タスク管理の3ステップ不完全 | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク                 |

## 完了条件

- [ ] 実行タスクを「表」と「- Task 12-X: 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 【Task 2 Step 1-A】仕様書完了記録を全項目実施した
- [ ] 【Task 2 Step 1-B】実装状況テーブルを更新した
- [ ] 【Task 2 Step 1-C】関連タスクテーブルを更新した
- [ ] 【Task 2 Step 1-D】topic-map.md を再生成した
- [ ] 【Task 2 Step 1-E〜1-G】未タスク検出 / skill feedback / 準拠チェック をそれぞれ作成した
- [ ] 【Task 2 Step 2】ui-ux-feature-components-core.md の更新と interfaces no-op 判定を documentation-changelog.md に記録した
- [ ] 未タスク検出レポートが出力されている
- [ ] スキルフィードバックレポートが出力されている
- [ ] 準拠チェックレポートが出力されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が同期している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
