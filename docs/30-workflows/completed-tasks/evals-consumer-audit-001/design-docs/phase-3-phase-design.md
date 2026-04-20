# Phase 3: Phase 設計（Phase 4〜13 の責務・入出力・ゲート・並列判定）

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-EVALS-CONSUMER-AUDIT-001                     |
| Phase      | 3                                                 |
| 機能名     | evals-consumer-audit                              |
| 作成日     | 2026-04-19                                        |
| 前提Phase  | Phase 2                                           |
| 後続Phase  | Phase 4〜13（並列/直列の混在実行）                |
| ステータス | pending                                           |
| taskType   | NON_VISUAL / 調査・文書化タスク（コード実装なし） |

## 目的

Phase 2 で確定したスコープ・アーキテクチャ・品質ゲートを受け、Phase 4〜13 各フェーズの「目的／入力／出力／完了条件／並列可否／先行 Phase」を確定する。これにより、後続の並列作成エージェントが各 Phase 仕様書を自立的に作成できるようにする。

---

## 1. Phase 別設計

本タスクは NON_VISUAL / 監査タスクのため、Phase 11 は「再現コマンド手動実行」、Phase 4-6 は「テスト作成／実装／テスト拡張」ではなく「検索・整理・差分抽出」に置き換える。テンプレートの機械適用ではなく、監査タスク特性に合わせて再解釈している。

---

### Phase 4: 静的検索・Raw Evidence 収集

| 項目      | 内容                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目的      | EVALS.json の参照候補を `rg` / `grep` / `find` で網羅的に抽出し、一次データ（raw evidence）を固定する                                                |
| 入力      | Phase 2 §7.2 の再現コマンド、`.claude/skills/` / `.agents/skills/` / `apps/` のソースツリー                                                          |
| 出力      | `outputs/phase-4/raw-grep-claude.txt`, `raw-grep-agents.txt`, `raw-grep-apps.txt`, `raw-find-evals.txt`, `raw-grep-dynamic.txt`, `raw-grep-docs.txt` |
| 完了条件  | 6 種の raw ファイルが生成され、ファイル先頭に実行コマンドとタイムスタンプが記録されている                                                            |
| 並列可否  | **完全並列可**: 検索ごとに独立（root 別・パターン別）                                                                                                |
| 先行Phase | Phase 3                                                                                                                                              |
| 後続Phase | Phase 5（一次データを解釈する）／Phase 6（find 結果を使う）                                                                                          |
| ゲート    | QG-2（漏れ 0 件）                                                                                                                                    |

**Step 0: P50 チェック**

- 最新 main との差分確認。EVALS.json 関連ファイルが直近で変更されていないか `git log -20 -- .claude/skills .agents/skills` で確認。
- 並行ブランチで同作業がないか確認。

---

### Phase 5: Consumer 一覧整理 と Field Map 作成

| 項目      | 内容                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目的      | Phase 4 の raw evidence を解釈し、consumer ごとの read/write/validate フィールドを確定。`consumer-audit-report.md` と `evals-field-map.md` を作成 |
| 入力      | Phase 4 の raw-\*.txt、Phase 2 §3.2 の consumer 分類列定義、Phase 2 §3.3 の逆引きマップ列定義                                                     |
| 出力      | `outputs/phase-5/consumer-audit-report.md`（★最終成果物 1）、`outputs/phase-5/evals-field-map.md`（★最終成果物 2）                                |
| 完了条件  | AC-1 / AC-2 / AC-3 / FR-2 〜 FR-5 を満たす                                                                                                        |
| 並列可否  | **内部で 2 並列可**: `consumer-audit-report.md` と `evals-field-map.md` を独立生成した後、最終突合                                                |
| 先行Phase | Phase 4                                                                                                                                           |
| 後続Phase | Phase 6（dual-root-parity 作成で consumer 一覧を参照）、Phase 7（漏れ再検索）、Phase 8（schema-change-guide 作成）                                |
| ゲート    | QG-3, QG-4                                                                                                                                        |

**サブタスク**:

1. 5-A: `consumer-audit-report.md` ドラフト（9 列 × A/B/C/D 4 分類 × 2 root）
2. 5-B: `evals-field-map.md` ドラフト（8 列 × 全フィールド）
3. 5-C: 5-A / 5-B 相互整合（field 名表記の統一、consumer パスの統一）

---

### Phase 6: Dual Root 差分抽出

