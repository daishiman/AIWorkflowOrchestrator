# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| タスクID   | TASK-9G                    |
| 前提Phase  | Phase 11（手動テスト検証） |
| 後続Phase  | Phase 13（PR作成）         |
| ステータス | 完了（2026-02-27）         |
| 作成日     | 2026-02-27                 |
| 機能名     | TASK-9G-skill-schedule     |

---

## 目的

スキルスケジュール実行機能の実装内容を文書化し、システム仕様書を更新する。
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
| P27        | topic-map.md 再生成トリガー判断ミス      | セクション削除・更新も再生成トリガーに含める                                    |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md も更新                                              |
| P3         | 未タスク管理の3ステップ不完全            | ①指示書 → ②残課題テーブル → ③関連仕様書リンク の全ステップ                      |
| P4         | documentation-changelog 早期「完了」記載 | 全 Step 確認前に「完了」と記載しない                                            |
| P25        | LOGS.md 2ファイル更新漏れ（再発）        | P1と同様。明示的にチェック                                                      |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」として作成                                        |
| P31        | システム仕様書更新漏れ（複数ファイル）   | IPC関連では5ファイル以上を確認                                                  |
| P43        | サブエージェントの rate limit 中断       | 仕様書更新は3ファイル以下/エージェントに分割する                                |

---

## 実行タスク

> 以下のタスク5つを全て実行してください（全タスク必須）。

- Task 1: 実装ガイド（Part 1/Part 2）を作成する
- Task 2: システム仕様書更新（Step 1-A〜1-D + Step 2）を実行する
- Task 3: ドキュメント更新履歴と artifacts 台帳（`artifacts.json` / `outputs/artifacts.json`）を更新する
- Task 4: 未タスク検出レポートを作成する
- Task 5: スキルフィードバックレポートを作成する

### タスク1: 実装ガイド作成

**目的**: スキルスケジュール実行機能の使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. IPC ドキュメント（チャンネル仕様）を作成する

#### Part 1: 概念的説明（中学生レベル — 日常例え必須）

以下の構成で作成すること:

```markdown
# スキルスケジュール実行機能 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### スキルスケジュールとは？

スキルスケジュールは、**スマートフォンのアラーム機能**のようなものです。

想像してみてください。毎朝7時に起きるためにアラームをセットしますよね。
スキルスケジュールも同じで、「毎日午前9時にこのスキルを実行して」と
設定しておけば、自動的にスキルが実行されます。

- **cron式**: 毎日午前9時にアラームが鳴る設定（「0 9 \* \* \*」）
- **interval**: 30分ごとにリマインダーが届く設定
- **once**: 明日の15時に1回だけアラームが鳴る設定
- **event**: スマホの電源を入れたときに自動で天気アプリが開く設定

### ScheduleStoreとは？

これは**アラームの設定を記憶しておくノート**のようなものです。

スマートフォンの電源を切っても、再起動するとアラームの設定は
残っていますよね。ScheduleStoreも同じで、アプリを閉じても
設定したスケジュールは保存されています。

### SkillSchedulerとは？

これは**アラームを実際に鳴らす仕組み**そのものです。

- 設定された時刻を監視する
- 時刻が来たらスキルを実行する
- 実行結果を記録する
- 設定に応じて通知を表示する
```

#### Part 2: 技術者向け実装詳細

以下の構成で作成すること:

```markdown
## Part 2: 技術者向け実装詳細

### 実装概要

| 項目            | 値                                                            |
| --------------- | ------------------------------------------------------------- |
| IPCチャンネル数 | 5                                                             |
| 新規ファイル数  | 3（SkillScheduler.ts, ScheduleStore.ts, skill-schedule.ts）   |
| 修正ファイル数  | 6（skillHandlers.ts, channels.ts, skill-api.ts, types.ts 等） |
| 依存パッケージ  | node-cron, @types/node-cron                                   |

### SkillScheduler API

（初期化フロー、アクティベーション、スケジュール実行ロジックの説明）

### ScheduleStore API

（CRUD操作、永続化方式、データ構造の説明）

### 5チャンネルのインターフェース

| チャンネル名          | 引数                                         | 戻り値           | 説明             |
| --------------------- | -------------------------------------------- | ---------------- | ---------------- |
| skill:schedule:list   | なし                                         | ScheduledSkill[] | スケジュール一覧 |
| skill:schedule:add    | { skillName, schedule, notification? }       | ScheduledSkill   | スケジュール追加 |
| skill:schedule:update | { id, schedule?, notification?, isEnabled? } | ScheduledSkill   | スケジュール更新 |
| skill:schedule:delete | scheduleId: string                           | void             | スケジュール削除 |
| skill:schedule:toggle | scheduleId: string                           | ScheduledSkill   | 有効/無効切替    |

### 型定義

（ScheduledSkill, SkillSchedule, NotificationSettings, ScheduledRunResult の説明）

### セキュリティ検証フロー

1. validateIpcSender → 2. 引数バリデーション（P42準拠3段） → 3. try/catch → 4. sanitizeErrorMessage

### エラーハンドリングパターン

（統一されたエラーレスポンス形式の説明）

### Date型のIPCシリアライズ

（ISO 8601文字列への変換とデシリアライズの説明）
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2 + IPC仕様を含む1ファイル）

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> **重要**: 📖 `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照してください。

