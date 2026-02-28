# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 12                           |
| Phase名    | ドキュメント更新             |
| タスクID   | TASK-9J                      |
| 前提Phase  | Phase 11（手動テスト検証）   |
| 後続Phase  | Phase 13（PR作成）           |
| ステータス | 完了（outputs/phase-12参照） |
| 作成日     | 2026-02-28                   |
| 機能名     | TASK-9J-skill-analytics      |

---

## 目的

スキル使用統計・分析機能の実装内容を文書化し、システム仕様書を更新する。
未タスクがあれば検出・記録する。
スキルフィードバックレポートを作成する。

## 背景

ドキュメントは将来のメンテナンスに不可欠である。
Phase 12 は漏れが最も発生しやすい Phase であるため、以下の既知の落とし穴を事前に確認すること。

### ⚠️ 事前確認必須: 既知の落とし穴（06-known-pitfalls.md）

| Pitfall ID | タイトル                                 | 対策                                                                            |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements と task-specification-creator の**2ファイル両方**を更新 |
| P2         | topic-map.md 再生成忘れ                  | 仕様書に変更があれば**必ず**再生成を実行                                        |
| P3         | 未タスク管理の3ステップ不完全            | ①指示書 → ②残課題テーブル → ③関連仕様書リンク の全ステップ                      |
| P4         | documentation-changelog 早期「完了」記載 | 全 Step 確認前に「完了」と記載しない                                            |
| P25        | LOGS.md 2ファイル更新漏れ（再発）        | P1と同様。明示的にチェック                                                      |
| P26        | システム仕様書更新遅延                   | Phase 12完了時点でシステム仕様書を更新する。PRマージを待たない                  |
| P27        | topic-map.md 再生成トリガー判断ミス      | セクション削除・更新も再生成トリガーに含める                                    |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」として作成                                        |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md も更新                                              |
| P31        | システム仕様書更新漏れ（複数ファイル）   | IPC関連では5ファイル以上を確認                                                  |
| P43        | サブエージェントの rate limit 中断       | 仕様書更新は3ファイル以下/エージェントに分割する                                |

---

## 実行タスク

> 以下のタスク5つを全て実行してください（全タスク必須）。

- Task 1: 実装ガイド（Part 1/Part 2）を作成する
- Task 2: システム仕様書更新（Step 1-A〜1-D + Step 2 + Step 3）を実行する
- Task 3: ドキュメント更新履歴と artifacts 台帳（`artifacts.json` / `outputs/artifacts.json`）を更新する
- Task 4: 未タスク検出レポートを作成する
- Task 5: スキルフィードバックレポートを作成する

### タスク1: 実装ガイド作成

**目的**: スキル使用統計・分析機能の使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. IPC ドキュメント（チャンネル仕様）を作成する

#### Part 1: 概念的説明（中学生レベル — 日常例え必須）

以下の構成で作成すること:

```markdown
# スキル使用統計・分析機能 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### スキル使用統計とは？

スキル使用統計は、**スマートフォンのアプリ使用時間レポート（スクリーンタイム）**のようなものです。

iPhoneの「スクリーンタイム」機能を知っていますか？
どのアプリを何回開いたか、どれくらいの時間使ったか、
自動で記録してグラフで見せてくれますよね。

スキル使用統計も同じで、「どのスキルを何回使ったか」
「うまくいったか失敗したか」「どれくらい時間がかかったか」を
自動で記録して、レポートにまとめる機能です。

### AnalyticsStoreとは？

これは**使用記録を書き込むノート**のようなものです。

スキルが実行されるたびに、ノートに1行ずつ記録が追加されます。
アプリを閉じても記録は消えないので、いつでも過去の使用状況を
振り返ることができます。

### SkillAnalyticsとは？

これは**記録されたデータを集計して分かりやすくする電卓**のようなものです。

- スキルごとの使用回数を数える
- 成功率を計算する
- 平均実行時間を算出する
- 日別・週別・月別のグラフ用データを作る
- CSVやJSONで記録をダウンロードできるようにする
```

#### Part 2: 技術者向け実装詳細

以下の構成で作成すること:

