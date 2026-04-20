# Phase 10: 最終レビュー・AC-6 解除判定（レビューゲート） - タスク仕様書

## メタ情報

| 項目              | 内容                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| phase_id          | phase-10                                                                                                                                                                                         |
| task_id           | TASK-EVALS-CONSUMER-AUDIT-001                                                                                                                                                                    |
| Phase             | 10                                                                                                                                                                                               |
| Phase名           | 最終レビュー・AC-6 解除判定（レビューゲート W6）                                                                                                                                                 |
| 機能名            | evals-consumer-audit                                                                                                                                                                             |
| 作成日            | 2026-04-19                                                                                                                                                                                       |
| status            | 完了（成果物作成済み）                                                                                                                                                                           |
| depends_on        | Phase 9（spec-alignment-report.md）、Phase 5（consumer-audit-report.md / evals-field-map.md）、Phase 6（dual-root-parity.md）、Phase 7（coverage-recheck.md）、Phase 8（schema-change-guide.md） |
| blocks            | Phase 11（手動検証）、Phase 12（ドキュメント更新）、Phase 13（PR 作成）                                                                                                                          |
| 前提Phase         | Phase 9                                                                                                                                                                                          |
| 後続Phase         | Phase 11（PASS 時）／Phase 5 or 6 or 8（MAJOR 時差し戻し）                                                                                                                                       |
| taskType          | NON_VISUAL / 調査・文書化タスク（コード実装なし）                                                                                                                                                |
| 出力先（主）      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-result.md`                                                                                                             |
| 出力先（副）      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/ac6-release-verdict.md`、`outputs/phase-10/final-review-log.md`、`outputs/phase-10/review-prompt.txt`                               |
| 対応 AC           | AC-1〜AC-8（Phase 1）全て、AC-6（TASK-CONFLICT-PREVENT-001）解除判定                                                                                                                             |
| 対応 Quality Gate | QG-9（Phase 2）                                                                                                                                                                                  |
| レビューゲート    | **有**（本 Phase 自体がレビューゲート W6）                                                                                                                                                       |

---

## 1. 目的（Why）

Phase 5〜9 で生成された全成果物を俯瞰的にレビューし、以下 2 点を決定することが本 Phase の唯一の責務である。

1. **TASK-CONFLICT-PREVENT-001 AC-6（「consumer 監査完了まで EVALS schema 変更禁止」）の解除可否判定**
2. **Phase 10 レビューゲートの最終判定（PASS / MINOR / MAJOR / CRITICAL）と戻り先決定**

AC-6 解除判定結果と最終判定結果は `final-review-result.md` と `ac6-release-verdict.md` に記録され、Phase 11 以降の進行可否、および後続スキーマ変更タスクの開始可否を決定づける。本 Phase はコード実装を一切含まず、既存成果物の検証と判定記録のみを行う。

---

## 2. 入力（前Phase成果物・参照資料）

### 2.1 前Phase成果物（必須入力・レビュー対象）

