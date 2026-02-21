# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| Phase名    | ドキュメント更新                  |
| タスクID   | UT-FIX-SKILL-IMPORT-INTERFACE-001 |
| 前提Phase  | Phase 11（手動テスト検証）        |
| 後続Phase  | Phase 13（PR作成）                |
| ステータス | 完了（2026-02-21 再監査反映）     |
| 作成日     | 2026-02-21                        |
| 機能名     | skill-import-agent-system         |

---

## 目的

実装内容を文書化し、システム仕様書を更新する。
未タスクがあれば検出・記録する。

## 背景

ドキュメントは将来のメンテナンスに不可欠である。
Phase 12 は漏れが最も発生しやすい Phase であるため、以下の既知の落とし穴を事前に確認すること。

### 事前確認必須: 既知の落とし穴（06-known-pitfalls.md）

| Pitfall ID | タイトル                                 | 対策                                                                            |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements と task-specification-creator の**2ファイル両方**を更新 |
| P2         | topic-map.md 再生成忘れ                  | 仕様書に変更があれば**必ず**再生成を実行                                        |
| P27        | topic-map.md 再生成トリガー判断ミス      | セクション削除・更新も再生成トリガーに含める                                    |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md も更新                                              |
| P3         | 未タスク管理の3ステップ不完全            | 指示書 → 残課題テーブル → 関連仕様書リンク の全ステップ                         |
| P4         | documentation-changelog 早期「完了」記載 | 全 Step 確認前に「完了」と記載しない                                            |
| P25        | LOGS.md 2ファイル更新漏れ（再発）        | P1と同様。明示的にチェック                                                      |
| P31        | システム仕様書更新漏れ（複数ファイル）   | IPC関連では複数ファイルを確認                                                   |
| P43        | サブエージェント rate limit 中断         | 仕様書更新は3ファイル以下/エージェントに分割                                    |

---

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

> 以下のタスク4つを全て実行してください（全タスク必須）。

### タスク1: 実装ガイド作成

**目的**: skill:import IPCハンドラのインターフェース不整合修正の内容を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する

#### Part 1: 概念的説明（中学生レベル — 日常例え必須）

以下の構成で作成すること:

```markdown
# skill:import インターフェース不整合修正 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### なぜ修正が必要だったか？

お店の注文カウンターで注文する場面を想像してください。

お客さん（画面）:「カレーライスください」（品名を直接言う）
受付（IPCハンドラ）:「注文用紙に品名リストを書いて渡してください」（注文用紙の形式を期待）

お客さんは品名を直接言っているのに、受付が「注文用紙に書いてある品名リストでしか受け付けません」と
断っていました。これがバグの原因です。

受付側を修正して「品名を直接言ってもらえればOK」にしたのが今回の修正です。

### 修正前と修正後

- **修正前**: 受付が「注文用紙（{ skillIds: ["name1", "name2"] }）」形式でしか受け付けない
- **修正後**: 受付が「品名の直接指定（"name"）」で受け付ける

### バリデーション（チェック）

修正後の受付は3段階でチェックします:

1. 品名が「文字列」であること（数字やオブジェクトは拒否）
2. 品名が空でないこと（「」は拒否）
3. 品名がスペースだけでないこと（「 」は拒否）
```

#### Part 2: 技術者向け実装詳細

以下の構成で作成すること:

```markdown
## Part 2: 技術者向け実装詳細

### 修正概要

| 項目               | 値                                                                       |
| ------------------ | ------------------------------------------------------------------------ |
| 修正ファイル数     | 2（ハンドラ1 + テスト1）                                                 |
| ハンドラーファイル | `apps/desktop/src/main/ipc/skillHandlers.ts`（行120-138）                |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（行630-740） |
| Preload変更        | なし（元から `skillName: string` を送信）                                |

### 修正前後のコード比較

#### 修正前（{ skillIds: string[] } オブジェクト形式を期待）

（修正前コードを記載: args: { skillIds: string[] } を受け取りArray.isArrayで検証）

#### 修正後（skillName: string 直接形式を受け取り）

（修正後コードを記載: skillName: string を受け取りP42準拠3段バリデーション）

### P42準拠3段バリデーション

1. `typeof skillName !== "string"` — 型チェック
2. `skillName === ""` — 空文字列チェック（`||` 連結で実装）
3. `skillName.trim() === ""` — スペースのみチェック

### skill:remove との一貫性

skill:remove ハンドラ（UT-FIX-SKILL-REMOVE-INTERFACE-001 で修正済み）と
同一パターンでインターフェース不整合を修正した。
両ハンドラが `skillName: string` 直接受け取り + P42準拠3段バリデーション
という同じ契約を持つことで、コードベースの一貫性が保たれる。
```

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2 を含む1ファイル）

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> **重要**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照してください。

**2ステップで実行:**

#### Step 1: タスク完了記録（必須）

##### Step 1-A: タスク完了記録

以下の6項目を**全て**実施する:

- [x] `interfaces-agent-sdk-skill.md` にタスク完了記録を追加する（skill:import IPC契約をskillName: string直接受け取りに更新）
- [x] `api-ipc-agent.md` にIPC実装完了記録を追加する
- [x] `aiworkflow-requirements/LOGS.md` を更新する
- [x] `task-specification-creator/LOGS.md` を更新する（**2ファイル両方** — P1/P25対策）
- [x] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [x] `task-specification-creator/SKILL.md` の変更履歴を更新する（P29対策）

##### Step 1-B: 実装状況テーブル更新

- [x] `interfaces-agent-sdk-skill.md` のskill:import実装ステータスを「完了」に更新する

##### Step 1-C: 関連タスクテーブル更新

```bash
# UT-FIX-SKILL-IMPORT を含む仕様書を検索する
grep -rn "UT-FIX-SKILL-IMPORT\|skill:import" .claude/skills/aiworkflow-requirements/references/
grep -rn "UT-FIX-SKILL-IMPORT\|skill:import" .claude/skills/task-specification-creator/references/
```

- [x] 検出された仕様書の関連タスクテーブルを更新する

##### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md を再生成する（P2/P27対策 — 仕様書に変更があれば必ず実行）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/ut-fix-skill-import-interface-001 --regenerate
```

- [x] `aiworkflow-requirements/indexes/topic-map.md` を再生成した
- [x] `task-specification-creator/references/resource-map.md`（`generate-index`再生成結果）を確認した

#### Step 2: システム仕様更新

**更新判断**: 本タスクはskill:importハンドラ内部の引数受け取り方の修正であり、skill:removeハンドラ（UT-FIX-SKILL-REMOVE-INTERFACE-001）と同一パターンの修正である。

**更新対象ファイルと内容**:

| 更新候補ファイル                          | 必要性判定                                          | 更新内容                                                                |
| ----------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | **必須** — skill:import Request列の更新             | Request列を `{ skillIds: string[] }` → `skillName: string` に修正       |
| `api-ipc-agent.md`                        | **必須** — skill:import引数仕様の更新               | 引数仕様を `skillName: string` に修正                                   |
| `arch-electron-services.md`               | **必須** — Skill管理IPC契約テーブルの更新           | `skill:import` 引数を `skillIds: string[]` → `skillName: string` に修正 |
| `security-electron-ipc.md`                | **必須** — skill:importのバリデーションパターン更新 | P42準拠3段バリデーション記述を追加                                      |
| `architecture-implementation-patterns.md` | **必須** — P44ステータス更新                        | P44（skill:import/remove不整合）を「解決済み」に更新                    |
| `architecture-overview.md`                | 不要 — アーキテクチャ変更なし                       | -                                                                       |
| `security-skill-ipc.md`                   | **必須** — skill:import検証仕様の更新               | sender検証 + 引数検証を `skillName` 形式に更新（P42準拠）               |

- [x] Step 2 の必要性判定が完了している
- [x] 必要と判定されたファイルは全て更新済み
- [x] 不要と判定されたファイルはその理由を `outputs/phase-12/documentation-changelog.md` に記録済み

**期待される成果物**:

- `outputs/phase-12/system-docs-update-log.md`（Step完了ステータスを含む）

---

### タスク3: ドキュメント更新履歴作成 & artifacts.json更新

**目的**: 本タスクで行ったドキュメント更新を記録する

**実行手順**:

1. 更新した全仕様書の変更内容を記録する
2. 各 Step の完了結果を詳細に記録する（漏れの可視化）
3. `artifacts.json` の Phase 12 ステータスを `completed` に更新する

**DON'T**: 全 Step 確認前に「完了」と記載しない（P4対策）

**更新履歴テンプレート**:

```markdown
# UT-FIX-SKILL-IMPORT-INTERFACE-001 ドキュメント更新履歴

## 作成日

2026-02-21

## 修正されたファイル

| ファイル                           | 変更種別 | 内容                              |
| ---------------------------------- | -------- | --------------------------------- |
| skillHandlers.ts（行120-138）      | 修正     | skill:importハンドラ引数形式変更  |
| skillHandlers.test.ts（行630-740） | 修正     | テスト期待値をskillName形式に修正 |

## Step 完了ステータス

### Step 1-A: タスク完了記録

- [ ] interfaces-agent-sdk-skill.md 更新
- [ ] api-ipc-agent.md 更新
- [ ] aiworkflow-requirements/LOGS.md 更新
- [ ] task-specification-creator/LOGS.md 更新
- [ ] aiworkflow-requirements/SKILL.md 更新
- [ ] task-specification-creator/SKILL.md 更新

### Step 1-B: 実装状況テーブル

- [ ] interfaces-agent-sdk-skill.md のskill:importステータス更新

### Step 1-C: 関連タスクテーブル

- [ ] grep結果に基づく更新（対象ファイル名を記載）

### Step 1-D: topic-map.md 再生成

- [ ] aiworkflow-requirements/indexes/topic-map.md
- [ ] task-specification-creator/references/resource-map.md（generate-index再生成結果）

### Step 2: システム仕様更新

