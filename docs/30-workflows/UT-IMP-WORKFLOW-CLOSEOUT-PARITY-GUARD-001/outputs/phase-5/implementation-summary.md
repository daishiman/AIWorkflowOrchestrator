# Phase 5 実装サマリー

## 概要

TDD Green化フェーズ。Phase 4で確立したRed状態（全テストFAIL）を、実装によってGreen（全テストPASS）に転換した。

## 実装内容

### 1. 新規作成: `validate-closeout-parity.js`

ワークフローのPhaseステータスがS1〜S4の4ソース間で一致しているかを検証するスクリプト。

**主要機能:**

- S1（index.md Phase表）、S2（root artifacts.json）、S3（outputs/artifacts.json）、S4（phase-N-\*.md frontmatter）の4ソースを読み取り比較
- 終了コード: 0=PARITY_OK, 1=PARITY_DRIFT, 2=MISSING_SOURCE, 3=INVALID_STATUS_VALUE
- `--json` フラグでJSON出力（スキーマ: result, phases, drifts, sourcesChecked, generatedAt）
- 人間可読出力: `Phase N | SX | expected=Y | actual=Z` 形式
- S1の`-`値はpendingと同義として扱う
- 完全にread-only（fsの書き込みAPIは一切使用しない）

### 2. 修正: `complete-phase.js`

**追加機能:**

- 未知フラグ拒否（`--workflow`, `--phase`, `--artifacts`以外は usage error で exit 1）
- 事前parity check（PARITY_DRIFT検出時は完了処理を拒否してexit 1）
- S3（outputs/artifacts.json）の更新
- S1（index.md Phase表）のステータス更新
- S4（phase-N-\*.md frontmatter）のステータス更新
- S3書き込み失敗時のロールバック（root artifacts.jsonを元の状態に戻す）

**後方互換性:** `--workflow`, `--phase`, `--artifacts` の既存CLI引数は変更なし

### 3. 修正: `verify-all-specs.js`

既存の検証フローの末尾にparity検証を統合:

- `runParityCheck(workflowDir)` 関数でvalidate-closeout-parity.jsをサブプロセス実行
- PARITY_OK以外の場合はerror追加・passed=false

### 4. `.agents/` ミラー同期

上記3ファイルを `.agents/skills/task-specification-creator/scripts/` にコピー

## テスト結果

| テストファイル                   | テスト数 | PASS   | FAIL  |
| -------------------------------- | -------- | ------ | ----- |
| validate-closeout-parity.test.js | 17       | 17     | 0     |
| complete-phase.parity.test.js    | 7        | 7      | 0     |
| **合計**                         | **24**   | **24** | **0** |

## 設計上の決定

- canonical値の優先順位: S2→S3→S1→S4（S2が最も信頼性高い）
- parity driftが既存の場合、complete-phase実行を事前に拒否（S3書き込み後ロールバックではなく、実行前チェックで失敗させる方が安全）
- empty-workflow（phases={}）はdriftなしでPARITY_OK
- S4ファイルが存在しない場合はS4チェックをスキップ
