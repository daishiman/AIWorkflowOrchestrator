# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard 仕様策定  |
| 前提Phase  | Phase 7 完了（カバレッジ確認）            |
| 後続Phase  | Phase 9                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

---

## 目的

Phase 5 で新規追加した `validate-closeout-parity.js` と Phase 5 で拡張した `complete-phase.js` / `verify-all-specs.js` の 3 ファイルから、**重複コード** と **責務境界ドリフト** を排除する。とくに既存 `validate-phase-output.js` と新規 parity validator の間に重複した frontmatter パーサや status 正規化ロジックが残らないようにし、validator は **read-only**、writer は **`complete-phase.js` のみ** という責務境界を維持する。

---

## 実行タスク

1. 重複コード検出（frontmatter パース / status 正規化 / artifacts.json 読込 / drift レポート整形）
2. 共通 utility への抽出可否を判定し、抽出する場合は配置先を決定する
3. 責務境界の保守: validator は書き込み禁止 / writer は `complete-phase.js` だけが S1〜S3 を更新
4. ナビゲーションドリフト修正（`index.md` から各 phase への相対リンク / `artifacts.json` の path 一貫性）
5. 変更内容を `対象 / Before / After / 理由` テーブル形式で記録
6. リファクタリング後に Phase 6 / Phase 7 のテストおよび exit code 経路が全て PASS することを再確認
7. 成果物として `outputs/phase-8/refactoring-plan.md` と `outputs/phase-8/refactoring-results.md` を出力

---

## 参照資料

### 実装・コード

| 種別                       | パス                                                                            | 役割                                                 |
| -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 新規                       | `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js` | parity validator（read-only 制約あり）               |
| 拡張                       | `.claude/skills/task-specification-creator/scripts/complete-phase.js`           | S1〜S3 一括更新 + atomic / rollback（唯一の writer） |
| 拡張                       | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`         | parity 検証を PASS 判定前に挿入                      |
| 比較対象                   | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`    | 重複候補（frontmatter / status 正規化）              |
| ミラー                     | `.agents/skills/task-specification-creator/scripts/`                            | `.claude/` と同期（mirror parity 対象）              |
| 仕様                       | `phase-2-design.md`                                                             | 責務境界と配置の正本                                 |
| 仕様                       | `phase-7-coverage-check.md`                                                     | 未到達 branch の refactor 候補                       |
| 実装サマリー               | `outputs/phase-5/implementation-summary.md`                                     | Phase 5 成果物                                       |
| 変更ファイル一覧           | `outputs/phase-5/changed-files.md`                                              | Phase 5 成果物                                       |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`                                            | Phase 7 成果物                                       |
| トレーサビリティマトリクス | `outputs/phase-7/traceability-matrix.md`                                        | Phase 7 成果物                                       |

### システム仕様（aiworkflow-requirements）

| 種別            | 参照キー                              | 役割                         |
| --------------- | ------------------------------------- | ---------------------------- |
| topic-map       | `task-workflow / closeout`            | close-out 三者同期 SSOT 記述 |
| keywords        | `validator / writer / responsibility` | 責務境界の用語統一           |
| resource-map    | `lessons-learned / parity-guard`      | 教訓還流の格納先             |
| quick-reference | `mirror-parity / .claude vs .agents`  | ミラー差分判定の手順         |

---

## リファクタリング対象チェック

```bash
# 1. 重複ロジック検出（frontmatter / status 正規化 / artifacts.json reader）
grep -rn "parseFrontmatter\|normalizeStatus\|loadArtifactsJson" \
  .claude/skills/task-specification-creator/scripts/

# 2. 書き込み禁止違反検出（validator から writeFile / writeFileSync が呼ばれていないこと）
grep -rn "writeFile\|writeFileSync\|fs.write" \
  .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js
# 期待: 0 件

