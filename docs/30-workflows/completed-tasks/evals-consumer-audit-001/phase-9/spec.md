# Phase 9: 正本整合性検証（aiworkflow-requirements skill） - タスク仕様書

## メタ情報

| 項目              | 内容                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| phase_id          | phase-9                                                                                                                     |
| task_id           | TASK-EVALS-CONSUMER-AUDIT-001                                                                                               |
| Phase             | 9                                                                                                                           |
| Phase名           | 正本整合性検証（aiworkflow-requirements references/ との突合）                                                              |
| 機能名            | evals-consumer-audit                                                                                                        |
| 作成日            | 2026-04-19                                                                                                                  |
| status            | 未実施                                                                                                                      |
| depends_on        | Phase 8（schema-change-guide.md）、Phase 5（consumer-audit-report.md / evals-field-map.md）、Phase 6（dual-root-parity.md） |
| blocks            | Phase 10（最終レビュー・AC-6 解除判定）                                                                                     |
| 前提Phase         | Phase 8                                                                                                                     |
| 後続Phase         | Phase 10                                                                                                                    |
| taskType          | NON_VISUAL / 調査・文書化タスク（コード実装なし）                                                                           |
| 出力先            | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md`                                       |
| 対応 AC           | AC-6（TASK-CONFLICT-PREVENT-001）解除条件の間接充足、FR-9（未タスク記録）                                                   |
| 対応 Quality Gate | QG-8（Phase 2）                                                                                                             |

---

## 1. 目的（Why）

`.claude/skills/aiworkflow-requirements/` の `references/` 配下には AIWorkflowOrchestrator の正本仕様が集約されており、`self-improvement-cycle.md` など EVALS.json のスキーマや運用に関する記述が含まれる可能性がある。Phase 5〜8 で作成した監査結果（consumer 一覧・field map・dual root 差分・schema-change-guide）と正本仕様の記述内容が**矛盾していないか**を機械検証と目視レビューの両輪で突合し、齟齬があれば未タスク（unassigned-task）候補としてリスト化することが本 Phase の目的である。

本 Phase はコード実装を一切含まず、Markdown 成果物のみで整合性判定と未タスク候補記録を行う。矛盾が見つかっても、本タスクでは**正本を修正しない**（監査スコープ外であり、後続の別タスクに委譲する）。

---

## 2. 入力（前Phase成果物・参照資料）

### 2.1 前Phase成果物（必須入力）

| 成果物                   | パス                                                                                  | 用途                                                     |
| ------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| consumer-audit-report.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | 実態の consumer 一覧（正本記述と突合する基準）           |
| evals-field-map.md       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | 実態のフィールド定義（正本のスキーマ言及と突合する基準） |
| dual-root-parity.md      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      | dual root の実態（正本が想定する同期方針との突合）       |
| schema-change-guide.md   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`   | 変更手順（正本の運用ルールとの突合）                     |

### 2.2 正本参照資料（突合対象）

| 資料                                   | パス                                                                             | 用途                                      |
| -------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| aiworkflow-requirements references/    | `.claude/skills/aiworkflow-requirements/references/`                             | EVALS 関連記述の一次探索先                |
| self-improvement-cycle.md（task-spec） | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md` | EVALS.json 構造・レベル判定ロジックの説明 |
| resource-map / quick-reference         | `.claude/skills/aiworkflow-requirements/references/resource-map.md` 等           | 正本検索の入口                            |
| topic-map / keywords                   | `.claude/skills/aiworkflow-requirements/references/topic-map.md` 等              | EVALS 関連トピックの所在確認              |

### 2.3 設計書（参照資料）

| 資料                     | パス                                                                                   | 用途                                 |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 1 要件定義         | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md`       | RISK-6 / FR-9 / 制約「正本との整合」 |
| Phase 2 スコープ・アーキ | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` | QG-8 定義、dual root 正本断定禁止    |
| Phase 3 Phase 設計       | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md`       | Phase 9 の入出力定義                 |
| 未タスクテンプレート     | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`         | 未タスク候補の記録フォーマット       |

### 2.4 入力検証

- [ ] Phase 5 / 6 / 8 の全成果物が存在し、それぞれの QG（QG-3 / QG-4 / QG-5 / QG-7）が PASS 済
- [ ] `.claude/skills/aiworkflow-requirements/references/` が checkout 済でアクセス可能
- [ ] `unassigned-task-template.md` が閲覧可能（未タスク記録時のフォーマット統一用）

---

## 3. 実行手順

### ステップ 1: 正本内の EVALS 関連記述の抽出

```bash
# aiworkflow-requirements references/ 配下で EVALS 関連記述を検索
rg -n 'EVALS(\.json)?|evals[_-]?path|currentLevel|levelHistory|metrics\.|qualityInsights|levelCriteria|phaseMetrics|skillName' \
   .claude/skills/aiworkflow-requirements/references/ \
   -g '*.md' \
   > docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/raw-refs-hits.txt

