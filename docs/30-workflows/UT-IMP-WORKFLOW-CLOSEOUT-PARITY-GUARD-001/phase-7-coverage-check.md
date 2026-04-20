# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard 仕様策定  |
| 前提Phase  | Phase 6 完了（テスト拡充）                |
| 後続Phase  | Phase 8                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

---

## 目的

Phase 4-6 で作成したテスト群（正常系 / drift 系 / 境界系 / phase 本文 frontmatter / 部分 drift / 同時更新競合）が、AC-1〜AC-7 と新規/拡張スクリプトの実装パスを過不足なく被覆していることを **line / branch / function** の三軸カバレッジと **AC × テスト** トレーサビリティマトリクスで機械検証する。基準未達の場合は Phase 6 への戻し条件を明示する。

---

## 実行タスク

1. parity guard 関連スクリプト群（新規 1 / 拡張 2）に対しカバレッジ計測を実行する
2. `line / branch / function` の三軸を取得し、Phase 7 基準と照合する
3. drift シナリオ（S1〜S4 のいずれか単独 drift / 複合 drift / status 値違反）の被覆を確認する
4. AC-1〜AC-7 と Phase 4 / Phase 6 のテストケース ID の対応関係を **トレーサビリティマトリクス** に固定する
5. exit code 0 / 1 / 2 / 3 の四経路がすべて少なくとも 1 ケースで通過していることを確認する
6. 未到達パス（uncovered branch）を検出した場合、Phase 6 へ戻り追加テストを起票する
7. 成果物として `outputs/phase-7/coverage-report.md` と `outputs/phase-7/traceability-matrix.md` を出力する

---

## 参照資料

### 実装・コード

| 種別                 | パス                                                                            | 役割                                 |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| 新規                 | `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js` | parity validator 本体（read-only）   |
| 拡張                 | `.claude/skills/task-specification-creator/scripts/complete-phase.js`           | S1〜S3 同値更新 + atomic / rollback  |
| 拡張                 | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`         | parity 検証を PASS 判定前に組込み    |
| 既存比較             | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`    | 重複検知の比較対象（Phase 8 で扱う） |
| 仕様                 | `phase-4-test-creation.md`                                                      | Red テストケース ID                  |
| 仕様                 | `phase-6-test-expansion.md`                                                     | 拡張テストケース ID                  |
| 仕様                 | `outputs/phase-1/acceptance-criteria.md`                                        | AC-1〜AC-7 の正本                    |
| 拡張テストケース一覧 | `outputs/phase-6/extended-test-cases.md`                                        | Phase 6 成果物                       |

### システム仕様（aiworkflow-requirements）

| 種別            | 参照キー                                  | 役割                               |
| --------------- | ----------------------------------------- | ---------------------------------- |
| topic-map       | `task-workflow / closeout`                | close-out 三者同期の正本記述       |
| keywords        | `parity / SSOT / drift`                   | 用語統一                           |
| resource-map    | `lessons-learned / phase-12`              | Phase 12 完了チェックリストの位置  |
| quick-reference | `complete-phase.js / verify-all-specs.js` | スクリプト呼び出しインターフェース |

---

## カバレッジ基準

| 軸             | 基準値   | 対象スコープ                                                                                      |
| -------------- | -------- | ------------------------------------------------------------------------------------------------- |
| Line           | 80% 以上 | `validate-closeout-parity.js` / `complete-phase.js` 追加分 / `verify-all-specs.js` 追加分         |
| Branch         | 60% 以上 | exit code 0/1/2/3 分岐 + S1〜S4 drift 判定分岐 + atomic 失敗時 rollback 分岐                      |
| Function       | 80% 以上 | parity 比較関数 / source loader (S1〜S4) / status normalizer / json reporter                      |
| Exit code 経路 | 4/4 通過 | `0=PARITY_OK`, `1=PARITY_DRIFT`, `2=MISSING_SOURCE`, `3=INVALID_STATUS_VALUE` 全てに最低 1 テスト |

---

## 実行手順

```bash
# 1. parity guard スクリプト群のカバレッジ計測
node --experimental-vm-modules \
  .claude/skills/task-specification-creator/scripts/__tests__/run-coverage.js \
  --target validate-closeout-parity.js,complete-phase.js,verify-all-specs.js \
  --report outputs/phase-7/coverage-report.md

# 2. exit code 経路網羅確認（4 経路すべての fixture を順次実行）
for code in 0 1 2 3; do
  node .claude/skills/task-specification-creator/scripts/__tests__/fixtures/run-exit-${code}.js
done

# 3. AC × Test トレーサビリティ生成
node .claude/skills/task-specification-creator/scripts/__tests__/build-traceability.js \
  --ac outputs/phase-1/acceptance-criteria.md \
  --tests phase-4-test-creation.md,phase-6-test-expansion.md \
  --out outputs/phase-7/traceability-matrix.md
```

