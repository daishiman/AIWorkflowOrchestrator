# Phase 1: 受け入れ基準（AC-1〜AC-7）

> 作成日: 2026-04-19

## AC-1: validator exit code 契約

`validate-closeout-parity.js --workflow <dir>` が S1〜S4 の status を比較し、**全一致で `exit 0`**、**drift で `exit 1`** を返すこと。MISSING_SOURCE は `exit 2`、INVALID_STATUS_VALUE は `exit 3`。

**検証方法**: Phase 4 TC-P-01 / TC-P-02 / TC-P-06 / TC-P-07 / TC-P-08 / TC-P-09。

## AC-2: drift レポートの構造化出力

drift 時のレポートが **「phase 番号 / ソース / 期待値 / 実測値」** の 4 項で構造化出力されること。`--json` フラグ付与時は JSON スキーマ `ParityReport`（Phase 2 設計）に適合。

**検証方法**: Phase 4 TC-P-12 / TC-P-13 / TC-P-15 / TC-P-16。

## AC-3: `verify-all-specs.js` への組込み

`verify-all-specs.js` が parity validator を組込み、**drift > 0 で PASS 判定を抑止**すること。既存 4 検証（構造／整合性／品質／完全性）が PASS でも、parity FAIL なら全体 FAIL に格上げ。

**検証方法**: Phase 6 TC-E-01〜TC-E-07。

## AC-4: `complete-phase.js` の同値更新

`complete-phase.js` が単一コマンド実行で **S1〜S4 を同値更新**すること。手動で片側更新を強要しない。atomic 書き込み＋validator FAIL 時 rollback が成立する。

**検証方法**: Phase 4 TC-C-01 / TC-C-06、Phase 6 TC-C-08〜TC-C-10。

## AC-5: checklist 反映

`phase-12-completion-checklist.md` に parity validator 実行コマンドが含まれ、`PARITY_OK` が PASS 判定の必須条件として記述されること。parity bypass 用フラグの導入を認めない方針が明記されている。

**検証方法**: Phase 6 TC-E-08 / TC-E-09 / TC-E-10。

## AC-6: 両 skill への教訓還流

`task-specification-creator` と `aiworkflow-requirements` の両 skill の reference / LOGS / SKILL.md に本 guard の current facts が反映されること。`.agents/` ミラーも同期される。`lessons-learned-current-2026-04.md` に `L-CLOSEOUT-PARITY-001` が採番される。

**検証方法**: Phase 12 Task 2 / Task 5 成果物。

## AC-7: 既存完了 workflow 遡及修正なし

既存完了 workflow を遡及修正しない前提が明文化され、`drift-inventory.md` が baseline として保存されること。`docs/30-workflows/completed-tasks/` 配下のファイル mtime が本タスク期間中に変化しない。

**検証方法**: Phase 6 TC-E-11 / TC-E-12、`git status --porcelain docs/30-workflows/completed-tasks/` が空。

## トレーサビリティ

| AC   | 検証 Phase        | 主担当テスト                          |
| ---- | ----------------- | ------------------------------------- |
| AC-1 | Phase 4, Phase 11 | TC-P-01 / TC-P-02 / TC-P-06〜09       |
| AC-2 | Phase 4           | TC-P-12 / TC-P-13 / TC-P-15 / TC-P-16 |
| AC-3 | Phase 6           | TC-E-01〜TC-E-07                      |
| AC-4 | Phase 4, Phase 6  | TC-C-01 / TC-C-06 / TC-C-08〜10       |
| AC-5 | Phase 6           | TC-E-08 / TC-E-09 / TC-E-10           |
| AC-6 | Phase 12          | Task 2 / Task 5 成果物                |
| AC-7 | Phase 6           | TC-E-11 / TC-E-12                     |