# task-specification-creator の self-improvement-cycle.md も対象（EVALS.json 構造説明）
rg -n 'EVALS|currentLevel|levelHistory|metrics\.|qualityInsights|levelCriteria' \
   .claude/skills/task-specification-creator/references/self-improvement-cycle.md \
   >> docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/raw-refs-hits.txt || true
```

- 検索ヒットの raw 結果を `raw-refs-hits.txt` に保存する
- 0 件ヒットの場合は「正本側に EVALS 関連記述なし」として記録し、整合性判定は「N/A」扱いにする

### ステップ 2: 記述ブロックの分類

raw-refs-hits.txt の各行について、以下の分類軸で整理する。

| 分類                    | 基準                                                      | 判定アクション                  |
| ----------------------- | --------------------------------------------------------- | ------------------------------- |
| A. スキーマ構造言及     | `EVALS.json` のフィールド名・型・構造を記述している       | evals-field-map.md と突合       |
| B. consumer 言及        | 特定の script / code を EVALS consumer として言及している | consumer-audit-report.md と突合 |
| C. dual root 同期言及   | `.claude` / `.agents` の同期に言及している                | dual-root-parity.md と突合      |
| D. 変更運用言及         | スキーマ変更手順や制約（AC-6 等）に言及している           | schema-change-guide.md と突合   |
| E. 単なる言及・コメント | コードとしての依存はない、説明文としての言及のみ          | 突合不要、参考情報として記録    |

### ステップ 3: 突合テーブルの作成（分類 A〜D）

4 カテゴリそれぞれについて、以下の列で表を作成する。

| 列名            | 型     | 必須 | 説明                                                    |
| --------------- | ------ | ---- | ------------------------------------------------------- |
| ref_path        | string | ○    | 正本側ファイルパス                                      |
| ref_line        | number | ○    | 正本側行番号                                            |
| ref_excerpt     | string | ○    | 正本側の該当記述（抜粋）                                |
| audit_source    | string | ○    | 突合先の監査成果物（consumer-audit-report.md など）     |
| audit_evidence  | string | ○    | 監査成果物の該当行（フィールド名・consumer パス等）     |
| alignment       | enum   | ○    | `aligned` / `misaligned` / `n/a` / `needs-review`       |
| finding         | string |      | 齟齬の具体内容（misaligned / needs-review の場合）      |
| proposed_action | string |      | `正本修正候補` / `監査修正候補` / `未タスク化` / `許容` |

### ステップ 4: 齟齬（misaligned / needs-review）の深掘り

各齟齬について以下を記録する。

- 正本の記述が古い／実態が正本と異なる／表記揺れ のいずれに該当するか
- 本タスクでは正本を修正しないため、修正は後続タスクに委譲する
- 委譲先として未タスク候補に登録する（ステップ 5）

### ステップ 5: 未タスク候補の記録（FR-9 / RISK-6 対策）

`docs/30-workflows/unassigned-task/` 配下に未タスク候補を記録する。ただし本 Phase では**具体的なタスク指示書ファイルは作成しない**（Phase 12 で行う）。本 Phase の出力としては以下を `spec-alignment-report.md` 末尾にリストする。

| 列名                  | 必須 | 説明                                              |
| --------------------- | ---- | ------------------------------------------------- |
| candidate_id          | ○    | 仮 ID（`UNASSIGNED-EVALS-SPEC-ALIGN-NNN`）        |
| category              | ○    | A/B/C/D のどれに該当するか                        |
| ref_path              | ○    | 正本側のパス                                      |
| summary               | ○    | 不整合の要約（1-2 行）                            |
| recommended_task_type | ○    | `正本修正` / `監査再実行` / `別スコープ`          |
| target_record_path    | ○    | Phase 12 で作成する予定の未タスク指示書の想定パス |

### ステップ 6: スキーマ構造突合の機械検証

evals-field-map.md のフィールド一覧を抽出し、正本記述に登場するフィールド名の集合と比較する。

```bash
# field-map からフィールド名を抽出（ドット記法）
rg -o '`[a-zA-Z][a-zA-Z0-9._]*`' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md \
   | sort -u > /tmp/field-map-fields.txt

# 正本側で言及されているフィールド名を抽出
rg -o '`[a-zA-Z][a-zA-Z0-9._]*`' \
   .claude/skills/aiworkflow-requirements/references/ \
   .claude/skills/task-specification-creator/references/self-improvement-cycle.md \
   -g '*.md' | sort -u > /tmp/refs-fields.txt