| 項目      | 内容                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------- |
| 目的      | `.claude/skills/*/EVALS.json` と `.agents/skills/*/EVALS.json` をスキル単位で diff し、差分を可視化 |
| 入力      | Phase 4 の `raw-find-evals.txt`（全 EVALS.json パス）、`diff` コマンド                              |
| 出力      | `outputs/phase-6/dual-root-parity.md`（★最終成果物 3）、`outputs/phase-6/raw-diff.txt`              |
| 完了条件  | AC-4 / FR-6 を満たす。全スキルが表に列挙され、差分が「0 / 許容 / 要対応」に三分類                   |
| 並列可否  | **スキル単位で並列可**: 各スキルの diff は独立して走れる                                            |
| 先行Phase | Phase 4（find 結果依存）。Phase 5 と並列実行可能                                                    |
| 後続Phase | Phase 8（schema-change-guide に dual root 同期手順として取り込み）                                  |
| ゲート    | QG-5                                                                                                |

**分類基準**:

- **0（完全一致）**: バイナリ diff が空
- **許容**: `lastUpdated` / `metrics.totalUsageCount` 等、運用メトリクスの差分のみ
- **要対応**: スキーマ構造自体（キー有無・型）の差異 → 未タスク記録

---

### Phase 7: 漏れ再検索（Coverage 相当）

| 項目      | 内容                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| 目的      | Phase 5 で整理した consumer 一覧に漏れがないか、同じ検索コマンドを再実行して差分を 0 にする |
| 入力      | `consumer-audit-report.md` の consumer パス集合、Phase 2 §7.2 の再現コマンド                |
| 出力      | `outputs/phase-7/coverage-recheck.md`（差分レポート、漏れ 0 の証跡）                        |
| 完了条件  | 再検索ヒット集合 ⊆ consumer-audit-report.md 記載集合。漏れ 0                                |
| 並列可否  | **単独**（前段成果物に依存）                                                                |
| 先行Phase | Phase 5, Phase 6                                                                            |
| 後続Phase | Phase 8                                                                                     |
| ゲート    | QG-6                                                                                        |

---

### Phase 8: Schema Change Guide 作成（Refactoring 相当）

| 項目      | 内容                                                                                          |
| --------- | --------------------------------------------------------------------------------------------- |
| 目的      | フィールド追加／削除／リネームの 3 操作について、影響範囲・手順・dual root 同期・検証を体系化 |
| 入力      | consumer-audit-report.md、evals-field-map.md、dual-root-parity.md、Phase 1 の AC-5 / FR-7     |
| 出力      | `outputs/phase-8/schema-change-guide.md`（★最終成果物 4）                                     |
| 完了条件  | AC-5 / FR-7 を満たす。3 操作 × 4 項目（影響範囲 / 手順 / dual root 同期 / 検証）が表に記載    |
| 並列可否  | **単独**（3 前段成果物すべてに依存）                                                          |
| 先行Phase | Phase 5, Phase 6, Phase 7                                                                     |
| 後続Phase | Phase 9                                                                                       |
| ゲート    | QG-7                                                                                          |

**必須内容**:

1. フィールド追加手順（既存 consumer が undefined を許容するか）
2. フィールド削除手順（どの consumer が破損するか）
3. フィールドリネーム手順（全 consumer の更新箇所リスト）
4. dual root の同期ルール（変更順序、commit 粒度）
5. 検証手順（`validate-schemas.js` 拡張有無、手動確認ポイント）
6. consumer 追加時の運用ルール（schema-change-guide.md 自体の更新義務）

---

### Phase 9: 品質検証（aiworkflow-requirements 正本との突合）

| 項目      | 内容                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| 目的      | `aiworkflow-requirements` の `references/` 内 EVALS 言及と監査結果の整合性を検証                          |
| 入力      | Phase 5 / 6 / 8 の成果物、`.claude/skills/aiworkflow-requirements/references/` 配下の EVALS 関連 Markdown |
| 出力      | `outputs/phase-9/spec-alignment-report.md`（整合／不整合一覧、不整合は未タスク化）                        |
| 完了条件  | 全不整合が「修正済」「未タスク化」「許容」のいずれかに分類されている                                      |
| 並列可否  | **単独**                                                                                                  |
| 先行Phase | Phase 8                                                                                                   |
| 後続Phase | Phase 10                                                                                                  |
| ゲート    | QG-8                                                                                                      |

---

### Phase 10: 最終レビュー・AC-6 解除判定

