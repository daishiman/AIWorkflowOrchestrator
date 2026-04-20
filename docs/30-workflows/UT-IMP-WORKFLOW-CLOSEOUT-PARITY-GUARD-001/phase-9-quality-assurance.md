# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard 仕様策定  |
| 前提Phase  | Phase 8 完了（リファクタリング）          |
| 後続Phase  | Phase 10                                  |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

---

## 目的

出荷品質を一括判定する。**line budget 規約** / **Markdown link 切れ** / **mirror parity (`diff -qr`)** / **lint** / **typecheck** / **全テスト PASS** / **Phase 3 MINOR 指摘解決** を 1 セットの品質ゲートとして検査し、PASS 全項目達成で Phase 10 のレビューゲートに進める状態を作る。

---

## 実行タスク

1. line budget 検査: 新規 `validate-closeout-parity.js` および拡張部の行数を line budget 規約に照合
2. Markdown link 検査: 仕様書（Phase 1〜Phase 10）内の相対リンクが全て有効
3. mirror parity 検査: `.claude/` と `.agents/` の `diff -qr` が 0 件
4. lint / typecheck: `pnpm lint` / `pnpm typecheck` の PASS
5. 全テスト実行: Phase 4 / Phase 6 のテスト + exit code 0/1/2/3 経路 fixture 全 PASS
6. Phase 3 MINOR 指摘の全解決を確認
7. parity validator の dogfooding: 本ワークフロー自身に validator を流して exit 0 を確認
8. 成果物として `outputs/phase-9/quality-assurance-report.md` を出力

---

## 参照資料

### 実装・コード

| 種別                 | パス                                                                            | 役割                                   |
| -------------------- | ------------------------------------------------------------------------------- | -------------------------------------- |
| 検査対象             | `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js` | line budget / lint / typecheck         |
| 検査対象             | `.claude/skills/task-specification-creator/scripts/complete-phase.js`           | line budget（差分） / lint / typecheck |
| 検査対象             | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`         | line budget（差分） / lint / typecheck |
| ミラー               | `.agents/skills/task-specification-creator/scripts/`                            | mirror parity（`diff -qr`）            |
| 仕様                 | `phase-3-design-review.md`                                                      | MINOR 指摘リスト                       |
| 仕様                 | `phase-7-coverage-check.md`                                                     | カバレッジ最終値                       |
| 仕様                 | `phase-8-refactoring.md`                                                        | リファクタリング後の検査対象           |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`                                     | Phase 5 成果物                         |
| 変更ファイル一覧     | `outputs/phase-5/changed-files.md`                                              | Phase 5 成果物                         |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`                                           | Phase 8 成果物                         |
| リファクタリング結果 | `outputs/phase-8/refactoring-results.md`                                        | Phase 8 成果物                         |

### システム仕様（aiworkflow-requirements）

| 種別            | 参照キー                                      | 役割                    |
| --------------- | --------------------------------------------- | ----------------------- |
| topic-map       | `task-workflow / quality-gate`                | 品質ゲート定義          |
| keywords        | `line-budget / mirror-parity / link-check`    | 検査用語統一            |
| resource-map    | `lessons-learned / parity-guard / dogfooding` | dogfooding 結果の格納先 |
| quick-reference | `pnpm lint / pnpm typecheck / diff -qr`       | 品質チェックコマンド    |

---

## 品質チェックコマンド

```bash
# 1. Line budget 検査
node .claude/skills/task-specification-creator/scripts/check-line-budget.js \
  --target .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js,\
.claude/skills/task-specification-creator/scripts/complete-phase.js,\
.claude/skills/task-specification-creator/scripts/verify-all-specs.js

# 2. Markdown link 検査
node .claude/skills/task-specification-creator/scripts/check-markdown-links.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

# 3. Mirror parity 検査
diff -qr .claude/skills/task-specification-creator/scripts/ \
         .agents/skills/task-specification-creator/scripts/
# 期待: 出力 0 行

# 4. Lint / Typecheck
pnpm lint
pnpm typecheck

# 5. 全テスト実行
node .claude/skills/task-specification-creator/scripts/__tests__/run-all.js
for code in 0 1 2 3; do
  node .claude/skills/task-specification-creator/scripts/__tests__/fixtures/run-exit-${code}.js
done

