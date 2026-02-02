# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 12                              |
| 機能名 | TASK-IMP-permission-date-filter |
| 作成日 | 2026-02-01                      |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成（2パート構成）
- システムドキュメント更新: aiworkflow-requirements等の更新（4サブステップ + 条件付き）
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1（中学生レベル）の必須要件

- 日常生活での例え話を**必ず**含める
  - 例: 「図書館の蔵書検索で『今週入荷した本だけ見たい』というフィルタのようなもの」
  - 例: 「スマホの写真アプリで『先月の写真だけ表示』するのと同じ仕組み」
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

#### Part 2（技術者レベル）の必須要件

- インターフェース/型定義（TypeScript）を含める
  - DatePreset型（union type: "all" | "today" | "week" | "month" | "custom"）
  - DateRangeFilter型（preset, start?, end?）
  - PermissionHistoryFilter型（拡張後）
- API シグネチャと使用例を記載
  - `getDateRangeStartDate(preset: DatePreset): Date | null`
  - `filterByDateRange(entries: PermissionHistoryEntry[], dateRange: DateRangeFilter): PermissionHistoryEntry[]`
- エラーハンドリングとエッジケースを説明
  - 無効な日付文字列の処理
  - start > end の場合の動作
  - タイムゾーン処理
- 設定可能なパラメータと定数を一覧化
  - `DATE_RANGE_PRESETS`（プリセット定義）
  - `DAYS_IN_WEEK = 7`
  - `DAYS_IN_MONTH = 30`

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

#### Step 1-A: タスク完了記録【必須】

以下のファイルに完了記録を追加:

| 対象ファイル                                                  | 更新内容                                        |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `aiworkflow-requirements: interfaces-agent-sdk-history.md`    | 「完了タスク」セクションに本タスク完了記録追加  |
| `aiworkflow-requirements: ui-ux-settings.md`                  | 関連ドキュメントセクションに実装ガイドリンク    |
| `aiworkflow-requirements: arch-state-management.md`           | 変更履歴セクションにバージョン追記              |
| `.claude/skills/aiworkflow-requirements/LOGS.md`              | タスク完了エントリ追加                          |
| `.claude/skills/task-specification-creator/LOGS.md`           | タスク完了記録追加                              |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` | 新規セクションエントリ追加（該当する場合）      |
| `.claude/skills/aiworkflow-requirements/SKILL.md`             | 変更履歴にバージョン追記                        |
| `.claude/skills/task-specification-creator/SKILL.md`          | 変更履歴にバージョン追記                        |
| `aiworkflow-requirements: ui-ux-components.md`                | 完了タスクと変更履歴を更新（UI/UXタスクのため） |

#### Step 1-B: 実装状況テーブル更新【必須】

| 対象ファイル                                               | 更新内容                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| `aiworkflow-requirements: interfaces-agent-sdk-history.md` | task-imp-permission-date-filter のステータスを「完了」に更新 |

#### Step 1-C: 関連タスクテーブル更新【必須】

| 対象ファイル                                        | 更新内容                                               |
| --------------------------------------------------- | ------------------------------------------------------ |
| `aiworkflow-requirements: arch-state-management.md` | 「関連タスク」「未タスク候補」テーブルのステータス更新 |
| `aiworkflow-requirements: ui-ux-settings.md`        | 「関連タスク」テーブルのステータス更新                 |

#### Step 2: システム仕様更新【条件付き】

**更新判断:**

| 変更タイプ                    | 更新要否 | 理由                                            |
| ----------------------------- | -------- | ----------------------------------------------- |
| PermissionHistoryFilter型拡張 | 必要     | 既存インターフェースに`dateRange`フィールド追加 |
| DateRangeFilter型追加         | 必要     | 新規インターフェース追加                        |
| DatePreset型追加              | 必要     | 新規型追加                                      |
| dateFilterUtils.ts追加        | 不要     | 内部実装の詳細                                  |
| UI表示ロジック変更            | 不要     | 内部実装の詳細                                  |

**更新対象ファイル:**

| ファイル                                                   | 更新内容                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `aiworkflow-requirements: arch-state-management.md`        | permissionHistorySlice内のPermissionHistoryFilter型定義にdateRange追加 |
| `aiworkflow-requirements: ui-ux-settings.md`               | フィルタ仕様にdateRange選択肢追加                                      |
| `aiworkflow-requirements: interfaces-agent-sdk-history.md` | DateRangeFilter/DatePreset型定義追加                                   |

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-IMP-permission-date-filter

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-IMP-permission-date-filter \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順:**

| スクリプト                            | 代替手順                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で`outputs/phase-12/documentation-changelog.md`を作成                                                                    |
| `complete-phase.js`                   | 手動で`artifacts.json`を更新（参照: `docs/30-workflows/completed-tasks/task-imp-permission-readable-ui-001/artifacts.json`） |

### Task 4: 未タスク検出【必須】（0件でも出力必須）

| #   | ソース                 | 確認項目                                       |
| --- | ---------------------- | ---------------------------------------------- |
| 1   | 元タスク仕様書         | Issue #632の「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                            |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                            |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案                 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント（新規追加分）      |

**スコープ外の候補（Issue #632より）:**

| 候補                                            | 説明                               |
| ----------------------------------------------- | ---------------------------------- |
| カレンダーピッカーUIの新規作成                  | 既存ネイティブdate inputで対応済み |
| バックエンド/Main Processでの日付フィルタリング | フロントエンド完結のため対象外     |

**UIコンポーネント実装時の横断的検出パターン:**

| チェック項目                           | 未タスク候補 | 優先度目安 |
| -------------------------------------- | ------------ | ---------- |
| ダークモード対応が必要か？             | テーマ対応   | 低         |
| アクセシビリティ（WCAG）準拠が必要か？ | a11y改善     | 中         |
| レスポンシブ対応が必要か？             | レスポンシブ | 低         |
| 日付フィルタの国際化（i18n）が必要か？ | i18n対応     | 低         |

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/renderer/components/settings/PermissionSettings --output .tmp/unassigned-candidates.json
```