| 成果物                   | パス                                                                                  | レビュー観点               |
| ------------------------ | ------------------------------------------------------------------------------------- | -------------------------- |
| consumer-audit-report.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | AC-1 / AC-2 充足、QG-3     |
| evals-field-map.md       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | AC-3 充足、QG-4            |
| dual-root-parity.md      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      | AC-4 充足、QG-5            |
| coverage-recheck.md      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/coverage-recheck.md`      | AC-8 / 漏れ 0 保証、QG-6   |
| schema-change-guide.md   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`   | AC-5 充足、QG-7            |
| spec-alignment-report.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md` | AC-7（未タスク記録）、QG-8 |

### 2.2 判定基準資料

| 資料                           | パス                                                                                   | 用途                                  |
| ------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1 要件定義               | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md`       | AC-1〜AC-8 の原文                     |
| Phase 2 品質ゲート             | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` | QG-1〜QG-12                           |
| Phase 3 レビューゲート通過条件 | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md`       | §4.2 Phase 10 ゲート条件              |
| TASK-CONFLICT-PREVENT-001 指示 | `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md`                   | AC-6 原文・解除条件 4 項目            |
| review-gate-criteria.md        | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`         | PASS/MINOR/MAJOR/CRITICAL 判定基準    |
| review-result-template.md      | `.claude/skills/task-specification-creator/assets/review-result-template.md`           | final-review-result.md のフォーマット |

### 2.3 入力検証

- [ ] Phase 5 / 6 / 7 / 8 / 9 の全成果物が存在する（§2.1 のパス 6 件すべて存在）
- [ ] 各 Phase の Quality Gate（QG-3 〜 QG-8）が PASS 済
- [ ] `review-result-template.md` が閲覧可能
- [ ] `review-gate-criteria.md` の PASS/MINOR/MAJOR/CRITICAL 定義が最新

---

## 3. 実行手順

### ステップ 1: 全成果物ファイルの存在検証

```bash
EVIDENCE_ROOT=docs/30-workflows/evals-consumer-audit-001/outputs
for f in \
  phase-5/consumer-audit-report.md \
  phase-5/evals-field-map.md \
  phase-6/dual-root-parity.md \
  phase-7/coverage-recheck.md \
  phase-8/schema-change-guide.md \
  phase-9/spec-alignment-report.md; do
  test -f "$EVIDENCE_ROOT/$f" \
    && echo "OK: $f" \
    || echo "MISSING: $f"
