# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 12                                                |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001              |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix |
| 作成日   | 2026-03-17                                        |
| 前Phase  | [Phase 11: 手動テスト](./phase-11-manual-test.md) |
| 後Phase  | [Phase 13: PR 作成](./phase-13-pr-creation.md)    |

## 目的

実装内容を文書化し、システム仕様書を更新する。
未タスクがあれば検出・記録する。
スキルフィードバックレポートを作成する。

## 背景

Phase 12 は漏れが最も発生しやすい Phase であるため、既知の落とし穴を事前に確認すること。

### 事前確認必須: 既知の落とし穴

| Pitfall ID | タイトル                                 | 対策                                                                            |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements と task-specification-creator の**2ファイル両方**を更新 |
| P2         | topic-map.md 再生成忘れ                  | 仕様書に変更があれば**必ず**再生成を実行                                        |
| P27        | topic-map.md 再生成トリガー判断ミス      | セクション削除・更新も再生成トリガーに含める                                    |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md も更新                                              |
| P3         | 未タスク管理の3ステップ不完全            | 指示書 → 残課題テーブル → 関連仕様書リンク の全ステップ                         |
| P4         | documentation-changelog 早期「完了」記載 | 全 Step 確認前に「完了」と記載しない                                            |
| P25        | LOGS.md 2ファイル更新漏れ（再発）        | P1 と同様。明示的にチェック                                                     |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」として作成                                        |
| P31        | システム仕様書更新漏れ（複数ファイル）   | IPC 関連では5ファイル以上を確認                                                 |

## 実行タスク

> 以下の5タスクを全て実行してください（全タスク必須）。

### タスク 1: 実装ガイド作成

**目的**: SKILL_UPDATE ハンドラおよび getDetail / update Preload API の使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. IPC ドキュメント（チャンネル仕様）を作成する

#### Part 1: 概念的説明（中学生レベル — 日常例え必須）

以下の構成で作成すること:

```markdown
# IPC層整合性修正 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### 「デッドチャンネル」とは？

デッドチャンネルとは、**存在するが誰も取り次いでくれない電話番号**のようなものです。

電話帳（チャンネル定数）には番号が載っている。
電話（invoke）はかけられる。
でも受話器を取る人（ipcMain.handle）がいない。
→ 永遠に呼び出し音が鳴り続ける、またはエラーになる。

本タスクはこの「受話器を取る人」を追加しました。

### 修正した2つの問題

| 問題                                | 例え                               | 解決策                         |
| ----------------------------------- | ---------------------------------- | ------------------------------ |
| SKILL_UPDATE デッドチャンネル       | 受話器を取る人がいない電話番号     | ipcMain.handle を追加した      |
| SKILL_GET_DETAIL Preload API 未公開 | 窓口看板はあるが窓口が開いていない | getDetail() メソッドを追加した |
```

#### Part 2: 技術者向け実装詳細

以下の構成で作成すること:

```markdown
## Part 2: 技術者向け実装詳細

### 実装概要

| 項目               | 値                                           |
| ------------------ | -------------------------------------------- |
| 修正ファイル数     | 2                                            |
| ハンドラーファイル | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`      |

### 追加した IPC ハンドラー / Preload API

#### SKILL_UPDATE ハンドラ（skillHandlers.ts）

- P42 準拠3段バリデーション（typeof → 空文字列 → trim）
- P45 準拠命名（skillName、skillId ではない）
- P5 対策 unregister 登録済み

#### getDetail / update Preload API（skill-api.ts）

- safeInvoke で IPC_CHANNELS 定数を使用
- P42 準拠バリデーションエラー処理
```

#### IPC ドキュメント

以下の構成で作成すること:

```markdown
### IPC チャンネル仕様（追加分）

| チャンネル名    | 引数                                                | 戻り値        | 説明                 |
| --------------- | --------------------------------------------------- | ------------- | -------------------- |
| skill:update    | skillName: string, updates: Record<string, unknown> | void          | スキルを更新する     |
| skill:getDetail | skillId: string                                     | Skill \| null | スキル詳細を取得する |
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク 2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> 参照: `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

**2ステップで実行**:

#### Step 1: タスク完了記録（必須）

##### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加する（`api-ipc-agent.md` 等）
- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `task-specification-creator/LOGS.md` を更新する（**2ファイル両方** — P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する（P29 対策）

##### Step 1-B: 実装状況テーブル更新

- [ ] `api-ipc-agent.md` に `skill:update` / `skill:getDetail` の実装ステータスを更新する

##### Step 1-C: 関連タスクテーブル更新

```bash
# TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 を含む仕様書を検索する
grep -rn "TASK-IMP-IPC-LAYER-INTEGRITY-FIX\|SKILL_UPDATE\|SKILL_GET_DETAIL" \
  .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-IMP-IPC-LAYER-INTEGRITY-FIX\|SKILL_UPDATE\|SKILL_GET_DETAIL" \
  .claude/skills/task-specification-creator/references/
