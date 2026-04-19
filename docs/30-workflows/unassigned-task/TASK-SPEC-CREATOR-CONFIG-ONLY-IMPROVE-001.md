# TASK-SPEC-CREATOR-CONFIG-ONLY-IMPROVE-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2336
```

## メタ情報

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| タスクID     | TASK-SPEC-CREATOR-CONFIG-ONLY-IMPROVE-001                                                   |
| タスク名     | task-specification-creator スキル config-only タスク対応改善                                |
| 分類         | ドキュメント改善 / スキル強化                                                               |
| 対象機能     | task-specification-creator スキル（SKILL.md）                                               |
| 優先度       | 中（MEDIUM）                                                                                |
| 見積もり規模 | 小規模（実装 1d / テスト 0.5d）                                                             |
| ステータス   | 未実施                                                                                      |
| 発見元       | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 Phase 12 skill-feedback-report.md（FB-01, FB-02） |
| 発見日       | 2026-04-19                                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`task-specification-creator` スキルが提供する Phase 1〜13 テンプレートは、コード実装タスクを前提として設計されている。TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 の実行において、`.gitattributes` という「宣言的設定ファイルのみ」を変更する config-only タスクでテンプレートを使用したところ、以下の 2 つの問題が表面化した（FB-01, FB-02）。

- **FB-01**: Phase 3〜7（TDD サイクル）のテンプレートが「コード実装」前提になっており、config-only タスクでは毎回手動で読み替えが必要だった。テスト框架が存在しない宣言的設定ファイルに対して、Red-Green サイクルをどう適用するかテンプレートが示していない。

- **FB-02**: Phase 12 Step 2（新規インターフェース追加）の N/A 判定根拠の書式が曖昧であった。「新規インターフェース追加なし」という判断の根拠を 7 観点（API / 型 / 定数 / 環境変数 / DB / ファイルフォーマット / CLI）で記録する必要があったが、テンプレートに標準雛形がなく毎回独自に再発明することになった。

### 1.2 問題の構造

| フィードバック ID | 症状                                              | 根本原因                                                         | 再発条件                                                        |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| FB-01             | Phase 3/5/6/7 の読み替えコストが毎回発生する      | テンプレートが「code実装タスク」のみを想定している               | `.gitattributes` / `*.json` / `*.sh` 等の設定ファイル変更タスク |
| FB-02             | Phase 12 Step 2 の N/A 判定根拠が毎回再発明される | N/A 判定時の標準チェックリスト雛形がテンプレートに含まれていない | 新規インターフェース追加がないあらゆるタスク                    |

### 1.3 放置した場合の影響

- config-only タスクを実行するたびに、担当者が Phase 3〜7 の読み替えを独自判断で行い、解釈のばらつきが発生する
- Phase 12 Step 2 の N/A 判定根拠の書式が統一されず、後続のレビューコストが増加する
- 将来の config-only タスク（`.husky/`・`eslint.config.*`・`tsconfig.json` 変更等）で同じ問題が繰り返される

---

## 2. 何を達成するか（What）

### 2.1 目的

`task-specification-creator` スキルに以下の 2 つの機能強化を施し、config-only タスクの実行効率を向上させる。

1. `taskType: config-only | code | ui` パラメータを導入し、config-only 時の Phase 3/6/7 挙動を明文化する
2. Phase 12 Step 2 に 7 観点チェックリスト雛形を標準装備し、N/A 判定の即時クローズを可能にする

### 2.2 最終ゴール

| ID   | ゴール                                                                                   |
| ---- | ---------------------------------------------------------------------------------------- |
| G-01 | `taskType: config-only` 時の Phase 3/6/7 標準動作がテンプレートに明文化されている        |
| G-02 | config-only タスク事例リスト（`references/task-type-config-only-examples.md`）が存在する |
| G-03 | Phase 12 Step 2 テンプレートに 7 観点チェックリスト雛形が組み込まれている                |
| G-04 | G-01〜G-03 に対応した SKILL.md が更新されており、LOGS.md に変更が記録されている          |

### 2.3 スコープ

#### 含むもの

- `SKILL.md` の `taskType` パラメータ追加（config-only 定義）
- `references/phase-template-core.md` または対応テンプレートファイルの Phase 3 条件分岐追記
- `references/phase-template-execution.md` の Phase 6/7 config-only 読み替え記述
- `references/phase-template-phase12-detail.md` の Phase 12 Step 2 への 7 観点チェックリスト雛形追加
- `references/task-type-config-only-examples.md` 新規作成（事例: TASK-CONFLICT-PREVENT-001 / TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001）
- SKILL.md x 2（`.claude/` / `.agents/`）・LOGS.md x 2 の更新

#### 含まないもの

- FB-03（aiworkflow-requirements の mirror 再同期）— 別タスクとして切り出し済み
- FB-04（`validate-references.js` への `--mirror-parity` オプション追加）— 実装規模が独立タスク相当
- Phase 13 の PR 作成（本タスクはドキュメント変更のみ）
- task-specification-creator スキルのスクリプト（`scripts/`）変更

### 2.4 受入条件

| ID   | 受入条件                                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------- |
| AC-1 | `SKILL.md` に `taskType: config-only \| code \| ui` の定義が追記されている                                     |
| AC-2 | `references/` 内テンプレートに config-only 時の Phase 3 代替手順（静的検証 + MT シナリオ設計）が記述されている |
| AC-3 | `references/` 内テンプレートに config-only 時の Phase 6/7 代替手順（MT による Red/Green）が記述されている      |
| AC-4 | Phase 12 Step 2 テンプレートに 7 観点チェックリスト雛形が組み込まれている                                      |
| AC-5 | `references/task-type-config-only-examples.md` が作成され、2 件以上の事例が記載されている                      |
| AC-6 | SKILL.md x 2（`.claude/` / `.agents/`）・LOGS.md x 2 が同期更新されている                                      |

### 2.5 成果物

| 成果物                                                                                   | 種別 | 説明                                            |
| ---------------------------------------------------------------------------------------- | ---- | ----------------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                     | 更新 | `taskType` パラメータ追加                       |
| `.agents/skills/task-specification-creator/SKILL.md`                                     | 更新 | mirror 同期                                     |
| `.claude/skills/task-specification-creator/LOGS.md`                                      | 更新 | 変更記録追記                                    |
| `.agents/skills/task-specification-creator/LOGS.md`                                      | 更新 | mirror 同期                                     |
| `.claude/skills/task-specification-creator/references/（対象テンプレート）`              | 更新 | config-only Phase 3/6/7 記述追加                |
| `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md`  | 更新 | Phase 12 Step 2 に 7 観点チェックリスト雛形追加 |
| `.claude/skills/task-specification-creator/references/task-type-config-only-examples.md` | 新規 | config-only タスク事例集（2件以上）             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills/task-specification-creator/` が存在すること
- `.agents/skills/task-specification-creator/` が存在し、mirror 関係にあること（`.gitattributes` の `merge=union` 適用済み）
- `TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001` が完了済みであること（LOGS.md が append-only で `merge=union` 運用中）

