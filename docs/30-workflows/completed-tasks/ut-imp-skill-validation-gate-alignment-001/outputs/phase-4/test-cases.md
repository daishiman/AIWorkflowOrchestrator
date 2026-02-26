# テストケース一覧

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| タスクID   | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 |
| Phase      | 4                                          |
| 作成日     | 2026-02-26                                 |
| テスト総数 | 45                                         |

## 1. テストシナリオ（Task 4-1）

### 1.1 要件由来シナリオ（TS-001 ~ TS-011）

| シナリオID | 要件    | シナリオ                                                | 期待結果                                  | テストID       |
| ---------- | ------- | ------------------------------------------------------- | ----------------------------------------- | -------------- |
| TS-001     | FR-001  | `spec-update-workflow.md` の検証コマンドが `.js` を指定 | `.py` への参照が0件                       | (Phase 5 検証) |
| TS-002     | FR-002  | `.py` の使用条件が fallback 限定として記載              | Node.js 不可時のみ `.py` を使用する旨記載 | (Phase 5 検証) |
| TS-003     | FR-003  | Step 1-G の検証コマンドが正規経路に統一                 | `.js` のコマンドのみ記載                  | (Phase 5 検証) |
| TS-004     | FR-004  | `phase-11-12-guide.md` の参照が正規経路に統一           | `.py` への参照が0件                       | (Phase 5 検証) |
| TS-005     | FR-005  | Warning が3段階に分類される                             | 分類ルールが文書化されている              | (Phase 5 検証) |
| TS-006     | FR-006  | 検証結果判定基準が明文化                                | Error 0件で合格と明記                     | (Phase 5 検証) |
| TS-007     | FR-007  | 参照リンク Warning の許容条件                           | 許容条件と理由が記載                      | (Phase 5 検証) |
| TS-008     | NFR-001 | 同一入力に対して同一結果                                | 2回実行して出力が一致                     | TS-008         |
| TS-009     | NFR-002 | Error / Warning / Pass が出力で一目で識別可能           | 各 severity が区別できるフォーマット      | TS-009         |
| TS-010     | NFR-004 | 検証が制限時間内に完了                                  | 実行時間 < 10秒（単一スキル）             | TS-010         |
| TS-011     | NFR-005 | 既存の Error 判定が変更されていない                     | 既存 Error パターンの判定結果不変         | TS-011         |

### 1.2 受入基準由来シナリオ（TS-AC-001 ~ TS-AC-006）

| シナリオID | AC     | シナリオ                                     | 検証方法                                  | テストID       |
| ---------- | ------ | -------------------------------------------- | ----------------------------------------- | -------------- |
| TS-AC-001  | AC-001 | `spec-update-workflow.md` に `.py` 参照が0件 | `grep -c "quick_validate.py"` が 0 を返す | (Phase 5 検証) |
| TS-AC-002  | AC-002 | `phase-11-12-guide.md` に `.py` 参照が0件    | `grep -c "quick_validate.py"` が 0 を返す | (Phase 5 検証) |
| TS-AC-003  | AC-003 | Warning 3段階分類ルールが文書化              | セクションの存在確認                      | (Phase 5 検証) |
| TS-AC-004  | AC-004 | 3スキルに `.js` 実行して Error 0件           | 終了コード 0                              | TC-N-001       |
| TS-AC-005  | AC-005 | 参照リンク Warning の許容条件が明記          | 対象パターンと許容理由の記載確認          | (Phase 5 検証) |
| TS-AC-006  | AC-006 | `.js` と `.py` で Error 判定が一致           | Error 項目の一致率 100%                   | (Phase 6 検証) |

## 2. 全テストケーステーブル（Task 4-2 ~ 4-4）

### 2.1 正常系テスト（14件）