# 正本にのみ登場するフィールド（実態に存在しない = misaligned 候補）
comm -23 /tmp/refs-fields.txt /tmp/field-map-fields.txt
```

- 正本にのみ登場するフィールドは「正本が古い／将来拡張として記載」のいずれかを判定
- 実態にのみ登場するフィールドは「正本記載漏れ」として未タスク候補化

### ステップ 7: spec-alignment-report.md 作成

以下のセクション構成で作成する。

```
# EVALS Spec Alignment Report

## メタ情報
## 1. 目的
## 2. 検証対象（正本側 / 監査成果物側）
## 3. 正本内 EVALS 関連記述の分類結果（A/B/C/D/E）
## 4. 突合テーブル（カテゴリ別）
   ### 4.1 スキーマ構造言及（A）
   ### 4.2 consumer 言及（B）
   ### 4.3 dual root 同期言及（C）
   ### 4.4 変更運用言及（D）
## 5. スキーマ構造フィールド集合 diff（ステップ 6 結果）
## 6. 齟齬深掘りと根本原因分類
## 7. 未タスク候補リスト
## 8. 整合性総括（aligned / partial / misaligned）
## 参照資料
```

### ステップ 8: 整合性総括の判定

spec-alignment-report.md の「整合性総括」セクションに以下のいずれかを明記する。

| 総括       | 判定条件                                                    |
| ---------- | ----------------------------------------------------------- |
| aligned    | misaligned / needs-review が 0 件                           |
| partial    | needs-review のみ存在（明確な齟齬ではないが確認継続が必要） |
| misaligned | misaligned が 1 件以上存在し、未タスク候補化が必要          |

### ステップ 9: Phase 10 への引き継ぎ事項整理

- 整合性総括の結果（aligned / partial / misaligned）
- 未タスク候補の件数
- AC-6 解除判定に影響する齟齬の有無
- Phase 10 で参照する `spec-alignment-report.md` のセクション番号を明記

---

## 4. 成果物（パス・フォーマット・スキーマ）

### 4.1 主成果物

| 成果物                   | パス                                                                                  | フォーマット                  |
| ------------------------ | ------------------------------------------------------------------------------------- | ----------------------------- |
| spec-alignment-report.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md` | Markdown。目安 1000 行以内    |
| raw-refs-hits.txt        | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/raw-refs-hits.txt`        | プレーンテキスト（rg 生出力） |

### 4.2 未タスク候補リストのスキーマ

spec-alignment-report.md §7「未タスク候補リスト」は以下の列で表形式化する。

| 列名                  | 型     | 必須 |
| --------------------- | ------ | ---- |
| candidate_id          | string | ○    |
| category              | enum   | ○    |
| ref_path              | string | ○    |
| summary               | string | ○    |
| recommended_task_type | enum   | ○    |
| target_record_path    | string | ○    |

---

## 5. 完了条件チェックリスト

- [ ] `outputs/phase-9/spec-alignment-report.md` が存在する
- [ ] `outputs/phase-9/raw-refs-hits.txt` が存在し、実行コマンドとタイムスタンプがファイル先頭に記録されている
- [ ] 正本内 EVALS 関連記述が分類 A〜E に仕分けされている
- [ ] 分類 A〜D について突合テーブルが作成されている
- [ ] フィールド集合 diff（ステップ 6）の結果が記録されている
- [ ] 齟齬が存在する場合、全て `修正済` / `未タスク化` / `許容` のいずれかに分類されている（QG-8）
- [ ] 未タスク候補が存在する場合、`target_record_path` が `docs/30-workflows/unassigned-task/` 配下を指している
- [ ] 整合性総括が `aligned` / `partial` / `misaligned` のいずれかに明示されている
- [ ] Phase 10 への引き継ぎ事項セクションが存在する
- [ ] Phase 1 FR-9 / RISK-6 と整合している
- [ ] Phase 2 §3.1 の「dual root 正本断定禁止」方針に違反していない（正本判定を本 Phase で断定していない）

---

## 6. 検証方法（自己検証コマンド）

### 6.1 ファイル存在検証

```bash
for f in spec-alignment-report.md raw-refs-hits.txt; do
  test -f "docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/$f" \
    && echo "OK: $f" \
    || echo "NG: missing $f"
done
```

### 6.2 分類 A〜E カバレッジ検証

```bash
for cat in '分類A' '分類B' '分類C' '分類D' '分類E' \
           'スキーマ構造言及' 'consumer 言及' 'dual root 同期言及' '変更運用言及'; do
  rg -n "$cat" docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md \
    || echo "INFO: '$cat' not found (may be expressed differently)"