### 3.2 依存タスク

| タスクID                                  | 依存種別 | 状態 | 説明                                                 |
| ----------------------------------------- | -------- | ---- | ---------------------------------------------------- |
| TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 | 発見元   | 完了 | フィードバックレポート（FB-01, FB-02）の発生元タスク |

### 3.3 アーキテクチャ設計方針（変更前→変更後）

**変更前**（現状）:

- `task-specification-creator` スキルは単一のフロー（code実装タスク前提）のみ定義
- Phase 3 = TDD設計、Phase 6 = Redテスト、Phase 7 = Greenテストが暗黙の前提
- Phase 12 Step 2 は「新規インターフェース追加あり」の場合のみ詳細手順を記述

**変更後**（本タスク完了後）:

- `taskType` パラメータにより code / config-only / ui の 3 モードを分岐
- config-only モード時: Phase 3 → 静的属性検証 + MT シナリオ設計、Phase 6 → MT Red、Phase 7 → MT Green
- Phase 12 Step 2 テンプレートに 7 観点チェックリスト雛形を標準装備（「なし」が 7/7 なら即 N/A クローズ）

### 3.4 主要ファイルと役割

| ファイルパス                                                                             | 役割                      | 変更内容                                 |
| ---------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                     | スキル定義                | `taskType` パラメータ定義追加            |
| `.claude/skills/task-specification-creator/references/phase-template-core.md`            | Phase 1-3 テンプレート    | Phase 3 の config-only 分岐追記          |
| `.claude/skills/task-specification-creator/references/phase-template-execution.md`       | Phase 4-10 テンプレート   | Phase 6/7 の config-only 代替手順追記    |
| `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md`  | Phase 12 詳細テンプレート | Step 2 への 7 観点チェックリスト雛形追加 |
| `.claude/skills/task-specification-creator/references/task-type-config-only-examples.md` | 事例集（新規作成）        | config-only タスク実例 2 件以上          |

