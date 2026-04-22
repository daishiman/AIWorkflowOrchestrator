# Phase 11: 手動テスト（NON_VISUAL）

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| Phase        | 11                                                  |
| 機能名       | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 |
| タスク名     | qualityInsights 現行定義を2 skillへ整合反映         |
| タスク種別   | docs-only（コード変更なし）                         |
| 前提Phase    | Phase 10 PASS                                       |
| 後続Phase    | Phase 12                                            |
| 作成日       | 2026-04-21                                          |
| ステータス   | completed                                           |
| GitHub Issue | #2327（CLOSED）                                     |

---

## タスク種別判定: NON_VISUAL

**本タスクは NON_VISUAL として処理する。**

### NON_VISUAL 判定理由

- 本タスクは UI/UX 変更を一切含まない（docs-only タスク）
- 変更対象は Markdown 仕様書ファイルのみ（`references/` 配下）
- Renderer / Main プロセスへの変更なし
- 新規コンポーネント・画面遷移・スタイル変更なし
- ブラウザ操作・Electron ウィンドウ操作が不要
- よって **スクリーンショットは不要**（N/A）

スクリーンショット要件: **N/A**（UI/UX 変更なしのため Phase 11 スクリーンショット不要）

---

## 目的

> **2026-04-21 current facts 補正**: manual test の観点は 10 実フィールド定義・writer/運用責任・NON_VISUAL close-out・mirror parity であり、`11` は確認ポイント数を意味する。

docs-only タスクにおける Phase 11「手動テスト」は、以下に読み替えて実施する:

- **対象ファイルの存在確認**: 追記対象の仕様書ファイルが期待するパスに存在するか（`ls` / Glob）
- **内容整合確認**: qualityInsights 11 フィールドの役割・writer・運用責任が正しく記述されているか（`grep` / `diff`）
- **mirror 同期確認**: `.claude/` と `.agents/` の差分がゼロであることを最終確認（`diff -q`）

自動テスト（Phase 4〜9）では機械的に検証した内容を、人の目で確認して意味的な問題（記述の誤解・情報の欠落・文脈の不整合）を検知することが目的。

---

## 実行タスク

1. NON_VISUAL 判定の根拠を `manual-test-result.md` に明記する
2. 対象ファイルの存在確認（`ls` / Glob による確認）を実施する
3. 内容整合確認（`grep` / `diff` による 11 フィールド全確認）を実施する
4. mirror 同期確認（`diff -q` による差分ゼロ確認）を実施する
5. 各フィールドの記述を人の目で通読し、意味的な問題がないかを確認する
6. 確認結果を `outputs/phase-11/manual-test-result.md` に記録する
7. HIGH 問題が発見された場合は `docs/30-workflows/unassigned-task/` に記録する

---

## 参照資料

### 仕様書・ドキュメント

| 資料名                    | パス                                                                                            | 用途                            |
| ------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                       | Phase 11 着手条件               |
| Phase 9 品質保証レポート  | `outputs/phase-9/quality-assurance-report.md`                                                   | 機械検証の最終結果              |
| 追記対象（正本）          | `references/` 配下の qualityInsights 関連仕様書                                                 | 通読・内容整合確認の対象        |
| Phase 2 設計書            | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-2-design.md`       | 11 フィールド一覧・追記設計方針 |
| Phase 1 受け入れ基準      | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-1-requirements.md` | AC 一覧のトレース元             |
| 出荷準備チェックリスト    | `outputs/phase-10/shipping-checklist.md`                                                        | Phase 10 成果物                 |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス（参照キー）                                                            | 用途                 |
| -------------------- | --------------------------------------------------------------------------- | -------------------- |
| topic-map            | `qualityInsights / evals / spec`                                            | 正本位置の最終確認   |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲートの受入条件 |

---

## 実行手順

### 0. 検証環境確認

```bash
# 追記対象ファイルのパス確認
ls -la references/ | grep -i "quality\|insight\|evals"

# Phase 10 PASS の確認（着手前提条件）
cat outputs/phase-10/final-review-result.md | grep -i "PASS\|判定結果"
```

### 1. 対象ファイルの存在確認（ls / Glob）

**手順**:

```bash
# 追記対象仕様書ファイルの存在確認
ls -la .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
# 期待: ファイルが存在し、タイムスタンプが Phase 5 実施後であること

# Glob による確認（qualityInsights 関連ファイル一覧）
ls references/*quality* references/*insight* references/*evals* 2>/dev/null
```

**期待結果**:

- 追記対象仕様書ファイルが存在する
- ファイルサイズが追記前より増加している
- 関連ファイルが期待するパスに配置されている

**manual-test-result.md への記録内容**:

- `ls` コマンドの出力
- ファイルの存在確認結果（OK / NG）

### 2. 内容整合確認（grep / diff）

**手順**:

```bash
# 11フィールド全ての存在確認
grep -n "qualityInsights\\." .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
# 期待: 11フィールド分のマッチ

# 役割記述の確認
grep -n "役割\\|description\\|overview" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# writer 記述の確認
grep -n "writer\\|書き込み\\|更新主体" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 運用責任記述の確認
grep -n "運用責任\\|responsibility\\|owner" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 意図しない変更がないことの確認（追記箇所以外に差分がないか）
git diff -- .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md | head -100
```

**期待結果**:

- 11 フィールド全てが仕様書に記述されている
- 各フィールドに役割・writer・運用責任の 3 点が存在する
- 追記箇所以外に意図しない変更がない

**manual-test-result.md への記録内容**:

- `grep` コマンドの出力（フィールドごとの確認結果）
- フィールドごとの役割・writer・運用責任の記述有無
- 内容整合確認結果（OK / NG / 要確認）

### 3. mirror 同期確認（diff -q）

**手順**:

```bash
# mirror sync 最終確認（diff -q ゼロ確認）
diff -qr .claude/skills/ .agents/skills/
# 期待: 出力 0 行（差分なし）

# 差分が発生している場合の詳細確認
diff -r .claude/skills/ .agents/skills/ 2>/dev/null | head -50
```

**期待結果**:

- `diff -qr` の出力が 0 行（差分なし）
- `.claude/` と `.agents/` が完全に同期している

**manual-test-result.md への記録内容**:

- `diff -qr` コマンドの出力（0 行であることを記録）
- mirror 同期確認結果（OK / NG）

### 4. 通読による意味的確認（人の目）

以下の観点で追記した 11 フィールドの記述を通読する:

| 観点             | 確認内容                                                                      |
| ---------------- | ----------------------------------------------------------------------------- |
| 文脈の自然さ     | 役割・writer・運用責任の説明が前後の文脈と整合しているか                      |
| 情報の完結性     | 仕様書を読んだだけで各フィールドの使用方法が理解できるか                      |
| 用語の一貫性     | 11 フィールド間で writer / operator / responsibility の表現が統一されているか |
| 未完了感なし     | 記述に「作業中」「TBD」「未確定」の印象を受けないか                           |
| docs-only の確認 | 追記内容が仕様書ファイルのみであり、コードへの言及が適切か                    |

---

## 3層評価

| 評価層   | 内容                                                              | 結果                |
| -------- | ----------------------------------------------------------------- | ------------------- |
| Semantic | 11 フィールドの役割・writer・運用責任が契約通りに記述されているか | （Phase 11 で記録） |
| Visual   | NON_VISUAL タスクのため N/A（UI/UX 変更なし）                     | N/A                 |
| AI UX    | 仕様書を読んだ運用者が各フィールドの使用方法を理解できるか        | （Phase 11 で記録） |

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`outputs/phase-11/screenshots/` ディレクトリは作成しない。スクリーンショット不要の理由:

1. 本タスクは docs-only（Markdown 仕様書の追記のみ）
2. Renderer / UI への変更がない
3. ブラウザ・Electron ウィンドウの操作を伴わない
4. 確認はすべてターミナルコマンド（ls / grep / diff）で完結する

この判断を `manual-test-result.md` の `## NON_VISUAL 判定` セクションに明記する。

---

## 統合テスト連携

docs-only タスクにおける手動統合テストは以下の確認で代替する:

| 確認種別         | 実施内容                                              | 担当エージェント |
| ---------------- | ----------------------------------------------------- | ---------------- |
| ファイル存在確認 | `ls` / Glob による追記対象ファイルの存在確認          | SubAgent-A       |
| 内容整合確認     | `grep` / `diff` による 11 フィールド全確認            | SubAgent-B       |
| mirror 同期確認  | `diff -q` による `.claude/` ↔ `.agents/` 差分ゼロ確認 | SubAgent-C       |
| 通読・意味的確認 | 人の目による記述の文脈・完結性・用語確認              | SubAgent-D       |

---

## 発見した HIGH 問題の処理

Phase 11 で HIGH 問題が発見された場合は、`docs/30-workflows/unassigned-task/` に指示書を作成し、Phase 12 の `unassigned-task-detection.md` から参照する。docs-only タスクのため、HIGH 問題はフィールド記述の欠落・誤記・構造的不整合として定義する。

---

## 成果物

| 成果物                   | パス                                        | 説明                                       |
| ------------------------ | ------------------------------------------- | ------------------------------------------ |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 3 種確認（存在・内容・mirror）の実施結果   |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | AC と各確認のトレース一覧（PASS/FAIL/N/A） |

### manual-test-result.md への記録内容（必須）

- `## NON_VISUAL 判定` セクション: 判定理由の明記
- `## 対象ファイルの存在確認`: `ls` コマンドの出力と確認結果
- `## 内容整合確認`: `grep` コマンドの出力・フィールドごとの確認結果
- `## mirror 同期確認`: `diff -qr` の出力（0 行であることを記録）
- `## 通読確認`: 観点ごとの確認結果
- `## 3層評価`: Semantic / Visual(N/A) / AI UX の評価結果

---

## 完了条件

- [ ] NON_VISUAL 判定理由が `manual-test-result.md` に明記されている
- [ ] 対象ファイルの存在確認が完了し、結果が記録されている
- [ ] 11 フィールド全ての内容整合確認が完了し、結果が記録されている
- [ ] mirror 同期確認が完了し、diff -q ゼロが記録されている
- [ ] 通読による意味的確認が完了し、問題なしが記録されている
- [ ] HIGH 問題が存在しないか、存在する場合は `unassigned-task/` に記録されている
- [ ] `## 視覚証跡` セクションに「UI/UX 変更なしのため Phase 11 スクリーンショット不要」が明記されている
- [ ] Phase 12（ドキュメント更新）へ渡せる結果が揃っている

---

## タスク100%実行確認【必須】

- [ ] NON_VISUAL 判定記録完了
- [ ] 対象ファイルの存在確認完了（`ls` / Glob 実行・結果記録）
- [ ] 11 フィールド内容整合確認完了（`grep` 実行・フィールドごとの結果記録）
- [ ] 役割記述確認完了（11 フィールド全て）
- [ ] writer 記述確認完了（11 フィールド全て）
- [ ] 運用責任記述確認完了（11 フィールド全て）
- [ ] mirror 同期確認完了（`diff -q` 0 行を記録）
- [ ] 通読確認完了（観点ごとの結果を記録）
- [ ] `manual-test-result.md` 出力完了
- [ ] `manual-test-checklist.md` 出力完了
- [ ] Phase 11 ステータスを `completed` に更新

---

## 次Phase

Phase 12（ドキュメント更新）へ進む。