| テストID | テスト名                                     | 入力条件                 | 期待結果                                   | カテゴリ | 対応する要件/検証項目 |
| -------- | -------------------------------------------- | ------------------------ | ------------------------------------------ | -------- | --------------------- |
| TC-N-001 | valid-skill で終了コード 0（Error 0件）      | valid-skill フィクスチャ | 終了コード 0                               | 正常系   | FR-006, AC-004        |
| TC-N-002 | valid-skill で検証成功メッセージが出力される | valid-skill フィクスチャ | 「検証成功」を含む出力                     | 正常系   | NFR-002               |
| TC-N-003 | valid-skill で Error 件数が 0                | valid-skill フィクスチャ | Error 0件                                  | 正常系   | FR-006                |
| TC-N-004 | valid-skill で Warning 件数が 0              | valid-skill フィクスチャ | Warning 0件                                | 正常系   | FR-005                |
| TC-N-005 | valid-skill で Pass 件数が 1 以上            | valid-skill フィクスチャ | Pass >= 1                                  | 正常系   | NFR-002               |
| TC-N-006 | (1) SKILL.md 存在確認がパス                  | valid-skill + verbose    | verbose に「SKILL.md が存在する」          | 正常系   | 検証項目1             |
| TC-N-007 | (2) 行数制限がパス                           | valid-skill + verbose    | verbose に「500 行以内」                   | 正常系   | 検証項目2             |
| TC-N-008 | (3) YAML frontmatter がパス                  | valid-skill + verbose    | verbose に「frontmatter が存在する」       | 正常系   | 検証項目3             |
| TC-N-009 | (4) name フィールドがパス                    | valid-skill + verbose    | verbose に「ハイフンケース」               | 正常系   | 検証項目4             |
| TC-N-010 | (5) description フィールドがパス             | valid-skill + verbose    | verbose に「1024 文字以内」                | 正常系   | 検証項目5             |
| TC-N-011 | (6) description に Anchors が含まれる        | valid-skill + verbose    | verbose に「Anchors が含まれている」       | 正常系   | 検証項目6             |
| TC-N-012 | (6) description に Trigger が含まれる        | valid-skill + verbose    | verbose に「Trigger が含まれている」       | 正常系   | 検証項目6             |
| TC-N-013 | (7) 不要な補助ドキュメントが存在しない       | valid-skill + verbose    | verbose に「補助ドキュメントが存在しない」 | 正常系   | 検証項目7             |
| TC-N-014 | (8) references/ ファイルがリンクされている   | valid-skill + verbose    | 「リンクされていません」が出力されない     | 正常系   | 検証項目8             |

### 2.2 異常系テスト（12件）

| テストID | テスト名                                                       | 入力条件         | 期待結果                                       | カテゴリ | 対応する要件/検証項目 |
| -------- | -------------------------------------------------------------- | ---------------- | ---------------------------------------------- | -------- | --------------------- |
| TC-E-001 | SKILL.md が存在しないディレクトリで Error 1件                  | no-skill-md      | 終了コード != 0, Error >= 1                    | 異常系   | 検証項目1             |
| TC-E-002 | 501行の SKILL.md で Error 1件                                  | over-limit       | 終了コード != 0, Error >= 1                    | 異常系   | 検証項目2             |
| TC-E-003 | frontmatter なし SKILL.md で Error 1件                         | no-frontmatter   | 終了コード != 0, Error >= 1                    | 異常系   | 検証項目3             |
| TC-E-004 | 65文字の name で Error 1件                                     | (間接検証)       | 64文字境界でError出ないことの裏返し            | 異常系   | 検証項目4             |
| TC-E-005 | キャメルケース name で Error 1件                               | invalid-name     | 終了コード != 0, Error >= 1                    | 異常系   | 検証項目4             |
| TC-E-006 | name がディレクトリ名と異なる場合に Warning 1件                | boundary-64-name | Warning >= 1, 「一致しません」                 | 異常系   | 検証項目4             |
| TC-E-007 | 1025文字の description で Error 1件                            | (間接検証)       | 1024文字境界でError出ないことの裏返し          | 異常系   | 検証項目5             |
| TC-E-008 | `<script>` を含む description で Error 1件                     | (間接検証)       | valid-skillで角括弧Errorが出ないことの確認     | 異常系   | 検証項目5             |
| TC-E-009 | Anchors も箇条書き記号も含まない description で Warning        | (間接検証)       | valid-skillでAnchors Warningが出ないことの確認 | 異常系   | 検証項目6             |
| TC-E-010 | Trigger も use when も含まない description で Warning          | (間接検証)       | valid-skillでTrigger Warningが出ないことの確認 | 異常系   | 検証項目6             |
| TC-E-011 | README.md が存在するスキルで Error 1件                         | forbidden-files  | 終了コード != 0, Error >= 1                    | 異常系   | 検証項目7             |
| TC-E-012 | references/ にファイルがあるが SKILL.md にリンクなしで Warning | unlinked-refs    | Warning >= 1, 「リンクされていません」         | 異常系   | 検証項目8             |

