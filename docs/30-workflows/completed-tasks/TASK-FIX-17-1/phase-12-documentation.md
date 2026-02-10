# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 12                                 |
| Phase名    | ドキュメント更新                   |
| 前提Phase  | Phase 11 (手動テスト検証)          |
| 後続Phase  | Phase 13 (完了)                    |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| 機能名     | skill:scan IPCハンドラーの新規追加 |

---

## 目的

実装内容のドキュメント化、システムドキュメント更新、未タスク検出、スキルフィードバック・改善・新規作成を行う。

## 背景

`SKILL_SCAN` ハンドラーの実装完了後、知識の形式化と継続的改善のためのドキュメント整備を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: documentation-architecture

**パス**: `.claude/skills/documentation-architecture/SKILL.md`

**Trigger条件**:

- ドキュメント構造設計・作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `phase-outputs/TASK-FIX-17-1/implementation-guide.md`
- `phase-outputs/TASK-FIX-17-1/documentation-update-log.md`

---

### スキル2: skill-creator【必須】

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**:

- スキルフィードバック記録・改善・新規作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「record-feedback」タスクに従って実行
3. 必要に応じて「update」または「create」モードを実行

**期待される成果物**:

- `phase-outputs/TASK-FIX-17-1/skill-feedback-report.md`
- 各スキルのLOGS.md更新
- （該当時）スキル改善実施レポート
- （該当時）新規スキル作成レポート

---

## 参照資料

| 参照資料       | パス                                                | 内容             |
| -------------- | --------------------------------------------------- | ---------------- |
| 実装コード     | `apps/desktop/src/main/ipc/skillHandlers.ts`        | ドキュメント対象 |
| タスク指示書   | `tasks/02b-task-fix-17-1-skill-scan-handler.md`     | 要件情報         |
| チャンネル定義 | `apps/desktop/src/preload/channels.ts`              | IPC設計情報      |
| 手動テスト結果 | `phase-outputs/TASK-FIX-17-1/manual-test-result.md` | テスト結果       |

---

## 成果物

| 成果物                           | パス                                                      | 内容                     |
| -------------------------------- | --------------------------------------------------------- | ------------------------ |
| 実装ガイド                       | `phase-outputs/TASK-FIX-17-1/implementation-guide.md`     | 概念的説明・技術的詳細   |
| ドキュメント更新記録             | `phase-outputs/TASK-FIX-17-1/documentation-update-log.md` | 更新したドキュメント一覧 |
| 未タスク検出レポート             | `phase-outputs/TASK-FIX-17-1/unassigned-task-report.md`   | 検出された未タスク       |
| スキルフィードバックレポート     | `phase-outputs/TASK-FIX-17-1/skill-feedback-report.md`    | スキル実行結果・改善提案 |
| スキル改善実施レポート（該当時） | `phase-outputs/TASK-FIX-17-1/skill-improvement-report.md` | 改善したスキルの一覧     |
| 新規スキル作成レポート（該当時） | `phase-outputs/TASK-FIX-17-1/new-skill-report.md`         | 作成した新規スキルの一覧 |

---

## Phase 12の4つの必須作業

### Task 1: 実装ガイド作成

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する。

#### Part 1: 概念的説明（中学生レベル）

**目的**: 技術的背景がない人でも理解できるよう、IPCハンドラーの役割を日常の例えで説明する。

**必須項目**:

| セクション        | 内容                                         |
| ----------------- | -------------------------------------------- |
| IPCハンドラーとは | 郵便局の窓口係のような役割の説明             |
| なぜ必要か        | アプリの「表」と「裏」が会話するための仕組み |
| SKILL_SCAN の役割 | 「スキル探し」を依頼するための専用窓口       |
| 例え話            | 図書館で新刊リストを更新依頼するような操作   |

**例え話テンプレート**:

```
IPCハンドラーは、銀行の窓口係のようなものです。

お客さん（Renderer プロセス）が「口座残高を確認したい」と言うと、
窓口係（IPC ハンドラー）がバックオフィス（Main プロセス）に確認して、
結果をお客さんに伝えます。

SKILL_SCAN ハンドラーは、特に「新しいスキルがないか探して」という
依頼を専門に受け付ける窓口です。
```

#### Part 2: 技術者向け実装詳細

**必須項目**:

| セクション             | 内容                                            |
| ---------------------- | ----------------------------------------------- |
| ハンドラー登録パターン | `ipcMain.handle()` と `withValidation()` の使用 |
| チャンネル設計         | `IPC_CHANNELS.SKILL_SCAN` の定義と役割          |
| SkillService 連携      | `scanAvailableSkills(true)` の呼び出し          |
| エラーハンドリング     | 失敗時のレスポンス形式                          |
| 型定義                 | 入力型・出力型の詳細                            |

---

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

更新対象のログファイル:

| ファイル                              | 更新内容                     |
| ------------------------------------- | ---------------------------- |
| `aiworkflow-requirements/LOGS.md`     | TASK-FIX-17-1 完了記録を追加 |
| `task-specification-creator/LOGS.md`  | TASK-FIX-17-1 完了記録を追加 |
| `aiworkflow-requirements/SKILL.md`    | 変更履歴セクションを更新     |
| `task-specification-creator/SKILL.md` | 変更履歴セクションを更新     |

**更新フォーマット**:

```markdown
## TASK-FIX-17-1-SKILL-SCAN-HANDLER (2026-02-08)

- skill:scan IPCハンドラーを追加
- skillHandlers.ts に SKILL_SCAN ハンドラーを実装
- 強制再スキャン機能を動作可能に
```

#### Step 1-B: 実装状況テーブル（該当する場合）

更新対象の仕様書:

| ファイル                                                 | 更新内容                        |
| -------------------------------------------------------- | ------------------------------- |
| `aiworkflow-requirements/references/interfaces-skill.md` | SKILL_SCAN 実装ステータスを更新 |

**更新例**:

```markdown
| チャンネル | ハンドラー | 実装状況 |
| ---------- | ---------- | -------- |
| skill:scan | SKILL_SCAN | 実装済み |
```

#### Step 1-C: 関連タスクテーブル

該当なし（新規インターフェース追加ではないため）

#### Step 1-D: topic-map.md 再生成

> ⚠️ **見落としやすい**: 仕様書に新規セクション追加時は必ず実行

**実行手順**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**確認項目**:

- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されている
- [ ] または「変更なし」と判断した理由を documentation-changelog.md に記録した

**本タスクの判断**:

- 新規セクション追加なし → **topic-map.md 再生成不要**（理由を changelog に記録）

---

### Task 2 Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                       | 更新不要                   |
| ------------------------------ | -------------------------- |
| 新規インターフェース/型の追加  | 内部実装の詳細変更のみ     |
| 既存インターフェースの変更     | リファクタリング（IF不変） |
| 新規定数/設定値の追加          | バグ修正（仕様変更なし）   |
| 外部連携インターフェースの追加 | テスト追加のみ             |

**本タスクの判断**:

- SKILL_SCAN ハンドラーは新規追加だが、既存のチャンネル定義を利用
- interfaces-skill.md の実装状況テーブルを更新（Step 1-B で対応済み）
- インターフェース自体の変更はなし → **Step 2 システム仕様更新不要**

**documentation-changelog.md への記録（必須）**:

```markdown
### Step 2: システム仕様更新

- 判断: 更新不要
- 理由: 既存チャンネル定義の利用であり、インターフェース変更なし
```

---

### Task 3: documentation-changelog.md 更新

このタスクで更新した全ドキュメントの変更内容を記録する。

**記録フォーマット**:

```markdown
## TASK-FIX-17-1-SKILL-SCAN-HANDLER (2026-02-08)

### 更新したファイル

| ファイル                           | 変更種別 | 内容                        |
| ---------------------------------- | -------- | --------------------------- |
| skillHandlers.ts                   | 修正     | SKILL_SCAN ハンドラー追加   |
| skillHandlers.test.ts              | 追加     | SKILL_SCAN テストケース追加 |
| aiworkflow-requirements/LOGS.md    | 追記     | タスク完了記録              |
| task-specification-creator/LOGS.md | 追記     | タスク完了記録              |

### Step 完了ステータス

- [x] Step 1-A: タスク完了記録
- [x] Step 1-B: 実装状況テーブル更新
- [ ] Step 1-C: 関連タスクテーブル（該当なし）
- [ ] Step 1-D: topic-map.md 再生成（該当なし - 新規セクション追加なし）
- [ ] Step 2: システム仕様更新（該当なし - インターフェース変更なし）
```