## アーキテクチャ層別ドキュメント（AIが判断）

| 層               | ドキュメント内容                                    | 更新対象                               |
| ---------------- | --------------------------------------------------- | -------------------------------------- |
| Renderer Process | PermissionHistoryFilter UI拡張、dateFilterUtils設計 | `ui-ux-settings.md`, `interfaces-*.md` |
| Shared           | DateRangeFilter/DatePreset型定義                    | `arch-state-management.md`             |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 必須 | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 必須 | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 必須 | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 - 中学生レベル）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細 - 型定義・API・使用例）が作成されている
- [ ] **【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】topic-map.mdに新規セクションエントリを追加した（該当する場合）**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.mdの変更履歴にバージョンを追記した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.mdの変更履歴にバージョンを追記した**
- [ ] **【Task 2 Step 1-A】ui-ux-components.mdの完了タスクと変更履歴を更新した（UI/UXタスクのため）**
- [ ] **【Task 2 Step 1-B】interfaces-agent-sdk-history.mdのステータスを「完了」に更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 1-C】Grepで`task-imp-permission-date-filter`をreferences/配下全体から検索し、関連テーブルの漏れを確認した**
- [ ] **【Task 2 Step 2】システム仕様更新を実施した（DateRangeFilter/DatePreset型追加、PermissionHistoryFilter型拡張）**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（Renderer層、Shared層）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

| スクリプト                            | 代替手順                                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                                                                     |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/task-imp-permission-readable-ui-001/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                          |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                         |

## サブタスク管理

1. Task 1: 実装ガイド作成（Part 1 + Part 2）
2. Task 2 Step 1-A: タスク完了記録
3. Task 2 Step 1-B: 実装状況テーブル更新
4. Task 2 Step 1-C: 関連タスクテーブル更新
5. Task 2 Step 2: システム仕様更新（DateRangeFilter/DatePreset型追加）
6. Task 3: ドキュメント更新履歴 & artifacts.json更新
7. Task 4: 未タスク検出
8. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-date-filter --phase 12
```

## 次のPhase

Phase 13: PR作成
