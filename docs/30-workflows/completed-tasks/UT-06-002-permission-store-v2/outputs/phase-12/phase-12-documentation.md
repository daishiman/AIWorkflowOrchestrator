# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック

Phase 12 実行前に `.claude/rules/06-known-pitfalls.md` の以下を確認:

- P1: LOGS.md 2ファイル更新漏れ
- P2: topic-map.md 再生成忘れ
- P3: 未タスク管理の3ステップ不完全
- P4: documentation-changelog への早期「完了」記載
- P25: LOGS.md 2ファイル更新漏れ（再発）
- P26: システム仕様書更新遅延
- P27: topic-map.md 再生成トリガーの判断ミス
- P28: スキルフィードバックレポート未作成

## 実行タスク

| Task      | 内容                                   | 主成果物                                         |
| --------- | -------------------------------------- | ------------------------------------------------ |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成） | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システムドキュメント更新               | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成               | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出（残課題の検出と記録）     | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成       | `outputs/phase-12/skill-feedback-report.md`      |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

## サブフェーズ

### Task 12-1: 実装ガイド作成

**2パート構成**:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1 の内容案**:

- PermissionStore を「セキュリティガードの記憶ノート」にたとえる
  - たとえば、学校の警備員さんが「この人は毎日来る先生だから通していい」「この人は今日だけの訪問者」と覚えるようなもの
- session = 「今日だけの許可証」、permanent = 「永久パス」、time_24h = 「24時間パス」
- アプリ終了時に session 許可証を回収する仕組み

**Part 2 の内容案**:

- AllowedToolEntryV2 型定義の詳細
- isToolAllowed 6分岐フローチャート
- calcExpiresAt 計算テーブル
- IPC チャンネル `permission:clear-session` の使用方法
- V1→V2 マイグレーション手順
- electron-store スキーマ定義

### Task 12-2: システムドキュメント更新

#### Step 1: タスク完了記録

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] aiworkflow-requirements/LOGS.md にタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.md にタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新
- [ ] task-specification-creator/SKILL.md 変更履歴更新

##### Step 1-B: 実装状況テーブル更新

- [ ] `interfaces-agent-sdk-executor-details.md` の AllowedToolEntryV2 関連セクション更新

##### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "UT-06-002" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索
- [ ] `task-workflow.md` の残課題テーブル更新

##### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行

#### Step 2: システム仕様更新

更新対象（本タスクは新規インターフェース/型追加のため更新必要）:

| #   | 更新対象ファイル                           | 更新内容                                           |
| --- | ------------------------------------------ | -------------------------------------------------- |
| 1   | `interfaces-agent-sdk-executor-details.md` | AllowedToolEntryV2 / IPermissionStoreV2 型定義追加 |
| 2   | `security-skill-execution.md`              | PermissionStore V2 のセッション管理仕様追記        |
| 3   | `arch-state-management-permissions.md`     | PermissionStore V2 スキーマ/キャッシュ設計更新     |
| 4   | `api-ipc-agent.md`                         | permission:clear-session チャンネル追加            |
| 5   | `task-workflow.md`                         | 完了タスクセクション追加、残課題テーブル更新       |

### Task 12-3: ドキュメント更新履歴

全 Step の実行結果を事後記録する（早期「完了」記載禁止 -- P4）。

### Task 12-4: 未タスク検出

**検出ソース**:

| #   | ソース                | 確認項目                                    |
| --- | --------------------- | ------------------------------------------- |
| 1   | Phase 3 設計レビュー  | MINOR-01: 既存ハンドラへの sender 検証追加  |
| 2   | Phase 10 最終レビュー | （実行時に記載）                            |
| 3   | Phase 11 手動テスト   | （実行時に記載）                            |
| 4   | コードベース          | `grep -rn "TODO\|FIXME\|HACK" 変更ファイル` |

**既知の未タスク候補**:

- MINOR-01: 既存 permission-store-handlers の3ハンドラに sender 検証を追加
- PermissionStore の `allowTool(string)` V1 シグネチャの段階的廃止（@deprecated）

**未タスク管理の3ステップ（P3準拠）**:

1. `docs/30-workflows/unassigned-task/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

### Task 12-5: スキルフィードバックレポート

改善点がなくても「改善点なし」としてレポートを作成する（省略不可 -- P28）。

## IPC 機能開発時の追加更新対象ファイル

| #   | 更新対象ファイル                | 更新内容                                    | 必須/任意 |
| --- | ------------------------------- | ------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`              | permission:clear-session チャンネル一覧追加 | 必須      |
| 2   | `security-electron-ipc.md`      | P42準拠バリデーションパターン追記           | 必須      |
| 3   | `architecture-overview.md`      | IPC ハンドラー登録一覧更新                  | 必須      |
| 4   | `interfaces-agent-sdk-skill.md` | IPermissionStoreV2 インターフェース追加     | 必須      |
| 5   | `task-workflow.md`              | 完了タスクセクション追加                    | 必須      |

## 成果物

| 成果物                       | パス                                                     | 必須 | 説明                                    |
| ---------------------------- | -------------------------------------------------------- | ---- | --------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | 必須 | 概念的+技術的ドキュメント               |
| システム仕様更新サマリ       | `outputs/phase-12/system-spec-update-summary.md`         | 必須 | Step 1-2 実績記録                       |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 必須 | 更新履歴                                |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 必須 | 検出結果（0件でも出力）                 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 必須 | 改善点（なしでも出力必須）              |
| Task仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 | Task 1〜5 の全完了確認（root evidence） |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`                 | 条件 | 検出時のみ作成                          |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.md にタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md 変更履歴更新**
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.md 変更履歴更新**
- [ ] **【Task 2 Step 1-D】topic-map.md を再生成した**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.md に記録した**
- [ ] **未タスク検出レポートが出力されている**
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した
- [ ] **スキルフィードバックレポートが出力されている**
- [ ] artifacts.json が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 漏れやすいポイント

| ID  | ポイント                      | 対策                                                          |
| --- | ----------------------------- | ------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ     | aiworkflow-requirements + task-specification-creator 両方更新 |
| P2  | topic-map.md 再生成忘れ       | セクション変更時は必ず generate-index.js を実行               |
| P27 | 再生成トリガー判断ミス        | 追加だけでなく削除・更新も再生成トリガー                      |
| P29 | SKILL.md 変更履歴更新漏れ     | LOGS.md とは別に SKILL.md の変更履歴テーブルも更新            |
| P3  | 未タスク管理の3ステップ不完全 | (1)指示書 → (2)task-workflow.md → (3)関連仕様書リンク         |

## 次のPhase

Phase 13: PR作成
