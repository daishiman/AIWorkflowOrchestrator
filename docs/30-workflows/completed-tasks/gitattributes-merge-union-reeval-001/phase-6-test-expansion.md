# Phase 6: テスト拡充（fail path / 回帰 guard）

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 5（`.gitattributes` 修正実装）      |
| 後続Phase  | Phase 7（テストカバレッジ確認）           |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 5 で修正した `.gitattributes` が「想定外の操作・誤設定・将来の追加ファイル」によって再び破綻しないように、fail path（異常系）と回帰 guard（防御テスト）を拡充する。さらに `.gitattributes` 各エントリを `git check-attr` で逆引き検証する補助コマンドを仕様化し、新規ファイル追加時に運用者が判断を誤らない仕組みを Phase 7 以降へ橋渡しする。

## 背景

`.gitattributes` の修正は静的設定のため、ロジックバグではなく「将来の運用ミス」が主要なリスクとなる。具体的には (a) `merge.ours.driver` の登録忘れ、(b) 構造化ドキュメントを誤って `merge=union` glob に含めてしまう変更、(c) 新規 `references/<新ファイル>.md` 追加時の判断ガイド欠如、の 3 つ。本 Phase ではこれらに対応する fail/regression テストを設計し、補助コマンドで継続検証可能な状態を作る。

## 実行タスク

### タスク0: fail path 追加

**目的**: 異常系の検出可否をテストで担保する。

**実行手順**:

1. **FAIL-01: `merge.ours.driver` 未登録時のエラー観測**
   - シナリオ: `setup-merge-drivers.sh` を実行せずに `indexes/<name>.json` を双方ブランチで変更 → merge。
   - 期待: stderr に「merge driver not found」または同等の warning が出力され、デフォルトマージへフォールバックする。
   - assert: warning 文字列の grep + 最終ファイルにコンフリクトマーカー有無を確認（環境差を吸収するため両方を許容）。
2. **FAIL-02: glob から外したつもりが適用されているケースの検出**
   - シナリオ: `task-workflow.md` に対して `git check-attr merge` を実行し、`merge: union` が **返らない** ことを assert。
   - 補助: `references/*.md` の中で `merge: union` が付与されているファイル一覧を列挙し、append-only ホワイトリストとの差分を検出。
3. 各 fail path を Phase 4 のシミュレーションスクリプト引数（`--scenario FAIL-01` 等）として追加する手順を Markdown で記述（実装は手動テスト Phase で実行）。

**期待される成果物**: `outputs/phase-6/test-expansion-record.md` の「fail path」章。

### タスク1: 回帰 guard 追加

**目的**: 既存運用が継続して動作することと、新規追加時の判断ミスを未然に防ぐことを保証する。

**実行手順**:

1. **REG-01: 新規 `references/<新ファイル>.md` 追加時の判断ガイド存在検証**
   - assert: `.gitattributes` 内に「新規ファイル追加判断:」コメントが各 `references` 関連エントリに付与されている（grep でコメント行数 ≥ エントリ数）。
   - assert: タスク用 README または `index.md` に「新規 references ファイルの分類フロー」が記載されている（Phase 12 で正本化される前提のリンク準備）。
2. **REG-02: `LOGS.md` 並列追記が引き続き `merge=union` で破綻しないこと**
   - シナリオ: TC-01 と同一手順を Phase 5 修正後の `.gitattributes` で再実行。
   - 期待: 両ブランチの追記行が重複なく union 結合される。
3. **REG-03: `setup-merge-drivers.sh` 冒頭コメント変更が機能を破壊していないこと**
   - assert: スクリプトを bash で dry-run 実行し、`git config merge.ours.driver` が登録されること。

**期待される成果物**: `outputs/phase-6/test-expansion-record.md` の「回帰 guard」章。

### タスク2: 補助コマンド整備（仕様のみ）