---

### Task 4: 未タスク検出

#### 必須チェック項目

| ソース                 | 確認項目             | 結果     |
| ---------------------- | -------------------- | -------- |
| Phase 3レビュー結果    | MINOR判定の指摘事項  | 該当なし |
| Phase 10レビュー結果   | MINOR判定の指摘事項  | 該当なし |
| Phase 11手動テスト結果 | スコープ外の発見事項 | 確認必要 |
| コードベース           | TODO/FIXME コメント  | 確認必要 |

#### 検出対象の未タスク

| タスクID                           | 概要                  | ステータス |
| ---------------------------------- | --------------------- | ---------- |
| TASK-FIX-5-1-SKILL-API-UNIFICATION | Preload側のスタブ解消 | 既知       |

**TASK-FIX-5-1 の詳細**:

- **Why**: Preload API の `rescan()` がスタブ (`Promise.resolve([])`) のまま
- **What**: `safeInvoke(IPC_CHANNELS.SKILL_SCAN)` に置き換え
- **How**: skill-api.ts L207 を修正

#### 未タスク検出レポート（必須）

**0件の場合でも以下のレポートを作成すること**:

```markdown
# 未タスク検出レポート - TASK-FIX-17-1

## 検出日: 2026-02-08

## 検出結果サマリー

- 新規検出: 0件
- 既知の関連タスク: 1件

## 既知の関連タスク

### TASK-FIX-5-1-SKILL-API-UNIFICATION

- **ステータス**: 未実施
- **関連性**: SKILL_SCAN ハンドラー完了により、Preload 側のスタブ解消が可能に
- **備考**: 本タスク完了が前提条件

## 検出プロセス

- [x] Phase 3レビュー結果確認
- [x] Phase 10レビュー結果確認
- [x] Phase 11手動テスト結果確認
- [x] コードベース TODO/FIXME 検索
- [x] 使用スキル LOGS.md 確認
```

---

## 完了条件

### Task 1: 実装ガイド

- [ ] 実装ガイド Part 1（概念的説明 - 中学生レベル・日常の例え話含む）が作成されている
- [ ] 実装ガイド Part 2（技術者向け詳細 - 型定義・API・エラーハンドリング）が作成されている

### Task 2: システム仕様書更新

- [ ] **【Step 1-A】** LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）が更新されている
- [ ] **【Step 1-A】** SKILL.md 2ファイルの変更履歴が更新されている
- [ ] **【Step 1-B】** 実装状況テーブル（interfaces-skill.md）が更新されている
- [ ] **【Step 1-C】** 関連タスクテーブル更新（または「該当なし」の判断を記録）
- [ ] **【Step 1-D】** topic-map.md 再生成（または「該当なし」の判断を記録）
- [ ] **【Step 2】** システム仕様更新要否を判断し、documentation-changelog.md に記録

### Task 3: documentation-changelog.md

- [ ] ドキュメント更新記録が出力されている
- [ ] 全 Step（1-A/1-B/1-C/1-D/Step 2）の結果が個別に明記されている

### Task 4: 未タスク検出

- [ ] 未タスク検出レポートが出力されている（**0件でも必須**）
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）

### スキルフィードバック

- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] **スキル改善/新規作成が必要な場合、skill-creatorで実行されている**
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックがskill-creatorで記録されている
- [ ] スキル改善/新規作成の判定が完了している

---

## 依存関係

- **前提**: Phase 5, 8, 9, 10, 11 が完了していること
- **後続**: Phase 13 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 使用スキル

| スキル                     | 結果                        | 備考     |
| -------------------------- | --------------------------- | -------- |
| documentation-architecture | {{success/partial/failure}} | {{備考}} |
| skill-creator              | {{success/partial/failure}} | {{備考}} |

### 成果物

- 実装ガイド: {{作成/未作成}}
- ドキュメント更新記録: {{作成/未作成}}
- 未タスク検出レポート: {{作成/未作成}}
- スキルフィードバックレポート: {{作成/未作成}}
- システム仕様更新: {{実施/不要}}

### Task 4 実行結果

- 未タスク検出: {{件数}}
- 既知の関連タスク: TASK-FIX-5-1-SKILL-API-UNIFICATION

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-outputs/TASK-FIX-17-1/phase-13-completion.md`