done
```

**判定ルール**: 1 件でも MISSING があれば、該当前段 Phase（5/6/7/8/9）へ差し戻し（MAJOR）。

### ステップ 2: AC-1〜AC-8 トレーサビリティ検証

各 AC が成果物のどのセクションで検証可能かを `final-review-log.md` に記録する。

| AC   | 対象成果物                                             | 検証観点                                         |
| ---- | ------------------------------------------------------ | ------------------------------------------------ |
| AC-1 | consumer-audit-report.md                               | 全 consumer が 4 分類（A/B/C/D）で列挙されている |
| AC-2 | consumer-audit-report.md                               | 各 consumer に operation / read / write が記録   |
| AC-3 | evals-field-map.md                                     | 全フィールド定義 + reader/writer 逆引き          |
| AC-4 | dual-root-parity.md                                    | スキル単位差分表、差分 3 区分判定                |
| AC-5 | schema-change-guide.md                                 | add/remove/rename 手順 + dual root 同期 + 検証   |
| AC-6 | consumer-audit-report.md 末尾 + ac6-release-verdict.md | 解除判定が明記                                   |
| AC-7 | spec-alignment-report.md §7                            | 未タスク記録先が `unassigned-task/` 配下を指す   |
| AC-8 | consumer-audit-report.md / coverage-recheck.md         | 再現コマンドが列挙・再実行で同結果               |

### ステップ 3: Quality Gate QG-3〜QG-8 の集計

| QG   | 評価対象                 | 合格基準                                         | 本 Phase の確認方法                                |
| ---- | ------------------------ | ------------------------------------------------ | -------------------------------------------------- | -------------- | ---------------------------- | ------------------ |
| QG-3 | consumer-audit-report.md | 分類軸 4 × 操作種別 が表に記載                   | `rg '(A\(code\)                                    | B\(script\)    | C\(test\)                    | D\(doc\))'` で確認 |
| QG-4 | evals-field-map.md       | 全フィールド + 逆引き（reader/writer/validator） | `rg '(readers                                      | writers        | validators)'` で確認         |
| QG-5 | dual-root-parity.md      | `.claude/skills/` の全ディレクトリが表に存在     | `find .claude/skills -maxdepth 1 -type d` との突合 |
| QG-6 | coverage-recheck.md      | 再検索ヒット ⊆ consumer-audit-report.md          | 報告内の「漏れ 0」記載確認                         |
| QG-7 | schema-change-guide.md   | 3 操作 × 4 項目 が表に記載                       | `rg '(フィールド追加                               | フィールド削除 | フィールドリネーム)'` で確認 |
| QG-8 | spec-alignment-report.md | 齟齬が「修正済／未タスク化／許容」に分類         | 整合性総括セクション確認                           |

### ステップ 4: AC-6 解除判定（本 Phase の核心）

TASK-CONFLICT-PREVENT-001 AC-6 の解除条件 4 項目をチェックする。

| 解除条件                                                                                                  | 成果物での確認                                  | 判定        |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------- |
| 全 consumer が consumer-audit-report.md に記載                                                            | AC-1 / AC-2 / QG-3 + coverage-recheck.md 漏れ 0 | pass / fail |
| 各 consumer の参照フィールドが evals-field-map.md に記載                                                  | AC-3 / QG-4                                     | pass / fail |
| schema-change-guide.md でフィールド変更手順が定義                                                         | AC-5 / QG-7                                     | pass / fail |
| dual-root-parity.md で `.claude/skills/` と `.agents/skills/` の差分が 0 または許容範囲内であることが確認 | AC-4 / QG-5                                     | pass / fail |

**AC-6 解除最終判定**:

- 上記 4 条件が**全て pass** → AC-6 **解除可能**
- 1 件でも fail → AC-6 **解除不可**、不足事項リストを `ac6-release-verdict.md` に明記し、本 Phase レビュー判定は MAJOR

### ステップ 5: Phase 10 レビューゲート判定

`review-gate-criteria.md` に従い、以下の判定を下す。

| 判定     | 条件                                                                                                             | 次のアクション                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| PASS     | 全成果物存在 + AC-1〜AC-8 全充足 + QG-3〜QG-8 全 PASS + AC-6 解除条件 4 件 pass + spec-alignment misaligned 0 件 | Phase 11 へ進行                                |
| MINOR    | 軽微な指摘のみ（表記揺れ・未タスク候補の文言整備等、実質は AC 充足）                                             | 指摘記録のみで Phase 11 へ進行（未タスク化可） |
| MAJOR    | AC-1〜AC-5 / AC-7 / AC-8 のいずれかが未充足、または QG-3〜QG-8 のいずれかが未 PASS                               | 該当 Phase（5 / 6 / 7 / 8 / 9）へ差し戻し      |
| CRITICAL | AC-6 解除条件 4 件のうち複数 fail、または監査スコープ自体の再定義が必要                                          | Phase 1（要件定義）へ戻しユーザー確認          |

### ステップ 6: 戻り先決定（MAJOR / CRITICAL 時）

| 問題の種類                                       | 戻り先  |
| ------------------------------------------------ | ------- |
| consumer 一覧・分類・操作種別の不備（AC-1/AC-2） | Phase 5 |
| フィールドマップの不備（AC-3）                   | Phase 5 |
| dual root 差分表の不備（AC-4）                   | Phase 6 |
| 漏れ再検索の不備（AC-8）                         | Phase 7 |
| schema-change-guide の不備（AC-5）               | Phase 8 |
| 正本整合性の未解決齟齬（AC-7）                   | Phase 9 |
| AC-6 解除条件の根本不成立・スコープ再定義        | Phase 1 |

### ステップ 7: review-prompt.txt の生成

Phase 3 レビューランナー方針（`review-gate-criteria.md §レビュー実行ランナー`）に従い、codex 等のレビュー CLI に共通で渡せる prompt artifact を出力する。

```bash
cat > docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/review-prompt.txt <<'PROMPT'
# Phase 10 最終レビュー prompt

本レビューは TASK-EVALS-CONSUMER-AUDIT-001 Phase 10 の最終レビューゲートである。
以下の成果物を検証し、PASS / MINOR / MAJOR / CRITICAL を判定せよ。

## 検証観点

1. 全成果物ファイル（phase-5/6/7/8/9 配下の 6 ファイル）の存在
2. Phase 1 AC-1〜AC-8 の充足
3. Phase 2 QG-3〜QG-8 の PASS 状態
4. TASK-CONFLICT-PREVENT-001 AC-6 の解除条件 4 項目
5. spec-alignment-report.md の整合性総括（aligned / partial / misaligned）

## 出力フォーマット

review-result-template.md に従う。最終判定と戻り先を明示すること。
PROMPT
```

### ステップ 8: final-review-result.md 作成（review-result-template.md 準拠）

`.claude/skills/task-specification-creator/assets/review-result-template.md` のテンプレート本体に従い、以下のセクションで作成する。

```
# Phase 10: 最終レビュー - レビュー結果