done
```

### 6.3 突合テーブル列存在検証

```bash
rg -n 'ref_path|ref_line|audit_source|alignment|proposed_action' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md
```

### 6.4 整合性総括判定検証

```bash
rg -n '整合性総括|aligned|partial|misaligned' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md
```

### 6.5 未タスク候補の target_record_path 健全性

```bash
rg -o 'docs/30-workflows/unassigned-task/[^ )]+' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md \
  | sort -u
```

### 6.6 フィールド集合 diff 再現

ステップ 6 のコマンドを再実行し、`spec-alignment-report.md §5` の記載と一致することを確認する。

### 6.7 正本不変性の確認

```bash
# Phase 9 作業中に正本ファイルを変更していないことを git で確認
git status .claude/skills/aiworkflow-requirements/references/ \
           .claude/skills/task-specification-creator/references/self-improvement-cycle.md
```

出力が空（または `outputs/phase-9/` 以外の変更が無い）であることを確認。変更があれば Phase 9 のスコープ違反。

---

## 7. リスクと対策

| リスク ID | リスク                                                                                  | 発生確率 | 影響 | 対策                                                                                             |
| --------- | --------------------------------------------------------------------------------------- | -------- | ---- | ------------------------------------------------------------------------------------------------ |
| P9-R-1    | 正本の記述が「将来拡張」として書かれており、実態との差を誤って misaligned 扱い          | 中       | 中   | ref_excerpt と周辺文脈を必ず記録し、将来拡張記述は `needs-review` に留める                       |
| P9-R-2    | 正本側に EVALS 関連記述が実質 0 件で、整合性検証が空振り                                | 中       | 低   | 空振り時は「N/A」を総括に明記し、FR-9 の未タスクは作成しない                                     |
| P9-R-3    | 本 Phase で正本を修正してしまい、監査スコープを逸脱                                     | 低       | 高   | Phase 1 制約「EVALS.json 自体の改変禁止」「正本の独断決定禁止」に準拠し、§6.7 で git status 確認 |
| P9-R-4    | 未タスク候補が過剰に生成され、Phase 12 の未タスク同期が破綻                             | 中       | 中   | 1 件 = 1 仕様不整合 の粒度を厳守、重複は merge する                                              |
| P9-R-5    | フィールド集合 diff で表記揺れ（`currentLevel` vs `current_level`）を別物と判定         | 中       | 中   | snake_case / camelCase / kebab-case の正規化ルールを §5 冒頭に明記                               |
| P9-R-6    | 正本の `self-improvement-cycle.md` が task-specification-creator 側にあることを見落とす | 中       | 中   | ステップ 1 のコマンドで明示的に両パスを検索対象に含める                                          |

---

## 8. 前/後 Phase との依存

### 8.1 前 Phase からの依存

- **Phase 8**: schema-change-guide.md の記述が正本との整合対象となる。Phase 8 QG-7 PASS が前提。
- **Phase 5 / 6**: consumer 一覧・field map・dual root 差分を正本突合の基準値として参照する。
- **Phase 7**: 漏れ 0 保証が前提（漏れがあると突合対象自体が不完全）。

### 8.2 後 Phase への引き継ぎ

- **Phase 10**: 整合性総括（aligned / partial / misaligned）と未タスク候補件数が、AC-6 解除判定の補助根拠となる。`spec-alignment-report.md` のセクション番号を Phase 10 仕様書から参照する。
- **Phase 12**: 未タスク候補リストが `unassigned-task-detection.md` 作成の入力となる。`target_record_path` がそのまま Phase 12 で作成する仕様書ファイルの配置先となる。

### 8.3 Phase 3 設計との整合

Phase 3 W5 に対応する単独ウェーブ。Phase 8 完了を待って開始し、Phase 10 ゲートの入力として成立する。並列化なし。

---

## 統合テスト連携【必須】

| 判定項目                                               | 基準             | 結果    |
| ------------------------------------------------------ | ---------------- | ------- |
| 正本内 EVALS 関連記述の抽出完了                        | 抽出済           | pending |
| 分類 A〜E の仕分け完了                                 | 全ヒット分類済   | pending |
| 分類 A〜D 突合テーブルの作成                           | 4 カテゴリ分作成 | pending |
| 齟齬が全て「修正済 / 未タスク化 / 許容」に分類（QG-8） | 100%             | pending |
| 整合性総括判定                                         | 明示あり         | pending |
| 正本ファイル未改変                                     | git diff 0       | pending |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] spec-alignment-report.md / raw-refs-hits.txt が生成されていることを確認
- [ ] 自己検証コマンド（§6）を実行し QG-8 PASS を確認
- [ ] Phase 10 が参照する引き継ぎ事項セクションが揃っていることを確認

---

## 次のPhase

`docs/30-workflows/evals-consumer-audit-001/phase-10/spec.md`（最終レビュー・AC-6 解除判定）