### 2.3 境界値テスト（3件）

| テストID | テスト名                                             | 入力条件           | 期待結果            | カテゴリ | 対応する要件/検証項目 |
| -------- | ---------------------------------------------------- | ------------------ | ------------------- | -------- | --------------------- |
| TC-B-001 | ちょうど500行の SKILL.md で行数制限 Error なし       | boundary-500-lines | 行数超過 Error なし | 境界値   | 検証項目2             |
| TC-B-002 | ちょうど64文字の name で長さ制限 Error なし          | boundary-64-name   | 長さ超過 Error なし | 境界値   | 検証項目4             |
| TC-B-003 | ちょうど1024文字の description で長さ制限 Error なし | boundary-1024-desc | 長さ超過 Error なし | 境界値   | 検証項目5             |

### 2.4 運用フローテスト（4件）

| テストID  | テスト名                                       | 入力条件                 | 期待結果                         | カテゴリ   | 対応する要件/検証項目 |
| --------- | ---------------------------------------------- | ------------------------ | -------------------------------- | ---------- | --------------------- |
| TC-OP-001 | 正規経路の検証コマンドが正常に実行可能         | quick_validate.js        | スクリプト存在 + 正常終了        | 運用フロー | FR-001                |
| TC-OP-002 | 検証結果出力が一意に解釈可能                   | valid-skill フィクスチャ | 結果サマリに Error/Warning/Pass  | 運用フロー | FR-006, NFR-002       |
| TC-OP-003 | fallback 経路の .py スクリプトが存在するか確認 | .py パス                 | 正規経路（.js）が動作            | 運用フロー | FR-002                |
| TC-OP-004 | Error と Warning が視覚的に区別できる出力      | no-skill-md + unlinked   | Error/Warning の識別記号が異なる | 運用フロー | NFR-002               |

### 2.5 Warning 分類テスト（6件）

| テストID  | テスト名                                               | 入力条件                   | 期待結果                       | カテゴリ     | 対応する要件/検証項目 |
| --------- | ------------------------------------------------------ | -------------------------- | ------------------------------ | ------------ | --------------------- |
| TC-WC-001 | SKILL.md 不在、name 形式不正は Error（即時対応）分類   | no-skill-md + invalid-name | Error >= 1                     | Warning 分類 | FR-005, FR-006        |
| TC-WC-002 | name とディレクトリ名の不一致は Warning（要対応）分類  | boundary-64-name           | Warning >= 1, 「一致しません」 | Warning 分類 | FR-005                |
| TC-WC-003 | references/ 未リンクファイルは Warning（許容候補）分類 | unlinked-refs              | Warning >= 1, Error == 0       | Warning 分類 | FR-005, FR-007        |
| TC-WC-004 | Anchors/Trigger を含むスキルで当該 Warning が出ない    | valid-skill                | Warning == 0                   | Warning 分類 | FR-005                |
| TC-WC-005 | errors + warnings + passed の集計が正確                | valid-skill                | 各件数が非負整数、合計が整合   | Warning 分類 | NFR-002               |
| TC-WC-006 | Warning 0件のスキル（クリーン状態）                    | valid-skill                | Warning == 0, Error == 0       | Warning 分類 | FR-005                |