# 6. Dogfooding（本ワークフロー自身に parity validator を流す）
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 --json
# 期待: exit 0, status="PARITY_OK"
```

---

## 品質ゲート

| チェック項目                                           | 合格基準                                | 結果 |
| ------------------------------------------------------ | --------------------------------------- | ---- |
| Line budget 規約照合                                   | 全ファイル基準内                        | [ ]  |
| Markdown link 検査                                     | 切れリンク 0 件                         | [ ]  |
| Mirror parity (`diff -qr .claude/ .agents/`)           | 出力 0 行                               | [ ]  |
| `pnpm lint`                                            | エラー 0                                | [ ]  |
| `pnpm typecheck`                                       | エラー 0                                | [ ]  |
| 全テスト実行                                           | 全 PASS                                 | [ ]  |
| Exit code 4 経路 fixture                               | 4/4 通過                                | [ ]  |
| カバレッジ（Phase 7 値）                               | line 80%+ / branch 60%+ / function 80%+ | [ ]  |
| Phase 3 MINOR 指摘                                     | 全解決                                  | [ ]  |
| Dogfooding (parity validator 本ワークフロー自身に適用) | exit 0 (`PARITY_OK`)                    | [ ]  |

---

## リスク台帳

| リスク                                        | 発生確率 | 影響度 | 対策                                                                 |
| --------------------------------------------- | -------- | ------ | -------------------------------------------------------------------- |
| `complete-phase.js` の atomic 書込中断        | 低       | 高     | rollback テスト（Phase 6 / 7 で網羅）+ exit code 経路の fixture      |
| S1〜S4 のいずれかが欠落（MISSING_SOURCE）     | 中       | 中     | `exit 2` で明示通知 + 人間可読 + `--json` 出力で原因 source 名を返却 |
| status 値ドリフト（許可値外）                 | 低       | 高     | 許可値を `scripts/lib/status.js` に一元定義 + `exit 3` で即時失敗    |
| `.claude/` と `.agents/` のミラー差分         | 中       | 中     | Phase 9 ゲートで `diff -qr` 0 行を必須化                             |
| 既存ワークフロー遡及修正の混入                | 低       | 高     | AC-7 の固定 + Phase 8 で grep ガード化                               |
| Dogfooding 失敗（本ワークフロー自身が drift） | 低       | 高     | 各 Phase 完了時の `complete-phase.js` 三者同値更新を必須化           |

---

## 多角的チェック観点（AI が判断）

| 観点       | チェック内容                                                                                |
| ---------- | ------------------------------------------------------------------------------------------- |
| 責務境界   | validator が書き込み系 API を一切呼んでいないか（grep ガードで検出）                        |
| 後方互換性 | `--json` 出力スキーマが既存 consumer から壊れる変更を含まないか                             |
| 性能       | parity 検査 1 ワークフロー当たり 1 秒未満で完了するか                                       |
| 因果ループ | drift 検出 → CI 失敗 → 自動再実行 が無限ループしないか（exit 1 はリトライ対象外であること） |
| dogfooding | 本タスク自身の Phase 1〜9 close-out が parity 違反を起こしていないか                        |

---

## 統合テスト連携

本 Phase は Phase 4 / Phase 6 / Phase 7 / Phase 8 の全テストを束ねて最終 PASS 判定を行う。

| 連携元 Phase | 引き取り項目                                         | 判定ゲート                  |
| ------------ | ---------------------------------------------------- | --------------------------- |
| Phase 4      | TDD Red → Green 遷移後の全ユニットテスト             | 100% PASS                   |
| Phase 6      | 拡張テストケース（drift 境界 / AC-3/5/7 E2E）        | 100% PASS                   |
| Phase 7      | カバレッジ（line 80% / branch 60% / function 80%）   | 基準充足                    |
| Phase 8      | リファクタリング後の回帰テスト / mirror parity       | 100% PASS + `diff -qr` 0 件 |
| 本 Phase     | dogfooding（本ワークフローに parity validator 適用） | exit 0（`PARITY_OK`）       |

dogfooding は本ワークフロー自身に対して `validate-closeout-parity.js --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 --json` を実行し、`code=PARITY_OK` を記録する。

## 成果物

- `outputs/phase-9/quality-assurance-report.md`
  - 全品質ゲート項目の結果
  - リスク台帳（更新後）
  - dogfooding 実行結果（本ワークフローへの parity validator 適用ログ）
  - mirror parity 結果

---

## 完了条件

- [ ] 全品質ゲート項目が PASS
- [ ] Phase 3 MINOR 指摘が全解決
- [ ] Dogfooding が exit 0 で成功
- [ ] mirror parity 差分 0
- [ ] リスク台帳が完成

---

## タスク100%実行確認【必須】

- [ ] Line budget 検査完了
- [ ] Markdown link 検査完了
- [ ] Mirror parity 検査完了
- [ ] Lint PASS
- [ ] Typecheck PASS
- [ ] 全テスト PASS
- [ ] Exit code 4 経路 fixture PASS
- [ ] Phase 3 MINOR 指摘全解決確認
- [ ] Dogfooding 実行・exit 0 確認
- [ ] 品質保証レポート出力完了
- [ ] Phase 9 ステータスを三者同値で `completed` に更新（自己 dogfooding）

---

## 次Phase

Phase 10（最終レビューゲート）へ進む。