- [ ] interfaces-agent-sdk-skill.md のskill:import Request列更新
- [ ] api-ipc-agent.md のskill:import引数仕様更新
- [ ] arch-electron-services.md のskill:import引数契約更新
- [ ] security-electron-ipc.md のバリデーションパターン更新
- [ ] security-skill-ipc.md のskill:import検証仕様更新
- [ ] architecture-implementation-patterns.md のP44ステータス更新
- [ ] 各ファイルの必要性判定と結果
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 残課題や未対応事項を検出・記録する（**0件でも出力必須**）

**実行手順**:

1. Phase 10（最終レビュー）の指摘事項を確認する
2. Phase 11（手動テスト）の発見課題を確認する
3. コードベースの TODO/FIXME を検索する
4. 元タスク仕様書のスコープ外項目を確認する
5. 検出結果を記録する（0件でも「検出タスクなし」と明記する）

**検出コマンド**:

```bash
# TODO/FIXME検索（修正対象ファイル）
grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/skillHandlers.ts
grep -rn "TODO\|FIXME" apps/desktop/src/preload/skill-api.ts

# 同様のインターフェース不整合パターン検索
grep -rn "args\?\.\|args\.\(skillId\|skillIds\)" apps/desktop/src/main/ipc/
```

**未タスク検出時の3ステップ（P3対策）**:

検出した未タスクは以下の3ステップを**全て**完了する:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

## 参照資料

> 依存Phase成果物参照: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準     |
| 実装ファイル            | `apps/desktop/src/main/ipc/skillHandlers.ts`（行120-138）                      | 実装コード       |
| Phase 11 発見課題       | `outputs/phase-11/discovered-issues.md`                                        | 発見課題         |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P31   |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | 必須チェック項目 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容               |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 更新対象           |
| IPC Agent仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 更新対象           |
| Electronサービス仕様       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | 更新対象           |
| セキュリティIPC仕様        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | 更新対象           |
| セキュリティSkill IPC仕様  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 更新対象           |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 更新判定・検証手順 |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 更新対象           |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 更新対象           |

---

## 成果物

| 成果物               | パス                                          | 内容                  |
| -------------------- | --------------------------------------------- | --------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Part 1 + Part 2       |
| システム仕様更新ログ | `outputs/phase-12/system-docs-update-log.md`  | Step完了ステータス    |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 全更新内容の記録      |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md`  | 残課題（0件でも必須） |

---

## 完了条件

- [x] 実装ガイド（Part 1: 中学生レベル概念説明 + Part 2: 技術詳細）が作成されている
- [x] Step 1-A: interfaces-agent-sdk-skill.md にタスク完了記録が追加されている
- [x] Step 1-A: api-ipc-agent.md にIPC実装完了記録が追加されている
- [x] Step 1-A: LOGS.md **2ファイル両方**が更新されている（P1/P25対策）
- [x] Step 1-A: SKILL.md **2ファイル両方**の変更履歴が更新されている（P29対策）
- [x] Step 1-B: interfaces-agent-sdk-skill.md のskill:import実装ステータスが更新されている
- [x] Step 1-C: `grep` で検出された関連仕様書が更新されている
- [x] Step 1-D: `topic-map.md` が再生成されている（**2ファイル両方**）
- [x] Step 2: interfaces-agent-sdk-skill.md のskill:import Request列が `skillName: string` に修正されている
- [x] Step 2: api-ipc-agent.md のskill:import引数仕様が更新されている
- [x] Step 2: arch-electron-services.md のskill:import引数契約が `skillName: string` に修正されている
- [x] Step 2: security-electron-ipc.md のバリデーションパターンが更新されている
- [x] Step 2: security-skill-ipc.md のskill:import検証仕様が `skillName` 形式に更新されている
- [x] Step 2: architecture-implementation-patterns.md は更新不要判定（P44正本は `06-known-pitfalls.md` で解決済み管理）
- [x] Step 2: 各ファイルの必要性判定が完了し、結果がdocumentation-changelog.mdに記録されている
- [x] ドキュメント更新履歴が各Stepの実施状況を含めて作成されている
- [x] `artifacts.json` の Phase 12 ステータスが更新されている
- [x] 未タスク検出レポートが作成されている（0件でも必須）
- [x] Phase 10 MINOR指摘がある場合、全て未タスク仕様書に変換されている
- [x] 検出した未タスクは3ステップ（指示書・残課題テーブル・関連仕様書リンク）全完了している

---

## フォールバック手順

Step 1-AでLOGS.md/SKILL.mdが見つからない場合:

1. ワークツリー環境のため、スキルディレクトリが存在しない場合がある
2. その場合は `outputs/phase-12/documentation-changelog.md` に「ワークツリー環境のためスキップ」と理由を記載する
3. メインリポジトリへのマージ後にLOGS.md/SKILL.mdを更新する旨を記録する

---

## Phase末端アクション【必須】

- [x] 本Phase内の全タスク（4タスク）を100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物（4ファイル）が全て生成されていることを確認
- [x] 全完了条件チェックリストを確認済み

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-fix-skill-import-interface-001/phase-13-pr-creation.md`