**⚠️ 2ステップで実行:**

#### Step 1: タスク完了記録（必須）

##### Step 1-A: タスク完了記録

以下の項目を**全て**実施する:

- [ ] `api-ipc-agent.md` にタスク完了記録を追加する（新規5チャンネル追加）
- [ ] `arch-electron-services.md` にSkillSchedulerサービス追加を記録する
- [ ] `interfaces-agent-sdk-skill.md` にスケジュール型定義追加を記録する
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` を更新する（**2ファイル両方** — P1/P25対策）
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新する（P29対策）

##### Step 1-B: 実装状況テーブル更新

- [ ] `api-ipc-agent.md` に5チャンネルの実装ステータスを追加する

##### Step 1-C: 関連タスクテーブル更新

```bash
# TASK-9G を含む仕様書を検索する
grep -rn "TASK-9G" .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-9G" .claude/skills/task-specification-creator/references/
```

- [ ] 検出された仕様書の関連タスクテーブルを更新する

##### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md を再生成する（P2/P27対策 — 仕様書に変更があれば必ず実行）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を再生成した

#### Step 2: システム仕様更新（本タスクでは**必須**）

**更新判断**: 新規IPCチャンネル5つ、新規サービス（SkillScheduler）、新規型定義を追加するため、システム仕様の更新が**必要**。

**IPC機能開発のため必須の更新対象ファイル**:

| #   | 更新対象ファイル                          | 更新内容                                                                     | 必須/任意 |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`                        | 新規5チャンネル一覧、引数型、戻り値型                                        | 必須      |
| 2   | `arch-electron-services.md`               | SkillSchedulerサービス、ScheduleStore の設計記載                             | 必須      |
| 3   | `security-electron-ipc.md`                | スケジュール操作のセキュリティ検証パターン                                   | 必須      |
| 4   | `architecture-overview.md`                | IPCハンドラー登録一覧にスケジュール操作を追加                                | 必須      |
| 5   | `interfaces-agent-sdk-skill.md`           | ScheduledSkill, SkillSchedule, NotificationSettings, ScheduledRunResult 定義 | 必須      |
| 6   | `task-workflow.md`                        | 完了タスクセクション追加、残課題テーブル更新                                 | 必須      |
| 7   | `lessons-learned.md`                      | 実装で得られた教訓（node-cron統合、タイマー管理等）                          | 任意      |
| 8   | `architecture-implementation-patterns.md` | スケジューラパターン追加                                                     | 任意      |
| 9   | `security-skill-ipc.md`                   | Skill系IPCのセキュリティ運用パターン反映                                     | 任意      |
| 10  | `ipc-type-resolution-guide.md`            | Date型ISO 8601変換とIPC境界契約の更新                                        | 任意      |

**⚠️ P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。以下の2グループに分けて実行すること:

- **グループA**: api-ipc-agent.md, arch-electron-services.md, security-electron-ipc.md
- **グループB**: architecture-overview.md, interfaces-agent-sdk-skill.md, task-workflow.md

**更新チェックリスト（P31対策 — 複数ファイル更新漏れ防止）**:

- [ ] `api-ipc-agent.md` に5チャンネルの仕様を追加した
- [ ] `arch-electron-services.md` にSkillScheduler/ScheduleStoreの設計を追加した
- [ ] `security-electron-ipc.md` にスケジュール操作のセキュリティパターンを追加した
- [ ] `architecture-overview.md` のIPCハンドラー一覧を更新した
- [ ] `interfaces-agent-sdk-skill.md` にインターフェース定義を追加した
- [ ] `task-workflow.md` に完了タスクとして TASK-9G を記録した

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
# TASK-9G ドキュメント更新履歴

## 作成日

2026-02-XX

## 更新したファイル

| ファイル                                               | 変更種別 | 内容                             |
| ------------------------------------------------------ | -------- | -------------------------------- |
| apps/desktop/src/main/services/skill/SkillScheduler.ts | 新規     | スケジューラサービス             |
| apps/desktop/src/main/services/skill/ScheduleStore.ts  | 新規     | スケジュール永続化               |
| packages/shared/src/types/skill-schedule.ts            | 新規     | スケジュール型定義               |
| apps/desktop/src/main/ipc/skillHandlers.ts             | 修正     | 5ハンドラー追加                  |
| apps/desktop/src/preload/channels.ts                   | 修正     | 5チャンネル定数追加              |
| apps/desktop/src/preload/skill-api.ts                  | 修正     | scheduleメソッド追加             |
| apps/desktop/src/preload/types.ts                      | 修正     | SkillAPI型にscheduleメソッド追加 |
| apps/desktop/src/main/ipc/index.ts                     | 修正     | SkillScheduler.initialize()追加  |
| packages/shared/src/types/index.ts                     | 修正     | skill-schedule re-export追加     |

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
5. スコープ外項目（UIコンポーネント等）を確認する
6. 検出結果を記録する（0件でも「検出タスクなし」と明記する）

