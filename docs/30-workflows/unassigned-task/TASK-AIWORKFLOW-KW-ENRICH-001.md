# TASK-AIWORKFLOW-KW-ENRICH-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2296
```

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | TASK-AIWORKFLOW-KW-ENRICH-001                                            |
| タスク名     | aiworkflow-requirements close-outキーワード充実（SkillCreatorService系） |
| 分類         | 改善                                                                     |
| 対象機能     | aiworkflow-requirements スキル / 検索インデックス                        |
| 優先度       | 低                                                                       |
| 見積もり規模 | 小規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | TASK-SW-STRUCT-LLM-002 Phase 12 skill-feedback-report.md                 |
| 発見日       | 2026-04-19                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorService` 系のタスクが連続して発生している：

- **TASK-SW-LLM-PURPOSE-AUTO-EXTRACT**（purpose 自動抽出）: `generatePurposeWithLlm` 相当の実装
- **TASK-SW-STRUCT-LLM-002**（features 自動生成）: `generateFeaturesWithLlm` / `generate_features.js` / `parseFeaturesResponse` の実装

これらの close-out 履歴が `aiworkflow-requirements` スキルの検索インデックスに
適切なキーワードで登録されていないため、類似タスクを将来実装する際に過去の知見を
再検索しにくい状態になっている。

TASK-SW-STRUCT-LLM-002 の `skill-feedback-report.md` には以下のフィードバックが残されている:

> `SkillCreatorService` 系 current facts は `purpose` 系タスクと `features` 系タスクが連続して発生しており、
> close-out 履歴の検索キーワードに `generateFeaturesWithLlm` / `generate_features.js` を追加しておくと
> 再検索しやすい。

### 1.2 問題の構造

| 問題                                                 | 内容                                                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `generateFeaturesWithLlm` がインデックス未登録       | TASK-SW-STRUCT-LLM-002 の中核メソッドであるが、`keywords.json` に存在しない                              |
| `generate_features.js` がインデックス未登録          | features 生成補助スクリプトのファイル名が検索キーワードとして登録されていない                            |
| `parseFeaturesResponse` がインデックス未登録         | features レスポンスのパース関数が検索対象外                                                              |
| `SkillCreatorService.features` がインデックス未登録  | テストファイル名（`SkillCreatorService.features.test.ts`）由来のキーワードが登録されていない             |
| `NON_VISUAL` タスク判定がインデックス不足            | `topic-map.md` に `NON_VISUAL` 判定の教訓は存在するが、`keywords.json` への追加漏れがある                |
| `topic-map.md` の SkillCreatorService セクション不足 | features 生成関連のトピックが SkillCreatorService セクションに追記されておらず、類似実装時に参照できない |

### 1.3 放置した場合の影響

- 将来 `SkillCreatorService` に新しい LLM 連携メソッドを追加するタスクが発生した際、
  過去実装（`generateFeaturesWithLlm` / `parseFeaturesResponse` のパターン）を
  `aiworkflow-requirements` スキルで検索しても見つからない
- 同じ設計パターン（フォールバック付き LLM 呼び出し + ヒューリスティック補完）を
  再発明するコストが発生する
- `generate_features.js` のような補助スクリプトを実装した知見が死蔵される
- NON_VISUAL タスクの Phase 11 close-out パターンが検索で見つからず、
  同様の手順ミスが繰り返される

---

## 2. 何を達成するか（What）

### 2.1 目的

`aiworkflow-requirements` スキルの検索インデックス（`keywords.json` / `topic-map.md`）に
SkillCreatorService 系 features 生成タスクの close-out キーワードを追加し、
将来の類似タスク実装者が過去の知見に素早くたどり着けるようにする。

### 2.2 最終ゴール