---

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義 / 現状確認

#### 目的

変更対象テンプレートファイルの現状を把握し、変更計画を確定する。

#### 作業内容

1. `.claude/skills/task-specification-creator/SKILL.md` を読み、`taskType` 関連記述の有無を確認する
2. `references/phase-template-core.md` を読み、Phase 3 の現行定義を確認する
3. `references/phase-template-execution.md` を読み、Phase 6/7 の現行定義を確認する
4. `references/phase-template-phase12-detail.md` を読み、Step 2 の現行定義を確認する
5. 変更対象ファイルリストと変更箇所を `outputs/phase-1/requirements.md` に記録する

#### 完了条件

- 変更対象ファイルが確定している
- `taskType` 関連の既存記述の有無が確認されている
- `outputs/phase-1/requirements.md` が作成されている

---

### Phase 2: 設計

#### 目的

各変更の具体的な追記内容（差分設計）を文書化する。

#### 作業内容

1. `taskType` パラメータの定義文（SKILL.md 追記内容）を草案する
2. Phase 3 config-only 分岐の記述内容を草案する（`git check-attr` 検証 + MT シナリオ設計フロー）
3. Phase 6/7 config-only 代替手順の記述内容を草案する（MT-Red / MT-Green フロー）
4. Phase 12 Step 2 の 7 観点チェックリスト雛形を草案する
5. `task-type-config-only-examples.md` の構造と事例 2 件を草案する
6. 全草案を `outputs/phase-2/design.md` に記録する

#### 完了条件

- 全変更の追記内容草案が `outputs/phase-2/design.md` に記録されている
- Phase 3 / Phase 6/7 / Phase 12 Step 2 / 事例集の 4 件すべての草案が揃っている

---

### Phase 3: 設計レビューゲート

#### 目的

設計草案の整合性・実用性・漏れを第三者視点で検証する。

#### 作業内容（config-only タスクのため静的検証）

1. 草案が既存テンプレートの構造・用語と整合していることを確認する
2. FB-01 / FB-02 の要件を草案がカバーしていることを確認する
3. SKILL.md の記述スタイル（箇条書き / テーブル形式）と一致していることを確認する
4. レビュー結果を `outputs/phase-3/design-review.md` に記録する

#### 完了条件

- 設計レビューで指摘された修正がすべて草案に反映されている
- `outputs/phase-3/design-review.md` が作成されている

---

### Phase 4: テスト設計（MT シナリオ）

#### 目的

変更後のテンプレートが config-only タスクで正しく機能することを確認するための MT シナリオを定義する。

#### 作業内容

1. MT シナリオを定義する:
   - MT-01: `taskType: config-only` でタスクを開始した場合、Phase 3 に config-only 手順が表示される
   - MT-02: Phase 12 Step 2 実行時、7 観点チェックリストがすべて「変更なし」の場合、N/A 判定で即クローズできる
   - MT-03: `task-type-config-only-examples.md` が存在し、2 件以上の事例を含む
2. 検証コマンドを定義する（`grep` / `rg` による記述存在確認）
3. `outputs/phase-4/test-scenarios.md` に記録する

#### 完了条件

- MT-01〜MT-03 の検証手順が明記されている
- `outputs/phase-4/test-scenarios.md` が作成されている

---

### Phase 5: 実装

#### 目的

設計草案を実際のファイルに反映する。

#### 作業内容

1. `.claude/skills/task-specification-creator/SKILL.md` に `taskType` パラメータ定義を追記する
2. `references/phase-template-core.md` の Phase 3 セクションに config-only 分岐を追記する
3. `references/phase-template-execution.md` の Phase 6/7 セクションに config-only 代替手順を追記する
4. `references/phase-template-phase12-detail.md` の Step 2 セクションに 7 観点チェックリスト雛形を追記する
5. `references/task-type-config-only-examples.md` を新規作成し、2 件の事例を記述する

#### 完了条件

- 5 つの変更（追記 4 件 + 新規作成 1 件）がすべて完了している
- 各変更が設計草案と一致している

---

### Phase 6: MT-Red（変更適用前の状態確認）

#### 目的

実装前の現状（期待挙動が未達）を証跡として確認する。

> **注記（config-only タスク）**: コードのユニットテストは存在しない。代わりに、実装前の状態で MT シナリオが FAIL していることを確認する。

#### 作業内容