## メタ情報
## 判定結果（PASS/MINOR/MAJOR/CRITICAL と戻り先）
## レビュー項目
  ### 要件（AC-1〜AC-8）
  ### 設計（Phase 5/6/7/8/9 の設計整合）
  ### 実装（成果物の記述品質）
  ### テスト（検証コマンド再現性）
  ### 品質（QG-3〜QG-8）
## サマリー（PASS/MINOR/MAJOR/CRITICAL 件数）
## 指摘事項一覧
## 次のアクション
## レビュアー
```

### ステップ 9: ac6-release-verdict.md 作成

AC-6 解除判定の独立成果物として、以下を記録する。

```
# AC-6 Release Verdict

## 判定サマリ（解除可能 / 解除不可）
## 解除条件 4 項目の個別判定結果（pass/fail + 根拠）
## fail の場合の不足事項リスト
## 後続スキーマ変更タスクへの通知事項（解除可能時のみ）
## AC-6 原文引用（TASK-CONFLICT-PREVENT-001 より）
## 参照成果物一覧（前段 6 成果物へのリンク）
```

### ステップ 10: final-review-log.md 作成

`final-review-log.md` には以下を記録する。

- ステップ 1 の存在検証結果
- ステップ 2 の AC トレーサビリティ表
- ステップ 3 の QG 集計表
- ステップ 4 の AC-6 解除条件判定表
- 指摘事項と戻り先決定の詳細ログ

### ステップ 11: エスカレーション判定

以下のいずれかに該当する場合は、レビュー判定確定前にユーザーへエスカレーションする（`review-gate-criteria.md §エスカレーション条件`）。

- 戻り先の判断が困難
- 複数 Phase にまたがる問題
- 要件自体（Phase 1）の見直しが必要
- AC-6 解除条件の「許容範囲内」判定に主観的要素が強く、断定が難しい

エスカレーション時は `final-review-log.md` に「エスカレーション事項」セクションを追加し、問題内容・試行対策・推奨アクションを記載する。

---

## 4. 成果物（パス・フォーマット・スキーマ）

### 4.1 主成果物

| 成果物                 | パス                                                                                 | フォーマット                                  |
| ---------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------- |
| final-review-result.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-result.md` | `review-result-template.md` 準拠の Markdown   |
| ac6-release-verdict.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/ac6-release-verdict.md` | Markdown、AC-6 解除判定専用                   |
| final-review-log.md    | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-log.md`    | Markdown、詳細ログ                            |
| review-prompt.txt      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/review-prompt.txt`      | プレーンテキスト、runner 共通 prompt artifact |

### 4.2 final-review-result.md の必須セクション

review-result-template.md テンプレート本体に従いつつ、本 Phase では以下を必須とする。

- メタ情報（Phase 10 / 最終レビュー / 実施日 / 実行ランナー / 実行コマンド / 最終判定）
- 判定結果（PASS/MINOR/MAJOR/CRITICAL + 戻り先）
- レビュー項目 5 カテゴリ（要件 / 設計 / 実装 / テスト / 品質）
- サマリー（判定件数）
- 指摘事項一覧
- 次のアクション
- レビュアー

### 4.3 ac6-release-verdict.md のスキーマ

| 列名           | 型     | 必須 | 説明                                      |
| -------------- | ------ | ---- | ----------------------------------------- |
| condition_id   | string | ○    | 解除条件 ID（`AC6-COND-1`〜`AC6-COND-4`） |
| condition_text | string | ○    | 解除条件原文                              |
| evidence_path  | string | ○    | 根拠成果物のパス                          |
| verdict        | enum   | ○    | `pass` / `fail`                           |
| rationale      | string | ○    | 判定理由                                  |
| remediation    | string |      | fail の場合の是正方法・戻り先 Phase       |

---

## 5. 完了条件チェックリスト

- [ ] `outputs/phase-10/final-review-result.md` が存在し、review-result-template.md に準拠
- [ ] `outputs/phase-10/ac6-release-verdict.md` が存在し、解除条件 4 項目の判定が明記
- [ ] `outputs/phase-10/final-review-log.md` が存在し、AC トレーサビリティ表と QG 集計表を含む
- [ ] `outputs/phase-10/review-prompt.txt` が存在し、runner 共通 prompt として利用可能
- [ ] 全成果物ファイル（Phase 5/6/7/8/9 の 6 ファイル）の存在確認結果が記録されている
- [ ] AC-1〜AC-8 各 AC に対し pass/fail 判定と根拠が記録されている
- [ ] QG-3〜QG-8 各 QG に対し PASS/FAIL 判定が記録されている
- [ ] AC-6 解除判定が「解除可能」または「解除不可（不足事項リスト付き）」のいずれかで明示
- [ ] 最終判定が PASS / MINOR / MAJOR / CRITICAL のいずれかで明示
- [ ] MAJOR / CRITICAL の場合、戻り先 Phase が明示
- [ ] エスカレーション条件に該当する場合、エスカレーション事項が記録されている
- [ ] コード実装（_.js / _.ts / \*.tsx 等）の変更が 0 件（git status で確認）

---

## 6. 検証方法（自己検証コマンド）

### 6.1 成果物 4 ファイル存在検証

```bash
for f in final-review-result.md ac6-release-verdict.md final-review-log.md review-prompt.txt; do
  test -f "docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/$f" \
    && echo "OK: $f" \
    || echo "NG: missing $f"