| ID   | 達成すること                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| G-01 | `keywords.json` に `generateFeaturesWithLlm` が追加され、TASK-SW-STRUCT-LLM-002 関連ファイルにリンクされている                    |
| G-02 | `keywords.json` に `generate_features.js` が追加され、関連ファイルにリンクされている                                              |
| G-03 | `keywords.json` に `parseFeaturesResponse` が追加され、関連ファイルにリンクされている                                             |
| G-04 | `keywords.json` に `SkillCreatorService.features` が追加され、関連ファイルにリンクされている                                      |
| G-05 | `topic-map.md` の SkillCreatorService セクションに features 生成関連トピックが追記されている                                      |
| G-06 | `.agents` mirror が `.claude` canonical と同期されている                                                                          |
| G-07 | `aiworkflow-requirements` スキルで上記キーワード検索を実行し、TASK-SW-STRUCT-LLM-002 の実装知見にたどり着けることが確認されている |

### 2.3 スコープ

**含むもの**:

- `.claude/skills/aiworkflow-requirements/indexes/keywords.json` の更新（canonical）
  - `generateFeaturesWithLlm` キーワード追加
  - `generate_features.js` キーワード追加
  - `parseFeaturesResponse` キーワード追加
  - `SkillCreatorService.features` キーワード追加
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の更新（canonical）
  - SkillCreatorService セクションへの features 生成トピック追記
- `.agents/skills/aiworkflow-requirements/` への mirror 同期
- 動作確認（`aiworkflow-requirements` スキルでキーワード検索を実行し、ヒットを確認）

**含まないもの**:

- `keywords.json` / `topic-map.md` のフォーマット変更・構造変更
- 他キーワードの削除・修正
- `aiworkflow-requirements` スキル本体（`SKILL.md`）の変更
- `SkillCreatorService.ts` 本体のコード変更
- `generate_features.js` 本体のコード変更
- 新規 lessons-learned ファイルの作成（既存ファイルへのリンクのみ追加）

### 2.4 受入条件（Acceptance Criteria）

| AC   | 条件                                                                                                                                           | 検証方法                                                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| AC-1 | `keywords.json` に `generateFeaturesWithLlm`, `generate_features.js`, `parseFeaturesResponse`, `SkillCreatorService.features` が追加されている | `grep` で各キーワードが `keywords.json` に存在することを確認                                          |
| AC-2 | `topic-map.md` の SkillCreatorService セクションに features 生成関連のトピックが追加されている                                                 | `grep` で `generateFeaturesWithLlm` または `generate_features` が `topic-map.md` に存在することを確認 |
| AC-3 | `.agents` mirror が `.claude` canonical と同期されている                                                                                       | diff コマンドで `.claude` と `.agents` の対象ファイルに差分がないことを確認                           |
| AC-4 | `aiworkflow-requirements` スキルを使ったキーワード検索で TASK-SW-STRUCT-LLM-002 の実装知見にたどり着ける                                       | スキルを起動し `generateFeaturesWithLlm` を検索して関連ファイルが返ることを手動確認                   |

### 2.5 成果物