1. MT-01: Phase 3 に config-only 記述が存在しないことを確認する（`rg -n "config-only" references/phase-template-core.md` が 0 件）
2. MT-02: Phase 12 Step 2 に 7 観点チェックリストが存在しないことを確認する（`rg -n "7 観点" references/phase-template-phase12-detail.md` が 0 件）
3. MT-03: `task-type-config-only-examples.md` が存在しないことを確認する
4. 結果を `outputs/phase-6/mt-red-evidence.md` に記録する

#### 完了条件

- MT-01〜MT-03 がすべて FAIL（現状未達）であることが確認されている
- `outputs/phase-6/mt-red-evidence.md` が作成されている

---

### Phase 7: MT-Green（変更適用後の状態確認）

#### 目的

実装後の状態で MT シナリオが PASS していることを確認する。

#### 作業内容

1. MT-01: Phase 3 に config-only 記述が存在することを確認する（`rg -n "config-only" references/phase-template-core.md` が 1 件以上）
2. MT-02: Phase 12 Step 2 に 7 観点チェックリストが存在することを確認する（`rg -n "7 観点" references/phase-template-phase12-detail.md` が 1 件以上）
3. MT-03: `task-type-config-only-examples.md` が存在し、2 件以上の事例を含むことを確認する
4. 結果を `outputs/phase-7/mt-green-evidence.md` に記録する

#### 完了条件

- MT-01〜MT-03 がすべて PASS していることが確認されている
- `outputs/phase-7/mt-green-evidence.md` が作成されている

---

### Phase 8: リファクタリング

#### 目的

追記内容の文体・用語・フォーマットを既存テンプレートと統一する。

#### 作業内容

1. 追記箇所の見出し深度（`#` の数）が既存と一致しているか確認する
2. テーブル形式の幅が既存と揃っているか確認する
3. 用語統一（「config-only」表記の揺れ解消）を行う
4. 変更差分を確認し、不要な空行・重複記述を除去する

#### 完了条件

- 追記内容の文体・フォーマットが既存テンプレートと整合している
- 用語表記の揺れがない

---

### Phase 9: 品質保証

#### 目的

変更前後の内容を対比し、意図しない削除・破損がないことを確認する。

#### 作業内容

1. `git diff` で変更箇所をレビューし、追記のみで既存記述を削除していないことを確認する
2. MT-01〜MT-03 を再実行し PASS を確認する
3. `references/` 内の他ファイルへの影響がないことを確認する（クロスリファレンス確認）

#### 完了条件

- `git diff` で意図しない削除がないことが確認されている
- MT-01〜MT-03 が全 PASS している

---

### Phase 10: 最終レビュー

#### 目的

受入条件（AC-1〜AC-6）をすべて満たしていることを最終確認する。

#### 作業内容

1. AC-1: SKILL.md の `taskType` 定義を確認する
2. AC-2: Phase 3 の config-only 代替手順を確認する
3. AC-3: Phase 6/7 の config-only 代替手順を確認する
4. AC-4: Phase 12 Step 2 の 7 観点チェックリスト雛形を確認する
5. AC-5: `task-type-config-only-examples.md` の事例数（2 件以上）を確認する
6. AC-6: `.claude/` と `.agents/` の mirror ファイルが同内容であることを確認する
7. 最終レビュー結果を `outputs/phase-10/final-review.md` に記録する

#### 完了条件

- AC-1〜AC-6 がすべてチェック済みである
- `outputs/phase-10/final-review.md` が作成されている

---

### Phase 11: 手動テスト（MT 最終証跡）

#### 目的

実際に config-only タスクの文脈でテンプレートを読み、読み替えコストが削減されていることを確認する。

#### 作業内容

1. MT-01 最終実行: `rg` でテンプレートへの追記が正確に存在することを確認する
2. MT-02 最終実行: 7 観点チェックリストの各行が正しく記述されていることを確認する
3. MT-03 最終実行: `task-type-config-only-examples.md` の事例が読んで理解できる品質であることを確認する
4. 証跡（コマンド出力）を `outputs/phase-11/mt-evidence.md` に記録する

#### 完了条件

- MT-01〜MT-03 の最終証跡が `outputs/phase-11/mt-evidence.md` に記録されている

---

### Phase 12: ドキュメント更新

#### 目的

SKILL.md・LOGS.md の更新と mirror 同期、および Phase 12 標準ドキュメントを作成する。

#### 作業内容

**Step 1: 仕様書同期**