### 2.6 Warning 3段階分類テスト（2件 -- Phase 5 実装予定、FAIL期待）

| テストID      | テスト名                                                                 | 入力条件      | 期待結果                                        | カテゴリ         | 対応する要件/検証項目 |
| ------------- | ------------------------------------------------------------------------ | ------------- | ----------------------------------------------- | ---------------- | --------------------- |
| TC-WC-NEW-001 | Warning 出力に severity レベル（warning-known/warning-action）が含まれる | unlinked-refs | 分類ラベルが出力に含まれる                      | Warning 新規分類 | FR-005                |
| TC-WC-NEW-002 | Warning 分類の集計サマリが出力される                                     | unlinked-refs | 「許容: N件」「要監視: N件」「要対応: N件」形式 | Warning 新規分類 | FR-005, FR-006        |

### 2.7 NFR テスト（4件）

| テストID | テスト名                                              | 入力条件            | 期待結果                                | カテゴリ | 対応する要件/検証項目 |
| -------- | ----------------------------------------------------- | ------------------- | --------------------------------------- | -------- | --------------------- |
| TS-008   | 同一入力に対して同一結果（再現性）                    | valid-skill x 2回   | Error/Warning/Pass 件数と終了コード一致 | NFR      | NFR-001               |
| TS-009   | 出力で Error / Warning / Pass が一目で識別可能        | valid-skill verbose | verbose に Pass 識別記号含む            | NFR      | NFR-002               |
| TS-010   | valid-skill の検証が10秒以内に完了                    | valid-skill         | 実行時間 < 10秒                         | NFR      | NFR-004               |
| TS-011   | 既存 Error パターンの判定結果が変わらない（後方互換） | 4フィクスチャ       | 全て終了コード != 0                     | NFR      | NFR-005               |

## 3. テストケース総数サマリ

| カテゴリ         | テスト数 |
| ---------------- | -------- |
| 正常系           | 14       |
| 異常系           | 12       |
| 境界値           | 3        |
| 運用フロー       | 4        |
| Warning 分類     | 6        |
| Warning 新規分類 | 2        |
| NFR              | 4        |
| **合計**         | **45**   |

## 4. 要件トレーサビリティマトリクス

### 4.1 FR トレーサビリティ

| FR-ID  | テストID                                     | カバー状態 |
| ------ | -------------------------------------------- | ---------- |
| FR-001 | TC-OP-001                                    | Phase 4 済 |
| FR-002 | TC-OP-003                                    | Phase 4 済 |
| FR-003 | (Phase 5 でドキュメント検証)                 | Phase 5    |
| FR-004 | (Phase 5 でドキュメント検証)                 | Phase 5    |
| FR-005 | TC-WC-001~006, TC-WC-NEW-001, TC-WC-NEW-002  | Phase 4 済 |
| FR-006 | TC-N-001, TC-N-003, TC-OP-002, TC-WC-NEW-002 | Phase 4 済 |
| FR-007 | TC-WC-003                                    | Phase 4 済 |

### 4.2 NFR トレーサビリティ

| NFR-ID  | テストID          | カバー状態 |
| ------- | ----------------- | ---------- |
| NFR-001 | TS-008            | Phase 4 済 |
| NFR-002 | TS-009, TC-OP-004 | Phase 4 済 |
| NFR-003 | (構造確認)        | Phase 5    |
| NFR-004 | TS-010            | Phase 4 済 |
| NFR-005 | TS-011            | Phase 4 済 |

### 4.3 AC トレーサビリティ

| AC-ID  | テストID       | カバー状態 |
| ------ | -------------- | ---------- |
| AC-001 | (Phase 5 grep) | Phase 5    |
| AC-002 | (Phase 5 grep) | Phase 5    |
| AC-003 | (Phase 5 検証) | Phase 5    |
| AC-004 | TC-N-001       | Phase 4 済 |
| AC-005 | (Phase 5 検証) | Phase 5    |
| AC-006 | (Phase 6 統合) | Phase 6    |