| 成果物                                                         | 内容                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json` | 4キーワード追加（canonical）                                              |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`  | SkillCreatorService セクションへの features 生成トピック追記（canonical） |
| `.agents/skills/aiworkflow-requirements/indexes/keywords.json` | canonical と同期（mirror）                                                |
| `.agents/skills/aiworkflow-requirements/indexes/topic-map.md`  | canonical と同期（mirror）                                                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 確認項目                                                                                                      | 確認方法                                                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| TASK-SW-STRUCT-LLM-002 が完了済みであること                                                                   | `git log --oneline` で関連コミットが含まれることを確認                                                                 |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json` の現状フォーマットを把握すること               | ファイルを読み、既存キーワードの追加パターン（キー: ファイル名配列）を確認する                                         |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の SkillCreatorService セクションを特定すること | ファイル内で `SkillCreatorService` 周辺の記述を検索し、追記位置を決める                                                |
| TASK-SW-STRUCT-LLM-002 の関連ファイル名を特定すること                                                         | `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/` 以下のファイルを確認し、キーワードにリンクすべきファイルを特定する |

### 3.2 依存タスク

| タスクID                         | 状態         | 関係                                                                |
| -------------------------------- | ------------ | ------------------------------------------------------------------- |
| TASK-SW-STRUCT-LLM-002           | 完了済み想定 | 本タスクで登録するキーワードの元ネタタスク                          |
| TASK-SW-LLM-PURPOSE-AUTO-EXTRACT | 関連タスク   | 同じ SkillCreatorService 系。purpose 系キーワードとの整合を確認する |

### 3.3 変更内容の方針

**`keywords.json` への追加パターン**:

既存の `"SkillCreatorService"` エントリと同様の形式で追加する。
リンク先のファイルは `aiworkflow-requirements` スキルが参照する `references/` 配下の
lessons-learned ファイルまたは task-workflow ファイルを指定する。
具体的なファイル名は Phase 1 の調査で確定させる。

```json
// 追加イメージ（ファイル名は Phase 1 で確定）
"generateFeaturesWithLlm": [
  "lessons-learned-<該当ファイル>.md",
  "task-workflow-skill-creator-<該当ファイル>.md"
],
"generate_features.js": [
  "lessons-learned-<該当ファイル>.md"
],
"parseFeaturesResponse": [
  "lessons-learned-<該当ファイル>.md"
],
"SkillCreatorService.features": [
  "lessons-learned-<該当ファイル>.md"
]
```

**`topic-map.md` への追記パターン**:

SkillCreatorService セクションに features 生成トピックの行を追加する。

```markdown
| generateFeaturesWithLlm / generate_features.js / parseFeaturesResponse（TASK-SW-STRUCT-LLM-002） | L<行番号> |
```

**mirror 同期方針**:

`.claude` canonical を先に更新してから `.agents` mirror に反映する。
ファイルをコピーするか、diff を確認して手動で同一内容を適用する。

### 3.4 主要ファイルと役割

| ファイル                                                                             | 役割                                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                       | 検索キーワードとファイルのマッピング（canonical） |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                        | トピックと参照行番号のマッピング（canonical）     |
| `.agents/skills/aiworkflow-requirements/indexes/keywords.json`                       | canonical の mirror                               |
| `.agents/skills/aiworkflow-requirements/indexes/topic-map.md`                        | canonical の mirror                               |
| `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-12/implementation-guide.md`  | 追加キーワードの技術的根拠（参照元）              |
| `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-12/skill-feedback-report.md` | 本タスク発見元（フィードバック記録）              |

---

## 4. 実行手順（Phase 構成）

### Phase 1: 要件定義

**目的**: 追加すべきキーワードとリンク先ファイルを確定する。

**作業内容**:

1. `.claude/skills/aiworkflow-requirements/indexes/keywords.json` を読み、既存の `"SkillCreatorService"` エントリの構造を把握する
2. `aiworkflow-requirements` スキルが参照する `references/` 配下のファイルのうち、
   TASK-SW-STRUCT-LLM-002 の close-out 情報が含まれるファイルを特定する
3. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を読み、
   SkillCreatorService セクションの現在の末尾行番号を確認する
4. 追加する4キーワード（`generateFeaturesWithLlm`, `generate_features.js`, `parseFeaturesResponse`, `SkillCreatorService.features`）それぞれのリンク先ファイルを確定する
5. AC-1〜AC-4 を本タスクの文脈で確定する

**完了条件**:

- 追加する4キーワードのリンク先ファイル名が全て特定されている
- `topic-map.md` の追記位置（行番号）が特定されている
- AC-1〜AC-4 が確認可能な形で文書化されている

---

### Phase 2: 設計

**目的**: `keywords.json` と `topic-map.md` の具体的な変更内容を設計する。

**作業内容**:

1. `keywords.json` に追加するエントリのドラフトを作成する（JSON 形式）
2. `topic-map.md` に追記するトピック行のドラフトを作成する（Markdown テーブル行形式）
3. mirror 同期の手順（コピー or 差分適用）を決定する
4. 設計内容を `outputs/phase-2/design.md` に記録する

**完了条件**:

- `keywords.json` への追加 JSON エントリが確定している（ファイル名含む）
- `topic-map.md` への追記行が確定している
- mirror 同期手順が決定している

---

### Phase 3: 設計レビューゲート

**目的**: Phase 2 の設計を Phase 4 へ進めるか判定する。

**レビュー観点**:

| 観点                                 | 確認内容                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| キーワードとリンク先ファイルの整合性 | リンク先ファイルが実際に `aiworkflow-requirements` スキルの `references/` 配下に存在するか |
| `keywords.json` のフォーマット整合性 | 既存エントリと同じ形式（文字列配列）で追加されているか                                     |
| `topic-map.md` の追記位置の妥当性    | SkillCreatorService セクション内の適切な位置に追記されているか                             |
| mirror 同期の対称性                  | `.claude` と `.agents` で同じ内容になるか                                                  |

**判定基準**:

- PASS: 全観点がクリアされれば Phase 4 へ進む
- MAJOR: 設計変更が必要な場合は Phase 2 に戻る
- CRITICAL: リンク先ファイルが存在しない場合は Phase 1 に戻る

---

### Phase 4: テスト設計

**目的**: 変更後の検証方法を設計する（TDD 的に先にどう確認するかを決める）。

**検証ケース**:

| VC ID | 対応 AC | 検証内容                                                   | 確認方法                                                                                  |
| ----- | ------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| VC-01 | AC-1    | `keywords.json` に4キーワードが存在する                    | `grep` で各キーワードを検索しヒットすることを確認                                         |
| VC-02 | AC-2    | `topic-map.md` に features 生成トピックが存在する          | `grep "generateFeaturesWithLlm"` または `grep "generate_features"` でヒットすることを確認 |
| VC-03 | AC-3    | `.claude` と `.agents` の対象ファイルに差分がない          | `diff` コマンドで差分なしを確認                                                           |
| VC-04 | AC-4    | `aiworkflow-requirements` スキルでキーワード検索が機能する | スキルを起動してキーワード検索を実行し、関連ファイルが返ることを確認                      |

---

### Phase 5: 実装計画

**目的**: Phase 4 の検証がパスするための実装手順を決定する。

**実装ステップ**:

1. `.claude/skills/aiworkflow-requirements/indexes/keywords.json` に4キーワードを追加する（canonical）
2. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` に features 生成トピック行を追加する（canonical）
3. VC-01〜VC-02 を実行してヒットを確認する
4. `.agents/skills/aiworkflow-requirements/indexes/keywords.json` を canonical と同期する
5. `.agents/skills/aiworkflow-requirements/indexes/topic-map.md` を canonical と同期する
6. VC-03 を実行して差分なしを確認する