**目的**: 新規ファイル追加時に開発者が手元で `.gitattributes` の整合性を確認できる検証コマンドを仕様化する（実装は Phase 7 以降のリファクタリング/手動テスト Phase で扱う）。

**実行手順**:

1. `scripts/check-gitattributes.sh`（仮称）の責務を以下に固定する。
   - `.gitattributes` を逆引きし、append-only ホワイトリストに無いファイルへ `merge=union` が適用されていないか検出。
   - `indexes/*.json` 全件に対し `merge=ours` が適用されているか確認。
   - 出力フォーマット: 1 行 1 違反、終了コード 0=OK / 1=違反あり。
2. 入出力契約・依存（`git check-attr`、`find`）・想定実行頻度（pre-commit / CI 任意）を Markdown で記述。
3. 「実装は本タスクのスコープ外。Issue 起票候補として REC-01 を残す」と明記する。

**期待される成果物**: `outputs/phase-6/test-expansion-record.md` の「補助コマンド仕様」章。

### タスク3: テスト拡充の総括と Phase 7 への引継ぎ

**目的**: カバレッジ確認 Phase で利用するチェックリストを生成する。

**実行手順**:

1. Phase 4 の TC-01〜TC-05 と Phase 6 の FAIL-01〜02 / REG-01〜03 を 1 表に統合し、現時点での PASS/FAIL/未実行を記録。
2. 未実行項目（Phase 11 の手動テストで初めて検証する項目）に印を付け、Phase 7 のカバレッジ計算対象から除外する。
3. 推奨 Issue（補助コマンド実装、CI 連携、ドキュメントテンプレート整備）を REC-XX 形式でリストアップ。

**期待される成果物**: `outputs/phase-6/test-expansion-record.md` の「総括」章。

## 参照資料

| 参照資料                  | パス                                          | 内容                           |
| ------------------------- | --------------------------------------------- | ------------------------------ |
| Phase 4 テスト設計        | `outputs/phase-4/test-design.md`              | TC-01〜TC-05 の本体            |
| Phase 4 マトリクス        | `outputs/phase-4/expected-behavior-matrix.md` | 期待挙動の根拠                 |
| Phase 5 実装サマリー      | `outputs/phase-5/implementation-summary.md`   | 修正後 `.gitattributes` の状態 |
| Git 公式 `check-attr` doc | <https://git-scm.com/docs/git-check-attr>     | 逆引き検証の根拠               |

## 成果物

| 成果物         | パス                                       | 内容                                      |
| -------------- | ------------------------------------------ | ----------------------------------------- |
| テスト拡充記録 | `outputs/phase-6/test-expansion-record.md` | fail path / 回帰 guard / 補助コマンド仕様 |

## 統合テスト連携【必須】

| 判定項目                                         | 基準                                                         | 結果    |
| ------------------------------------------------ | ------------------------------------------------------------ | ------- |
| FAIL-01〜02 が定義され、検出可否が説明されている | 異常系 2 件の手順・期待結果・assert が記述                   | pending |
| REG-01〜03 が定義され、既存運用継続が担保される  | 回帰 3 件が `.gitattributes` 修正後の挙動で PASS する見込み  | pending |
| 補助コマンド仕様がスコープ内/外を明示            | 実装はスコープ外、REC として Issue 起票候補が記録            | pending |
| Phase 7 引継ぎ用のチェックリストが存在           | TC + FAIL + REG を 1 表に統合し PASS/FAIL/未実行の状態を記録 | pending |

## 完了条件

- [ ] FAIL-01・FAIL-02 を `outputs/phase-6/test-expansion-record.md` に記述
- [ ] REG-01・REG-02・REG-03 を同ファイルに記述
- [ ] `scripts/check-gitattributes.sh`（仮称）の入出力契約とスコープ外宣言を記述
- [ ] TC + FAIL + REG を統合した引継ぎチェックリストを作成
- [ ] Phase 6 ではコード変更を一切行わないことを確認
- [ ] `complete-phase.js` で Phase 6 を complete に更新
