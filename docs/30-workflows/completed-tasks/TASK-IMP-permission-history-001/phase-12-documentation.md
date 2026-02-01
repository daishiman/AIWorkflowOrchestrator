# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 12                              |
| 機能名 | TASK-IMP-permission-history-001 |
| 作成日 | 2026-01-31                      |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成（2パート構成）
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）の必須要件**:

- 日常生活での例え話を含める（例: 権限履歴は「図書館の貸出記録」のようなもの）
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**Part 2（技術者レベル）の必須要件**:

- PermissionHistoryEntry型定義（TypeScript）
- permissionHistorySlice API（addHistoryEntry, clearHistory, setHistoryFilter）
- PermissionHistoryPanel/Filter/Item コンポーネント使用例
- エラーハンドリング（localStorage容量超過、JSON.parseエラー）
- 設定可能なパラメータ（PERMISSION_HISTORY_MAX_ENTRIES=1000, argsSnapshot最大200文字）
- 仮想スクロール設定（@tanstack/react-virtual, estimateSize=72, overscan=5）

**テンプレート**: `assets/implementation-guide-template.md`

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

#### Step 1-A: タスク完了記録【必須・全タスク】

- [ ] `ui-ux-settings.md`に「完了タスク」セクションを追加（PermissionHistoryPanel追加の記録）
- [ ] `security-skill-execution.md`に関連ドキュメントセクション更新（履歴記録仕様の参照リンク追加）
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md`にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md`にタスク完了記録を追加
- [ ] `topic-map.md`に新規セクションエントリを追加（PermissionHistory関連）

#### Step 1-B: 実装状況テーブル更新

- [ ] `ui-ux-settings.md`内のPermissionHistory関連の「未実装」→「完了」に更新

#### Step 1-C: 関連タスクテーブル更新

- [ ] `ui-ux-settings.md`内の「関連タスク」テーブルでtask-imp-permission-history-001のステータスを「完了」に更新
- [ ] `security-skill-execution.md`内の「関連タスク」テーブルでtask-imp-permission-history-001のステータスを「完了」に更新

#### Step 2: システム仕様更新【条件付き】

本タスクでの更新要否判断:

| 更新対象                      | 更新内容                                             | 要否 |
| ----------------------------- | ---------------------------------------------------- | ---- |
| `ui-ux-settings.md`           | PermissionSettingsに「権限履歴」セクション仕様を追加 | 必要 |
| `security-skill-execution.md` | PermissionStoreの履歴記録メカニズム仕様を追加        | 必要 |
| `arch-state-management.md`    | permissionHistorySliceの仕様を追加                   | 必要 |
| `interfaces-*.md`             | PermissionHistoryEntry型のインターフェース追加       | 必要 |

更新理由: 新規インターフェース（PermissionHistoryEntry, PermissionHistoryFilter）の追加、新規Zustand Slice（permissionHistorySlice）の追加、UI仕様の追加のため。

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-IMP-permission-history-001

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-IMP-permission-history-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新
- 更新したドキュメントと変更内容を一覧化

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                                                                               |
| --- | ---------------------- | -------------------------------------------------------------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目（履歴エクスポート、自動推奨ロジック、外部ログ連携） |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                                                                    |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                                                                    |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案                                                         |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント                                                            |

**既知のスコープ外項目（未タスク候補）**:

- 履歴のエクスポート/インポート機能（task-imp-permission-export-import-001に記載済み）
- 履歴に基づく自動推奨ロジック
- 外部ログサービスとの連携
- Main Processでのログファイル出力
- 期間別フィルタリング

## アーキテクチャ層別ドキュメント（AIが判断）

| 層               | ドキュメント内容                                       | 更新対象                                        |
| ---------------- | ------------------------------------------------------ | ----------------------------------------------- |
| Renderer Process | PermissionHistoryPanel設計、permissionHistorySlice仕様 | `ui-ux-settings.md`, `arch-state-management.md` |
| データ層         | localStorage永続化スキーマ、Zustand persist設定        | `arch-state-management.md`                      |
| セキュリティ     | safeString()適用箇所、機密データ非保存ポリシー         | `security-skill-execution.md`                   |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 必須 | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 必須 | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 必須 | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明・中学生レベル）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】ui-ux-settings.mdに「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】security-skill-execution.mdに関連ドキュメント更新した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】topic-map.mdに新規セクションエントリを追加した**
- [ ] **【Task 2 Step 1-B】実装状況テーブルを更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した**
- [ ] **【Task 2 Step 2】システム仕様更新を実施した（ui-ux-settings.md, security-skill-execution.md, arch-state-management.md, interfaces-\*.md）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

| スクリプト                            | 代替手順                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で`outputs/phase-12/documentation-changelog.md`を作成                           |
| `complete-phase.js`                   | 手動で`artifacts.json`を更新                                                        |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、`unassigned-task-detection.md`を作成 |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-history-001 --phase 12
```

## 次のPhase

Phase 13: PR作成
