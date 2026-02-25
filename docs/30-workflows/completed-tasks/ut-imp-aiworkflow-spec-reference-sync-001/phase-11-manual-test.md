# Phase 11: 手動テスト検証（運用手順実地確認） — UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001

## メタ情報

| 項目               | 値                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| タスクID           | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001                                                                          |
| Phase              | 11（手動テスト検証）                                                                                               |
| タスク名           | Phase 12 仕様更新リンク同期ガード強化                                                                              |
| 機能名             | ut-imp-aiworkflow-spec-reference-sync-001                                                                          |
| 種別               | 改善（仕様書・運用手順の改善タスク。コード変更なし）                                                               |
| 作成日             | 2026-02-25                                                                                                         |
| 前提Phase          | phase-10-final-review.md                                                                                           |
| 目的               | 仕様書修正の運用手順・検証コマンド・参照整合・baseline/current分離を手動で確認し、機械検証が拾わない矛盾を除去する |
| 成果物ディレクトリ | docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-11/                      |

## 目的

仕様書修正の運用手順・検証コマンド・参照整合を手動で確認し、機械検証が拾わない矛盾を除去する。本タスクは仕様書修正のみ（コード変更なし）のため、UIテストは不要。代わりに以下の5つの手動検証を実施する。

1. Phase 5 で作成したチェックリストを用いた手動実行
2. 検証コマンド（verify-unassigned-links / generate-index / SKILL validator）の手動実行
3. baseline/current 分離テスト
4. 3点同期（task-workflow.md / SKILL.md / LOGS.md）の手動確認
5. fallback 経路（スクリプト未存在時の代替手順）の手動テスト

## 実行タスク

- 実行方針: 下記 Task を順番に実施し、成果物へ根拠を記録する。

### Task 11-1: チェックリスト手動実行

- Phase 5 で作成した3点同期チェックリストを使って、実際の Phase 12 想定シナリオを手動実行する
- チェックリストの各項目が実行可能であること、判定基準が明確であることを検証する
- 各項目の実行結果を成果物に記録する

### Task 11-2: 検証コマンド手動実行

以下の3つの検証コマンドを手動で実行し、結果を記録する。

1. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` を実行し、参照切れ 0 件を確認する
2. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、topic-map.md / keywords.json が正常更新されることを確認する
3. `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py` を2スキルに対して実行し、`Skill is valid!` 出力を確認する

### Task 11-3: baseline/current 分離テスト

- 実際のタスク（既完了タスク）で、baseline 違反と今回差分違反の判定が正しく分離できるかテストする
- 監査実行結果を「baseline（既存の問題）」と「current（今回の変更で生じた問題）」に分離記録する
- 分離記録の形式が明確であること、混同が発生しないことを検証する

### Task 11-4: 3点同期確認

- task-workflow.md / SKILL.md / LOGS.md の同期チェックリストを手動実行する
- 以下の5ファイルでタスクIDの記載が一致していることを確認する:
  1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  2. `.claude/skills/aiworkflow-requirements/SKILL.md`
  3. `.claude/skills/task-specification-creator/SKILL.md`
  4. `.claude/skills/aiworkflow-requirements/LOGS.md`
  5. `.claude/skills/task-specification-creator/LOGS.md`

### Task 11-5: fallback 経路確認

- 通常経路だけでなく、fallback 経路（スクリプト未存在時の代替手順）も手動テストする
- スクリプトが存在しない場合に、手動で同等の結果を得られる代替手順が文書化されていることを確認する
- 代替手順を実行して、通常経路と同等の検証結果が得られることを確認する

## SubAgent 分担

| SubAgent   | 担当                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| SubAgent-A | Task 11-2（検証コマンド実行）                                             |
| SubAgent-D | Task 11-1, 11-3, 11-4, 11-5（チェックリスト・分離テスト・同期・fallback） |

## 参照資料

### システム仕様（aiworkflow-requirements + task-specification-creator）

| 参照資料                 | パス                                                                                 | 内容                             |
| ------------------------ | ------------------------------------------------------------------------------------ | -------------------------------- |
| リソースマップ           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                     | 必要仕様の探索起点               |
| トピックマップ           | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                        | セクション単位の参照位置特定     |
| タスクワークフロー       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 未タスク参照同期ルール           |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 同種タスク失敗例と予防策         |
| パターン集               | `.claude/skills/aiworkflow-requirements/references/patterns.md`                      | Phase 12漏れの再発防止パターン   |
| 品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | 品質ゲートとテスト要件           |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | Step 1-A/1-B/1-C/Step 2 要件     |
| 未タスクガイドライン     | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク管理3ステップ            |
| Phase 11/12ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | Phase 11/12 実行ガイド           |
| LOGS.md（requirements）  | `.claude/skills/aiworkflow-requirements/LOGS.md`                                     | タスク完了記録（requirements側） |
| LOGS.md（creator）       | `.claude/skills/task-specification-creator/LOGS.md`                                  | タスク完了記録（creator側）      |
| SKILL.md（requirements） | `.claude/skills/aiworkflow-requirements/SKILL.md`                                    | スキル変更履歴（requirements側） |
| SKILL.md（creator）      | `.claude/skills/task-specification-creator/SKILL.md`                                 | スキル変更履歴（creator側）      |

### aiworkflow-requirements 抽出ログ（Progressive Disclosure）

1. `indexes/resource-map.md` から「ガイドライン」「タスクワークフロー」を選定。
2. `indexes/topic-map.md` で `task-workflow.md` / `lessons-learned.md` / `patterns.md` の参照位置を特定。
3. Phase 11 の手動検証対象として上記3仕様 + `quality-requirements.md` を確定。

### aiworkflow-requirements 抽出完全性チェック

| カテゴリ                   | 参照仕様                                                                                               | 判定   | 反映先                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ------ | ------------------------------ |
| タスク運用ルール           | `references/task-workflow.md`                                                                          | 必須   | Task 11-2, Task 11-4           |
| 教訓・再発防止             | `references/lessons-learned.md`, `references/patterns.md`                                              | 必須   | Task 11-1, Task 11-5           |
| 品質ゲート                 | `references/quality-requirements.md`                                                                   | 必須   | 完了条件, 手動検証観点         |
| 探索インデックス           | `indexes/resource-map.md`, `indexes/topic-map.md`                                                      | 必須   | 参照資料, 抽出ログ             |
| 仕様作成規約               | `references/spec-guidelines.md`                                                                        | 必須   | 検証記録の記述粒度             |
| API/UI/DB/セキュリティ個別 | `references/api-*.md`, `references/ui-ux-*.md`, `references/database-*.md`, `references/security-*.md` | 非該当 | コード変更なし（仕様書タスク） |

### タスク固有参照

| 参照資料               | パス                                                                               | 内容                     |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------ |
| Phase 10 成果物        | `outputs/phase-10/final-review-result.md`                                          | 最終レビュー判定結果     |
| Phase 9 成果物         | `outputs/phase-9/quality-report.md`                                                | 品質保証結果             |
| Phase 8 成果物         | `outputs/phase-8/refactoring-report.md`                                            | リファクタ結果           |
| Phase 7 成果物         | `outputs/phase-7/coverage-report.md`                                               | ゲート判定結果           |
| Phase 6 成果物         | `outputs/phase-6/integration-test.md`                                              | 統合検証結果             |
| Phase 5 成果物         | `phase-5-implementation.md`                                                        | チェックリスト・運用手順 |
| Phase 2 成果物         | `phase-2-design.md`                                                                | 設計基準                 |
| Phase 1 成果物         | `phase-1-requirements.md`                                                          | 要件定義                 |
| 未タスク指示書（原本） | `docs/30-workflows/completed-tasks/task-imp-aiworkflow-spec-reference-sync-001.md` | 元の未タスク指示書       |
| 完了タスク（発見元）   | `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md`          | 教訓の発見元タスク       |

## 統合テスト連携

- 手動点検結果を Phase 12 更新履歴へ反映する
- 検証コマンド実行結果を Phase 12 の documentation-changelog.md へ転記する
- 手動統合テスト: 検証コマンド3種を連続実行し、全て正常終了することを確認する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                 | 仕様参照先                                         |
| ------------------ | ------------------------ | -------------------------------------------------- |
| セキュリティ       | 非該当（コード変更なし） | `aiworkflow-requirements: security-*.md`           |
| UI/UX              | 非該当（仕様書タスク）   | `aiworkflow-requirements: ui-ux-*.md`              |
| アーキテクチャ     | 非該当（コード変更なし） | `aiworkflow-requirements: architecture-*.md`       |
| API設計            | 非該当（コード変更なし） | `aiworkflow-requirements: api-*.md`                |
| データ整合性       | 非該当（DB変更なし）     | `aiworkflow-requirements: database-*.md`           |
| エラーハンドリング | 非該当（コード変更なし） | `aiworkflow-requirements: error-handling.md`       |
| パフォーマンス     | 非該当（コード変更なし） | `aiworkflow-requirements: quality-requirements.md` |
| アクセシビリティ   | 非該当（UI実装なし）     | `aiworkflow-requirements: ui-ux-*.md`              |
| テスタビリティ     | 必須（手順の実行可能性） | `aiworkflow-requirements: quality-requirements.md` |

### Electron デスクトップアプリ観点

| 層                         | 適用判断                 | 仕様参照先 |
| -------------------------- | ------------------------ | ---------- |
| フロントエンド（Renderer） | 非該当（コード変更なし） | -          |
| バックエンド（Main）       | 非該当（コード変更なし） | -          |
| IPC通信                    | 非該当（コード変更なし） | -          |
| Preload/セキュリティ       | 非該当（コード変更なし） | -          |
| ローカルストレージ         | 非該当（DB変更なし）     | -          |

## 実行手順

### Step 1: チェックリスト手動実行（Task 11-1）

1. Phase 5 成果物から3点同期チェックリストを取得する
2. チェックリストの各項目を順番に実行する
3. task-workflow.md の残課題テーブルを開き、UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 の記載を確認する
4. SKILL.md（aiworkflow-requirements + task-specification-creator の2ファイル）の変更履歴にタスクIDが記載されていることを確認する
5. LOGS.md（aiworkflow-requirements + task-specification-creator の2ファイル）にタスク完了記録が記載可能な構造であることを確認する
6. 各項目の実行結果を手動テスト結果ファイルに記録する

### Step 2: 検証コマンド実行（Task 11-2）

1. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` を実行する
2. 出力に `ALL_LINKS_EXIST`（参照切れ 0 件）が含まれることを確認する
3. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
4. topic-map.md と keywords.json が正常に更新されることを確認する
5. 以下の2コマンドを実行する
   - `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements`
   - `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator`