1. `.claude/skills/task-specification-creator/SKILL.md` の変更概要を `LOGS.md` に追記する
2. `.agents/skills/task-specification-creator/SKILL.md` および `LOGS.md` を mirror 同期する
3. `diff .claude/skills/task-specification-creator/LOGS.md .agents/skills/task-specification-creator/LOGS.md` で parity を確認する

**Step 2: 新規インターフェース追加確認**

### 判定根拠（7 観点チェック）

| 観点                        | 変更有無 | 根拠                                                 |
| --------------------------- | -------- | ---------------------------------------------------- |
| 公開 API（IPC contract 等） | なし     | ドキュメントのみの変更。コード・IPC 定義は変更しない |
| 型定義 / TypeScript types   | なし     | スキルは Markdown ドキュメント群のみで構成           |
| 定数・設定値                | なし     | `SKILL.md` への記述追加は定数ではなく説明文          |
| 環境変数                    | なし     | 環境変数への変更なし                                 |
| データベーススキーマ        | なし     | DB を使用しない                                      |
| ファイルフォーマット        | なし     | Markdown 形式は変更しない                            |
| 新規 CLI / コマンド         | なし     | CLI コマンドへの変更なし                             |

判定: **N/A（新規インターフェース追加なし）**

**Step 3〜5**: 標準 Phase 12 手順に従い、changelog・topic-map・フィードバックレポートを作成する

#### 完了条件

- SKILL.md x 2 が更新されている
- LOGS.md x 2 が更新・同期されている
- `diff .claude/...LOGS.md .agents/...LOGS.md` の出力が 0 行である
- Phase 12 標準成果物が作成されている

---

### Phase 13: PR 作成【ユーザーの明示的な承認なしに実行禁止】

> **重要**: Phase 13 はユーザーから明示的に「PR を作成してください」という指示を受けるまで実行してはならない。Phase 12 完了後に自動的に実行しないこと。

#### 目的

変更をコミットし、PR を作成してレビューを依頼する。

#### 作業内容（承認後のみ実行）

1. 変更ファイルを `git add` でステージングする
2. コミットメッセージを作成してコミットする（`--no-verify` は絶対に使用しない）
3. `gh pr create` で PR を作成する
4. CI が PASS していることを確認する

#### 完了条件

- PR が作成されている
- CI が PASS している
- PR の説明に変更内容（FB-01, FB-02 対応）が明記されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: SKILL.md に `taskType: config-only | code | ui` の定義が追記されている
- [ ] AC-2: Phase 3 テンプレートに config-only 時の代替手順（静的検証 + MT シナリオ設計）が記述されている
- [ ] AC-3: Phase 6/7 テンプレートに config-only 時の代替手順（MT Red / Green）が記述されている
- [ ] AC-4: Phase 12 Step 2 テンプレートに 7 観点チェックリスト雛形が組み込まれている
- [ ] AC-5: `task-type-config-only-examples.md` が作成され、2 件以上の事例が記載されている

### 品質要件

- [ ] MT-01〜MT-03 が最終証跡付きで PASS している
- [ ] `git diff` で意図しない削除がないことが確認されている
- [ ] テンプレートの文体・フォーマットが既存と統一されている

### ドキュメント要件

- [ ] AC-6: SKILL.md x 2（`.claude/` / `.agents/`）・LOGS.md x 2 が更新・同期されている
- [ ] `diff .claude/.../LOGS.md .agents/.../LOGS.md` の出力が 0 行である
- [ ] Phase 12 標準成果物（changelog・フィードバックレポート）が作成されている

---

## 6. 検証方法

### テストシナリオ

| ID    | 検証内容                                                        | 期待結果                      |
| ----- | --------------------------------------------------------------- | ----------------------------- |
| MT-01 | Phase 3 テンプレートに config-only 記述が存在する               | `rg` で 1 件以上 HIT          |
| MT-02 | Phase 12 Step 2 に 7 観点チェックリストが存在する               | `rg` で 1 件以上 HIT          |
| MT-03 | `task-type-config-only-examples.md` が存在し事例が 2 件以上ある | ファイル存在確認 + 事例数確認 |

### 検証コマンド（参考）

```bash
# MT-01: Phase 3 config-only 記述の確認
rg -n "config-only" .claude/skills/task-specification-creator/references/phase-template-core.md

# MT-02: Phase 12 Step 2 の 7 観点チェックリスト確認
rg -n "7 観点" .claude/skills/task-specification-creator/references/phase-template-phase12-detail.md

# MT-03: 事例ファイルの存在確認
ls .claude/skills/task-specification-creator/references/task-type-config-only-examples.md

# mirror parity 確認
diff .claude/skills/task-specification-creator/LOGS.md .agents/skills/task-specification-creator/LOGS.md
diff .claude/skills/task-specification-creator/SKILL.md .agents/skills/task-specification-creator/SKILL.md
```