> 上記コマンドは Phase 5 / Phase 6 の成果として用意される計測ハーネスを呼び出す。ハーネス未提供の場合、Phase 6 へ戻し追加実装を起票する。

---

## AC × Test トレーサビリティマトリクス（雛形）

| AC   | 概要                                                                              | 対応テスト（Phase 4 / Phase 6） | カバー確認 |
| ---- | --------------------------------------------------------------------------------- | ------------------------------- | ---------- |
| AC-1 | 三者+phase 本文の status 一致で exit 0 / drift で exit 1                          | TC-01, TC-02, TC-12             | [ ]        |
| AC-2 | drift レポート構造化出力 (`--json`)                                               | TC-03, TC-13                    | [ ]        |
| AC-3 | `verify-all-specs.js` への組込み（PASS 前 gate）                                  | TC-04, TC-14                    | [ ]        |
| AC-4 | `complete-phase.js` が S1〜S3 を同値更新 + atomic/rollback                        | TC-05, TC-06, TC-15, TC-16      | [ ]        |
| AC-5 | `phase-12-completion-checklist.md` への反映                                       | TC-07, TC-17                    | [ ]        |
| AC-6 | 両 skill への教訓還流（`task-specification-creator` / `aiworkflow-requirements`） | TC-08, TC-18                    | [ ]        |
| AC-7 | 既存ワークフロー遡及修正なし（既存 fixture の status 不変）                       | TC-09, TC-10, TC-19, TC-20      | [ ]        |

> テスト ID は Phase 4 / Phase 6 の確定値で書き換える。空欄は未割当のため Phase 6 戻し条件となる。

---

## 不足カバレッジ検出時の戻し条件

| 検出条件                                      | 戻し先 Phase | 起票内容                                                                 |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| Line / Branch / Function いずれかが基準値未達 | Phase 6      | 未到達 branch を含む追加テストケース ID と対象ソース行範囲を明記して追加 |
| exit code 経路 4/4 のうち未通過あり           | Phase 6      | 未通過 exit code 値と再現 fixture を起票                                 |
| AC-1〜AC-7 のいずれかが「対応テストなし」     | Phase 6      | AC ID と必要シナリオを起票（drift / 正常 / 境界の 3 系統で確認）         |
| atomic 失敗 → rollback 経路が一度も呼ばれない | Phase 6      | rollback fixture（書き込み中断シミュレーション）の追加を起票             |

---

## 統合テスト連携

本 Phase は Phase 4 / Phase 6 のテスト成果物を集計し、Phase 8 以降で追加するリファクタリング・品質保証の判定材料を確定する。

| 引き渡し項目                         | 受け手                     | 形式                                |
| ------------------------------------ | -------------------------- | ----------------------------------- |
| AC × Test トレーサビリティマトリクス | Phase 8 / Phase 10         | `traceability-matrix.md` の対応表   |
| 未到達 branch 一覧                   | Phase 6（戻し時）/ Phase 8 | 未到達 branch と対応ソース行範囲    |
| exit code 0/1/2/3 経路の通過状況     | Phase 9                    | `coverage-report.md` の exit 経路表 |
| rollback 経路の呼出確認              | Phase 8 / Phase 9          | 呼出ログと fixture 再現手順         |

Phase 9 の品質保証ゲートは本 Phase のカバレッジレポートを直接参照する。

## 成果物

- `outputs/phase-7/coverage-report.md`
  - parity guard 関連スクリプト群の line / branch / function カバレッジ
  - exit code 経路 4/4 通過状況
  - 未到達 branch 一覧（戻し対象の根拠）
- `outputs/phase-7/traceability-matrix.md`
  - AC-1〜AC-7 × Phase 4 / Phase 6 テストケース対応表
  - drift シナリオ（S1〜S4 単独 / 複合）の網羅状況

---

## 完了条件

- [ ] line 80% / branch 60% / function 80% を全て満たす
- [ ] exit code 0 / 1 / 2 / 3 の 4 経路に最低 1 テストが通過
- [ ] AC-1〜AC-7 が全てトレーサビリティマトリクスに紐付く
- [ ] 未到達 branch ゼロ、または未到達 branch の Phase 6 戻し票が起票済み
- [ ] `outputs/phase-7/coverage-report.md` 出力完了
- [ ] `outputs/phase-7/traceability-matrix.md` 出力完了

---

## タスク100%実行確認【必須】

- [ ] カバレッジ計測コマンド実行完了
- [ ] line / branch / function 三軸の基準照合完了
- [ ] exit code 0/1/2/3 経路の通過確認完了
- [ ] AC × Test トレーサビリティマトリクス完成
- [ ] 不足カバレッジに対する Phase 6 戻し票発行（該当時）
- [ ] 成果物 2 ファイル出力完了
- [ ] Phase 7 ステータスを三者同値で `completed` に更新（自己 dogfooding）

---

## 次Phase

Phase 8（リファクタリング）へ進む。基準未達がある場合は Phase 6 へ戻し、未到達 branch を解消したうえで Phase 7 を再実行する。