```markdown
## Part 2: 技術者向け実装詳細

### 実装概要

| 項目            | 値                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------- |
| IPCチャンネル数 | 5                                                                                        |
| 新規ファイル数  | 4（SkillAnalytics.ts, AnalyticsStore.ts, skillAnalyticsHandlers.ts, skill-analytics.ts） |
| 修正ファイル数  | 6（index.ts, channels.ts, skill-api.ts, types/index.ts 等）                              |
| 型定義数        | 8インターフェース                                                                        |

### SkillAnalytics API

（イベント記録、統計計算、サマリー集計、トレンド集計、エクスポートのロジック説明）

### AnalyticsStore API

（CRUD操作、electron-storeによる永続化方式、データ構造の説明）

### 5チャンネルのインターフェース

| チャンネル名               | 引数                                                                                  | 戻り値                                      | 説明               |
| -------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------ |
| skill:analytics:record     | `{ skillName, eventType, duration?, success, errorMessage?, toolsUsed, tokenCount? }` | `{ success: true }`                         | 使用イベント記録   |
| skill:analytics:statistics | `skillName: string`                                                                   | `{ success: true, data: SkillStatistics }`  | スキル別統計取得   |
| skill:analytics:summary    | なし                                                                                  | `{ success: true, data: AnalyticsSummary }` | 全体サマリー取得   |
| skill:analytics:trend      | `{ skillName: string, period: AnalyticsPeriod }`                                      | `{ success: true, data: UsageTrend }`       | 使用トレンド取得   |
| skill:analytics:export     | `{ format: "csv" \| "json", period?: AnalyticsPeriod }`                               | `{ success: true, data: string }`           | データエクスポート |

### 8型定義（skill-analytics.ts）

| 型名              | 用途                              |
| ----------------- | --------------------------------- |
| SkillUsageEvent   | 使用イベントの記録単位            |
| SkillStatistics   | スキル別の集計統計                |
| AnalyticsSummary  | 全スキルの総合サマリー            |
| UsageTrend        | 時系列トレンドデータ              |
| TrendDataPoint    | トレンドの1データポイント         |
| AnalyticsPeriod   | 集計期間（start/end/granularity） |
| ToolUsageStat     | ツール別使用回数                  |
| SkillUsageSummary | スキル別集計サマリー              |

### セキュリティ検証フロー

1. validateIpcSender → 2. 引数バリデーション（P42準拠3段） → 3. try/catch → 4. sanitizeErrorMessage

### エラーハンドリングパターン

（統一されたエラーレスポンス形式の説明）
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2 + IPC仕様を含む1ファイル）

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> **重要**: 📖 `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照してください。

**⚠️ 3ステップで実行:**

#### Step 1: タスク完了記録（必須）

##### Step 1-A: タスク完了記録

以下の項目を**全て**実施する:

- [ ] `api-ipc-agent.md` にタスク完了記録を追加する（新規5チャンネル追加）
- [ ] `arch-electron-services.md` にSkillAnalyticsサービス追加を記録する
- [ ] `interfaces-agent-sdk-skill.md` に分析型定義追加を記録する（8インターフェース）
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` を更新する（**2ファイル両方** — P1/P25対策）
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新する（P29対策）

##### Step 1-B: 実装状況テーブル更新

- [ ] `api-ipc-agent.md` に5チャンネルの実装ステータスを追加する

##### Step 1-C: 関連タスクテーブル更新

```bash
# TASK-9J を含む仕様書を検索する
grep -rn "TASK-9J" .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-9J" .claude/skills/task-specification-creator/references/
```

- [ ] 検出された仕様書の関連タスクテーブルを更新する

##### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md を再生成する（P2/P27対策 — 仕様書に変更があれば必ず実行）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を再生成した

#### Step 2: システム仕様更新（本タスクでは**必須**）

**更新判断**: 新規IPCチャンネル5つ、新規サービス（SkillAnalytics）、新規型定義8つを追加するため、システム仕様の更新が**必要**。

**IPC機能開発のため必須の更新対象ファイル**:

| #   | 更新対象ファイル                | 更新内容                                                                                                                                 | 必須/任意 |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`              | 新規5チャンネル一覧、引数型、戻り値型の追加                                                                                              | 必須      |
| 2   | `arch-electron-services.md`     | SkillAnalyticsサービス、AnalyticsStore の設計記載                                                                                        | 必須      |
| 3   | `security-electron-ipc.md`      | 分析チャンネルのセキュリティ検証パターン                                                                                                 | 必須      |
| 4   | `architecture-overview.md`      | IPCハンドラー登録一覧に分析操作を追加                                                                                                    | 必須      |
| 5   | `interfaces-agent-sdk-skill.md` | SkillUsageEvent, SkillStatistics, ToolUsageStat, AnalyticsPeriod, UsageTrend, TrendDataPoint, AnalyticsSummary, SkillUsageSummary を反映 | 必須      |
| 6   | `task-workflow.md`              | 完了タスクセクション追加、残課題テーブル更新                                                                                             | 必須      |
| 7   | `lessons-learned.md`            | 実装で得られた教訓（統計集計パターン、electron-store永続化のパフォーマンス考慮等）                                                       | 任意      |