done
```

### 6.2 前段 6 成果物存在検証（本 Phase の入力）

```bash
EVIDENCE_ROOT=docs/30-workflows/evals-consumer-audit-001/outputs
MISSING=0
for f in \
  phase-5/consumer-audit-report.md \
  phase-5/evals-field-map.md \
  phase-6/dual-root-parity.md \
  phase-7/coverage-recheck.md \
  phase-8/schema-change-guide.md \
  phase-9/spec-alignment-report.md; do
  test -f "$EVIDENCE_ROOT/$f" || { echo "MISSING: $f"; MISSING=$((MISSING+1)); }
done
test "$MISSING" -eq 0 && echo "ALL PRESENT" || echo "MAJOR: $MISSING file(s) missing"
```

### 6.3 final-review-result.md の必須セクション存在

```bash
for sec in 'メタ情報' '判定結果' '指摘事項一覧' '次のアクション' '最終判定'; do
  rg -n "$sec" docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-result.md \
    || echo "NG: section '$sec' missing"
done
```

### 6.4 AC-6 解除判定の明示確認

```bash
rg -n '解除可能|解除不可|AC6-COND-1|AC6-COND-2|AC6-COND-3|AC6-COND-4' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/ac6-release-verdict.md
```

### 6.5 最終判定の明示確認

```bash
rg -n '^\|\s*\*\*(PASS|MINOR|MAJOR|CRITICAL)\*\*\s*\||最終判定.*\*\*(PASS|MINOR|MAJOR|CRITICAL)\*\*' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-result.md
```

### 6.6 コード不改変の確認（監査タスクのスコープ遵守）

```bash
# 本 Phase 作業中にコード実装に変更が入っていないことを確認
git status -- '*.ts' '*.tsx' '*.js' '*.jsx' \
  | rg -v '^$' \
  && echo "NG: code file modified in Phase 10" \
  || echo "OK: no code change"
```

### 6.7 レビューランナー実行（任意）

Phase 3 レビューゲート方針に従い、`run-review-task.js` の最終レビュー用呼び出しを実行する場合は以下。

```bash
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --mode exec \
  --task-file docs/30-workflows/evals-consumer-audit-001/phase-10/spec.md \
  --output-prompt docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/review-prompt.txt