---

### Phase 6: 実装（canonical 更新）

**目的**: `keywords.json` と `topic-map.md` の canonical を更新する。

**作業内容**:

1. `.claude/skills/aiworkflow-requirements/indexes/keywords.json` に以下を追加する:
   - `generateFeaturesWithLlm`: Phase 1 で確定したファイル名配列
   - `generate_features.js`: Phase 1 で確定したファイル名配列
   - `parseFeaturesResponse`: Phase 1 で確定したファイル名配列
   - `SkillCreatorService.features`: Phase 1 で確定したファイル名配列
2. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の SkillCreatorService セクションに features 生成トピック行を追加する
3. JSON フォーマットが valid であることを確認する（`node -e "require('./.claude/skills/aiworkflow-requirements/indexes/keywords.json')"` 等）

---

### Phase 7: カバレッジ確認

**目的**: 追加したキーワードが全て正しく機能することを確認する。

**確認項目**:

| 確認項目                                          | 基準                                                |
| ------------------------------------------------- | --------------------------------------------------- |
| 4キーワード全てが `keywords.json` に存在する      | VC-01 が全キーワードでヒット                        |
| `topic-map.md` に features 生成トピックが存在する | VC-02 がヒット                                      |
| `keywords.json` の JSON が valid である           | `node` / `python -m json.tool` 等でパースエラーなし |