# 3. ナビゲーションドリフト検出（index.md と各 phase ファイル名の整合）
node .claude/skills/task-specification-creator/scripts/check-index-links.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001
```

---

## 変更記録テーブル（Before / After 形式）

| 対象                  | Before                                                                       | After                                                                                                         | 理由                                           |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `parseFrontmatter()`  | `validate-phase-output.js` と `validate-closeout-parity.js` で別実装         | 共通 utility `scripts/lib/frontmatter.js` に抽出し両者から import                                             | パース仕様の単一源化、drift 防止               |
| `normalizeStatus()`   | `complete-phase.js` と `validate-closeout-parity.js` で別実装                | `scripts/lib/status.js` に抽出し許可値 (`pending` / `in_progress` / `completed` / `blocked` / `-`) を一元定義 | 許可値ドリフト防止                             |
| `loadArtifactsJson()` | root と outputs で読込ロジックがコピペ                                       | `scripts/lib/artifacts-source.js` に S1〜S4 ローダーを統一                                                    | 読み手を一箇所にまとめ、責務境界の明示化       |
| validator の書き込み  | （誤実装時の保険コード残）                                                   | `validate-closeout-parity.js` から fs.write 系を完全排除                                                      | validator = read-only の責務境界を機械的に保証 |
| writer の重複         | `complete-phase.js` 以外から S1〜S3 を更新するパスが存在しないことを確認のみ | grep ガードを `__tests__/no-other-writer.test.js` として固定                                                  | writer 一元化を回帰テスト化                    |
| drift レポート整形    | validator 内に inline                                                        | `scripts/lib/drift-reporter.js` に抽出（json / human の 2 形式を 1 関数で）                                   | `--json` / 人間可読の双方を維持しつつ重複排除  |
| ミラー差分            | `.claude/` と `.agents/` で diff あり                                        | `diff -qr` で差分ゼロ                                                                                         | mirror parity 規約遵守                         |
| （実装後追記）        | （具体的な Before を記入）                                                   | （具体的な After を記入）                                                                                     | （理由を記入）                                 |

---

## 注意事項

- 動作を変更するリファクタリングは禁止（Phase 6 / Phase 7 テスト Green を維持）
- exit code (`0 / 1 / 2 / 3`) の意味を変えてはならない
- `--json` 出力スキーマは互換性維持（外部 consumer 想定）
- validator は **read-only**、writer は **`complete-phase.js` のみ** の境界を破ってはならない
- `.claude/` の変更は必ず `.agents/` に mirror（Phase 9 の mirror parity ゲートで再検査）

---

## 実行手順

```bash
# リファクタリング後の確認
node .claude/skills/task-specification-creator/scripts/__tests__/run-all.js
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

# exit code 0/1/2/3 経路の再確認
for code in 0 1 2 3; do
  node .claude/skills/task-specification-creator/scripts/__tests__/fixtures/run-exit-${code}.js
done

# ミラー差分ゼロ確認
diff -qr .claude/skills/task-specification-creator/scripts/ \
         .agents/skills/task-specification-creator/scripts/
```

---

## 統合テスト連携

本 Phase のリファクタリング後に Phase 6 / Phase 7 のテストを再実行して PASS を維持することが必須。抽出した共通 utility は以下のテストで回帰保証する。

| 抽出対象                                           | 回帰テスト配置                                 | Phase 9 ゲート対象 |
| -------------------------------------------------- | ---------------------------------------------- | ------------------ |
| frontmatter parser (`scripts/lib/frontmatter.js`)  | `scripts/__tests__/lib/frontmatter.test.js`    | Yes                |
| status normalizer (`scripts/lib/status.js`)        | `scripts/__tests__/lib/status.test.js`         | Yes                |
| artifacts.json loader (`scripts/lib/artifacts.js`) | `scripts/__tests__/lib/artifacts.test.js`      | Yes                |
| drift reporter (`scripts/lib/drift-reporter.js`)   | `scripts/__tests__/lib/drift-reporter.test.js` | Yes                |
| writer 一元化（validator read-only）               | `scripts/__tests__/no-other-writer.test.js`    | Yes                |

Phase 9 は本 Phase 完了後に全テスト PASS + `.claude/` / `.agents/` mirror parity 差分 0 件を確認する。

## 成果物

- `outputs/phase-8/refactoring-plan.md`
  - 抽出する共通 utility の一覧と配置先
  - 責務境界違反候補と排除方針
- `outputs/phase-8/refactoring-results.md`
  - `対象 / Before / After / 理由` 変更記録テーブル（実施結果）
  - リファクタリング後の Phase 6 / Phase 7 テスト再実行結果
  - mirror parity 確認結果（`diff -qr` の出力 0 件）

---

## 完了条件

- [ ] 重複コード（frontmatter / status / artifacts loader / drift reporter）が共通 utility に集約されている
- [ ] validator (`validate-closeout-parity.js`) に書き込み系 API が一切存在しない
- [ ] writer は `complete-phase.js` の 1 ファイルに限定されている
- [ ] 変更記録テーブルが `対象 / Before / After / 理由` で完成
- [ ] Phase 6 / Phase 7 の全テストがリファクタリング後も PASS
- [ ] `.claude/` と `.agents/` のミラー差分が 0 件

---

## タスク100%実行確認【必須】

- [ ] 重複コード検出 grep 実行完了
- [ ] 共通 utility 抽出完了
- [ ] validator read-only 制約の機械検証完了
- [ ] writer 一元化の回帰テスト追加完了
- [ ] 変更記録テーブル完成
- [ ] 全テスト再実行 PASS 確認
- [ ] mirror parity 確認完了
- [ ] 成果物 2 ファイル出力完了
- [ ] Phase 8 ステータスを三者同値で `completed` に更新（自己 dogfooding）

---

## 次Phase

Phase 9（品質保証）へ進む。