**⚠️ P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。以下の2グループに分けて実行すること:

- **グループA**: api-ipc-agent.md, arch-electron-services.md, security-electron-ipc.md
- **グループB**: architecture-overview.md, interfaces-agent-sdk-skill.md, task-workflow.md

**更新チェックリスト（P31対策 — 複数ファイル更新漏れ防止）**:

- [ ] `api-ipc-agent.md` に5チャンネルの仕様を追加した
- [ ] `arch-electron-services.md` にSkillAnalytics/AnalyticsStoreの設計を追加した
- [ ] `security-electron-ipc.md` に分析チャンネルのセキュリティパターンを追加した
- [ ] `architecture-overview.md` のIPCハンドラー一覧を更新した
- [ ] `interfaces-agent-sdk-skill.md` に8インターフェース定義を追加した
- [ ] `task-workflow.md` に完了タスクとして TASK-9J を記録した

#### Step 3: IPC契約検証（本タスクはIPC機能開発のため**必須**）

> **参照**: `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` Phase 1-6

以下のチェック項目を全て実施する:

- [ ] Phase 1: チャンネル名がIPC_CHANNELS定数として定義されている（5チャンネル）
- [ ] Phase 2: ハンドラ引数形式とPreload側の呼び出し形式が一致している
- [ ] Phase 3: 引数名のセマンティクスが実際に渡される値と一致している（P45対策）
- [ ] Phase 4: P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラに実装されている
- [ ] Phase 5: エラーレスポンスがsanitizeErrorMessageで処理されている
- [ ] Phase 6: preload/types.ts のSkillAPI型にanalyticsメソッド5つが追加されている

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`

---

### タスク3: ドキュメント更新履歴作成 & artifacts 台帳更新

**目的**: 本タスクで行ったドキュメント更新を記録する

**実行手順**:

1. 更新した全仕様書の変更内容を記録する
2. 各 Step の完了結果を詳細に記録する（漏れの可視化）
3. `artifacts.json` の Phase 12 ステータスを `completed` に更新する
4. `outputs/artifacts.json` を `artifacts.json` と同期する

**⚠️ DON'T**: 全 Step 確認前に「完了」と記載しない（P4対策）

**更新履歴テンプレート**:

```markdown
# TASK-9J ドキュメント更新履歴

## 作成日

2026-02-XX

## 更新したファイル

| ファイル                                               | 変更種別 | 内容                                               |
| ------------------------------------------------------ | -------- | -------------------------------------------------- |
| apps/desktop/src/main/services/skill/SkillAnalytics.ts | 新規     | 分析サービス                                       |
| apps/desktop/src/main/services/skill/AnalyticsStore.ts | 新規     | 分析データ永続化                                   |
| packages/shared/src/types/skill-analytics.ts           | 新規     | 分析型定義（8インターフェース）                    |
| apps/desktop/src/main/ipc/skillAnalyticsHandlers.ts    | 新規     | 5ハンドラー追加                                    |
| apps/desktop/src/main/ipc/index.ts                     | 修正     | SkillAnalytics登録配線追加                         |
| apps/desktop/src/preload/channels.ts                   | 修正     | 5チャンネル定数追加                                |
| apps/desktop/src/preload/skill-api.ts                  | 修正     | analyticsメソッド追加                              |
| apps/desktop/src/preload/types.ts                      | 参照     | SkillAPI型は skill-api.ts から動的取得（変更不要） |
| packages/shared/src/types/index.ts                     | 修正     | skill-analytics re-export追加                      |