---

### Phase 8: mirror 同期

**目的**: `.agents` mirror を canonical と同期する。

**作業内容**:

1. `.claude/skills/aiworkflow-requirements/indexes/keywords.json` を `.agents/skills/aiworkflow-requirements/indexes/keywords.json` に反映する
2. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を `.agents/skills/aiworkflow-requirements/indexes/topic-map.md` に反映する
3. `diff` コマンドで `.claude` と `.agents` の対象ファイルに差分がないことを確認する（VC-03）

---

### Phase 9: 品質保証

**目的**: 変更ファイルの品質ゲートをクリアする。

**実行コマンド**:

```bash
# keywords.json の JSON valid 確認
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/aiworkflow-requirements/indexes/keywords.json', 'utf8')); console.log('JSON valid')"

# 4キーワードの存在確認
grep -c "generateFeaturesWithLlm" .claude/skills/aiworkflow-requirements/indexes/keywords.json
grep -c "generate_features.js" .claude/skills/aiworkflow-requirements/indexes/keywords.json
grep -c "parseFeaturesResponse" .claude/skills/aiworkflow-requirements/indexes/keywords.json
grep -c "SkillCreatorService.features" .claude/skills/aiworkflow-requirements/indexes/keywords.json

# topic-map.md への追記確認
grep -n "generateFeaturesWithLlm\|generate_features" .claude/skills/aiworkflow-requirements/indexes/topic-map.md

# mirror 差分確認
diff .claude/skills/aiworkflow-requirements/indexes/keywords.json .agents/skills/aiworkflow-requirements/indexes/keywords.json
diff .claude/skills/aiworkflow-requirements/indexes/topic-map.md .agents/skills/aiworkflow-requirements/indexes/topic-map.md
```

**合格基準**:

- `keywords.json` が JSON valid
- 4キーワードが全て `keywords.json` に存在する（各 `grep` が 1 以上を返す）
- `topic-map.md` に features 生成トピックが存在する
- `.claude` と `.agents` の diff が空（差分なし）

---

### Phase 10: 最終レビュー

**目的**: AC-1〜AC-4 の完了判定を行い、マージ可能かどうかを判断する。

**確認チェックリスト**:

- [ ] AC-1: `keywords.json` に `generateFeaturesWithLlm`, `generate_features.js`, `parseFeaturesResponse`, `SkillCreatorService.features` が追加されている
- [ ] AC-2: `topic-map.md` の SkillCreatorService セクションに features 生成関連のトピックが追加されている
- [ ] AC-3: `.agents` mirror が `.claude` canonical と同期されている
- [ ] AC-4: `aiworkflow-requirements` スキルでキーワード検索し TASK-SW-STRUCT-LLM-002 の実装知見にたどり着けることを確認（手動）

**判定基準**:

- PASS: 全 AC がクリアされれば Phase 11 へ進む
- MAJOR: AC 未達の場合は対応 Phase に戻る
- CRITICAL: リンク先ファイルが存在しない場合は Phase 1 に戻る

---

### Phase 11: 手動テスト

**目的**: `aiworkflow-requirements` スキルを実際に使って、追加したキーワードで検索できることを確認する。

> **注記**: 本タスクは UI 変更なしの NON_VISUAL タスク。スクリーンショット取得は不要。
> 代替証跡として `outputs/phase-11/manual-test-result.md` を作成する。

**確認手順**:

1. `aiworkflow-requirements` スキルを起動する
2. `generateFeaturesWithLlm` で検索し、TASK-SW-STRUCT-LLM-002 関連の結果が返ることを確認する
3. `generate_features.js` で検索し、関連ファイルが返ることを確認する
4. `parseFeaturesResponse` で検索し、関連ファイルが返ることを確認する
5. `SkillCreatorService.features` で検索し、関連ファイルが返ることを確認する
6. 検索結果を `outputs/phase-11/manual-test-result.md` に記録する

**Phase 11 NON_VISUAL 宣言**:

本タスクは `NON_VISUAL` タスクのため、`outputs/phase-11/manual-test-checklist.md` に
`NON_VISUAL: true` を明示して記録する（L-WEEKGRD-003 の教訓に従う）。

---

### Phase 12: ドキュメント更新

**目的**: 実装ガイド・未タスク検出・フィードバックレポートを記録する。

**作成する成果物**:

| 成果物                                          | 内容                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`      | 変更ファイル一覧・追加キーワード一覧・苦戦箇所の記録    |
| `outputs/phase-12/unassigned-task-detection.md` | 本タスク実施中に発見された未タスクの一覧（0件でも記録） |
| `outputs/phase-12/skill-feedback-report.md`     | スキルへのフィードバック・改善点（なしでも記録）        |

**記録必須項目（implementation-guide.md）**:

- 追加した4キーワードとそれぞれのリンク先ファイル名
- `topic-map.md` への追記行の内容
- mirror 同期の実施方法
- 苦戦箇所と解決策（セクション 9 を参照）

---

### Phase 13: PR 作成

**目的**: ユーザーの承認を得た後に PR を作成する。

> **重要**: このフェーズはユーザーの明示的な承認なしに実行禁止。

**PR 作成手順**:

1. `git status` で変更ファイルを確認する
2. `git diff` で変更内容を最終確認する
3. コミットメッセージ案をユーザーに提示し承認を得る
4. `gh pr create` で PR を作成する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `keywords.json` に `generateFeaturesWithLlm`, `generate_features.js`, `parseFeaturesResponse`, `SkillCreatorService.features` が追加されている
- [ ] AC-2: `topic-map.md` の SkillCreatorService セクションに features 生成関連のトピックが追加されている
- [ ] AC-3: `.agents` mirror が `.claude` canonical と同期されている（diff 空）
- [ ] AC-4: `aiworkflow-requirements` スキルでキーワード検索し TASK-SW-STRUCT-LLM-002 の実装知見にたどり着けることを確認

### 品質要件

- [ ] `keywords.json` が JSON valid（パースエラーなし）
- [ ] `topic-map.md` の Markdown テーブル構文が崩れていない

### ドキュメント要件

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも出力）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている

---

## 6. 検証方法

### 6.1 grep による存在確認

```bash
# keywords.json の4キーワード確認
grep "generateFeaturesWithLlm" .claude/skills/aiworkflow-requirements/indexes/keywords.json
grep "generate_features.js" .claude/skills/aiworkflow-requirements/indexes/keywords.json
grep "parseFeaturesResponse" .claude/skills/aiworkflow-requirements/indexes/keywords.json
grep "SkillCreatorService.features" .claude/skills/aiworkflow-requirements/indexes/keywords.json

# topic-map.md の追記確認
grep -n "generateFeaturesWithLlm\|generate_features" .claude/skills/aiworkflow-requirements/indexes/topic-map.md
```

### 6.2 JSON valid 確認

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/skills/aiworkflow-requirements/indexes/keywords.json', 'utf8')); console.log('OK')"
```

### 6.3 mirror 差分確認

```bash
diff .claude/skills/aiworkflow-requirements/indexes/keywords.json \
     .agents/skills/aiworkflow-requirements/indexes/keywords.json \
     && echo "mirror in sync"

diff .claude/skills/aiworkflow-requirements/indexes/topic-map.md \
     .agents/skills/aiworkflow-requirements/indexes/topic-map.md \
     && echo "mirror in sync"
```

### 6.4 手動検証ポイント（AC-4）