```

- [ ] 検出された仕様書の関連タスクテーブルを更新する

##### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md を再生成する（P2/P27 対策 — 仕様書に変更があれば必ず実行）
cd .claude/skills/aiworkflow-requirements && node generate-index.js
cd .claude/skills/task-specification-creator && node generate-index.js
```

- [ ] `aiworkflow-requirements/references/topic-map.md` を再生成した
- [ ] `task-specification-creator/references/topic-map.md` を再生成した

#### Step 2: システム仕様更新（IPC追加更新対象）

**更新判断**: SKILL_UPDATE ハンドラ新規追加・SKILL_GET_DETAIL Preload API 追加のため、IPC 関連仕様書の更新が**必要**。

**IPC 追加更新対象ファイル**:

| #   | 更新対象ファイル                | 更新内容                                                       | 必須/任意 |
| --- | ------------------------------- | -------------------------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`              | SKILL_UPDATE / SKILL_GET_DETAIL の仕様追加・実装ステータス更新 | 必須      |
| 2   | `security-electron-ipc.md`      | P42 3段バリデーション・P45 命名統一パターンを追記              | 必須      |
| 3   | `interfaces-agent-sdk-skill.md` | getDetail / update のインターフェース定義追加                  | 必須      |
| 4   | `task-workflow.md`              | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 を完了タスクに記録        | 必須      |
| 5   | `architecture-overview.md`      | IPCハンドラー一覧に SKILL_UPDATE を追加                        | 必須      |
| 6   | `lessons-learned.md`            | P42/P45 対応の実装教訓                                         | 任意      |

**更新チェックリスト（P31 対策 — 複数ファイル更新漏れ防止）**:

- [ ] `api-ipc-agent.md` に2チャンネルの仕様と実装ステータスを追加した
- [ ] `security-electron-ipc.md` に P42/P45 バリデーションパターンを追記した
- [ ] `interfaces-agent-sdk-skill.md` に getDetail / update のインターフェースを追加した
- [ ] `task-workflow.md` に完了タスクとして TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 を記録した
- [ ] `architecture-overview.md` のIPCハンドラー一覧を更新した

#### Step 3: IPC 契約検証（IPC修正タスクのため必須）

- [ ] ipc-contract-checklist.md Phase 1-6 を実施済み（Phase 10 タスク 1 の結果を参照）
- [ ] ハンドラー引数形式と Preload 側の呼び出し形式が一致していることを確認済み
- [ ] 引数名のセマンティクスが実際の値と一致していることを確認済み（P45 対策）
- [ ] P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装済みであることを確認済み

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`

---

### タスク 3: ドキュメント更新履歴作成 & artifacts.json 更新

**目的**: 本タスクで行ったドキュメント更新を記録する

**実行手順**:

1. 更新した全仕様書の変更内容を記録する
2. 各 Step の完了結果を詳細に記録する（漏れの可視化）
3. `artifacts.json` の Phase 12 ステータスを `completed` に更新する

**DON'T**: 全 Step 確認前に「完了」と記載しない（P4 対策）

**更新履歴テンプレート**:

```markdown
# TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 ドキュメント更新履歴

## 作成日

2026-03-17

## 更新したファイル

| ファイル                                   | 変更種別 | 内容                                      |
| ------------------------------------------ | -------- | ----------------------------------------- |
| apps/desktop/src/main/ipc/skillHandlers.ts | 修正     | SKILL_UPDATE ハンドラ追加・unregister追加 |
| apps/desktop/src/preload/skill-api.ts      | 修正     | getDetail / update メソッド追加           |

## Step 完了ステータス

### Step 1-A: タスク完了記録

- [ ] 各項目の実施状況

### Step 1-B: 実装状況テーブル

- [ ] 各項目の実施状況

### Step 1-C: 関連タスクテーブル

- [ ] 各項目の実施状況

### Step 1-D: topic-map.md 再生成

- [ ] 各項目の実施状況

### Step 2: システム仕様更新（IPC追加更新対象）

- [ ] 各ファイルの更新状況

### Step 3: IPC 契約検証

- [ ] 各項目の確認状況
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク 4: 未タスク検出レポート作成

**目的**: 残課題や未対応事項を検出・記録する（**0件でも出力必須**）

**実行手順**:

1. Phase 3（設計レビュー）の指摘事項を確認する
2. Phase 10（最終レビュー）の指摘事項（MINOR 判定分）を確認する
3. Phase 11（手動テスト）の発見課題を確認する
4. コードベースの TODO/FIXME を検索する
5. 検出結果を記録する（0件でも「検出タスクなし」と明記する）

**検出コマンド**:

```bash
# TODO/FIXME 検索
grep -rn "TODO\|FIXME" \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/preload/skill-api.ts