| 項目      | 内容                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| 目的      | 4 成果物の品質を最終レビューし、TASK-CONFLICT-PREVENT-001 AC-6 の解除可否を判定             |
| 入力      | 全 Phase 成果物、Phase 1 AC-1〜AC-8、TASK-CONFLICT-PREVENT-001 AC-6 の原文                  |
| 出力      | `outputs/phase-10/ac6-release-verdict.md`、`outputs/phase-10/final-review-log.md`           |
| 完了条件  | AC-6 解除判定が「可」「不可（追加対応必要）」のいずれかに明示決定され、根拠が記載されている |
| 並列可否  | **単独**（全前段成果物を俯瞰する）                                                          |
| 先行Phase | Phase 9                                                                                     |
| 後続Phase | Phase 11                                                                                    |
| ゲート    | QG-9（レビューゲート通過必須）                                                              |

**レビューゲート通過条件**:

- AC-1〜AC-8 が全て成果物で検証できる
- QG-3 / QG-4 / QG-5 / QG-7 が PASS
- 未タスクが `unassigned-task/` に記録先指定済み（Phase 12 で最終反映）
- PASS / MINOR / MAJOR の戻り先判定:
  - **PASS**: Phase 11 へ進行
  - **MINOR**: Phase 12 で追跡（未タスク記録の追記）
  - **MAJOR**: Phase 5 / 6 / 8 のいずれかへ差し戻し

---

### Phase 11: 手動検証（再現コマンド実行）

| 項目      | 内容                                                                                                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目的      | 第三者が `consumer-audit-report.md` 記載の再現コマンドを実行し、同じ consumer リストが得られることを検証                                                                                            |
| 入力      | Phase 5 の consumer-audit-report.md、Phase 2 §7.2 の再現コマンド                                                                                                                                    |
| 出力      | `outputs/phase-11/manual-test-result.md`（primary evidence）、`outputs/phase-11/reproduction-verification.md`、`outputs/phase-11/manual-test-checklist.md`、`outputs/phase-11/discovered-issues.md` |
| 完了条件  | 再実行結果と consumer-audit-report.md の記載が 0 差分                                                                                                                                               |
| 並列可否  | **単独**                                                                                                                                                                                            |
| 先行Phase | Phase 10                                                                                                                                                                                            |
| 後続Phase | Phase 12                                                                                                                                                                                            |
| ゲート    | QG-10                                                                                                                                                                                               |

NON_VISUAL タスクのため screenshot は不要。`manual-test-result.md` に primary evidence を集約する。

---

### Phase 12: ドキュメント更新・未タスク同期

| 項目      | 内容                                                                                                                                                                                                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目的      | 監査成果の close-out 成果物を生成し、仕様書更新判断と未タスク同期を実施                                                                                                                                                                                                                                                                                 |
| 入力      | Phase 5 / 6 / 8 / 9 / 10 の成果物、Phase 11 の検証結果                                                                                                                                                                                                                                                                                                  |
| 出力      | Phase 12 必須 6 成果物（task-specification-creator Phase 12 テンプレ準拠）:<br>1. `implementation-guide.md`（Part 1: 中学生レベル説明 / Part 2: 技術説明）<br>2. `system-spec-update-summary.md`<br>3. `documentation-changelog.md`<br>4. `unassigned-task-detection.md`<br>5. `skill-feedback-report.md`<br>6. `phase12-task-spec-compliance-check.md` |
| 完了条件  | 6 成果物生成、未タスクが `docs/30-workflows/unassigned-task/` に記録先指定済み                                                                                                                                                                                                                                                                          |
| 並列可否  | **一部並列可**（Task 1 / 4 / 5 は先行並列、Task 6 は最終直列）                                                                                                                                                                                                                                                                                          |
| 先行Phase | Phase 11                                                                                                                                                                                                                                                                                                                                                |
| 後続Phase | Phase 13                                                                                                                                                                                                                                                                                                                                                |
| ゲート    | QG-11                                                                                                                                                                                                                                                                                                                                                   |

**Phase 12 並列サブタスク設計**:

| サブ  | 成果物                                  | 依存         |
| ----- | --------------------------------------- | ------------ |
| 12-T1 | `implementation-guide.md`               | 独立         |
| 12-T4 | `unassigned-task-detection.md`          | 独立         |
| 12-T5 | `skill-feedback-report.md`              | 独立         |
| 12-T2 | `system-spec-update-summary.md`         | 12-T1 の後   |
| 12-T3 | `documentation-changelog.md`            | 12-T2 の後   |
| 12-T6 | `phase12-task-spec-compliance-check.md` | 12-T1〜T5 後 |

---

### Phase 13: PR 作成