| 確認項目                                                         | 確認方法                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `generateFeaturesWithLlm` で検索して関連ファイルが返る           | `aiworkflow-requirements` スキルでキーワード検索を実行                               |
| 返ってきたファイルに TASK-SW-STRUCT-LLM-002 の実装知見が含まれる | ファイルを開き `generateFeaturesWithLlm` や `parseFeaturesResponse` の記述を確認する |

---

## 7. リスクと対策

| リスク                                                                                                                   | 影響度 | 発生確率 | 対策                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------ | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aiworkflow-requirements` スキルが参照する `references/` 配下に TASK-SW-STRUCT-LLM-002 の close-out ファイルが存在しない | 高     | 中       | Phase 1 で `references/` の内容を先に確認し、該当ファイルが存在しない場合はリンク先を `docs/30-workflows/TASK-SW-STRUCT-LLM-002/` 配下のファイルで代替するか検討する |
| `keywords.json` のサイズが大きく（現在 543KB 超）、追加後に JSON パースが遅くなる                                        | 低     | 低       | 追加するエントリは4件のみであり、影響は軽微。Phase 9 の JSON valid 確認で問題なければ許容する                                                                        |
| `topic-map.md` の SkillCreatorService セクションが複数箇所に分散しており、追記位置が曖昧                                 | 中     | 中       | Phase 1 で `grep -n "SkillCreatorService"` で全出現箇所を確認し、features 関連の追記に最も適切なセクションを特定してから Phase 5 の実装に進む                        |
| `.agents` mirror への同期を忘れる                                                                                        | 中     | 中       | Phase 8 を独立したフェーズとして設定し、Phase 9 の diff 確認を必須ゲートとする                                                                                       |
| 追加キーワードの綴りミス（例: `generateFeatureswithLlm`）                                                                | 低     | 低       | Phase 9 の `grep` 確認で綴りを再チェックする。grep の検索文字列と追加したキーワードを目視で照合する                                                                  |

---

## 8. 参照情報

| 参照先                                                                               | 目的                                                             |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-12/skill-feedback-report.md` | 本タスクの発見元（フィードバック内容）                           |
| `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-12/implementation-guide.md`  | 追加キーワードの技術的根拠（`generateFeaturesWithLlm` 等の定義） |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`（行 6282 付近）       | 既存 `SkillCreatorService` エントリの追加パターン参照            |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`（行 4670 付近）        | 直近の SkillCreatorService 関連トピック追記例                    |
| `docs/30-workflows/unassigned-task/TASK-SW-LLM-PURPOSE-AUTO-EXTRACT.md`              | 同系列タスクの仕様書フォーマット参照例                           |

---

## 9. 備考（苦戦箇所【記入必須】）

### 9.1 事前に予測される苦戦箇所

実施前の時点での予測リスクを記録する。**実施後は各行の「実際の結果」列を更新すること**
（Phase 12 の `skill-feedback-report.md` へ転記できる粒度で記載する）。