## Step 完了ステータス

### Step 1-A: タスク完了記録

- [x] / [ ] 各項目の実施状況

### Step 1-B: 実装状況テーブル

- [x] / [ ] 各項目の実施状況

### Step 1-C: 関連タスクテーブル

- [x] / [ ] 各項目の実施状況

### Step 1-D: topic-map.md 再生成

- [x] / [ ] 各項目の実施状況

### Step 2: システム仕様更新

- [x] / [ ] 各ファイルの更新状況

### Step 3: IPC契約検証

- [x] / [ ] 各Phase（1-6）の実施状況
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 残課題や未対応事項を検出・記録する（**0件でも出力必須**）

**実行手順**:

1. Phase 3（設計レビュー）の指摘事項を確認する
2. Phase 10（最終レビュー）の指摘事項を確認する
3. Phase 11（手動テスト）の発見課題を確認する
4. コードベースの TODO/FIXME を検索する
5. スコープ外項目（UIコンポーネント）を確認する
6. 検出結果を記録する（0件でも「検出タスクなし」と明記する）

**検出コマンド**:

```bash
# TODO/FIXME検索
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/SkillAnalytics.ts
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/AnalyticsStore.ts
grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/skillAnalyticsHandlers.ts
grep -rn "TODO\|FIXME" packages/shared/src/types/skill-analytics.ts
```

**未タスク検出時の3ステップ（P3対策）**:

検出した未タスクは以下の3ステップを**全て**完了する:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**⚠️ P38対策**: 未タスク指示書は必ず `unassigned-task/` ディレクトリ配下に配置する（`tasks/` 直下に配置しない）

**スコープ外で確認すべき項目**:

| 項目                    | 確認内容                                 |
| ----------------------- | ---------------------------------------- |
| 分析ダッシュボードUI    | task-031b で定義済み。本タスクでは対象外 |
| SkillAnalyticsView      | task-031b で定義済み。本タスクでは対象外 |
| TrendChart              | task-031b で定義済み。本タスクでは対象外 |
| StatisticsCard          | task-031b で定義済み。本タスクでは対象外 |
| E2Eテスト（Playwright） | 別タスク。本タスクでは対象外             |

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### タスク5: スキルフィードバックレポート作成

**目的**: 実装プロセスで得られたスキル改善点を記録する（**改善点なしでも作成必須** — P28対策）

**実行手順**:

1. Phase 1〜11 の実行で発見したワークフロー改善点を振り返る
2. task-specification-creator スキルの改善提案があれば記録する
3. 改善点がない場合は「改善点なし」の理由を記載する

**レポートテンプレート**:

```markdown
# スキルフィードバックレポート - TASK-9J

## 対象スキル

- task-specification-creator

## 改善提案

（改善点がある場合は記載。ない場合は以下）

### 改善点なし

- 理由: （具体的な理由を記載）

## ワークフロー改善点

（Phase実行中に発見した改善点。例: electron-store永続化のパフォーマンス対策、統計集計のバッチ処理パターン等）
```

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 漏れやすいポイント

> Phase 12 で漏れが発生しやすい箇所を明示する。

| #   | Pitfall ID | 漏れやすい操作                                  | 防止策                                                                 |
| --- | ---------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | P1/P25     | LOGS.md の2ファイル更新                         | aiworkflow-requirements と task-specification-creator の**両方**を更新 |
| 2   | P2/P27     | topic-map.md の再生成                           | 仕様書に変更があれば**必ず**再生成を実行                               |
| 3   | P29        | SKILL.md 変更履歴の更新                         | LOGS.md だけでなく SKILL.md も更新                                     |
| 4   | P3/P38     | 未タスクの3ステップ完遂と正しいディレクトリ配置 | ①指示書(unassigned-task/) → ②残課題テーブル → ③関連仕様書リンク        |
| 5   | P4         | documentation-changelog への早期「完了」記載    | 全 Step 確認前に「完了」と記載しない                                   |

---