# P52 対策: 同ファイル内の non-null assertion 残存確認
grep -n '!' \
  apps/desktop/src/main/ipc/skillHandlers.ts | grep -v "!=" | head -20
```

**未タスク検出時の3ステップ（P3 対策）**:

検出した未タスクは以下の3ステップを**全て**完了する:

1. `docs/30-workflows/skill-lifecycle-routing/tasks/unassigned-task/` に指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**再評価クローズ時の注意（P56 対策）**:

- 未タスクを再評価クローズする場合は、対応する GitHub Issue も `gh issue close` で同時にクローズする

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

### タスク 5: スキルフィードバックレポート作成

**目的**: 実装プロセスで得られたスキル改善点を記録する（**改善点なしでも作成必須** — P28 対策）

**実行手順**:

1. Phase 1〜11 の実行で発見したワークフロー改善点を振り返る
2. task-specification-creator スキルの改善提案があれば記録する
3. 改善点がない場合は「改善点なし」の理由を記載する

**レポートテンプレート**:

```markdown
# スキルフィードバックレポート - TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001

## 対象スキル

- task-specification-creator

## 改善提案

（改善点がある場合は記載。ない場合は以下）

### 改善点なし

- 理由: （具体的な理由を記載）

## ワークフロー改善点

（Phase 実行中に発見した改善点。IPC タスク特有の知見があれば記載）

## P42/P45 対応における学び

（3段バリデーション・命名統一の実装で得られた教訓）
```

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準     |
| IPC 契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | Phase 1-6 手順   |
| 実装ファイル            | `apps/desktop/src/main/ipc/skillHandlers.ts`                                   | 実装コード       |
| Phase 11 発見課題       | `outputs/phase-11/discovered-issues.md`                                        | 発見課題         |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P31   |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | 必須チェック項目 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容     |
| -------------------------- | --------------------------------------------------------------------------------- | -------- |
| IPC Agent 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 更新対象 |
| セキュリティ IPC 仕様      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | 更新対象 |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 更新対象 |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 更新対象 |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 更新対象 |

---

## 成果物

| 成果物               | パス                                          | 内容                      |
| -------------------- | --------------------------------------------- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Part 1 + Part 2 + IPC仕様 |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`     | Step 1-3 の実施結果       |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 全更新内容の記録          |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md`  | 残課題（0件でも必須）     |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`   | スキル改善提案            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細 + IPC仕様）が作成されている
- [ ] Step 1-A: LOGS.md **2ファイル両方**が更新されている
- [ ] Step 1-A: SKILL.md **2ファイル両方**の変更履歴が更新されている
- [ ] Step 1-B: `api-ipc-agent.md` に2チャンネルの実装ステータスが更新されている
- [ ] Step 1-C: `grep` で検出された関連仕様書が更新されている
- [ ] Step 1-D: `topic-map.md` が再生成されている（**2ファイル両方**）
- [ ] Step 2: 5つの必須更新対象ファイルが全て更新されている
- [ ] Step 3: IPC 契約検証が完了している
- [ ] ドキュメント更新履歴が各 Step の実施状況を含めて作成されている
- [ ] `artifacts.json` の Phase 12 ステータスが更新されている
- [ ] 未タスク検出レポートが作成されている（0件でも必須）
- [ ] 検出した未タスクは3ステップ（指示書・残課題テーブル・関連仕様書リンク）全完了している
- [ ] `unassigned-task-detection.md` の件数・ステータスが更新されている
- [ ] スキルフィードバックレポートが作成されている（改善点なしでも必須）

---

## フォールバック手順

Step 1-A で LOGS.md/SKILL.md が見つからない場合:

1. ワークツリー環境のため、スキルディレクトリが存在しない場合がある
2. その場合は `outputs/phase-12/spec-update-summary.md` に「ワークツリー環境のためスキップ」と理由を記載する
3. メインリポジトリへのマージ後に LOGS.md/SKILL.md を更新する旨を記録する

---

## タスク100%実行確認【必須】

- [ ] **本Phase内の全タスクを100%実行完了**
- [ ] 各タスクの成果物（5ファイル）が生成されている
- [ ] 全完了条件チェックリストを確認済み

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 12
```

## 次Phase

Phase 13: PR 作成（[phase-13-pr-creation.md](./phase-13-pr-creation.md)）