---

## 7. リスクと対策

| リスク                                                                | 影響度 | 発生確率 | 対策                                                             |
| --------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------- |
| 既存テンプレートの記述を誤って削除・改変する                          | 高     | 低       | Phase 9 で `git diff` を必ずレビューし、追記のみであることを確認 |
| config-only の定義が曖昧で新しいタスクで再解釈が必要になる            | 中     | 中       | SKILL.md に判断基準（「コード変更を伴わない」等）を明文化する    |
| `.claude/` と `.agents/` の mirror が非同期になる                     | 中     | 低       | Phase 12 で `diff` コマンドを必ず実行し parity を確認する        |
| Phase 12 Step 2 の 7 観点チェックリスト雛形が将来の実態に合わなくなる | 低     | 中       | チェックリストに「観点を必要に応じて追加可」と注記する           |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/gitattributes-merge-union-reeval-001/outputs/phase-12/skill-feedback-report.md` — FB-01, FB-02 の詳細記述（発見元）
- `.claude/skills/task-specification-creator/SKILL.md` — 変更対象スキル定義
- `.claude/skills/task-specification-creator/references/phase-templates.md` — テンプレートファイルインデックス
- `.claude/skills/task-specification-creator/references/phase-template-core.md` — Phase 1-3 テンプレート
- `.claude/skills/task-specification-creator/references/phase-template-execution.md` — Phase 4-10 テンプレート
- `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md` — Phase 12 詳細テンプレート

### 参考資料

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` — 未タスク作成ガイドライン
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` — Phase 12 ドキュメントガイド

---

## 9. 備考（苦戦箇所【記入必須】）

### 9.1 既知の苦戦箇所（分析から記録）

#### 苦戦箇所 1: config-only タスクの Phase 3（設計レビューゲート）実装

**問題**: `.gitattributes` のような宣言的設定ファイルに対して、Phase 3 での「設計ゲート」をどう実装するか不明確だった。通常タスクは Phase 4 で期待挙動マトリクス → Phase 5 で実装という Red-Green サイクルを回すが、設定ファイルにはテストフレームワークが存在しない。

**解決**: `git check-attr` を使った静的検証スクリプト + 一時 clone でのマージシミュレーションを combined evidence として設計することで、「設計ゲート = 期待挙動の静的証明」として代替できた。

**テンプレート化の指針**: config-only タスクの Phase 3 は「属性/スキーマの静的検証 + MT シナリオ設計」に読み替え、Phase 4 では MT シナリオを検証手順として記述することを標準とする。

#### 苦戦箇所 2: Phase 12 Step 2 の N/A 判定根拠の毎回再発明

**問題**: 「新規インターフェース追加なし」という判断の根拠を 7 観点で記録する必要があったが、テンプレートに雛形がなく、毎回 FB-02 で体験したように再発明が必要だった。

**解決**: 本タスクの Phase 12 Step 2 に 7 観点チェックリスト（API / 型 / 定数 / 環境変数 / DB / ファイルフォーマット / CLI）を雛形として含めることで、すべて「なし」の場合に即時 N/A クローズが可能となる。

**テンプレート化の指針**: 7 観点を網羅することで「新規追加なし」を証明できる形式とし、各観点に「なし」と記入するだけで N/A 判定の根拠が揃う標準書式とする。

### 9.2 背景コンテキスト（将来実装者へ）

本タスクは、TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 という config-only タスクを実際に実行した際の「第一人者の体験」に基づいている。設定ファイル変更タスクでは、`.gitattributes`・`eslint.config.*`・`tsconfig.json`・`Makefile`・`package.json（設定項目のみ）` 等が config-only タスクに該当し得る。

コード実装タスクとの最大の違いは「テストフレームワークが存在しない」ことではなく、「静的な宣言が期待挙動を定義する」ことである。テンプレートを読み替えるのではなく、「設定ファイルの期待値を静的に検証する手順が Phase 4/6/7 に相当する」という認識の転換が重要である。

FB-03（mirror 再同期）と FB-04（`validate-references.js` への `--mirror-parity` 追加）は本タスクのスコープ外として意図的に除外した。これらは独立した作業規模を持つため、別タスクとして `unassigned-task/` に登録することを推奨する。