| 項目      | 内容                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------- |
| 目的      | 4 最終成果物 + 設計書 + Phase 12 close-out 成果物を含む PR 段取りを確定                         |
| 入力      | 全 Phase 成果物、PR テンプレート                                                                |
| 出力      | `outputs/phase-13/pr-description.md`、`outputs/phase-13/approval-checklist.md`                  |
| 完了条件  | PR 説明に 4 最終成果物パス、AC-6 解除判定、未タスク一覧が記載され、blocked 条件が明記されている |
| 並列可否  | **単独**                                                                                        |
| 先行Phase | Phase 12                                                                                        |
| 後続Phase | -                                                                                               |
| ゲート    | QG-12（レビューゲート通過必須）                                                                 |

**Blocked 条件**:

- Issue #2279 が CLOSED のため、PR description に「CLOSED Issue に対する fix-forward PR」である旨を明記
- AC-6 解除判定が「不可」の場合は、Draft PR のまま「追加対応 MAJOR」として Phase 5 or 6 or 8 へ戻し、本 Phase は blocked

---

## 2. 依存関係マトリクス

| Phase ↓ / 先行 → | P3  | P4  | P5  | P6  | P7  | P8  | P9  | P10 | P11 | P12 |
| ---------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P4               | ◯   |     |     |     |     |     |     |     |     |     |
| P5               |     | ◯   |     |     |     |     |     |     |     |     |
| P6               |     | ◯   |     |     |     |     |     |     |     |     |
| P7               |     |     | ◯   | ◯   |     |     |     |     |     |     |
| P8               |     |     | ◯   | ◯   | ◯   |     |     |     |     |     |
| P9               |     |     |     |     |     | ◯   |     |     |     |     |
| P10              |     |     |     |     |     |     | ◯   |     |     |     |
| P11              |     |     |     |     |     |     |     | ◯   |     |     |
| P12              |     |     |     |     |     |     |     |     | ◯   |     |
| P13              |     |     |     |     |     |     |     |     |     | ◯   |

---

## 3. 並列化ウェーブ設計

### 3.1 ウェーブ一覧

| Wave | 実行 Phase / サブタスク                               | 並列数 | 所要目安 | 説明                                          |
| ---- | ----------------------------------------------------- | ------ | -------- | --------------------------------------------- |
| W1   | Phase 4（raw 収集 6 検索を並列）                      | 6 並列 | 短       | 静的検索。検索パターン × root ごとに独立      |
| W2   | Phase 5（5-A / 5-B 並列）＋ Phase 6（スキル単位並列） | 2〜N   | 中       | 前段は W1 のみ。Phase 5 と Phase 6 は相互独立 |
| W3   | Phase 7（漏れ再検索）                                 | 1      | 短       | W2 の成果を入力                               |
| W4   | Phase 8（schema-change-guide）                        | 1      | 中       | W2 + W3 の成果を統合                          |
| W5   | Phase 9（references 整合）                            | 1      | 短       | W4 完了後                                     |
| W6   | Phase 10（最終レビュー・AC-6 判定）                   | 1      | 短       | **レビューゲート必須**                        |
| W7   | Phase 11（再現コマンド実行）                          | 1      | 短       | W6 PASS 後                                    |
| W8   | Phase 12（Task 1 / 4 / 5）                            | 3 並列 | 中       | implementation-guide / unassigned / feedback  |
| W9   | Phase 12（Task 2 / 3 → Task 6）                       | 直列   | 短       | spec sync・changelog・compliance 集約         |
| W10  | Phase 13（PR 作成）                                   | 1      | 短       | **レビューゲート必須**                        |

### 3.2 ウェーブ間の critical path

```
W1 → W2 → W3 → W4 → W5 → W6(gate) → W7 → W8 → W9 → W10(gate)
```

W2 内で Phase 5 と Phase 6 を並列化することで、クリティカルパスを 1 ステップ短縮。Phase 12 の W8/W9 分割により、文書生成を最大 4 並列化。

### 3.3 並列作成エージェント実行方針

後続の「Phase 4-13 並列作成エージェント」は以下の方針で分担する:

- **エージェント A（Phase 4-7 群）**: W1〜W3。静的検索と consumer 整理 / dual root diff / 漏れ再検索。
- **エージェント B（Phase 8-10 群）**: W4〜W6。schema-change-guide 作成 / references 整合 / 最終レビュー。
- **エージェント C（Phase 11-13 群）**: W7〜W10。手動検証 / canonical 6 成果物 / PR 作成。

各エージェントは自担当 Phase の仕様書（`phase-N-*.md`）を独立作成し、`docs/30-workflows/evals-consumer-audit-001/phase-N/` に配置する。先行 Phase の完了を待つ必要がある場合は、依存関係マトリクスに従う。

---

## 4. レビューゲート通過条件

### 4.1 Phase 3 ゲート（本 Phase 完了条件）