| 苦戦箇所                                                                                             | 原因                                                                                                                                                                    | 対応策（予測）                                                                                                                                                                   | 実際の結果（実施後に記入） |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `references/` 配下に TASK-SW-STRUCT-LLM-002 のファイルが存在せず、キーワードのリンク先が見つからない | `aiworkflow-requirements` スキルが参照する `references/` は定期的に同期されるが、最新の close-out が反映されていない可能性がある                                        | Phase 1 で `references/` を確認し、存在しない場合は `docs/30-workflows/TASK-SW-STRUCT-LLM-002/outputs/phase-12/implementation-guide.md` を直接参照するか、別のリンク先を検討する | （実施後に記入）           |
| `keywords.json` のサイズが大きすぎて Read ツールで全件読めない                                       | ファイルサイズが 543KB を超えており、一括読み込みができない。既存の SkillCreatorService エントリの追加パターンを確認するために部分読み込みが必要                        | `grep -n "SkillCreatorService"` で行番号を特定してから `Read` の offset/limit で周辺行を確認する。実施時は同様のアプローチで4キーワードの追加位置を特定する                      | （実施後に記入）           |
| `topic-map.md` が 87,091 トークンを超えており、SkillCreatorService セクションの特定に時間がかかる    | ファイルが巨大で全件読み込みができない。`grep -n "SkillCreatorService"` で行番号を割り出してから部分読み込みが必要                                                      | Phase 1 で `grep -n "SkillCreatorService"` を実行し、最新の追記行番号を確認してから追記位置を決める                                                                              | （実施後に記入）           |
| `.agents` mirror への同期方法が不明確（手動コピー vs スクリプト）                                    | プロジェクトの mirror 同期が手動操作なのかスクリプト自動化なのかが仕様書上で明確になっていない。誤った方法で同期すると `.agents` の他のファイルを上書きするリスクがある | Phase 1 で `.agents/skills/aiworkflow-requirements/` の構造を確認し、同期スクリプトが存在するか確認する。存在しない場合は `cp` コマンドで個別ファイルをコピーする                | （実施後に記入）           |
| JSON の追加位置の選択（アルファベット順 vs 末尾追加 vs SkillCreatorService 近傍）                    | `keywords.json` の既存エントリにソート順の規則があるかどうかが不明。誤った位置に挿入すると将来のメンテナンス性が下がる                                                  | Phase 1 で `keywords.json` の構造を確認し、既存エントリのソート順ルールを把握してから追加位置を決める。明確な規則がなければ `SkillCreatorService` エントリの直後に追加する       | （実施後に記入）           |

### 9.2 背景コンテキスト（将来実装者へ）

- 本タスクは TASK-SW-STRUCT-LLM-002 の Phase 12 `skill-feedback-report.md` に記録された
  フィードバックを実現するための改善タスクである。フィードバックの原文は:

  > `SkillCreatorService` 系 current facts は `purpose` 系タスクと `features` 系タスクが連続して発生しており、
  > close-out 履歴の検索キーワードに `generateFeaturesWithLlm` / `generate_features.js` を追加しておくと
  > 再検索しやすい。

- 追加対象の4キーワードは以下の技術的根拠を持つ（詳細は `implementation-guide.md` を参照）:
  - `generateFeaturesWithLlm`: `SkillCreatorService` のプライベートメソッドで、LLM を使って `features` 配列を生成する
  - `generate_features.js`: LLM 呼び出しを補助するスクリプトファイル（`.claude/skills/skill-creator/scripts/` 配下）
  - `parseFeaturesResponse`: LLM レスポンス文字列から features 配列を抽出するパーサー
  - `SkillCreatorService.features`: テストファイル名（`SkillCreatorService.features.test.ts`）由来のキーワード

- `aiworkflow-requirements` スキルは `.claude/skills/aiworkflow-requirements/indexes/keywords.json` を
  検索の起点として使う。このファイルへの追加が AC の中核であり、
  リンク先ファイル名の正確さが AC-4 の達成に直結する。
  リンク先のファイルが実際に存在しないと、検索はヒットしても知見に到達できない。

- `topic-map.md` は `keywords.json` と異なり、行番号ベースで参照先を管理している。
  追記後に行番号がズレると既存の参照が壊れる可能性があるため、
  **既存行の変更は絶対に行わず、末尾への追加のみ** を原則とする。

- **100人中100人が同じ理解で実行できる**ために特に重要なポイント:
  1. Phase 1 で `references/` 配下のファイル存在確認を必ず行ってから実装に進む
  2. `keywords.json` の追加は JSON valid を維持しながら行う（末尾カンマの扱いに注意）
  3. `topic-map.md` への追記は既存行を変更せず新行を末尾に追加する形を原則とする
  4. mirror 同期は `.claude` canonical を先に更新してから `.agents` に反映する順序を守る
  5. Phase 13 はユーザーの承認なしに絶対に実行しない
