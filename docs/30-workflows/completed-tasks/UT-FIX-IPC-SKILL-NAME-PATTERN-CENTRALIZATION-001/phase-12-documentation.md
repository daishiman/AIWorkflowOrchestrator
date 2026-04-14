# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 12                                                 |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 11                                           |
| 後続Phase  | Phase 13                                           |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

Phase 12 必須 6 タスクを完了可能な形で固定する。
実装ガイド・仕様更新・変更履歴・未タスク検出・スキルフィードバック・準拠確認を全件作成する。

## 背景

`SKILL_NAME_PATTERN` の shared 一元化により、定数管理の責務境界が明確になった。
この変更を将来の開発者が正しく理解・活用できるよう、実装ガイドおよびシステム仕様を更新する。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                             |
| ---------- | ------------------ | -------------------------------------------------- |
| SubAgent-A | Main/shared 責務   | 実装ガイド（Part 1・Part 2）作成                   |
| SubAgent-B | 仕様・履歴管理     | システム仕様更新・変更履歴作成                     |
| SubAgent-C | 未タスク・改善管理 | 未タスク検出レポート・スキルフィードバックレポート |
| SubAgent-D | 統合監査           | 矛盾・漏れ・整合・依存判定                         |

## 実行タスク

- Task 12-1: 実装ガイド作成（Part 1: 中学生向け概念説明 + Part 2: 技術者向け詳細）
- Task 12-2: システム仕様更新（Step 1-A/1-B/1-C 必須、Step 2 は export 追加のため実施）
- Task 12-3: 更新履歴作成（`generate-documentation-changelog.js` 使用）
- Task 12-4: 未タスク検出レポート（0 件でも出力必須）
- Task 12-5: スキルフィードバックレポート（改善点なしでも出力必須）

## 参照資料

| 参照資料               | パス                                              | 説明            |
| ---------------------- | ------------------------------------------------- | --------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| 仕様抽出結果           | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| アーキテクチャ設計     | `outputs/phase-2/design-document.md`              | Phase 2 成果物  |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物  |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物  |
| リファクタリング計画   | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物  |
| 品質レポート           | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 出荷準備チェック       | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`          | Phase 11 成果物 |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`              | Phase 11 成果物 |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`             | Phase 11 成果物 |

## 実行手順

1. Task 12-1: `implementation-guide.md` を Part 1/Part 2 の 2 部構成で作成する。
2. Task 12-2 Step 1-A: 完了タスク記録・関連リンク・LOGS.md（2 ファイル）・topic-map.md を更新する。
3. Task 12-2 Step 1-B: 実装状況テーブルを `completed` または `spec_created` へ更新する。
4. Task 12-2 Step 1-C: 関連タスクテーブルのステータスを更新する。
5. Task 12-2 Step 1-D: topic-map.md を再生成し、行番号を反映する。
6. Task 12-2 Step 2: 新規 export（`SKILL_NAME_PATTERN`）があるため仕様更新を実施する。
7. Task 12-3/12-4/12-5/12-6: changelog・未タスク検出・skill-feedback・準拠確認を出力する。

## Task 12-1: 実装ガイド詳細要件

### Part 1: 中学生向け概念説明

- **日常例え話**: 「学校のルール集」の例を使用する。
  - たとえば、複数のクラス（SkillScanner・init_skill）で同じルール（スキル名のルール）を使う場合、1 つの場所（packages/shared）に定義しておけば、ルールを変えたいときに 1 か所だけ直せばよい。
  - 各クラスがそれぞれ独自のルールを持つと、片方だけ変えてしまったときに「クラスによってルールが違う」という混乱が生じる。
- 専門用語（正規表現・定数・import）は登場するたびに即座にわかりやすく説明する。
- 図（テキストアート）を使って「1 か所に定義 → 複数箇所が参照」の構造を示す。

### Part 2: 技術者向け詳細

- TypeScript インターフェース定義（`SKILL_NAME_PATTERN: RegExp`）
- 使用例（`SkillScanner.ts` での import 例・`init_skill.js` での import 例）
- エラーハンドリング（バリデーション失敗時の挙動）
- 設定値一覧（`SKILL_NAME_PATTERN` の正規表現値・許容パターン・禁止パターン）
- ESM/CJS 両対応の注意点

## Task 12-2: システム仕様更新の判定基準

| 判定項目 | 実行条件                                     | 完了条件                                        |
| -------- | -------------------------------------------- | ----------------------------------------------- |
| Step 1-A | 全タスクで必須                               | 完了記録 + LOGS.md(2) + topic-map 更新          |
| Step 1-B | 全タスクで必須                               | 実装状況を completed または spec_created へ更新 |
| Step 1-C | 関連タスク記載がある場合は必須               | 関連タスク表ステータス更新                      |
| Step 1-D | 仕様書変更がある場合は必須                   | topic-map.md を再生成して行番号を反映           |
| Step 2   | 新規 export 追加がある場合（本タスクは実施） | 対象仕様を更新し変更履歴へ記録                  |

## Task 12-4: 未タスク検出候補

0 件でも出力必須。検出される可能性のある候補タスク:

| 候補タスク ID                           | 概要                                   | 優先度 |
| --------------------------------------- | -------------------------------------- | ------ |
| UT-FIX-SKILL-NAME-LENGTH-VALIDATION-001 | スキル名の最大文字数バリデーション追加 | 低     |
| UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001 | 日本語入力時のスキル名 UX 改善         | 低     |

## Task 12-5: スキルフィードバックレポート作成【必須】

- 改善点があれば next action を書く。
- 改善点がなくても「改善点なし」と理由を書く。

## Task 12-6: phase12-task-spec-compliance-check【必須】

- Task 12-1〜12-5 の全完了を確認してから作成する。
- Phase 12 の成果物に仕様外の表現が残っていないことを確認する。
- `system-spec-update-summary.md` と `documentation-changelog.md` の一致を確認する。

## 多角的チェック観点

| 観点     | 確認内容                                                      |
| -------- | ------------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                            |
| 漏れ     | 要件から成果物への未反映項目がないか確認する                  |
| 整合性   | Part 1 の例え話と Part 2 の技術説明が矛盾していないか確認する |
| 依存関係 | 依存 Phase との入力出力が整合しているか確認する               |

## 成果物

| 成果物               | パス                                                     | 説明                             |
| -------------------- | -------------------------------------------------------- | -------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2 構成               |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/1-D/Step 2 記録 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴             |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0 件でも作成）         |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0 件でも作成）           |
| 準拠確認             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の全完了確認     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-6 の全完了を確認した
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 統合テスト連携

- Phase 11 の手動テスト証跡を受け取り、Phase 13 の PR 情報整理へつなぐ。
- `system-spec-update-summary.md` と `documentation-changelog.md` の内容を相互照合してから閉じる。

## Phase 12 実装ガイド要件

- Part 1: 中学生向け説明、日常例（たとえば学校のルール集）、専門用語の即時説明。
- Part 2: TypeScript 型、API シグネチャ、エッジケース、設定値一覧。
- 未タスク検出レポートは 0 件でも必ず出力する。
- スキルフィードバックは改善点 0 件でも必ず出力する。

## 次のPhase

Phase 13: PR 作成