**検出コマンド**:

```bash
# TODO/FIXME検索
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/SkillScheduler.ts
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/ScheduleStore.ts
grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/skillHandlers.ts
grep -rn "TODO\|FIXME" packages/shared/src/types/skill-schedule.ts
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
| スケジュール管理UI      | task-031b で定義済み。本タスクでは対象外 |
| ScheduleSkillDialog     | task-031b で定義済み。本タスクでは対象外 |
| CronEditor              | task-031b で定義済み。本タスクでは対象外 |
| ScheduleList            | task-031b で定義済み。本タスクでは対象外 |
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
# スキルフィードバックレポート - TASK-9G

## 対象スキル

- task-specification-creator

## 改善提案

（改善点がある場合は記載。ない場合は以下）

### 改善点なし

- 理由: （具体的な理由を記載）

## ワークフロー改善点

（Phase実行中に発見した改善点。例: node-cron統合時の教訓、タイマーテストのパターン等）
```

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準     |
| SkillScheduler実装      | `apps/desktop/src/main/services/skill/SkillScheduler.ts`                       | 実装コード       |
| ScheduleStore実装       | `apps/desktop/src/main/services/skill/ScheduleStore.ts`                        | 実装コード       |
| Phase 1成果物           | `outputs/phase-1/requirements-definition.md`                                   | 要件定義         |
| Phase 2成果物           | `outputs/phase-2/architecture-design.md`                                       | 設計仕様         |
| Phase 5成果物           | `outputs/phase-5/implementation-summary.md`                                    | 実装結果         |
| Phase 6成果物           | `outputs/phase-6/coverage-report.md`                                           | テスト拡充結果   |
| Phase 7成果物           | `outputs/phase-7/coverage-report.md`                                           | カバレッジ結果   |
| Phase 8成果物           | `outputs/phase-8/refactoring-log.md`                                           | リファクタ結果   |
| Phase 9成果物           | `outputs/phase-9/quality-report.md`                                            | 品質保証結果     |
| Phase 10成果物          | `outputs/phase-10/final-review-result.md`                                      | 最終レビュー結果 |
| Phase 11 発見課題       | `outputs/phase-11/discovered-issues.md`                                        | 発見課題         |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P43   |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | 必須チェック項目 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容          |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------- |
| IPC Agent仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 更新対象      |
| Electronサービス設計       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | 更新対象      |
| セキュリティIPC仕様        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | 更新対象      |
| Skill IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 参照必須      |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 更新対象      |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 更新対象      |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 参照必須      |
| IPC型不整合ガイド          | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | Date/引数整合 |
| 実装パターン集             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 任意更新      |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 更新対象      |

---

## 成果物

| 成果物               | パス                                            | 内容                      |
| -------------------- | ----------------------------------------------- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2 + IPC仕様 |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-2 の実施結果       |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 全更新内容の記録          |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-detection.md` | 残課題（0件でも必須）     |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | スキル改善提案            |

---

## 完了条件

- [x] 実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細 + IPC仕様）が作成されている
- [x] Step 1-A: `api-ipc-agent.md` にタスク完了記録が追加されている
- [x] Step 1-A: `arch-electron-services.md` にSkillSchedulerサービスが追加されている
- [x] Step 1-A: `interfaces-agent-sdk-skill.md` にスケジュール型定義が追加されている
- [x] Step 1-A: LOGS.md **2ファイル両方**が更新されている
- [x] Step 1-A: SKILL.md **2ファイル両方**の変更履歴が更新されている
- [x] Step 1-B: `api-ipc-agent.md` に5チャンネルの実装ステータスが追加されている
- [x] Step 1-C: `grep` で検出された関連仕様書が更新されている
- [x] Step 1-D: `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` が再生成されている
- [x] Step 2: 6つの必須更新対象ファイルが全て更新されている
- [x] ドキュメント更新履歴が各Stepの実施状況を含めて作成されている
- [x] `artifacts.json` の Phase 12 ステータスが更新されている
- [x] `outputs/artifacts.json` が `artifacts.json` と同期されている
- [x] 未タスク検出レポートが作成されている（0件でも必須）
- [x] 検出した未タスクは3ステップ（指示書・残課題テーブル・関連仕様書リンク）全完了している
- [x] `unassigned-task-detection.md` の件数・ステータスが更新されている
- [x] スキルフィードバックレポートが作成されている（改善点なしでも必須）

---

## フォールバック手順

Step 1-AでLOGS.md/SKILL.mdが見つからない場合:

1. ワークツリー環境のため、スキルディレクトリが存在しない場合がある
2. その場合は `outputs/phase-12/spec-update-summary.md` に「ワークツリー環境のためスキップ」と理由を記載する
3. メインリポジトリへのマージ後にLOGS.md/SKILL.mdを更新する旨を記録する

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスク（5タスク）を100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物（5ファイル）が全て生成されていることを確認
- [x] 全完了条件チェックリストを確認済み

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-13-pr-creation.md`
