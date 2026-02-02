# Phase 1: 要件定義

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 1                               |
| 機能名 | TASK-IMP-permission-date-filter |
| 作成日 | 2026-02-01                      |

## 目的

PermissionHistoryFilterに期間別フィルタリング機能を追加するための機能要件・非機能要件・受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: Issue #632およびtask-imp-permission-history-001の成果物からフィルタ拡張要件を抽出
- 受け入れ基準作成: 期間フィルタの動作を検証可能な基準として定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名            | パス                                                                                        | 説明                                    |
| ----------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| GitHub Issue #632 | https://github.com/daishiman/AIWorkflowOrchestrator/issues/632                              | タスク元Issue                           |
| 権限履歴UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` L251-L309             | PermissionHistoryPanel UI仕様           |
| 状態管理仕様      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` L333-L434      | permissionHistorySlice仕様              |
| 完了記録          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md` L18-L77 | task-imp-permission-history-001完了記録 |
| 未タスク指示書    | `docs/30-workflows/unassigned-task/task-imp-permission-date-filter.md`                      | 元の未タスク指示書                      |

## 実行手順

### 1. 要件抽出

Issue #632および関連仕様書から以下の要件を抽出する。

#### 機能要件（FR）

| FR-ID | 要件                                                                   | 優先度 |
| ----- | ---------------------------------------------------------------------- | ------ |
| FR-1  | 期間プリセット選択が可能であること（全期間/今日/過去7日/過去30日）     | 高     |
| FR-2  | カスタム日付範囲（start/end）の指定が可能であること                    | 高     |
| FR-3  | 既存フィルタ（ツール名・判断結果）と期間フィルタを組み合わせられること | 高     |
| FR-4  | プリセット選択時にカスタム日付入力が非表示になること                   | 中     |
| FR-5  | カスタム範囲選択時にstart/endの日付入力欄が表示されること              | 中     |
| FR-6  | デフォルトは「全期間」（フィルタなし状態）であること                   | 中     |

#### 非機能要件（NFR）

| NFR-ID | 要件                                                         | 優先度 |
| ------ | ------------------------------------------------------------ | ------ |
| NFR-1  | 1000件の履歴に対してフィルタ適用が体感上遅延なく完了すること | 高     |
| NFR-2  | ISO8601タイムスタンプをローカル時間で比較すること            | 高     |
| NFR-3  | Line Coverage 80%以上を達成すること                          | 高     |
| NFR-4  | TypeScript strict モードでエラーがないこと                   | 高     |
| NFR-5  | ESLint / Prettier の規約に準拠すること                       | 中     |

### 2. 受け入れ基準作成

| AC-ID | 受け入れ基準                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------- |
| AC-1  | 期間プリセット「今日」を選択すると、本日00:00:00以降のエントリのみ表示される                       |
| AC-2  | 期間プリセット「過去7日」を選択すると、7日前00:00:00以降のエントリのみ表示される                   |
| AC-3  | 期間プリセット「過去30日」を選択すると、30日前00:00:00以降のエントリのみ表示される                 |
| AC-4  | 期間プリセット「全期間」を選択すると、全エントリが表示される                                       |
| AC-5  | カスタム範囲でstart/endを指定すると、その範囲内のエントリのみ表示される                            |
| AC-6  | ツール名フィルタ「Bash」と期間「今日」を同時適用すると、今日のBashエントリのみ表示される           |
| AC-7  | 判断結果フィルタ「denied」と期間「過去7日」を同時適用すると、7日以内のdeniedエントリのみ表示される |
| AC-8  | フィルタ結果が0件の場合、空状態メッセージが表示される（既存のフィルタ結果なしメッセージを流用）    |

### 3. FR/NFR分類

上記の表で分類済み。全FR/NFRに優先度を設定済み。

## 統合テスト連携【必須】

| 接続要件カテゴリ | 記載内容                                                             |
| ---------------- | -------------------------------------------------------------------- |
| API接続          | なし（Renderer Process内で完結、Main Process/IPCの変更なし）         |
| 認証フロー       | なし                                                                 |
| データフロー     | Zustand store → PermissionHistoryPanel → フィルタロジック → 表示更新 |

## アーキテクチャ層別要件（AIが判断）

| 層                         | 確認観点                                                                      |
| -------------------------- | ----------------------------------------------------------------------------- |
| フロントエンド（Renderer） | PermissionHistoryFilter UI拡張、dateRangeによるフィルタ状態管理、プリセットUI |
| バックエンド（Main）       | 対象外（Renderer内完結）                                                      |
| IPC通信                    | 対象外（Renderer内完結）                                                      |
| セキュリティ               | 日付入力のバリデーション（不正な日付文字列の防止）                            |
| データ                     | PermissionHistoryFilter型のdateRangeフィールド追加（非永続化）                |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                   | 仕様参照先                                             |
| ------------------ | -------------------------- | ------------------------------------------------------ |
| UI/UX              | 適用（UI拡張）             | `aiworkflow-requirements: ui-ux-settings.md` L251-L309 |
| アクセシビリティ   | 適用（UI拡張）             | `aiworkflow-requirements: ui-ux-settings.md`           |
| パフォーマンス     | 適用（1000件フィルタ）     | `aiworkflow-requirements: arch-state-management.md`    |
| セキュリティ       | 非適用                     | -                                                      |
| API設計            | 非適用                     | -                                                      |
| データ整合性       | 非適用                     | -                                                      |
| エラーハンドリング | 適用（日付バリデーション） | -                                                      |

## 成果物

| 成果物       | パス                                         | 説明                            |
| ------------ | -------------------------------------------- | ------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件（本Phase成果） |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義                          |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲                        |

## 完了条件

- [ ] 全要件（FR-1〜FR-6、NFR-1〜NFR-5）が抽出されている
- [ ] 各要件に受け入れ基準（AC-1〜AC-8）がある
- [ ] FR/NFRが分類されている
- [ ] 接続要件（Renderer内完結）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Issue #632、ui-ux-settings.md、arch-state-management.md）
2. 機能要件の抽出と定義
3. 非機能要件の抽出と定義
4. 受け入れ基準の作成
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-date-filter --phase 1
```

## 次のPhase

Phase 2: 設計