6. `Skill is valid!` が出力されることを確認する
7. 全コマンドの実行結果を手動テスト結果ファイルに記録する

### Step 3: baseline/current 分離テスト（Task 11-3）

1. 既完了タスクの監査結果を取得する
2. 監査結果を baseline（既存の問題）と current（今回の変更で生じた問題）に分類する
3. 分類結果が明確に分離されていることを確認する
4. 分離記録の形式が Phase 5 で定義した標準形式に準拠していることを確認する
5. 検証結果を手動テスト結果ファイルに記録する

### Step 4: 3点同期確認（Task 11-4）

1. 以下のコマンドで5ファイル全てにタスクIDが記載されていることを確認する:
   ```bash
   grep -c "UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001" \
     .claude/skills/aiworkflow-requirements/references/task-workflow.md \
     .claude/skills/aiworkflow-requirements/SKILL.md \
     .claude/skills/task-specification-creator/SKILL.md \
     .claude/skills/aiworkflow-requirements/LOGS.md \
     .claude/skills/task-specification-creator/LOGS.md
   ```
2. 5ファイル全てで1件以上のマッチがあることを確認する
3. 3点（task-workflow.md / SKILL.md / LOGS.md）の同期状態が一貫していることを確認する
4. 検証結果を手動テスト結果ファイルに記録する

### Step 5: fallback 経路確認（Task 11-5）

1. verify-unassigned-links.js が存在しない場合の代替手順を確認する
2. 代替手順（手動での参照リンク確認）を実行する
3. 通常経路と同等の検証結果が得られることを確認する
4. generate-index.js が存在しない場合の代替手順も同様に確認する
5. 検証結果を手動テスト結果ファイルに記録する

## テストケース

| No  | カテゴリ         | テスト項目                        | 前提条件         | 操作手順                                                                                                                                                                                                                                                       | 期待結果                                   | 実行結果 | 備考 |
| --- | ---------------- | --------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------- | ---- |
| 1   | チェックリスト   | 3点同期チェックリスト実行         | 仕様書更新済み   | チェックリスト全項目を順次確認                                                                                                                                                                                                                                 | 全項目合格                                 | -        | -    |
| 2   | 検証コマンド     | verify-unassigned-links           | 台帳更新済み     | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` 実行                                                                                           | 参照切れ 0 件（`ALL_LINKS_EXIST` 出力）    | -        | -    |
| 3   | 検証コマンド     | generate-index                    | 仕様書更新済み   | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` 実行                                                                                                                                                                                   | topic-map.md / keywords.json 再生成成功    | -        | -    |
| 4   | 検証コマンド     | SKILL validator                   | スキル更新済み   | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements` と `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator` を実行 | `Skill is valid!` 出力                     | -        | -    |
| 5   | baseline/current | 判定分離テスト                    | 既完了タスクあり | 監査結果を baseline/current に分離記録                                                                                                                                                                                                                         | baseline と current が明確に分離されている | -        | -    |
| 6   | 3点同期          | task-workflow/SKILL/LOGS 同期確認 | 仕様書更新済み   | 5ファイルで grep によるタスクID検索                                                                                                                                                                                                                            | 5ファイル全てで1件以上マッチ               | -        | -    |
| 7   | fallback         | スクリプト未存在時の代替手順      | スクリプトなし   | 代替手順（手動でのリンク確認）を実行                                                                                                                                                                                                                           | 手動で通常経路と同等の検証結果が得られる   | -        | -    |

## 成果物

| 成果物         | パス                                     | 説明                          |
| -------------- | ---------------------------------------- | ----------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | テストケース1-7の実行結果記録 |

## 完了条件

- [ ] テストケース7件が全て実行され、結果が記録されている
- [ ] 3点同期チェックリスト（task-workflow.md / SKILL.md / LOGS.md）の同期が確認されている
- [ ] 検証コマンド3種（verify-unassigned-links.js / generate-index.js / quick_validate.py）が全て正常終了している
- [ ] baseline/current の分離記録形式が明確であることが確認されている
- [ ] fallback 経路（スクリプト未存在時の代替手順）が実行可能であることが確認されている
- [ ] task-workflow.md の残課題テーブル内の全リンクが実在ファイルを指すことが確認されている
- [ ] 成果物1件（manual-test-result.md）が生成されている

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成して管理する。

1. 参照資料確認
2. 実行タスク実施（Task 11-1 〜 11-5）
3. 成果物作成
4. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了状態を明記している

## 次Phase

Phase 12（ドキュメント更新）へ進む。
