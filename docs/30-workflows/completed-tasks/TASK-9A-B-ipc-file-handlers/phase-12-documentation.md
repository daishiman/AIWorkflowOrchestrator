# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 12                          |
| Phase名    | ドキュメント更新            |
| タスクID   | TASK-9A-B                   |
| 前提Phase  | Phase 11（手動テスト検証）  |
| 後続Phase  | Phase 13（PR作成）          |
| ステータス | 完了                        |
| 作成日     | 2026-02-19                  |
| 機能名     | TASK-9A-B-ipc-file-handlers |

---

## 目的

実装内容を文書化し、システム仕様書を更新する。
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

---

## 実行タスク

> 以下のタスク5つを全て実行してください（全タスク必須）。

### タスク1: 実装ガイド作成

**目的**: 6つのファイル編集IPCハンドラーの使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. IPC ドキュメント（チャンネル仕様）を作成する

#### Part 1: 概念的説明（中学生レベル — 日常例え必須）

以下の構成で作成すること:

```markdown
# ファイル編集IPCハンドラー 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### IPCハンドラーとは？

IPCハンドラーは、**お店の受付カウンター**のようなものです。

想像してみてください。大きなビルの1階にある受付カウンターを。
お客さん（画面の操作部分）は直接バックオフィス（コンピューターの奥の部分）に
入ることはできません。

- **お客さん（Renderer）**: アプリの画面を操作している人
- **受付カウンター（IPCハンドラー）**: リクエストを受け取って処理する窓口
- **バックオフィス（Main Process）**: 実際にファイルを読み書きする場所

### パストラバーサル防止とは？

これは**住所の偽造防止**のようなものです。

受付カウンターに「隣のビルのファイルを見せて」と言っても、
「それはうちの管轄外なので見せられません」と断られます。
これがパストラバーサル防止です。

お客さんが `../../../etc/passwd` というパスを指定しても、
受付カウンターが「このパスは不正です」と拒否します。

### 6つの操作

| 操作          | 日常の例え                           |
| ------------- | ------------------------------------ |
| readFile      | 図書館で本を借りて内容を読む         |
| writeFile     | ノートに内容を書き込む               |
| createFile    | 新しいノートを1冊作る                |
| deleteFile    | 不要なノートをゴミ箱に入れる         |
| listBackups   | バックアップフォルダの一覧を確認する |
| restoreBackup | バックアップから元の状態に戻す       |
```

#### Part 2: 技術者向け実装詳細

以下の構成で作成すること:

```markdown
## Part 2: 技術者向け実装詳細

### 実装概要

| 項目               | 値                                           |
| ------------------ | -------------------------------------------- |
| チャンネル数       | 6                                            |
| ハンドラーファイル | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`      |
| 型定義             | `apps/desktop/src/preload/types.ts`          |

### 6チャンネルのインターフェース

（各チャンネルの引数型、戻り値型、TypeScriptインターフェースを記載）

### セキュリティ検証フロー

1. validateIpcSender → 2. validatePath → 3. try/catch → 4. sanitizeErrorMessage

### エラーハンドリングパターン

（統一されたエラーレスポンス形式の説明）
```

#### IPC ドキュメント

以下の構成で作成すること:

```markdown
### IPC チャンネル仕様

| チャンネル名        | 引数                             | 戻り値                | 説明             |
| ------------------- | -------------------------------- | --------------------- | ---------------- |
| skill:readFile      | { skillName, filePath }          | { content }           | ファイル読み込み |
| skill:writeFile     | { skillName, filePath, content } | void                  | ファイル書き込み |
| skill:createFile    | { skillName, filePath, content } | void                  | ファイル作成     |
| skill:deleteFile    | { skillName, filePath }          | void                  | ファイル削除     |
| skill:listBackups   | { skillName }                    | { backups: Backup[] } | バックアップ一覧 |
| skill:restoreBackup | { skillName, backupId }          | void                  | バックアップ復元 |
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

以下の4項目を**全て**実施する:

- [ ] 該当仕様書にタスク完了記録を追加する（`api-ipc-agent.md` 等）
- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `task-specification-creator/LOGS.md` を更新する（**2ファイル両方** — P1/P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する（P29対策）

##### Step 1-B: 実装状況テーブル更新

- [ ] `api-ipc-agent.md` に6チャンネルの実装ステータスを追加する

##### Step 1-C: 関連タスクテーブル更新

```bash
# TASK-9A-B を含む仕様書を検索する
grep -rn "TASK-9A-B\|TASK-9A-A\|TASK-9A-C" .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-9A-B\|TASK-9A-A\|TASK-9A-C" .claude/skills/task-specification-creator/references/
```

- [ ] 検出された仕様書の関連タスクテーブルを更新する

##### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md を再生成する（P2/P27対策 — 仕様書に変更があれば必ず実行）
cd .claude/skills/aiworkflow-requirements && node generate-index.js
cd .claude/skills/task-specification-creator && node generate-index.js
```

- [ ] `aiworkflow-requirements/references/topic-map.md` を再生成した
- [ ] `task-specification-creator/references/topic-map.md` を再生成した

#### Step 2: システム仕様更新（本タスクでは**必須**）

**更新判断**: 新規IPCチャンネル6つを追加するため、システム仕様の更新が**必要**。

**IPC機能開発のため必須の更新対象ファイル**:

| #   | 更新対象ファイル                          | 更新内容                                     | 必須/任意 |
| --- | ----------------------------------------- | -------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`                        | 新規6チャンネル一覧、引数型、戻り値型        | 必須      |
| 2   | `security-electron-ipc.md`                | ファイル操作のセキュリティ検証パターン       | 必須      |
| 3   | `architecture-overview.md`                | IPCハンドラー登録一覧にファイル操作を追加    | 必須      |
| 4   | `interfaces-agent-sdk-skill.md`           | SkillFileManager インターフェース定義        | 必須      |
| 5   | `task-workflow.md`                        | 完了タスクセクション追加、残課題テーブル更新 | 必須      |
| 6   | `lessons-learned.md`                      | 実装で得られた教訓                           | 任意      |
| 7   | `architecture-implementation-patterns.md` | 実装パターン追加                             | 任意      |

**更新チェックリスト（P31対策 — 複数ファイル更新漏れ防止）**:

- [ ] `api-ipc-agent.md` に6チャンネルの仕様を追加した
- [ ] `security-electron-ipc.md` にファイル操作のセキュリティパターンを追加した
- [ ] `architecture-overview.md` のIPCハンドラー一覧を更新した
- [ ] `interfaces-agent-sdk-skill.md` にインターフェース定義を追加した
- [ ] `task-workflow.md` に完了タスクとして TASK-9A-B を記録した

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`

---

### タスク3: ドキュメント更新履歴作成 & artifacts.json更新

**目的**: 本タスクで行ったドキュメント更新を記録する

**実行手順**:

1. 更新した全仕様書の変更内容を記録する
2. 各 Step の完了結果を詳細に記録する（漏れの可視化）
3. `artifacts.json` の Phase 12 ステータスを `completed` に更新する

**⚠️ DON'T**: 全 Step 確認前に「完了」と記載しない（P4対策）

**更新履歴テンプレート**:

```markdown
# TASK-9A-B ドキュメント更新履歴

## 作成日

2026-02-19

## 更新したファイル

| ファイル                            | 変更種別 | 内容                   |
| ----------------------------------- | -------- | ---------------------- |
| skillHandlers.ts                    | 修正     | 6ハンドラー追加        |
| skill-api.ts                        | 修正     | 6メソッド追加          |
| channels.ts                         | 修正     | 6チャンネル定数追加    |
| types.ts                            | 修正     | 型定義追加             |
| packages/shared/src/ipc/channels.ts | 修正     | 共有チャンネル定数追加 |

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
5. 検出結果を記録する（0件でも「検出タスクなし」と明記する）

**検出コマンド**:

```bash
# TODO/FIXME検索
grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/skillHandlers.ts
grep -rn "TODO\|FIXME" apps/desktop/src/preload/skill-api.ts
```

**未タスク検出時の3ステップ（P3対策）**:

検出した未タスクは以下の3ステップを**全て**完了する:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

### タスク5: スキルフィードバックレポート作成

**目的**: 実装プロセスで得られたスキル改善点を記録する（**改善点なしでも作成必須** — P28対策）

**実行手順**:

1. Phase 1〜11 の実行で発見したワークフロー改善点を振り返る
2. task-specification-creator スキルの改善提案があれば記録する
3. 改善点がない場合は「改善点なし」の理由を記載する

**レポートテンプレート**:

```markdown
# スキルフィードバックレポート - TASK-9A-B

## 対象スキル

- task-specification-creator

## 改善提案

（改善点がある場合は記載。ない場合は以下）

### 改善点なし

- 理由: （具体的な理由を記載）

## ワークフロー改善点

（Phase実行中に発見した改善点）
```

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準     |
| 実装ファイル            | `apps/desktop/src/main/ipc/skillHandlers.ts`                                   | 実装コード       |
| Phase 11 発見課題       | `outputs/phase-11/discovered-issues.md`                                        | 発見課題         |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P31   |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | 必須チェック項目 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容     |
| -------------------------- | --------------------------------------------------------------------------------- | -------- |
| IPC Agent仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 更新対象 |
| セキュリティIPC仕様        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | 更新対象 |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 更新対象 |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 更新対象 |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 更新対象 |

---

## 成果物

| 成果物               | パス                                          | 内容                      |
| -------------------- | --------------------------------------------- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Part 1 + Part 2 + IPC仕様 |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`     | Step 1-2 の実施結果       |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 全更新内容の記録          |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md`  | 残課題（0件でも必須）     |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`   | スキル改善提案            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細 + IPC仕様）が作成されている
- [ ] Step 1-A: LOGS.md **2ファイル両方**が更新されている
- [ ] Step 1-A: SKILL.md **2ファイル両方**の変更履歴が更新されている
- [ ] Step 1-B: `api-ipc-agent.md` に6チャンネルの実装ステータスが追加されている
- [ ] Step 1-C: `grep` で検出された関連仕様書が更新されている
- [ ] Step 1-D: `topic-map.md` が再生成されている（**2ファイル両方**）
- [ ] Step 2: 5つの必須更新対象ファイルが全て更新されている
- [ ] ドキュメント更新履歴が各Stepの実施状況を含めて作成されている
- [ ] `artifacts.json` の Phase 12 ステータスが更新されている
- [ ] 未タスク検出レポートが作成されている（0件でも必須）
- [ ] 検出した未タスクは3ステップ（指示書・残課題テーブル・関連仕様書リンク）全完了している
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
- [ ] 全完了条件チェックリストを確認済み

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-13-pr-creation.md`
