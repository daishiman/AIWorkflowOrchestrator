# 受け入れ基準

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 |
| Phase    | 1                                          |
| 作成日   | 2026-02-26                                 |
| 目的     | 各要件に対する検証可能な受け入れ基準の定義 |

## 受け入れ基準一覧

| AC-ID  | 対応要件         | 受け入れ基準                                                                                              | 検証方法                                                                                                               | 検証タイミング   |
| ------ | ---------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------- |
| AC-001 | FR-001, FR-003   | `spec-update-workflow.md` の検証コマンドが全て `quick_validate.js`（repo配下）を指定している              | `grep -c "quick_validate.py" .claude/skills/task-specification-creator/references/spec-update-workflow.md` が 0 を返す | Phase 5 実装後   |
| AC-002 | FR-001, FR-004   | `phase-11-12-guide.md` の検証コマンドが全て `quick_validate.js`（repo配下）を指定している                 | `grep -c "quick_validate.py" .claude/skills/task-specification-creator/references/phase-11-12-guide.md` が 0 を返す    | Phase 5 実装後   |
| AC-003 | FR-005           | Warning 3段階分類ルールが文書化されている                                                                 | `spec-update-workflow.md` に「許容 / 要監視 / 要対応」の定義と分類基準が記載されている                                 | Phase 5 実装後   |
| AC-004 | FR-006, NFR-001  | `quick_validate.js` を3スキルに対して実行し、Error 0件で終了する                                          | 3スキル全てで終了コード 0（SUCCESS）を返す                                                                             | Phase 9, 11      |
| AC-005 | FR-007           | `aiworkflow-requirements` の参照リンク Warning に対する許容条件が明記されている                           | `spec-update-workflow.md` に「Progressive Disclosure 設計に起因する参照リンク Warning は許容」と記載されている         | Phase 5 実装後   |
| AC-006 | NFR-001, NFR-005 | 同一スキルに `.js` と `.py` を実行した際、Error 判定が一致する                                            | 3スキル全てで Error/Fail 判定の一致率 100%                                                                             | Phase 1 現状分析 |
| AC-007 | FR-001, FR-002   | `.js` を正規経路（primary）、`.py` を補助経路（fallback）として位置づけるルールが文書化されている         | `spec-update-workflow.md` に優先順位と使い分け条件が記載されている                                                     | Phase 5 実装後   |
| AC-008 | NFR-002          | 検証結果の出力で Error / Warning / Pass が一目で識別できる                                                | `quick_validate.js --verbose` の出力に `✓`（Pass）、`⚠`（Warning）、`✗`（Error）のプレフィックスが付いている           | Phase 1 で確認済 |
| AC-009 | NFR-003          | 検証ルールの追加・変更が `quick_validate.js` の1ファイルで完結する                                        | `.js` のソースコード構造が単一クラス（QuickValidationResult）+ validateSkill関数で構成されている                       | Phase 1 で確認済 |
| AC-010 | NFR-004          | 全3スキルの検証が合計30秒以内に完了する                                                                   | `time` コマンドで3スキルの連続実行を計測し、合計30秒未満であることを確認                                               | Phase 9, 11      |
| AC-011 | FR-003           | `spec-update-workflow.md` の `.js` パスが repo 内の相対パスまたは本プロジェクトの絶対パスで記載されている | `grep -c "ObsidianMemo" spec-update-workflow.md` が 0 を返す                                                           | Phase 5 実装後   |

## AC-006 検証結果（Phase 1 実施済み）

| スキル名                   | .js Error | .py Fail | 一致 |
| -------------------------- | --------- | -------- | ---- |
| aiworkflow-requirements    | 0         | 0        | Yes  |
| task-specification-creator | 0         | 0        | Yes  |
| skill-creator              | 0         | 0        | Yes  |

**結果**: Error 判定一致率 100%。AC-006 充足。

## AC-008 検証結果（Phase 1 実施済み）

`.js --verbose` 出力に以下のプレフィックスが使用されている:

- `✓` — パスした項目
- `⚠` — 警告
- `✗` — エラー

**結果**: AC-008 充足。

## AC-009 検証結果（Phase 1 実施済み）

`quick_validate.js` は以下の構造で検証ロジックが1ファイルに集約されている:

- `QuickValidationResult` クラス（結果管理）
- `validateSkill()` 関数（8つの検証チェック）
- `main()` 関数（CLI引数処理）
- 外部依存: `./utils.js`（共通ユーティリティ、検証ロジックには無関係）

**結果**: AC-009 充足。

## AC-010 検証結果（Phase 9/11 で実施予定）

Phase 1 時点での簡易計測（体感）: 3スキル合計で数秒以内に完了。正式計測は Phase 9 で実施。

## トレーサビリティマトリクス

| 要件    | AC-001 | AC-002 | AC-003 | AC-004 | AC-005 | AC-006 | AC-007 | AC-008 | AC-009 | AC-010 | AC-011 |
| ------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| FR-001  | x      | x      |        |        |        |        | x      |        |        |        |        |
| FR-002  |        |        |        |        |        |        | x      |        |        |        |        |
| FR-003  | x      |        |        |        |        |        |        |        |        |        | x      |
| FR-004  |        | x      |        |        |        |        |        |        |        |        |        |
| FR-005  |        |        | x      |        |        |        |        |        |        |        |        |
| FR-006  |        |        |        | x      |        |        |        |        |        |        |        |
| FR-007  |        |        |        |        | x      |        |        |        |        |        |        |
| NFR-001 |        |        |        | x      |        | x      |        |        |        |        |        |
| NFR-002 |        |        |        |        |        |        |        | x      |        |        |        |
| NFR-003 |        |        |        |        |        |        |        |        | x      |        |        |
| NFR-004 |        |        |        |        |        |        |        |        |        | x      |        |
| NFR-005 |        |        |        |        |        | x      |        |        |        |        |        |

全要件（FR-001〜007, NFR-001〜005）に対して1つ以上の AC が紐づいており、カバレッジ 100%。