```

---

## 7. レビューゲート判定基準・Pass/Fail 条件・エスカレーション経路

### 7.1 Pass 条件（PASS 判定に必要な全条件）

| 条件 ID | 条件内容                                                                                 |
| ------- | ---------------------------------------------------------------------------------------- |
| PASS-1  | §6.2 の前段 6 成果物すべて存在                                                           |
| PASS-2  | AC-1〜AC-8 全て pass                                                                     |
| PASS-3  | QG-3〜QG-8 全て PASS                                                                     |
| PASS-4  | AC-6 解除条件 4 項目すべて pass                                                          |
| PASS-5  | spec-alignment-report.md 整合性総括が `aligned`（または `partial` で全件が未タスク化済） |
| PASS-6  | コード実装変更 0 件                                                                      |

### 7.2 Fail 条件（MAJOR 判定の契機）

| 条件 ID | Fail 契機                                                           | 戻り先             |
| ------- | ------------------------------------------------------------------- | ------------------ |
| FAIL-A  | consumer-audit-report.md の分類・操作種別欠落                       | Phase 5            |
| FAIL-B  | evals-field-map.md の逆引き列欠落                                   | Phase 5            |
| FAIL-C  | dual-root-parity.md の全スキル網羅欠落                              | Phase 6            |
| FAIL-D  | coverage-recheck.md の漏れ 0 未保証                                 | Phase 7            |
| FAIL-E  | schema-change-guide.md の 3 操作 × 4 観点未充足                     | Phase 8            |
| FAIL-F  | spec-alignment-report.md で `misaligned` 件が未タスク化されていない | Phase 9            |
| FAIL-G  | AC-6 解除条件 4 件のうち複数 fail                                   | CRITICAL → Phase 1 |

### 7.3 MINOR 判定の範囲

- 表記揺れ（全角/半角、ケース不統一）
- 未タスク候補の ID 体系未整備
- 参照リンクの軽微な誤り
- Markdown スタイル（見出しレベル）の不統一

MINOR は `final-review-result.md` の指摘事項一覧に記録し、Phase 12（ドキュメント更新）で是正可能なものは未タスク化せずに Phase 11 へ進行する。

### 7.4 CRITICAL 判定の範囲

- AC-6 解除条件 4 件中 2 件以上が fail
- 監査スコープ自体の再定義が必要（例: 新たな root や consumer が大量発見）
- Phase 1 要件定義との根本的不整合

CRITICAL は Phase 1 へ戻し、ユーザーと要件再確認する。

### 7.5 エスカレーション経路

以下に該当する場合、判定確定前にユーザーへエスカレーションする。

1. 戻り先の判断が困難（複数候補あり）
2. 複数 Phase にまたがる問題で単一戻り先では対処不能
3. 要件自体（Phase 1 AC-1〜AC-8）の見直しが必要
4. セキュリティ上の重大な懸念（EVALS.json に個人情報・認証情報が含まれている等）

**エスカレーション手順**:

1. `final-review-log.md` に「エスカレーション事項」セクション追加
2. 問題内容・試行対策・推奨アクション 3 点を記載
3. ユーザー判断を待って判定を確定
4. 待機中は Phase 10 を `blocked` 状態とし、Phase 11 へは進行しない

---

## 8. リスクと対策

| リスク ID | リスク                                                               | 発生確率 | 影響 | 対策                                                                                         |
| --------- | -------------------------------------------------------------------- | -------- | ---- | -------------------------------------------------------------------------------------------- |
| P10-R-1   | AC-6 解除判定を「許容範囲内」として主観的に pass 判定してしまう      | 中       | 高   | `許容` 判定には dual-root-parity.md の差分タイプ（0 / 許容 / 要対応）定義との紐付けを必須化  |
| P10-R-2   | Phase 9 の未解決齟齬（misaligned）を MINOR と誤判定                  | 中       | 中   | `misaligned` は全件 `未タスク化済` を要求、未タスク化未済は MAJOR へ昇格                     |
| P10-R-3   | 戻り先選定時に複数 Phase 候補が出て判断停止                          | 中       | 中   | §7.5 のエスカレーション経路に従い判定確定を保留                                              |
| P10-R-4   | レビュー中にコード実装を修正してしまい、監査タスクのスコープを逸脱   | 低       | 高   | §6.6 で `git status` を毎回確認、変更検出時は判定無効化                                      |
| P10-R-5   | review-result-template.md のスキーマから逸脱し後続の機械読込が壊れる | 低       | 中   | §3 ステップ 8 の必須セクションを厳守、テンプレート本体を直接コピーする                       |
| P10-R-6   | AC-6 解除「可能」判定後に新規 consumer が追加されて判定が覆る        | 低       | 高   | schema-change-guide.md §8 の「consumer 追加時運用ルール」を参照し、判定日時を verdict に明記 |
| P10-R-7   | Phase 3 レビューゲート通過条件の更新を見落として古い基準で判定       | 低       | 中   | §2.2 の review-gate-criteria.md を都度 Read して最新基準を確認                               |

---

## 9. 前/後 Phase との依存

### 9.1 前 Phase からの依存

- **Phase 9**: spec-alignment-report.md の整合性総括が AC-6 解除判定と最終判定の主要根拠。Phase 9 QG-8 PASS が前提。
- **Phase 8**: schema-change-guide.md が AC-6 解除条件「schema-change-guide.md でフィールド変更手順が定義されている」を満たす根拠。QG-7 PASS が前提。
- **Phase 5 / 6 / 7**: AC-1〜AC-4 / AC-8 の根拠。いずれも QG-3 / QG-4 / QG-5 / QG-6 PASS が前提。

### 9.2 後 Phase への引き継ぎ

- **Phase 11（PASS 時）**: final-review-result.md の最終判定と ac6-release-verdict.md を入力として、再現コマンド実行による第三者検証に進行。
- **Phase 12（MINOR 時）**: 指摘事項一覧を未タスク化候補として Phase 12 の `unassigned-task-detection.md` に取り込み。
- **Phase 5 / 6 / 7 / 8 / 9（MAJOR 時）**: §7.2 Fail 条件表に従い、該当 Phase へ差し戻す。戻し後は Phase 10 を再実行する。
- **Phase 1（CRITICAL 時）**: 要件定義へ戻し、ユーザー確認を経て Phase 2 以降を再実行する。

### 9.3 AC-6 解除判定の下流影響

AC-6 解除判定結果は `ac6-release-verdict.md` に記録され、以下のタスクの開始可否を決定する。

- EVALS.json にフィールドを追加する全タスク
- EVALS.json フィールドをリネームする全タスク
- EVALS.json からフィールドを削除する全タスク
- mirror sync ガード系タスク（UT-UIUX-MIRROR-SYNC-CI-001 等）のうち EVALS.json に関わるもの

解除不可時は上記タスクすべてがブロック継続となるため、Phase 10 の判定精度が後続全体のスケジュールに直結する。

### 9.4 Phase 3 設計との整合

Phase 3 設計書 W6 に対応する単独ウェーブ・レビューゲート。Phase 11（W7）へは PASS 時のみ進行し、W7 以降は本 Phase の PASS が前提となる。

---

## 統合テスト連携【必須】

| 判定項目                                  | 基準       | 結果    |
| ----------------------------------------- | ---------- | ------- |
| 前段 6 成果物すべて存在                   | 6/6        | pending |
| AC-1〜AC-8 全 pass                        | 8/8        | pending |
| QG-3〜QG-8 全 PASS                        | 6/6        | pending |
| AC-6 解除条件 4 項目の判定明示            | 4/4        | pending |
| 最終判定（PASS/MINOR/MAJOR/CRITICAL）明示 | 明示あり   | pending |
| 戻り先明示（MAJOR/CRITICAL 時）           | 該当時明示 | pending |
| コード実装変更 0 件                       | 0          | pending |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] final-review-result.md / ac6-release-verdict.md / final-review-log.md / review-prompt.txt の 4 成果物が生成されていることを確認
- [ ] 自己検証コマンド（§6）を全て実行し QG-9 PASS を確認
- [ ] 最終判定結果に応じて次 Phase（11 / 12 / 5〜9 / 1）への遷移条件を満たす
- [ ] エスカレーションが必要な場合は `final-review-log.md` に記録しユーザー確認を待つ

---

## 次のPhase

- **PASS 判定時**: `docs/30-workflows/evals-consumer-audit-001/phase-11/spec.md`（手動検証）
- **MINOR 判定時**: `phase-11/spec.md` へ進行しつつ、指摘事項は `phase-12/` で未タスク化
- **MAJOR 判定時**: §7.2 Fail 条件表に従い Phase 5 / 6 / 7 / 8 / 9 のいずれかへ差し戻し
- **CRITICAL 判定時**: `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md` を再レビューし、ユーザーと要件再確認