- [ ] Phase 4〜13 すべてに「目的／入力／出力／完了条件／並列可否／先行Phase」が記載されている
- [ ] 依存関係マトリクスが矛盾なく構築されている
- [ ] 並列化ウェーブ W1〜W10 が定義されている
- [ ] Phase 10 / Phase 13 のレビューゲート通過条件が明示されている
- [ ] 後続エージェント（A / B / C）の分担が定義されている
- [ ] simpler alternative 検討: 「単一レポート 1 ファイルに全てを記載する」案を検討し、成果物を 4 分割する理由（逆引きマップ性・AC-6 解除判定のトレーサビリティ）を記録済

### 4.2 Phase 10 ゲート（最終レビュー）

- [ ] AC-1〜AC-8 がすべて成果物で検証可能
- [ ] QG-3 / QG-4 / QG-5 / QG-7 が PASS
- [ ] AC-6 解除判定が「可」or「不可」で明示
- [ ] 不整合・漏れはすべて未タスクとして記録先指定済み
- [ ] PASS / MINOR / MAJOR のいずれかが明示

### 4.3 Phase 13 ゲート（PR 作成）

- [ ] PR 説明に 4 最終成果物のパス記載
- [ ] PR 説明に AC-6 解除判定結果の記載
- [ ] PR 説明に発見未タスクの記録先記載
- [ ] Issue #2279 が CLOSED である旨の注記

---

## 5. Simpler Alternative 検討記録

| 代替案                                       | 採否   | 理由                                                                               |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| 成果物を単一 `audit-report.md` に統合        | 不採用 | 逆引きマップ性が落ち、AC-6 解除判定のトレーサビリティが不明瞭になる                |
| Phase 5 と Phase 6 を統合                    | 不採用 | consumer 整理と dual root 差分は独立並列可能で、統合するとクリティカルパスが延びる |
| Phase 11 を省略（NON_VISUAL なので不要）     | 不採用 | 再現コマンド実行による「第三者検証」は監査タスクの信頼性担保に不可欠               |
| Phase 12 canonical 6 成果物を 4 成果物に削減 | 不採用 | task-specification-creator Phase 12 テンプレ準拠が v9.13.0 以降必須                |
| schema-change-guide を Phase 5 内で作成      | 不採用 | dual-root-parity.md 成立後でないと dual root 同期手順が書けない                    |

---

## 統合テスト連携【必須】

| 判定項目                                                           | 基準     | 結果    |
| ------------------------------------------------------------------ | -------- | ------- |
| Phase 4〜13 に 6 セクション（目的/入力/出力/完了/並列/先行）が揃う | 100%     | pending |
| 依存関係マトリクスが矛盾なく構築されている                         | 矛盾 0   | pending |
| 並列化ウェーブ W1〜W10 が定義されている                            | 10 件    | pending |
| Phase 10 / 13 レビューゲート通過条件が明示                         | 明示あり | pending |

---

## 成果物

| 成果物              | パス                                                                             | 説明       |
| ------------------- | -------------------------------------------------------------------------------- | ---------- |
| Phase 設計（4〜13） | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md` | 本ファイル |

## 完了条件

- [ ] Phase 4〜13 の目的・入出力・完了条件・並列可否・先行 Phase が全て確定
- [ ] 依存関係マトリクスが矛盾なく構築されている
- [ ] 並列化ウェーブ W1〜W10 が定義されている
- [ ] レビューゲート（Phase 3 / 10 / 13）の通過条件が明示されている
- [ ] 後続エージェント A / B / C の担当分担が定義されている
- [ ] Simpler Alternative の検討記録が残っている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [x] Phase 4（静的検索・raw 収集）設計完了
- [x] Phase 5（consumer 整理・field map）設計完了
- [x] Phase 6（dual root 差分抽出）設計完了
- [x] Phase 7（漏れ再検索）設計完了
- [x] Phase 8（schema-change-guide）設計完了
- [x] Phase 9（references 整合）設計完了
- [x] Phase 10（最終レビュー・AC-6 判定）設計完了
- [x] Phase 11（再現コマンド手動検証）設計完了
- [x] Phase 12（canonical 6 成果物・並列サブ設計）完了
- [x] Phase 13（PR 作成・blocked 条件）設計完了
- [x] 依存関係マトリクス作成
- [x] ウェーブ W1〜W10 定義
- [x] レビューゲート通過条件明示
- [x] Simpler Alternative 検討記録

## 次Phase

Phase 4〜13: 並列/直列ウェーブに沿って各 Phase 仕様書を作成（後続エージェント A / B / C が担当）
