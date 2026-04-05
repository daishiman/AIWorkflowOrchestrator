# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 規模       | 小規模                                 |
| 作成日     | 2026-04-04                             |

## 目的

実装内容のドキュメント化、仕様同期、および未タスクの検出を行う。Phase 1〜11 の実装結果を正式にドキュメントとして記録し、後続タスク（P0-04, P0-07, P0-09）が参照可能な状態にする。

## 事前チェック

以下のドキュメントの現状を確認してから作業を開始すること:

| チェック対象     | 確認内容                                           | 確認結果 |
| ---------------- | -------------------------------------------------- | -------- |
| P1: LOGS.md x2   | ワークフロー LOGS.md と仕様書 LOGS.md が存在するか | -        |
| P2: topic-map.md | `references/` 配下の topic-map.md が最新か         | -        |
| P25: 実装状況    | 実装状況テーブルに TASK-P0-03 のエントリがあるか   | -        |
| P29: SKILL.md    | SKILL.md の変更履歴セクションが最新か              | -        |

## 実行タスク

### 実行タスク一覧

| Task | タスク名                         | 必須 | 成果物                                           |
| ---- | -------------------------------- | ---- | ------------------------------------------------ |
| 12-1 | 実装ガイド作成                   | ✅   | `outputs/phase-12/implementation-guide.md`       |
| 12-2 | システムドキュメント更新         | ✅   | `outputs/phase-12/system-spec-update-summary.md` |
| 12-3 | ドキュメント更新履歴作成         | ✅   | `outputs/phase-12/documentation-changelog.md`    |
| 12-4 | 未タスク検出                     | ✅   | `outputs/phase-12/unassigned-task-detection.md`  |
| 12-5 | スキルフィードバックレポート作成 | ✅   | `outputs/phase-12/skill-feedback-report.md`      |

---

### Task 12-1: 実装ガイド作成

2パート構成で `outputs/phase-12/implementation-guide.md` を作成する。

#### Part 1: 概念説明（中学生レベル）

**レシピ本の目次の例え**を使用して、workflow-manifest.json の役割を説明する:

- **料理ロボット（ManifestLoader）** はレシピ本の **目次（workflow-manifest.json）** を見て動く
  - 目次がなければ、ロボットは何を作ればいいか分からない
  - 目次が壊れていたら、ロボットはエラーを出して止まる
- **5つの調理工程（フェーズ）** がある:
  1. **材料を決める**（requirements-gathering）-- 何が必要かリストアップ
  2. **手順を計画する**（plan）-- どの順番で作るか決める
  3. **実際に作る**（execute）-- レシピ通りに調理する
  4. **確認する**（verify）-- 味見して問題ないかチェック
  5. **味を調整する**（improve）-- フィードバックをもとに改善
- 各工程には **「開始の合図」（entry hook）** と **「終了の合図」（exit hook）** がある
  - 開始の合図で「この工程を始めます」と宣言
  - 終了の合図で「この工程が終わりました」と報告
- **本番の厨房（canonical）** と **予備の厨房（mirror）** に同じ目次を置く
  - どちらの厨房でも同じ料理が作れるようにするため

#### Part 2: 技術者レベル

- **manifest JSON 構造**: トップレベル 6 フィールド（schemaVersion, workflowId, phases, resources, entry, exit）
- **ManifestLoader 検証ステップ**: 11 ステップの検証フロー概要
- **テストケース**: 15 ケースの概要（TC-01〜RC-03）
- **配置パス**: canonical（`.claude/skills/skill-creator/`）と mirror（`.agents/skills/skill-creator/`）
- **phase 構造**: 5 phase の dependsOn チェーン、resourceIds、entryHookId/exitHookId
- **resource 構造**: 7 resource の type/path/phaseIds

---

### Task 12-2: システムドキュメント更新

#### Step 1-A: 仕様書完了記録

- ワークフロー LOGS.md に TASK-P0-03 Phase 12 完了を記録
- 仕様書ディレクトリの LOGS.md に Phase 12 完了を記録
- SKILL.md x2 の変更履歴セクションを更新（該当する場合）

#### Step 1-B: 実装状況テーブル更新

- 実装状況テーブルに TASK-P0-03 のステータスを更新
- 配置ファイルパスと対応テスト件数を記録

#### Step 1-C: 関連タスクテーブル更新

- P0-04（ManifestLoader デフォルト有効化）: 依存元として TASK-P0-03 完了を記録
- P0-07（動的エージェント名解決）: 依存元として TASK-P0-03 完了を記録
- P0-09（permission/hooks governance）: 依存元として TASK-P0-03 完了を記録

#### Step 1-D: topic-map.md 再生成

- `references/` 配下の topic-map.md に workflow-manifest.json 関連エントリを追加する必要がある場合のみ再生成する

#### Step 2: システム仕様更新の要否判断

manifest 配置のみで API / IPC / 型定義 / 設定フォーマットに変更を加えないため、システム仕様更新は不要と判断する。

判断基準:

- ManifestLoader.ts のコード変更: **なし** -- 更新不要
- 新規 API / IPC チャネル追加: **なし** -- 更新不要
- 型定義の変更: **なし** -- 更新不要
- 設定ファイルフォーマットの変更: **なし**（既存フォーマット準拠）-- 更新不要

結論を `system-spec-update-summary.md` に記録する。

---

### Task 12-3: ドキュメント更新履歴作成

`outputs/phase-12/documentation-changelog.md` に以下を記録:

- 更新日時
- 更新対象ファイル一覧
- 各ファイルの変更概要
- 更新理由（Phase 12 ドキュメント化の一環）