## 参照資料

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準     |
| SkillAnalytics実装      | `apps/desktop/src/main/services/skill/SkillAnalytics.ts`                       | 実装コード       |
| AnalyticsStore実装      | `apps/desktop/src/main/services/skill/AnalyticsStore.ts`                       | 実装コード       |
| Phase 1成果物           | `outputs/phase-1/requirements-definition.md`                                   | 要件定義         |
| Phase 2成果物           | `outputs/phase-2/architecture-design.md`                                       | 設計仕様         |
| Phase 5成果物           | `outputs/phase-5/implementation-report.md`                                     | 実装結果         |
| Phase 6成果物           | `outputs/phase-6/test-expansion-report.md`                                     | テスト拡充結果   |
| Phase 7成果物           | `outputs/phase-7/coverage-report.md`                                           | カバレッジ結果   |
| Phase 8成果物           | `outputs/phase-8/refactoring-report.md`                                        | リファクタ結果   |
| Phase 9成果物           | `outputs/phase-9/quality-assurance-report.md`                                  | 品質保証結果     |
| Phase 10成果物          | `outputs/phase-10/final-review-result.md`                                      | 最終レビュー結果 |
| Phase 11 発見課題       | `outputs/phase-11/manual-test-result.md`                                       | 発見課題         |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P43   |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | 必須チェック項目 |
| IPC契約チェックリスト   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC検証手順      |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容     |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------- |
| IPC Agent仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 更新対象 |
| Electronサービス設計       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | 更新対象 |
| セキュリティIPC仕様        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | 更新対象 |
| Skill IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 参照必須 |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 更新対象 |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 更新対象 |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 参照必須 |
| 実装パターン集             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 任意更新 |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 更新対象 |

---

## 成果物

| 成果物               | パス                                            | 内容                           |
| -------------------- | ----------------------------------------------- | ------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2 + IPC仕様      |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-2-3 の実施結果          |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 全更新内容の記録               |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-detection.md` | 残課題（0件でも必須）          |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | スキル改善提案（なしでも必須） |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細 + IPC仕様）が作成されている
- [ ] Step 1-A: `api-ipc-agent.md` にタスク完了記録が追加されている
- [ ] Step 1-A: `arch-electron-services.md` にSkillAnalyticsサービスが追加されている
- [ ] Step 1-A: `interfaces-agent-sdk-skill.md` に分析型定義（8インターフェース）が追加されている
- [ ] Step 1-A: LOGS.md **2ファイル両方**が更新されている
- [ ] Step 1-A: SKILL.md **2ファイル両方**の変更履歴が更新されている
- [ ] Step 1-B: `api-ipc-agent.md` に5チャンネルの実装ステータスが追加されている
- [ ] Step 1-C: `grep` で検出された関連仕様書が更新されている
- [ ] Step 1-D: `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` が再生成されている
- [ ] Step 2: 6つの必須更新対象ファイルが全て更新されている
- [ ] Step 3: IPC契約検証（Phase 1-6）が全て完了している
- [ ] Step 3: ハンドラ引数形式とPreload側の呼び出し形式が一致している
- [ ] Step 3: 引数名のセマンティクスが実際の値と一致している（P45対策）
- [ ] Step 3: P42準拠3段バリデーションが全ハンドラに実装されている
- [ ] ドキュメント更新履歴が各Stepの実施状況を含めて作成されている
- [ ] `artifacts.json` の Phase 12 ステータスが更新されている
- [ ] `outputs/artifacts.json` が `artifacts.json` と同期されている
- [ ] 未タスク検出レポートが作成されている（0件でも必須）
- [ ] 検出した未タスクは3ステップ（指示書・残課題テーブル・関連仕様書リンク）全完了している
- [ ] 未タスク指示書は `unassigned-task/` ディレクトリ配下に配置されている（P38対策）
- [ ] `unassigned-task-detection.md` の件数・ステータスが更新されている
- [ ] スキルフィードバックレポートが作成されている（改善点なしでも必須）

---

## フォールバック手順

Step 1-AでLOGS.md/SKILL.mdが見つからない場合:

1. ワークツリー環境のため、スキルディレクトリが存在しない場合がある
2. その場合は `outputs/phase-12/spec-update-summary.md` に「ワークツリー環境のためスキップ」と理由を記載する
3. メインリポジトリへのマージ後にLOGS.md/SKILL.mdを更新する旨を記録する

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 全完了条件チェックリスト（22項目）を確認済み

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9J-skill-analytics/phase-13-pr-creation.md`