---

### Task 12-4: 未タスク検出

**0 件でも出力必須**。`outputs/phase-12/unassigned-task-detection.md` を作成する。

検出ソース:

| ソース                  | 確認内容                                            |
| ----------------------- | --------------------------------------------------- |
| Phase 3 レビュー結果    | レビューで指摘された未対応事項がないか              |
| Phase 10 レビュー結果   | 最終レビューで検出された残課題がないか              |
| Phase 11 手動テスト結果 | 手動テストで発見された問題で未対応のものがないか    |
| コードベース TODO/FIXME | manifest 関連の TODO/FIXME コメントが残っていないか |

出力フォーマット:

```markdown
## 未タスク検出結果

| No                                                      | 検出元 | 内容 | 優先度 | 対応タスク候補 |
| ------------------------------------------------------- | ------ | ---- | ------ | -------------- |
| （0件の場合: 「検出された未タスクはありません」と記載） |
```

---

### Task 12-5: スキルフィードバックレポート作成

**改善点なしでも出力必須**。`outputs/phase-12/skill-feedback-report.md` を作成する。

レポート内容:

- スキル実行プロセスでの気づき
- Phase 1〜11 を通じた改善提案
- 仕様書テンプレートへのフィードバック
- 0 件の場合: 「現時点で特筆すべき改善点はありません」と記録

## 参照資料

| 資料名                     | パス                                                                                          | 説明                     |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1                    | `phase-1-requirements.md`                                                                     | 要件定義                 |
| Phase 2                    | `phase-2-design.md`                                                                           | 設計                     |
| Phase 3                    | `phase-3-design-review.md`                                                                    | 設計レビュー             |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | 検証ロジック本体         |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | テスト期待値（15ケース） |
| canonical manifest         | `.claude/skills/skill-creator/workflow-manifest.json`                                         | 本番 manifest            |
| mirror manifest            | `.agents/skills/skill-creator/workflow-manifest.json`                                         | ミラー manifest          |
| 要件定義書                 | `outputs/phase-1/requirements.md`                                                             | Phase 1 成果物           |
| 設計書                     | `outputs/phase-2/design.md`                                                                   | Phase 2 成果物           |
| 実装計画書                 | `outputs/phase-5/implementation-plan.md`                                                      | Phase 5 成果物           |
| リファクタリングレポート   | `outputs/phase-8/refactoring-report.md`                                                       | Phase 8 成果物           |
| 品質レポート               | `outputs/phase-9/quality-report.md`                                                           | Phase 9 成果物           |
| 最終レビュー結果           | `outputs/phase-10/final-review-result.md`                                                     | Phase 10 成果物          |
| 手動テスト結果             | `outputs/phase-11/manual-test-result.md`                                                      | Phase 11 成果物          |
| 発見された問題一覧         | `outputs/phase-11/discovered-issues.md`                                                       | Phase 11 成果物          |

### システム仕様（aiworkflow-requirements）

| 参照対象                     | パス                                                                                        | 要点                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| workflow manifest foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `WorkflowManifest*` / `ManifestLoader` の read / validate 契約                                 |
| orchestration boundary       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | `ManifestLoader` は workflow foundation であり state owner ではない                            |
| owner separation             | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `ManifestLoader` は route/state authority を持たず `SkillCreatorWorkflowEngine` と責務分離する |

## 成果物

| 成果物                       | パス                                             | 必須 |
| ---------------------------- | ------------------------------------------------ | ---- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`       | ✅   |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md` | ✅   |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`    | ✅   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`  | ✅   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`      | ✅   |

## 漏れやすいポイント

| ID  | ポイント                        | 対策                                                                   |
| --- | ------------------------------- | ---------------------------------------------------------------------- |
| P1  | LOGS.md 2 ファイルの更新忘れ    | ワークフロー LOGS.md と仕様書 LOGS.md の両方を必ず更新                 |
| P2  | topic-map.md の未更新           | `references/` 配下の topic-map.md を確認し、更新が必要な場合のみ再生成 |
| P25 | 実装状況テーブルの更新漏れ      | TASK-P0-03 のステータスを「完了」に更新                                |
| P27 | 未タスク検出を 0 件でもスキップ | 0 件でも `outputs/phase-12/unassigned-task-detection.md` を必ず出力    |
| P29 | SKILL.md 変更履歴の更新忘れ     | SKILL.md の変更履歴セクションに Phase 12 完了を追記                    |

## 完了条件

- [ ] Task 12-1: `outputs/phase-12/implementation-guide.md` が Part 1（中学生レベル）と Part 2（技術者レベル）の 2 パート構成で作成されている
- [ ] Task 12-2 Step 1-A: LOGS.md x2、SKILL.md x2 が更新されている
- [ ] Task 12-2 Step 1-B: 実装状況テーブルが更新されている
- [ ] Task 12-2 Step 1-C: 関連タスクテーブル（P0-04, P0-07, P0-09）が更新されている
- [ ] Task 12-2 Step 1-D: topic-map.md の更新要否が判断され、更新が必要な場合のみ再生成されている
- [ ] Task 12-2 Step 2: `system-spec-update-summary.md` にシステム仕様更新の要否判断が記録されている
- [ ] Task 12-3: `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] Task 12-4: `outputs/phase-12/unassigned-task-detection.md` が作成されている（0 件でも出力）
- [ ] Task 12-5: `outputs/phase-12/skill-feedback-report.md` が作成されている（改善点なしでも出力）
- [ ] 事前チェック（P1, P2, P25, P29）が全て確認済み
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
